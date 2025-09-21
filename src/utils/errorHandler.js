const logger = require('./logger');
const config = require('../config/env');

class ErrorHandler {
  handle(error, req, res, next) {
    let { statusCode = 500, message } = error;

    // Log error details
    logger.error('Error occurred:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId || 'anonymous'
    });

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = this.handleValidationError(error);
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
      statusCode = 400;
      message = this.handleDuplicateError(error);
    }

    // Mongoose cast error
    if (error.name === 'CastError') {
      statusCode = 400;
      message = this.handleCastError(error);
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    }

    if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    // MongoDB connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      statusCode = 503;
      message = 'Service temporarily unavailable';
    }

    // Don't expose internal errors in production
    if (config.server.env === 'production' && statusCode === 500) {
      message = 'Internal server error';
    }

    res.status(statusCode).json({
      status: 'error',
      message,
      ...(config.server.env === 'development' && { 
        stack: error.stack,
        originalError: error.message 
      })
    });
  }

  handleValidationError(error) {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));

    return {
      message: 'Validation failed',
      errors
    };
  }

  handleDuplicateError(error) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    
    return `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
  }

  handleCastError(error) {
    return `Invalid ${error.path}: ${error.value}`;
  }

  // Handle async errors
  catchAsync(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Create custom error
  createError(message, statusCode = 500) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  // Handle uncaught exceptions and unhandled rejections
  handleUncaughtExceptions() {
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }
}

module.exports = new ErrorHandler();