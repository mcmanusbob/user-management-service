const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Protected routes
router.use(authMiddleware.authenticate);

router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.post('/change-password', authController.changePassword);

module.exports = router;