const db = require('../config/db');
const { upload, handleImage } = require('../../src/middleware/imageHandler');

// Get semua menu
exports.getAllMenus = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM menu');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get menus' });
  }
};

// Get menu by ID
exports.getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM menu WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get menu' });
  }
};

// Tambah menu baru
exports.createMenu = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    if (!req.file) {
      console.error('File upload gagal: req.file tidak ada');
      return res.status(400).json({ message: 'Gambar menu wajib diupload!' });
    }
    const image = `uploads/${req.file.filename}`;

    await db.query(
      'INSERT INTO menu (image, name, category, price, description) VALUES ($1, $2, $3, $4, $5)',
      [image, name, category, price, description]
    );

    res.status(201).json({ message: 'Menu created successfully' });
  } catch (error) {
    console.error('Error createMenu:', error);
    res.status(500).json({ message: 'Failed to create menu', error: error.message });
  }
};

// Update menu
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description } = req.body;
    let image = null;
    if (req.file) {
      // Pastikan path yang disimpan hanya uploads/namafile.jpg
      image = `uploads/${req.file.filename}`;
    }
    if (image) {
      await db.query(
        'UPDATE menu SET image = $1, name = $2, category = $3, price = $4, description = $5 WHERE id = $6',
        [image, name, category, price, description, id]
      );
    } else {
      await db.query(
        'UPDATE menu SET name = $1, category = $2, price = $3, description = $4 WHERE id = $5',
        [name, category, price, description, id]
      );
    }
    res.json({ message: 'Menu updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update menu' });
  }
};

// Hapus menu
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
  await db.query('DELETE FROM menu WHERE id = $1', [id]);
    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete menu' });
  }
};
