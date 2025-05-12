/**
 * Auth Service Entry Point
 * Main application file for the Auth Service
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Import utilities and middleware
const { logger, requestLogger } = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');
const redis = require('./utils/redis');
const config = require('./config');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error(`MongoDB connection error: ${error.message}`, { error });
    process.exit(1);
  });

// Connect to Redis
redis.connect()
  .then(() => {
    logger.info('Connected to Redis');
  })
  .catch((error) => {
    logger.warn(`Redis connection error: ${error.message}`, { error });
    logger.warn('Continuing without Redis - some features may be degraded');
  });

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'API documentation for the Auth Service',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(helmet()); // Security headers
app.use(cors(config.cors)); // CORS configuration
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(compression()); // Compress responses
app.use(requestLogger()); // Request logging
app.use(globalLimiter); // Rate limiting

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check endpoint
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  };
  
  // Check MongoDB connection
  if (mongoose.connection.readyState === 1) {
    healthcheck.mongodb = 'Connected';
  } else {
    healthcheck.mongodb = 'Disconnected';
    healthcheck.message = 'Degraded';
  }
  
  // Check Redis connection
  if (redis.isReady) {
    healthcheck.redis = 'Connected';
  } else {
    healthcheck.redis = 'Disconnected';
    healthcheck.message = 'Degraded';
  }
  
  res.status(healthcheck.message === 'OK' ? 200 : 503).json(healthcheck);
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Auth Service running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Exit with failure
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

module.exports = app;
