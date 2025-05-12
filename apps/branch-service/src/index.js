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
const serviceAreaRoutes = require('./routes/serviceAreaRoutes');

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
        // Service Area Schemas
        ServiceAreaCreate: {
          type: 'object',
          required: ['name', 'code', 'boundaries', 'center'],
          properties: {
            name: {
              type: 'string',
              description: 'Service area name',
              example: 'Bandung City Coverage',
            },
            code: {
              type: 'string',
              description: 'Service area code',
              example: 'BDG-AREA-001',
            },
            description: {
              type: 'string',
              description: 'Service area description',
              example: 'Coverage area for Bandung city center',
            },
            boundaries: {
              type: 'object',
              required: ['type', 'coordinates'],
              properties: {
                type: {
                  type: 'string',
                  enum: ['Polygon'],
                  description: 'GeoJSON geometry type',
                  example: 'Polygon',
                },
                coordinates: {
                  type: 'array',
                  description: 'GeoJSON coordinates array',
                  example: [[[
                    107.5900, -6.9000,
                    107.6200, -6.9000,
                    107.6200, -6.9300,
                    107.5900, -6.9300,
                    107.5900, -6.9000
                  ]]],
                },
              },
            },
            center: {
              type: 'object',
              required: ['type', 'coordinates'],
              properties: {
                type: {
                  type: 'string',
                  enum: ['Point'],
                  description: 'GeoJSON geometry type',
                  example: 'Point',
                },
                coordinates: {
                  type: 'array',
                  description: 'GeoJSON coordinates array [longitude, latitude]',
                  example: [107.6097, -6.9147],
                },
              },
            },
            coverageRadius: {
              type: 'number',
              description: 'Coverage radius in kilometers',
              example: 5,
            },
            type: {
              type: 'string',
              enum: ['delivery', 'pickup', 'both'],
              description: 'Service area type',
              example: 'both',
            },
            branches: {
              type: 'array',
              description: 'Assigned branches',
              items: {
                type: 'object',
                properties: {
                  branchId: {
                    type: 'string',
                    description: 'Branch ID',
                    example: '60d21b4667d0d8992e610c85',
                  },
                  isPrimary: {
                    type: 'boolean',
                    description: 'Is primary branch for this area',
                    example: true,
                  },
                },
              },
            },
            pricing: {
              type: 'object',
              properties: {
                basePrice: {
                  type: 'number',
                  description: 'Base price for delivery in this area',
                  example: 10000,
                },
                pricePerKm: {
                  type: 'number',
                  description: 'Price per kilometer',
                  example: 2000,
                },
                minimumDistance: {
                  type: 'number',
                  description: 'Minimum distance in kilometers',
                  example: 1,
                },
                maximumDistance: {
                  type: 'number',
                  description: 'Maximum distance in kilometers',
                  example: 20,
                },
                specialRates: {
                  type: 'array',
                  description: 'Special rates for specific conditions',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Special rate name',
                        example: 'Weekend Rate',
                      },
                      description: {
                        type: 'string',
                        description: 'Special rate description',
                        example: 'Higher rate for weekend deliveries',
                      },
                      rate: {
                        type: 'number',
                        description: 'Rate amount',
                        example: 15000,
                      },
                      conditions: {
                        type: 'object',
                        description: 'Conditions for applying this rate',
                        example: { days: ['saturday', 'sunday'] },
                      },
                    },
                  },
                },
              },
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending'],
              description: 'Service area status',
              example: 'active',
            },
          },
        },
        ServiceAreaUpdate: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Service area name',
              example: 'Bandung City Coverage Updated',
            },
            description: {
              type: 'string',
              description: 'Service area description',
              example: 'Updated coverage area for Bandung city center',
            },
            boundaries: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['Polygon'],
                  description: 'GeoJSON geometry type',
                  example: 'Polygon',
                },
                coordinates: {
                  type: 'array',
                  description: 'GeoJSON coordinates array',
                  example: [[[
                    107.5800, -6.8900,
                    107.6300, -6.8900,
                    107.6300, -6.9400,
                    107.5800, -6.9400,
                    107.5800, -6.8900
                  ]]],
                },
              },
            },
            center: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['Point'],
                  description: 'GeoJSON geometry type',
                  example: 'Point',
                },
                coordinates: {
                  type: 'array',
                  description: 'GeoJSON coordinates array [longitude, latitude]',
                  example: [107.6097, -6.9147],
                },
              },
            },
            coverageRadius: {
              type: 'number',
              description: 'Coverage radius in kilometers',
              example: 6,
            },
            type: {
              type: 'string',
              enum: ['delivery', 'pickup', 'both'],
              description: 'Service area type',
              example: 'both',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending'],
              description: 'Service area status',
              example: 'active',
            },
          },
        },
        ServiceAreaStatus: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending'],
              description: 'Service area status',
              example: 'inactive',
            },
            reason: {
              type: 'string',
              description: 'Reason for status change',
              example: 'Temporarily unavailable due to road construction',
            },
          },
        },
        ServiceAreaBranchAssignment: {
          type: 'object',
          required: ['branchId'],
          properties: {
            branchId: {
              type: 'string',
              description: 'Branch ID to assign',
              example: '60d21b4667d0d8992e610c85',
            },
            isPrimary: {
              type: 'boolean',
              description: 'Is primary branch for this area',
              example: true,
            },
          },
        },
        ServiceAreaPricing: {
          type: 'object',
          properties: {
            basePrice: {
              type: 'number',
              description: 'Base price for delivery in this area',
              example: 12000,
            },
            pricePerKm: {
              type: 'number',
              description: 'Price per kilometer',
              example: 2500,
            },
            minimumDistance: {
              type: 'number',
              description: 'Minimum distance in kilometers',
              example: 1,
            },
            maximumDistance: {
              type: 'number',
              description: 'Maximum distance in kilometers',
              example: 25,
            },
            specialRates: {
              type: 'array',
              description: 'Special rates for specific conditions',
              items: {
                type: 'object',
                required: ['name', 'rate'],
                properties: {
                  name: {
                    type: 'string',
                    description: 'Special rate name',
                    example: 'Holiday Rate',
                  },
                  description: {
                    type: 'string',
                    description: 'Special rate description',
                    example: 'Higher rate for holiday deliveries',
                  },
                  rate: {
                    type: 'number',
                    description: 'Rate amount',
                    example: 18000,
                  },
                  conditions: {
                    type: 'object',
                    description: 'Conditions for applying this rate',
                    example: { holidays: ['new-year', 'independence-day'] },
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
app.use('/api/v1/service-areas', serviceAreaRoutes);

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
