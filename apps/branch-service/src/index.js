/**
 * Branch Management Service Entry Point
 * Main application file for the Branch Management Service
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
const redis = require('./utils/redis');

// Import routes
const branchRoutes = require('./routes/branchRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3003;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sarana-branch', {
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
      title: 'Branch Management Service API',
      version: '1.0.0',
      description: 'API documentation for the Branch Management Service',
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
      schemas: {
        BranchInput: {
          type: 'object',
          required: ['code', 'name', 'type', 'address', 'contactInfo'],
          properties: {
            code: {
              type: 'string',
              description: 'Branch code',
              example: 'BDG-001',
            },
            name: {
              type: 'string',
              description: 'Branch name',
              example: 'Bandung Branch',
            },
            type: {
              type: 'string',
              enum: ['headquarters', 'regional', 'branch'],
              description: 'Branch type',
              example: 'branch',
            },
            parentId: {
              type: 'string',
              description: 'Parent branch ID',
              example: '60d21b4667d0d8992e610c85',
            },
            address: {
              type: 'object',
              required: ['street', 'city', 'state', 'postalCode'],
              properties: {
                street: {
                  type: 'string',
                  description: 'Street address',
                  example: 'Jl. Asia Afrika No. 123',
                },
                city: {
                  type: 'string',
                  description: 'City',
                  example: 'Bandung',
                },
                state: {
                  type: 'string',
                  description: 'State/Province',
                  example: 'Jawa Barat',
                },
                postalCode: {
                  type: 'string',
                  description: 'Postal code',
                  example: '40112',
                },
                country: {
                  type: 'string',
                  description: 'Country',
                  example: 'Indonesia',
                },
                coordinates: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['Point'],
                      example: 'Point',
                    },
                    coordinates: {
                      type: 'array',
                      items: {
                        type: 'number',
                      },
                      example: [107.6097, -6.9147],
                    },
                  },
                },
              },
            },
            contactInfo: {
              type: 'object',
              required: ['phone', 'email'],
              properties: {
                phone: {
                  type: 'string',
                  description: 'Phone number',
                  example: '+62221234567',
                },
                email: {
                  type: 'string',
                  description: 'Email address',
                  example: 'bandung@sarana.com',
                },
                fax: {
                  type: 'string',
                  description: 'Fax number',
                  example: '+62221234568',
                },
                website: {
                  type: 'string',
                  description: 'Website URL',
                  example: 'https://bandung.sarana.com',
                },
              },
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending', 'closed'],
              description: 'Branch status',
              example: 'active',
            },
          },
        },
        BranchUpdateInput: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Branch name',
              example: 'Bandung Branch Updated',
            },
            type: {
              type: 'string',
              enum: ['headquarters', 'regional', 'branch'],
              description: 'Branch type',
              example: 'regional',
            },
            parentId: {
              type: 'string',
              description: 'Parent branch ID',
              example: '60d21b4667d0d8992e610c85',
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  description: 'Street address',
                  example: 'Jl. Braga No. 456',
                },
                city: {
                  type: 'string',
                  description: 'City',
                  example: 'Bandung',
                },
                state: {
                  type: 'string',
                  description: 'State/Province',
                  example: 'Jawa Barat',
                },
                postalCode: {
                  type: 'string',
                  description: 'Postal code',
                  example: '40115',
                },
                country: {
                  type: 'string',
                  description: 'Country',
                  example: 'Indonesia',
                },
                coordinates: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['Point'],
                      example: 'Point',
                    },
                    coordinates: {
                      type: 'array',
                      items: {
                        type: 'number',
                      },
                      example: [107.6097, -6.9147],
                    },
                  },
                },
              },
            },
            contactInfo: {
              type: 'object',
              properties: {
                phone: {
                  type: 'string',
                  description: 'Phone number',
                  example: '+62221234567',
                },
                email: {
                  type: 'string',
                  description: 'Email address',
                  example: 'bandung@sarana.com',
                },
                fax: {
                  type: 'string',
                  description: 'Fax number',
                  example: '+62221234568',
                },
                website: {
                  type: 'string',
                  description: 'Website URL',
                  example: 'https://bandung.sarana.com',
                },
              },
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending', 'closed'],
              description: 'Branch status',
              example: 'active',
            },
          },
        },
        BranchResourcesInput: {
          type: 'object',
          properties: {
            employeeCount: {
              type: 'integer',
              description: 'Number of employees',
              example: 25,
            },
            vehicleCount: {
              type: 'integer',
              description: 'Number of vehicles',
              example: 10,
            },
            storageCapacity: {
              type: 'number',
              description: 'Storage capacity in cubic meters',
              example: 500,
            },
            maxDailyPackages: {
              type: 'integer',
              description: 'Maximum daily package capacity',
              example: 1000,
            },
          },
        },
        BranchPerformanceMetricsInput: {
          type: 'object',
          properties: {
            monthlyRevenue: {
              type: 'number',
              description: 'Monthly revenue',
              example: 250000000,
            },
            monthlyPackages: {
              type: 'integer',
              description: 'Monthly package count',
              example: 15000,
            },
            customerSatisfaction: {
              type: 'number',
              description: 'Customer satisfaction score (0-100)',
              example: 85,
            },
            deliverySuccessRate: {
              type: 'number',
              description: 'Delivery success rate (0-100)',
              example: 98.5,
            },
          },
        },
        BranchDocumentInput: {
          type: 'object',
          required: ['name', 'type', 'fileUrl'],
          properties: {
            name: {
              type: 'string',
              description: 'Document name',
              example: 'Business License',
            },
            type: {
              type: 'string',
              enum: ['license', 'permit', 'certificate', 'contract', 'other'],
              description: 'Document type',
              example: 'license',
            },
            fileUrl: {
              type: 'string',
              description: 'Document file URL',
              example: 'https://storage.sarana.com/documents/license-123.pdf',
            },
            expiryDate: {
              type: 'string',
              format: 'date',
              description: 'Document expiry date',
              example: '2025-12-31',
            },
            isActive: {
              type: 'boolean',
              description: 'Document active status',
              example: true,
            },
          },
        },
        BranchDocumentUpdateInput: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Document name',
              example: 'Business License Updated',
            },
            type: {
              type: 'string',
              enum: ['license', 'permit', 'certificate', 'contract', 'other'],
              description: 'Document type',
              example: 'license',
            },
            fileUrl: {
              type: 'string',
              description: 'Document file URL',
              example: 'https://storage.sarana.com/documents/license-123-updated.pdf',
            },
            expiryDate: {
              type: 'string',
              format: 'date',
              description: 'Document expiry date',
              example: '2026-12-31',
            },
            isActive: {
              type: 'boolean',
              description: 'Document active status',
              example: true,
            },
          },
        },
        BranchOperationalHoursInput: {
          type: 'object',
          required: ['operationalHours'],
          properties: {
            operationalHours: {
              type: 'array',
              items: {
                type: 'object',
                required: ['day', 'isOpen'],
                properties: {
                  day: {
                    type: 'string',
                    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                    description: 'Day of the week',
                    example: 'monday',
                  },
                  isOpen: {
                    type: 'boolean',
                    description: 'Is branch open on this day',
                    example: true,
                  },
                  openTime: {
                    type: 'string',
                    description: 'Opening time (HH:MM)',
                    example: '08:00',
                  },
                  closeTime: {
                    type: 'string',
                    description: 'Closing time (HH:MM)',
                    example: '17:00',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS configuration
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(compression()); // Compress responses
app.use(requestLogger()); // Request logging

// API routes
app.use('/api/v1/branches', branchRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check endpoint
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongoConnection: mongoose.connection.readyState === 1,
    redisConnection: redis.isConnected(),
  };
  
  res.status(200).json(healthcheck);
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Branch Management Service running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

module.exports = app;
