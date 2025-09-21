const User = require('../models/userModel');
const tokenService = require('./tokenService');
const logger = require('../utils/logger');

class AuthService {
  async register(userData) {
    try {
      const { email, password, firstName, lastName } = userData;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName
      });

      await user.save();
      logger.info(`New user registered: ${email}`);

      // Generate tokens
      const tokens = await tokenService.generateTokenPair(user._id, user.role);
      
      // Add refresh token to user
      await user.addRefreshToken(tokens.refreshToken);

      return {
        user: user.toJSON(),
        tokens
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Find user with password field
      const user = await User.findByEmail(email).select('+password');
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info(`User logged in: ${email}`);

      // Generate tokens
      const tokens = await tokenService.generateTokenPair(user._id, user.role);
      
      // Add refresh token to user
      await user.addRefreshToken(tokens.refreshToken);

      return {
        user: user.toJSON(),
        tokens
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = await tokenService.verifyRefreshToken(refreshToken);
      
      // Find user and check if refresh token exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
      if (!tokenExists) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await tokenService.generateTokenPair(user._id, user.role);
      
      // Remove old refresh token and add new one
      await user.removeRefreshToken(refreshToken);
      await user.addRefreshToken(tokens.refreshToken);

      logger.info(`Token refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  async logout(userId, refreshToken) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove refresh token
      await user.removeRefreshToken(refreshToken);
      
      logger.info(`User logged out: ${user.email}`);
      
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();