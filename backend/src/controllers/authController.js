// Register admin
exports.registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      'INSERT INTO "user" (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, 'admin']
    );
    res.status(201).send({ message: 'Registrasi admin berhasil!', userId: result.rows[0].id });
  } catch (error) {
    console.error('Error saat registrasi admin:', error);
    res.status(500).send({ message: 'Terjadi kesalahan server.' });
  }
};
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validationResult } = require('express-validator');
const pool = require('../config/db');
require('dotenv').config();

const cookieOptions = {
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1 jam
    secure: process.env.NODE_ENV === 'production', // hanya https di production
    sameSite: 'strict',
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Debug log
    console.log('Login attempt:', { username, password });
    const result = await pool.query(
      'SELECT id, username, password, role FROM "user" WHERE username = $1',
      [username.trim()]
    );
    const user = result.rows[0];
    console.log('User found:', user);
    if (!user) {
      return res.status(401).json({ message: 'Login gagal! Username atau password salah.' });
    }
    // Debug log
    console.log('Comparing password:', password, 'with hash:', user.password);
    const passwordIsValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', passwordIsValid);
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Login gagal! Username atau password salah.' });
    }
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: '1h' }
    );
    res.cookie('authcookie', token, cookieOptions);
    res.status(200).json({ message: `Login ${user.role} berhasil!`, role: user.role });
  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};


exports.registerCashier = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

  try {
    const { username, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      'INSERT INTO "user" (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, 'cashier']
    );
    res.status(201).send({ message: 'Registrasi kasir berhasil!', userId: result.rows[0].id });
  } catch (error) {
    console.error('Error saat registrasi:', error);
    res.status(500).send({ message: 'Terjadi kesalahan server.' });
  }
};

exports.logout = async (req, res) => {
    const token = req.cookies['authcookie'];

    if (!token) {
        return res.status(400).json({ message: 'Token tidak ditemukan.' });
    }

  try {
    await pool.query('INSERT INTO blacklisted_tokens (token) VALUES ($1)', [token]);
    res.clearCookie('authcookie');
    res.status(200).json({ message: 'Logout berhasil.' });
  } catch (error) {
    console.error('Error saat logout:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat logout.' });
  }
};

// update user profile
exports.updateProfile = async (req, res) => {
    const { username, email, status } = req.body;
    const userId = req.user.userId; 
  
    try {
      const result = await pool.query(
        'UPDATE "user" SET username = $1, email = $2, status = $3 WHERE id = $4 RETURNING *',
        [username, email, status, userId]
      );
      if (result.rowCount === 0) {
        return res.status(400).json({ message: 'Gagal memperbarui profil.' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error saat memperbarui profil:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
  };


// get current user profile
exports.getCurrentUser = async (req, res) => {
    const { userId } = req.user;
    try {
      const result = await pool.query(
        'SELECT id, picture, username, email, role, status FROM "user" WHERE id = $1',
        [userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan." });
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Gagal mengambil profil." });
    }
  };
  