const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration } = require('../middleware/regisValidation');
const logoutMiddleware = require('../middleware/logoutMiddleware');
const { authenticateToken } = require('../middleware/authenticateToken');
const { upload } = require('../middleware/imageHandler');

router.post('/login', authController.login);
router.post('/register', authController.createUser); // hanya untuk kasir
router.post('/register-admin', authenticateToken, authController.registerAdmin); // hanya admin bisa akses
router.post('/logout', logoutMiddleware, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/update-profile', authenticateToken, authController.updateProfile);
router.post('/upload-picture', authenticateToken, upload.single('picture'), authController.uploadPicture);
router.post('/forgot-password', authController.forgotPassword); 
router.post('/reset-password', authController.resetPassword); 

module.exports = router;