/**
 * Configuration Module
 * Centralizes configuration settings for the API Gateway
 */

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    corsOrigins: [
      process.env.WEB_CLIENT_URL || 'http://localhost:3001',
      process.env.MOBILE_CLIENT_URL || 'http://localhost:19000',
    ],
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  },
  
  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: 60 * 60, // 1 hour cache TTL by default
  },
  
  // Microservices configuration
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timeout: 5000,
    },
    core: {
      url: process.env.CORE_SERVICE_URL || 'http://localhost:3002',
      timeout: 5000,
    },
    operations: {
      url: process.env.OPERATIONS_SERVICE_URL || 'http://localhost:3003',
      timeout: 5000,
    },
    finance: {
      url: process.env.FINANCE_SERVICE_URL || 'http://localhost:3004',
      timeout: 5000,
    },
    notification: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
      timeout: 5000,
    },
    reporting: {
      url: process.env.REPORTING_SERVICE_URL || 'http://localhost:3006',
      timeout: 5000,
    },
  },
  
  // Circuit breaker configuration
  circuitBreaker: {
    timeout: 5000, // If function takes longer than 5 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
    resetTimeout: 30000, // After 30 seconds, try again
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'api-gateway.log',
  },
  
  // Swagger documentation configuration
  swagger: {
    title: 'Samudra Paket ERP API',
    version: '1.0.0',
    description: 'API documentation for Samudra Paket ERP system',
  },
};

module.exports = config;
