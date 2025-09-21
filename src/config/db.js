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
        // Additional options for lab environment
        retryWrites: true,
        w: 'majority'
      };

      // Log connection attempt (without password)
      const safeUri = mongoUri.replace(/\/\/.*:.*@/, '//****:****@');
      logger.info(`Attempting to connect to MongoDB: ${safeUri}`);

      this.connection = await mongoose.connect(mongoUri, options);
      
      logger.info(`MongoDB connected successfully to ${config.mongo.host}:${config.mongo.port}`);
      logger.info(`Database: ${config.server.env === 'test' ? config.mongo.testDatabase : config.mongo.database}`);
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

      mongoose.connection.on('connecting', () => {
        logger.info('MongoDB connecting...');
      });

      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected');
      });

      // Graceful shutdown
      process.on('SIGINT', () => {
        this.disconnect();
      });

      return this.connection;
    } catch (error) {
      logger.error('Database connection failed:', error);
      
      // Log specific connection errors for debugging
      if (error.name === 'MongoNetworkError') {
        logger.error('Network error - check if MongoDB server is running and accessible');
      } else if (error.name === 'MongoAuthenticationError') {
        logger.error('Authentication failed - check username and password');
      } else if (error.name === 'MongoTimeoutError') {
        logger.error('Connection timeout - check network connectivity');
      }
      
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

  async clearDatabase() {
    if (config.server.env === 'test') {
      try {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
          await collections[key].deleteMany({});
        }
        logger.info('Test database cleared');
      } catch (error) {
        logger.error('Error clearing test database:', error);
      }
    } else {
      logger.warn('Database clear attempted in non-test environment');
    }
  }

  // Check connection status
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  // Get connection info
  getConnectionInfo() {
    if (this.isConnected()) {
      return {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState
      };
    }
    return null;
  }

  // Ping database to check if it's responsive
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