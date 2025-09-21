const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const logger = require('../utils/logger');

// Create different rate limiters for different endpoints
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`);
      res.status(429).json({
        status: 'error',
        message: 'Too many requests, please try again later'
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    }
  });
};

// General API rate limiter
const generalLimiter = createRateLimiter(
  config.security.rateLimitWindowMs, // 15 minutes
  config.security.rateLimitMaxRequests, // 100 requests per windowMs
  'Too many requests from this IP, please try again after 15 minutes'
);

// Strict rate limiter for auth endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per 15 minutes
  'Too many authentication attempts, please try again after 15 minutes'
);

// Password reset rate limiter
const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 requests per hour
  'Too many password reset attempts, please try again after 1 hour'
);

// Email verification rate limiter
const emailVerificationLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 requests per hour
  'Too many email verification attempts, please try again after 1 hour'
);

// Registration rate limiter
const registrationLimiter = createRateLimiter(
  24 * 60 * 60 * 1000, // 24 hours
  3, // 3 registrations per day per IP
  'Too many accounts created from this IP, please try again after 24 hours'
);

// Profile update rate limiter
const profileUpdateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // 10 updates per minute
  'Too many profile updates, please slow down'
);

class RateLimitMiddleware {
  // Apply general rate limiting
  general() {
    return generalLimiter;
  }

  // Apply auth-specific rate limiting
  auth() {
    return authLimiter;
  }

  // Apply password reset rate limiting
  passwordReset() {
    return passwordResetLimiter;
  }

  // Apply email verification rate limiting
  emailVerification() {
    return emailVerificationLimiter;
  }

  // Apply registration rate limiting
  registration() {
    return registrationLimiter;
  }

  // Apply profile update rate limiting
  profileUpdate() {
    return profileUpdateLimiter;
  }

  // Dynamic rate limiter based on user role
  byRole(studentMax = 50, instructorMax = 100, adminMax = 200) {
    return (req, res, next) => {
      const user = req.user;
      let maxRequests = studentMax;

      if (user) {
        switch (user.role) {
          case 'instructor':
            maxRequests = instructorMax;
            break;
          case 'admin':
            maxRequests = adminMax;
            break;
          default:
            maxRequests = studentMax;
        }
      }

      const dynamicLimiter = createRateLimiter(
        config.security.rateLimitWindowMs,
        maxRequests,
        `Too many requests for ${user ? user.role : 'anonymous'} user`
      );

      return dynamicLimiter(req, res, next);
    };
  }

  // Custom rate limiter for specific endpoints
  custom(windowMs, max, message) {
    return createRateLimiter(windowMs, max, message);
  }
}

// Export default general limiter and the class for specific limiters
module.exports = generalLimiter;
module.exports.RateLimitMiddleware = new RateLimitMiddleware();