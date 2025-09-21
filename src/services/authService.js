const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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
        lastName,
        emailVerificationToken: crypto.randomBytes(32).toString('hex'),
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
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
      const user = await User.findByEmail(email).select('+password +loginAttempts +lockUntil');
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new Error('Account is temporarily locked due to too many failed login attempts');
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        throw new Error('Invalid email or password');
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

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

  async logoutAll(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove all refresh tokens
      user.refreshTokens = [];
      await user.save();
      
      logger.info(`User logged out from all devices: ${user.email}`);
      
      return { message: 'Logged out from all devices successfully' };
    } catch (error) {
      logger.error('Logout all error:', error);
      throw error;
    }
  }

  async verifyEmail(token) {
    try {
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      logger.info(`Email verified for user: ${user.email}`);

      return { message: 'Email verified successfully' };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return { message: 'If email exists, password reset instructions have been sent' };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      logger.info(`Password reset requested for user: ${email}`);

      // In production, send email with resetToken
      return { 
        message: 'If email exists, password reset instructions have been sent',
        resetToken // Remove in production
      };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.refreshTokens = []; // Logout from all devices
      await user.save();

      logger.info(`Password reset for user: ${user.email}`);

      return { message: 'Password reset successfully' };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      user.password = newPassword;
      user.refreshTokens = []; // Logout from all devices except current
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();