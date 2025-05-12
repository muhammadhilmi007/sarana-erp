/**
 * API Gateway for Samudra Paket ERP
 * Main entry point for the API Gateway service
 */
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const winston = require('winston');
const expressWinston = require('express-winston');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const Prometheus = require('prom-client');
const redis = require('redis');
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/authMiddleware');
const { circuitBreaker } = require('./middleware/circuitBreaker');
const { requestValidator } = require('./middleware/requestValidator');
const { healthCheckRoutes } = require('./routes/healthCheck');
const config = require('./config');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Redis client for caching
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

(async () => {
  await redisClient.connect();
})();

// Setup Prometheus metrics collection
const metricsInterval = Prometheus.collectDefaultMetrics();
const httpRequestDurationMicroseconds = new Prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
});

// Setup middleware
app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS configuration
app.use(cors({
  origin: [
    process.env.WEB_CLIENT_URL || 'http://localhost:3001',
    process.env.MOBILE_CLIENT_URL || 'http://localhost:19000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Logging middleware
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'api-gateway.log' }),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
}));

// Request tracing middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || require('crypto').randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', Prometheus.register.contentType);
  res.end(await Prometheus.register.metrics());
});

// Health check routes
app.use('/health', healthCheckRoutes);

// API versioning
app.use('/api/v1', [
  // Authentication middleware for protected routes
  authMiddleware,
  
  // Service routes with circuit breaker and request validation
  circuitBreaker(
    '/auth',
    createProxyMiddleware({
      target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      pathRewrite: { '^/api/v1/auth': '' },
      changeOrigin: true,
    })
  ),
  
  circuitBreaker(
    '/core',
    createProxyMiddleware({
      target: process.env.CORE_SERVICE_URL || 'http://localhost:3002',
      pathRewrite: { '^/api/v1/core': '' },
      changeOrigin: true,
    })
  ),
  
  circuitBreaker(
    '/operations',
    createProxyMiddleware({
      target: process.env.OPERATIONS_SERVICE_URL || 'http://localhost:3003',
      pathRewrite: { '^/api/v1/operations': '' },
      changeOrigin: true,
    })
  ),
  
  circuitBreaker(
    '/finance',
    createProxyMiddleware({
      target: process.env.FINANCE_SERVICE_URL || 'http://localhost:3004',
      pathRewrite: { '^/api/v1/finance': '' },
      changeOrigin: true,
    })
  ),
  
  circuitBreaker(
    '/notification',
    createProxyMiddleware({
      target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
      pathRewrite: { '^/api/v1/notification': '' },
      changeOrigin: true,
    })
  ),
  
  circuitBreaker(
    '/reporting',
    createProxyMiddleware({
      target: process.env.REPORTING_SERVICE_URL || 'http://localhost:3006',
      pathRewrite: { '^/api/v1/reporting': '' },
      changeOrigin: true,
    })
  ),
]);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Samudra Paket ERP API',
      version: '1.0.0',
      description: 'API documentation for Samudra Paket ERP system',
      contact: {
        name: 'API Support',
        email: 'support@samudraepaket.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/api/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  metricsInterval.clear();
  redisClient.quit();
  app.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
