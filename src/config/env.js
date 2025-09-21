const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Helper function to construct MongoDB URI
const constructMongoUri = (isTest = false) => {
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const host = process.env.MONGO_HOST;
  const port = process.env.MONGO_PORT;
  const database = isTest ? 
    (process.env.MONGO_TEST_DATABASE || 'learning_platform_users_test') : 
    (process.env.MONGO_DATABASE || 'learning_platform_users');
  
  // If individual components are provided, construct the URI
  if (username && password && host && port) {
    return `mongodb://${username}:${password}@${host}:${port}/${database}`;
  }
  
  // Fallback to direct URI if provided
  return isTest ? 
    (process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/learning_platform_users_test') :
    (process.env.MONGODB_URI || 'mongodb://localhost:27017/learning_platform_users');
};

const config = {
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1'
  },
  database: {
    uri: constructMongoUri(false),
    testUri: constructMongoUri(true),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
      // Additional options for authentication
      authSource: 'admin'
    }
  },
  mongo: {
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    host: process.env.MONGO_HOST || 'localhost',
    port: process.env.MONGO_PORT || '27017',
    database: process.env.MONGO_DATABASE || 'learning_platform_users',
    testDatabase: process.env.MONGO_TEST_DATABASE || 'learning_platform_users_test'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    expiresIn: process.env.JWT_EXPIRE || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  },
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/user-service.log'
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'MONGO_USERNAME',
  'MONGO_PASSWORD', 
  'MONGO_HOST',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && config.server.env !== 'test') {
  console.error('Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file');
  process.exit(1);
}

// Log database configuration (without sensitive data)
if (config.server.env === 'development') {
  console.log('Database Configuration:');
  console.log('- Host:', config.mongo.host);
  console.log('- Port:', config.mongo.port);
  console.log('- Database:', config.mongo.database);
  console.log('- Auth Source: admin');
}

module.exports = config;