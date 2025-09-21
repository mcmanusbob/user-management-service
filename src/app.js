const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const config = require('./config/env');
const db = require('./config/db');
const logger = require('./utils/logger');

class App {
  constructor() {
    this.app = express();
    this.server = null;
  }

  async initialize() {
    try {
      logger.info('🚀 Initializing User Management Service...');
      
      // Connect to database
      await db.connect();

      // Setup middlewares
      this.setupMiddlewares();
      
      // Setup routes
      this.setupRoutes();
      
      // Setup error handling
      this.setupErrorHandling();

      // Start server
      await this.startServer();

      logger.info(`✅ User Management Service initialized successfully`);
    } catch (error) {
      logger.error('❌ Failed to initialize application:', error);
      process.exit(1);
    }
  }

  setupMiddlewares() {
    // Security middlewares
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  setupRoutes() {
    const authRoutes = require('./routes/authRoutes');

    // Health check endpoint with database status
    this.app.get('/health', async (req, res) => {
      const isDbConnected = db.isConnected();
      let dbStatus = 'disconnected';
      
      if (isDbConnected) {
        const pingSuccess = await db.ping();
        dbStatus = pingSuccess ? 'connected' : 'error';
      }

      const healthStatus = {
        status: isDbConnected ? 'OK' : 'ERROR',
        timestamp: new Date().toISOString(),
        service: 'user-management-service',
        version: config.server.apiVersion,
        environment: config.server.env,
        database: {
          status: dbStatus,
          host: config.mongo.host,
          port: config.mongo.port,
          database: config.mongo.database
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
      };

      const statusCode = isDbConnected ? 200 : 503;
      res.status(statusCode).json(healthStatus);
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'User Management Service is running!',
        version: config.server.apiVersion,
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          auth: `/api/${config.server.apiVersion}/auth`,
          docs: 'https://github.com/your-repo/user-management-service'
        }
      });
    });

    // API routes
    this.app.use(`/api/${config.server.apiVersion}/auth`, authRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        status: 'error',
        message: 'Route not found',
        path: req.originalUrl
      });
    });
  }

  setupErrorHandling() {
    this.app.use((error, req, res, next) => {
      logger.error('Error occurred:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      const statusCode = error.statusCode || 500;
      const message = config.server.env === 'production' ? 'Internal server error' : error.message;

      res.status(statusCode).json({
        status: 'error',
        message,
        ...(config.server.env === 'development' && { stack: error.stack })
      });
    });
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(config.server.port, (error) => {
        if (error) {
          logger.error('Failed to start server:', error);
          reject(error);
        } else {
          logger.info(`🚀 Server running on port ${config.server.port}`);
          console.log(`🚀 User Management Service is running on port ${config.server.port}`);
          console.log(`🔍 Health check: http://localhost:${config.server.port}/health`);
          console.log(`🌍 Environment: ${config.server.env}`);
          console.log(`📱 API Version: ${config.server.apiVersion}`);
          console.log('\n📋 Available endpoints:');
          console.log(`  GET  http://localhost:${config.server.port}/`);
          console.log(`  GET  http://localhost:${config.server.port}/health`);
          console.log(`  POST http://localhost:${config.server.port}/api/${config.server.apiVersion}/auth/register`);
          console.log(`  POST http://localhost:${config.server.port}/api/${config.server.apiVersion}/auth/login`);
          console.log(`  GET  http://localhost:${config.server.port}/api/${config.server.apiVersion}/auth/me`);
          console.log('\n💡 Press Ctrl+C to stop the server');
          resolve();
        }
      });
    });
  }

  async shutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });
    }

    await db.disconnect();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  }
}

// Initialize and start the application
if (require.main === module) {
  const app = new App();
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => app.shutdown('SIGTERM'));
  process.on('SIGINT', () => app.shutdown('SIGINT'));
  
  app.initialize();
}

module.exports = App;