const jwt = require('jsonwebtoken');
const config = require('./env');
const logger = require('../utils/logger');

class AuthConfig {
  generateAccessToken(payload) {
    try {
      return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        issuer: 'user-management-service',
        audience: 'learning-platform'
      });
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw new Error('Token generation failed');
    }
  }

  generateRefreshToken(payload) {
    try {
      return jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
        issuer: 'user-management-service',
        audience: 'learning-platform'
      });
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw new Error('Refresh token generation failed');
    }
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret, {
        issuer: 'user-management-service',
        audience: 'learning-platform'
      });
    } catch (error) {
      logger.error('Error verifying access token:', error);
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'user-management-service',
        audience: 'learning-platform'
      });
    } catch (error) {
      logger.error('Error verifying refresh token:', error);
      throw new Error('Invalid refresh token');
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

module.exports = new AuthConfig();