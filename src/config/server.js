const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const config = require('./env');
const logger = require('../utils/logger');
const errorHandler = require('../utils/errorHandler');
const rateLimitMiddleware = require('../middlewares/rateLimitMiddleware');

class ServerConfig {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddlewares() {
    // Security middlewares
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      }
    }));

    // CORS configuration
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

    // Sanitize user input
    this.app.use(mongoSanitize());

    // Rate limiting
    this.app.use(rateLimitMiddleware);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  setupRoutes() {
    const authRoutes = require('../routes/authRoutes');
    const profileRoutes = require('../routes/profileRoutes');
    const preferencesRoutes = require('../routes/preferencesRoutes');

    // Health check endpoint with database status
    this.app.get('/health', async (req, res) => {
      const db = require('./db');
      const connectionInfo = db.getConnectionInfo();
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
          database: config.mongo.database,
          connection: connectionInfo
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
      };

      const statusCode = isDbConnected ? 200 : 503;
      res.status(statusCode).json(healthStatus);
    });

    // API routes
    this.app.use(`/api/${config.server.apiVersion}/auth`, authRoutes);
    this.app.use(`/api/${config.server.apiVersion}/profile`, profileRoutes);
    this.app.use(`/api/${config.server.apiVersion}/preferences`, preferencesRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    });
  }

  setupErrorHandling() {
    this.app.use(errorHandler.handle);
  }

  getApp() {
    return this.app;
  }
}

module.exports = new ServerConfig();