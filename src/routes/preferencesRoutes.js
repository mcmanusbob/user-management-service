const express = require('express');
const preferencesController = require('../controllers/preferencesController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All preferences routes require authentication
router.use(authMiddleware.authenticate);

// Main preferences routes
router.get('/', preferencesController.getPreferences);
router.put('/', preferencesController.updatePreferences);
router.post('/reset', preferencesController.resetPreferences);

// Specific preference categories
router.put('/learning', preferencesController.updateLearningPreferences);
router.put('/notifications', preferencesController.updateNotificationPreferences);
router.put('/privacy', preferencesController.updatePrivacySettings);
router.put('/accessibility', preferencesController.updateAccessibilitySettings);

module.exports = router;