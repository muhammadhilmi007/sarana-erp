/**
 * Cache Middleware
 * Implements response caching with Redis for performance optimization
 */

const redis = require('redis');
const { logger } = require('../utils/logger');
const config = require('../config');

// Initialize Redis client
let redisClient;

// Default TTL in seconds
const DEFAULT_TTL = config.redis.ttl || 3600; // 1 hour

/**
 * Initialize the Redis client
 * @returns {Promise<void>}
 */
const initRedisClient = async () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      url: config.redis.url,
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });
    
    await redisClient.connect();
  }
  
  return redisClient;
};

/**
 * Generate a cache key from request
 * @param {Object} req - Express request object
 * @returns {string} Cache key
 */
const generateCacheKey = (req) => {
  const path = req.originalUrl || req.url;
  
  // Include user ID in cache key if authenticated
  const userId = req.user ? req.user.id : 'anonymous';
  
  // Include query parameters in cache key
  const queryParams = JSON.stringify(req.query);
  
  return `api:${userId}:${req.method}:${path}:${queryParams}`;
};

/**
 * Cache middleware factory
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (ttl = DEFAULT_TTL) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    try {
      const client = await initRedisClient();
      const key = generateCacheKey(req);
      
      // Try to get cached response
      const cachedResponse = await client.get(key);
      
      if (cachedResponse) {
        const parsedResponse = JSON.parse(cachedResponse);
        
        // Set headers from cached response
        if (parsedResponse.headers) {
          Object.keys(parsedResponse.headers).forEach((header) => {
            res.setHeader(header, parsedResponse.headers[header]);
          });
        }
        
        // Add cache hit header
        res.setHeader('X-Cache', 'HIT');
        
        // Send cached response
        return res.status(parsedResponse.status).json(parsedResponse.data);
      }
      
      // Cache miss, continue to handler
      res.setHeader('X-Cache', 'MISS');
      
      // Store original send method
      const originalSend = res.json;
      
      // Override send method to cache response
      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const responseToCache = {
            status: res.statusCode,
            data,
            headers: {
              'Content-Type': res.getHeader('Content-Type'),
            },
          };
          
          // Store response in cache
          client.set(key, JSON.stringify(responseToCache), {
            EX: ttl,
          }).catch((err) => {
            logger.error('Redis cache error:', err);
          });
        }
        
        // Call original send method
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Clear cache for a specific pattern
 * @param {string} pattern - Cache key pattern to clear
 * @returns {Promise<number>} Number of keys removed
 */
const clearCache = async (pattern) => {
  try {
    const client = await initRedisClient();
    const keys = await client.keys(`api:${pattern}*`);
    
    if (keys.length > 0) {
      const result = await client.del(keys);
      logger.info(`Cleared ${result} cache keys matching pattern: ${pattern}`);
      return result;
    }
    
    return 0;
  } catch (error) {
    logger.error('Clear cache error:', error);
    throw error;
  }
};

module.exports = {
  cacheMiddleware,
  clearCache,
  initRedisClient,
};
