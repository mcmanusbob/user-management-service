const userService = require('../services/userService');
const validator = require('../utils/validator');
const logger = require('../utils/logger');

class PreferencesController {
  async getPreferences(req, res) {
    try {
      const userId = req.user.userId;
      const preferences = await userService.getUserPreferences(userId);
      
      res.status(200).json({
        status: 'success',
        data: { preferences }
      });
    } catch (error) {
      logger.error('Get preferences controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async updatePreferences(req, res) {
    try {
      const validationErrors = validator.validatePreferences(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const userId = req.user.userId;
      const preferences = await userService.updateUserPreferences(userId, req.body);
      
      res.status(200).json({
        status: 'success',
        message: 'Preferences updated successfully',
        data: { preferences }
      });
    } catch (error) {
      logger.error('Update preferences controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async updateLearningPreferences(req, res) {
    try {
      const validationErrors = validator.validateLearningPreferences(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const userId = req.user.userId;
      const preferences = await userService.updateUserPreferences(userId, {
        learningPreferences: req.body
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Learning preferences updated successfully',
        data: { learningPreferences: preferences.learningPreferences }
      });
    } catch (error) {
      logger.error('Update learning preferences controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async updateNotificationPreferences(req, res) {
    try {
      const validationErrors = validator.validateNotificationPreferences(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const userId = req.user.userId;
      const preferences = await userService.updateUserPreferences(userId, {
        notificationPreferences: req.body
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Notification preferences updated successfully',
        data: { notificationPreferences: preferences.notificationPreferences }
      });
    } catch (error) {
      logger.error('Update notification preferences controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async updatePrivacySettings(req, res) {
    try {
      const validationErrors = validator.validatePrivacySettings(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const userId = req.user.userId;
      const preferences = await userService.updateUserPreferences(userId, {
        privacySettings: req.body
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Privacy settings updated successfully',
        data: { privacySettings: preferences.privacySettings }
      });
    } catch (error) {
      logger.error('Update privacy settings controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async updateAccessibilitySettings(req, res) {
    try {
      const validationErrors = validator.validateAccessibilitySettings(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const userId = req.user.userId;
      const preferences = await userService.updateUserPreferences(userId, {
        accessibilitySettings: req.body
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Accessibility settings updated successfully',
        data: { accessibilitySettings: preferences.accessibilitySettings }
      });
    } catch (error) {
      logger.error('Update accessibility settings controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async resetPreferences(req, res) {
    try {
      const userId = req.user.userId;
      const defaultPreferences = require('../models/preferencesModel').getDefaultPreferences();
      const preferences = await userService.updateUserPreferences(userId, defaultPreferences);
      
      res.status(200).json({
        status: 'success',
        message: 'Preferences reset to defaults successfully',
        data: { preferences }
      });
    } catch (error) {
      logger.error('Reset preferences controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new PreferencesController();