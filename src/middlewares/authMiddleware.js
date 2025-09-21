const tokenService = require('../services/tokenService');
const User = require('../models/userModel');
const logger = require('../utils/logger');

class AuthMiddleware {
  async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = tokenService.extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'Access token is required'
        });
      }

      const decoded = await tokenService.verifyAccessToken(token);
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found or inactive'
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      logger.error('Authentication middleware error:', error);
      res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
  }

  authorize(...allowedRoles) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            status: 'error',
            message: 'Authentication required'
          });
        }

        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            status: 'error',
            message: 'Insufficient permissions'
          });
        }

        next();
      } catch (error) {
        logger.error('Authorization middleware error:', error);
        res.status(403).json({
          status: 'error',
          message: 'Authorization failed'
        });
      }
    };
  }
}

module.exports = new AuthMiddleware();