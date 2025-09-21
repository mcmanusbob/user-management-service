const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Basic validation
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          status: 'error',
          message: 'Email, password, firstName, and lastName are required'
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
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

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

  async getMe(req, res) {
    try {
      const userId = req.user.userId;
      const User = require('../models/userModel');
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }
      
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