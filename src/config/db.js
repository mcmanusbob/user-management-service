const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

class DatabaseConnection {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoUri = config.server.env === 'test' 
        ? config.database.testUri 
        : config.database.uri;

      const options = {
        ...config.database.options,
        retryWrites: true,
        w: 'majority'
      };

      // Log connection attempt (without password)
      const safeUri = mongoUri.replace(/\/\/.*:.*@/, '//****:****@');
      logger.info(`Attempting to connect to MongoDB: ${safeUri}`);

      this.connection = await mongoose.connect(mongoUri, options);
      
      logger.info(`MongoDB connected successfully to ${config.mongo.host}:${config.mongo.port}`);
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      return this.connection;
    } catch (error) {
      logger.error('Database connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
      }
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  async ping() {
    try {
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      logger.error('Database ping failed:', error);
      return false;
    }
  }
}

module.exports = new DatabaseConnection();