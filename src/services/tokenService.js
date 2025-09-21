const jwt = require('jsonwebtoken');
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

      const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        issuer: 'user-management-service',
        audience: 'learning-platform'
      });

      const refreshToken = jwt.sign({ userId: userId.toString() }, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
        issuer: 'user-management-service',
        audience: 'learning-platform'
      });

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
      return jwt.verify(token, config.jwt.secret, {
        issuer: 'user-management-service',
        audience: 'learning-platform'
      });
    } catch (error) {
      logger.error('Access token verification error:', error);
      throw new Error('Invalid access token');
    }
  }

  async verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'user-management-service',
        audience: 'learning-platform'
      });
    } catch (error) {
      logger.error('Refresh token verification error:', error);
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

module.exports = new TokenService();