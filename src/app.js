const express = require('express');
const config = require('./config/env');
const serverConfig = require('./config/server');
const db = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler');

class App {
  constructor() {
    this.app = serverConfig.getApp();
    this.server = null;
  }

  async initialize() {
    try {
      // Setup uncaught exception handlers
      errorHandler.handleUncaughtExceptions();

      // Connect to database
      await db.connect();

      // Start server
      await this.startServer();

      logger.info(`User Management Service initialized successfully`);
      logger.info(`Environment: ${config.server.env}`);
      logger.info(`Port: ${config.server.port}`);
      logger.info(`API Version: ${config.server.apiVersion}`);
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      process.exit(1);
    }
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(config.server.port, (error) => {
        if (error) {
          logger.error('Failed to start server:', error);
          reject(error);
        } else {
          logger.info(`Server running on port ${config.server.port}`);
          resolve();
        }
      });

      // Handle server errors
      this.server.on('error', (error) => {
        logger.error('Server error:', error);
        reject(error);
      });
    });
  }

  async shutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    // Close server
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });
    }

    // Close database connection
    await db.disconnect();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  }

  setupGracefulShutdown() {
    // Handle graceful shutdown
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
  }
}

// Initialize and start the application
if (require.main === module) {
  const app = new App();
  app.setupGracefulShutdown();
  app.initialize();
}

module.exports = App;