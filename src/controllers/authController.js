const authService = require('../services/authService');
const validator = require('../utils/validator');
const logger = require('../utils/logger');

class AuthController {
  async register(req, res) {
    try {
      // Validate request data
      const validationErrors = validator.validateRegistration(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const result = await authService.register(req.body);
      
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      logger.error('Register controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async login(req, res) {
    try {
      // Validate request data
      const validationErrors = validator.validateLogin(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      logger.error('Login controller error:', error);
      res.status(401).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          status: 'error',
          message: 'Refresh token is required'
        });
      }

      const tokens = await authService.refreshToken(refreshToken);
      
      res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: tokens
      });
    } catch (error) {
      logger.error('Refresh token controller error:', error);
      res.status(401).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user.userId;
      
      if (!refreshToken) {
        return res.status(400).json({
          status: 'error',
          message: 'Refresh token is required'
        });
      }

      await authService.logout(userId, refreshToken);
      
      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async logoutAll(req, res) {
    try {
      const userId = req.user.userId;
      await authService.logoutAll(userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Logged out from all devices successfully'
      });
    } catch (error) {
      logger.error('Logout all controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({
          status: 'error',
          message: 'Verification token is required'
        });
      }

      await authService.verifyEmail(token);
      
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully'
      });
    } catch (error) {
      logger.error('Verify email controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const validationErrors = validator.validateEmail(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      
      res.status(200).json({
        status: 'success',
        message: result.message,
        ...(process.env.NODE_ENV === 'development' && { resetToken: result.resetToken })
      });
    } catch (error) {
      logger.error('Forgot password controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const validationErrors = validator.validatePasswordReset(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      
      res.status(200).json({
        status: 'success',
        message: 'Password reset successfully'
      });
    } catch (error) {
      logger.error('Reset password controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async changePassword(req, res) {
    try {
      const validationErrors = validator.validatePasswordChange(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;
      
      await authService.changePassword(userId, currentPassword, newPassword);
      
      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getMe(req, res) {
    try {
      const userId = req.user.userId;
      const user = await require('../services/userService').getUserById(userId);
      
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      logger.error('Get me controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();