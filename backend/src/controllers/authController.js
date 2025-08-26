const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();
const validator = require('validator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// opsi cookie untuk JWT
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 1000, // 1 jam
};

/**
 * HANYA kasir yang boleh register dari frontend.
 * Admin (roleId=1) hanya bisa dibuat lewat API oleh user ber-role admin.
 */
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Pastikan user yang akses adalah admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa membuat akun admin baru.' });
    }

    // Cek apakah email sudah ada
    const existUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru dengan role admin (id = 1)
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        roleId: 1, // admin
        status: 'active',
      },
    });

    res.status(201).json({ message: 'Admin berhasil dibuat', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createUser = async (req, res, next) => {
  try {
  const { username, email, password } = req.body;

    // ——— Validasi dasar ———
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, dan password harus diisi.' });
    }
    if (!validator.isEmail(String(email))) {
      return res.status(400).json({ message: 'Format email tidak valid.' });
    }
    if (!validator.isStrongPassword(String(password))) {
      return res.status(400).json({
        message: 'Password harus minimal 8 karakter dan mengandung huruf besar, huruf kecil, angka, dan simbol.',
      });
    }

    // ——— Cek duplikat username/email ———
    const existed = await prisma.user.findFirst({
      where: {
        OR: [{ username: String(username) }, { email: String(email) }],
      },
      select: { id: true, username: true, email: true },
    });
    if (existed) {
      return res.status(409).json({ message: 'Username atau email sudah terdaftar.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

  // Selalu daftarkan sebagai kasir (roleId = 2)
  const finalRoleId = 2;

    // ——— Insert user ———
    const result = await prisma.user.create({
      data: {
        username: String(username).trim(),
        email: String(email).toLowerCase().trim(),
        password: passwordHash,
        // Gunakan field Prisma: roleId (di-map ke kolom DB role_id)
  roleId: finalRoleId,
        status: 'active',
      },
      include: { role: true },
    });

    return res.status(201).json({
      message: 'User berhasil terdaftar',
      data: {
        id: result.id,
        username: result.username,
        email: result.email,
        roleId: result.roleId,     // <- gunakan roleId (bukan role_id)
        role: result.role?.name ?? null,
        status: result.status,
      },
    });
  } catch (error) {
    // tangani unique constraint prisma
    if (error && error.code === 'P2002') {
      return res.status(409).json({ message: 'Username atau email sudah terdaftar.' });
    }
    next(error);
  }
};

// ========================= LOGIN =========================
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: String(username).trim() },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Login gagal! Username atau password salah.' });
    }

    const passwordIsValid = await bcrypt.compare(String(password), user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Login gagal! Username atau password salah.' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role?.name ?? 'user', // <- pastikan string
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie('authcookie', token, cookieOptions);
    return res.status(200).json({
      message: `Login ${user.role?.name ?? 'user'} berhasil!`,
      role: user.role?.name ?? null,
      token
    });
  } catch (error) {
    console.error('Error saat login:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ========================= LOGOUT ========================
exports.logout = async (req, res) => {
  try {
    let token = req.cookies?.authcookie;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(400).json({ message: 'Token tidak ditemukan.' });
    }

    await pool.query('INSERT INTO blacklisted_tokens (token) VALUES ($1)', [token]);
    res.clearCookie('authcookie');
    return res.status(200).json({ message: 'Logout berhasil.' });
  } catch (error) {
    console.error('Error saat logout:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat logout.' });
  }
};

// ===================== UPDATE PROFILE ====================
exports.updateProfile = async (req, res) => {
  const { username, email, status } = req.body;
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ message: 'Unauthorized.' });

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        username: username ?? undefined,
        email: email ?? undefined,
        status: status ?? undefined,
      },
      include: { role: true },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ message: 'Username atau email sudah dipakai.' });
    }
    console.error('Error update profile:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ===================== UPLOAD PICTURE ====================
exports.uploadPicture = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  try {
    const imagePath = `uploads/${req.file.filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { picture: imagePath },
    });
    return res.status(200).json({ picture: imagePath });
  } catch (error) {
    console.error('Error upload picture:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ===================== GET CURRENT USER ==================
exports.getCurrentUser = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized.' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { role: true },
    });

    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

    // pastikan role hanya 'admin' atau 'cashier'
    let roleString = null;
    if (user.role?.name) {
      roleString = user.role.name.toLowerCase() === 'admin' ? 'admin' : 'cashier';
    }
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: roleString,
      status: user.status,
      picture: user.picture
    });
  } catch (error) {
    console.error('Error get current user:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};