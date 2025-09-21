const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const config = require('../config/env');
const logger = require('../utils/logger');

class TokenService {
  async generateTokenPair(userId, role) {
    try {
      const payload = {
        userId: userId.toString(),
        role,
        iat: Math.floor(Date.now() / 1000)
      };

      const accessToken = authConfig.generateAccessToken(payload);
      const refreshToken = authConfig.generateRefreshToken({ userId: userId.toString() });

      return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: config.jwt.expiresIn
      };
    } catch (error) {
      logger.error('Token generation error:', error);
      throw new Error('Failed to generate tokens');
    }
  }

  async verifyAccessToken(token) {
    try {
      return authConfig.verifyAccessToken(token);
    } catch (error) {
      logger.error('Access token verification error:', error);
      throw new Error('Invalid access token');
    }
  }

  async verifyRefreshToken(token) {
    try {
      return authConfig.verifyRefreshToken(token);
    } catch (error) {
      logger.error('Refresh token verification error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  extractTokenFromHeader(authHeader) {
    return authConfig.extractTokenFromHeader(authHeader);
  }

  async decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      logger.error('Token decode error:', error);
      throw new Error('Failed to decode token');
    }
  }

  isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  getTokenExpirationTime(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return null;
      }
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  async generatePasswordResetToken() {
    try {
      const payload = {
        type: 'password_reset',
        iat: Math.floor(Date.now() / 1000)
      };

      return jwt.sign(payload, config.jwt.secret, { expiresIn: '10m' });
    } catch (error) {
      logger.error('Password reset token generation error:', error);
      throw new Error('Failed to generate password reset token');
    }
  }

  async generateEmailVerificationToken() {
    try {
      const payload = {
        type: 'email_verification',
        iat: Math.floor(Date.now() / 1000)
      };

      return jwt.sign(payload, config.jwt.secret, { expiresIn: '24h' });
    } catch (error) {
      logger.error('Email verification token generation error:', error);
      throw new Error('Failed to generate email verification token');
    }
  }
}

module.exports = new TokenService();