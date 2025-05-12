/**
 * Employee Service
 * Main entry point for the employee management service
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { errorHandler } = require('./middleware/errorMiddleware');
require('dotenv').config();

// Import routes
const employeeRoutes = require('./routes/employeeRoutes');
const documentRoutes = require('./routes/documentRoutes');
const skillRoutes = require('./routes/skillRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const careerRoutes = require('./routes/careerRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const contractRoutes = require('./routes/contractRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3003;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Management Service API',
      version: '1.0.0',
      description: 'API documentation for the Employee Management Service',
      contact: {
        name: 'API Support',
        email: 'support@samudrapaket.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js',
    './src/models/schemas.js'
  ]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/v1', employeeRoutes);
app.use('/api/v1', documentRoutes);
app.use('/api/v1', skillRoutes);
app.use('/api/v1', performanceRoutes);
app.use('/api/v1', careerRoutes);
app.use('/api/v1', trainingRoutes);
app.use('/api/v1', contractRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'employee-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Not found middleware
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Employee Service running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
