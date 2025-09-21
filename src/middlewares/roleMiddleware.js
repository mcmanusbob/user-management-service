const logger = require('../utils/logger');

class RoleMiddleware {
  requireRole(...allowedRoles) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            status: 'error',
            message: 'Authentication required'
          });
        }

        if (!allowedRoles.includes(req.user.role)) {
          logger.warn(`Access denied for user ${req.user.userId} with role ${req.user.role}. Required roles: ${allowedRoles.join(', ')}`);
          return res.status(403).json({
            status: 'error',
            message: 'Insufficient permissions',
            requiredRoles: allowedRoles,
            currentRole: req.user.role
          });
        }

        next();
      } catch (error) {
        logger.error('Role middleware error:', error);
        res.status(500).json({
          status: 'error',
          message: 'Role authorization failed'
        });
      }
    };
  }

  requireAdmin() {
    return this.requireRole('admin');
  }

  requireInstructor() {
    return this.requireRole('instructor', 'admin');
  }

  requireStudent() {
    return this.requireRole('student', 'instructor', 'admin');
  }

  checkOwnership(resourceField = 'userId') {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            status: 'error',
            message: 'Authentication required'
          });
        }

        // Admin can access any resource
        if (req.user.role === 'admin') {
          return next();
        }

        // Check if user owns the resource
        const resourceUserId = req.params.userId || req.body[resourceField] || req.user.userId;
        
        if (req.user.userId !== resourceUserId) {
          logger.warn(`Access denied for user ${req.user.userId} trying to access resource owned by ${resourceUserId}`);
          return res.status(403).json({
            status: 'error',
            message: 'Access denied: You can only access your own resources'
          });
        }

        next();
      } catch (error) {
        logger.error('Ownership middleware error:', error);
        res.status(500).json({
          status: 'error',
          message: 'Ownership validation failed'
        });
      }
    };
  }
}

module.exports = new RoleMiddleware();