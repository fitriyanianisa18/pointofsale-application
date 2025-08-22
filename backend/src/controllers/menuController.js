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
exports.createMenu = [
    upload.single('image'),
    async (req, res) => {
      try {
        const { name, category, price, description } = req.body;
        const image = req.file ? `uploads/${req.file.filename}` : null;
  
        await db.query(
          'INSERT INTO menu (image, name, category, price, description) VALUES ($1, $2, $3, $4, $5)',
          [image, name, category, price, description]
        );
  
        res.status(201).json({ message: 'Menu created successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create menu' });
      }
    }
  ];

// Update menu
exports.updateMenu = [
    upload.single('image'),  
    async (req, res) => {
      try {
        const { id } = req.params;
        const { name, category, price, description } = req.body;
        const image = req.file ? `uploads/${req.file.filename}` : null;
  
        await db.query(
          'UPDATE menu SET image = $1, name = $2, category = $3, price = $4, description = $5 WHERE id = $6',
          [image, name, category, price, description, id]
        );
  
        res.json({ message: 'Menu updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update menu' });
      }
    }
  ];

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
