const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * Authentication Routes
 */

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);

// Admin only routes
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);
router.put('/users/:userId/role', authMiddleware, adminMiddleware, authController.updateUserRole);
router.put('/users/:userId/deactivate', authMiddleware, adminMiddleware, authController.deactivateUser);

module.exports = router;
