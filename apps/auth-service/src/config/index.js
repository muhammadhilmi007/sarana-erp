/**
 * Configuration Module
 * Centralizes configuration settings for the Auth Service
 */

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
  },
  
  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sarana-auth',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'sarana-auth-service',
    audience: process.env.JWT_AUDIENCE || 'sarana-app',
  },
  
  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    prefix: 'auth:',
  },
  
  // Email configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@samudraepaket.com',
    service: process.env.EMAIL_SERVICE || 'smtp',
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    },
  },
  
  // Security configuration
  security: {
    // Password policy
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      maxHistory: 5,
      expiryDays: 90,
    },
    
    // Rate limiting
    rateLimit: {
      login: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts per IP per window
      },
      passwordReset: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // 3 attempts per IP per window
      },
      emailVerification: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // 5 attempts per IP per window
      },
    },
    
    // Account locking
    accountLocking: {
      maxFailedAttempts: 5,
      lockDuration: 30 * 60 * 1000, // 30 minutes
    },
    
    // Token configuration
    tokens: {
      emailVerification: {
        expiresIn: '24h',
      },
      passwordReset: {
        expiresIn: '1h',
      },
    },
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'auth-service.log',
  },
  
  // Client URLs for redirects
  clientUrls: {
    webAppUrl: process.env.WEB_APP_URL || 'http://localhost:3000',
    mobileAppUrl: process.env.MOBILE_APP_URL || 'exp://localhost:19000',
    emailVerificationRedirect: '/verify-email',
    passwordResetRedirect: '/reset-password',
  },
};

module.exports = config;
