/**
 * Health Check Routes
 * Provides endpoints for monitoring system health
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const redis = require('redis');
const { version } = require('../../package.json');
const { logger } = require('../utils/logger');

// Service endpoints to check
const services = [
  { name: 'auth-service', url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001', path: '/health' },
  { name: 'core-service', url: process.env.CORE_SERVICE_URL || 'http://localhost:3002', path: '/health' },
  { name: 'operations-service', url: process.env.OPERATIONS_SERVICE_URL || 'http://localhost:3003', path: '/health' },
  { name: 'finance-service', url: process.env.FINANCE_SERVICE_URL || 'http://localhost:3004', path: '/health' },
  { name: 'notification-service', url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005', path: '/health' },
  { name: 'reporting-service', url: process.env.REPORTING_SERVICE_URL || 'http://localhost:3006', path: '/health' },
];

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get API Gateway health status
 *     description: Returns the health status of the API Gateway
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API Gateway is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 timestamp:
 *                   type: string
 *                   example: 2023-04-15T12:00:00.000Z
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    version,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /health/redis:
 *   get:
 *     summary: Check Redis connection
 *     description: Checks if the API Gateway can connect to Redis
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Redis connection is healthy
 *       503:
 *         description: Redis connection failed
 */
router.get('/redis', async (req, res) => {
  try {
    const redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis health check error:', err);
      throw err;
    });
    
    await redisClient.connect();
    await redisClient.ping();
    await redisClient.quit();
    
    res.json({
      status: 'ok',
      service: 'redis',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Redis health check failed:', error);
    res.status(503).json({
      status: 'error',
      service: 'redis',
      message: 'Redis connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /health/services:
 *   get:
 *     summary: Check all microservices health
 *     description: Checks the health of all microservices
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All services health status
 */
router.get('/services', async (req, res) => {
  const results = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await axios.get(`${service.url}${service.path}`, {
          timeout: 3000,
        });
        
        return {
          name: service.name,
          status: response.status === 200 ? 'ok' : 'error',
          url: `${service.url}${service.path}`,
        };
      } catch (error) {
        logger.error(`Health check failed for ${service.name}:`, error.message);
        return {
          name: service.name,
          status: 'error',
          message: error.message,
          url: `${service.url}${service.path}`,
        };
      }
    })
  );
  
  const allOk = results.every(result => result.status === 'ok');
  
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: results,
  });
});

/**
 * @swagger
 * /health/service/{serviceName}:
 *   get:
 *     summary: Check specific microservice health
 *     description: Checks the health of a specific microservice
 *     tags: [Health]
 *     parameters:
 *       - in: path
 *         name: serviceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the service to check
 *     responses:
 *       200:
 *         description: Service health status
 *       404:
 *         description: Service not found
 */
router.get('/service/:serviceName', async (req, res) => {
  const { serviceName } = req.params;
  const service = services.find(s => s.name === serviceName);
  
  if (!service) {
    return res.status(404).json({
      status: 'error',
      message: `Service ${serviceName} not found`,
      timestamp: new Date().toISOString(),
    });
  }
  
  try {
    const response = await axios.get(`${service.url}${service.path}`, {
      timeout: 3000,
    });
    
    res.json({
      name: service.name,
      status: response.status === 200 ? 'ok' : 'error',
      url: `${service.url}${service.path}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Health check failed for ${service.name}:`, error.message);
    res.status(503).json({
      name: service.name,
      status: 'error',
      message: error.message,
      url: `${service.url}${service.path}`,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = {
  healthCheckRoutes: router,
};
