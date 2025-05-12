/**
 * Redis Utility
 * Provides Redis client for caching and other operations
 */

const redis = require('redis');
const { logger } = require('./logger');

// Redis client instance
let client;
let isConnected = false;
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Connect to Redis
 * @returns {Promise<Object>} - Redis client
 */
const connect = async () => {
  if (isConnected) {
    return client;
  }
  
  if (isConnecting) {
    // Wait for connection to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (isConnected) {
          clearInterval(checkInterval);
          resolve(client);
        }
      }, 100);
    });
  }
  
  isConnecting = true;
  
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    
    // Set up event handlers
    client.on('error', (err) => {
      logger.error('Redis client error: ', { error: err });
      isConnected = false;
    });
    
    client.on('connect', () => {
      logger.info('Redis client connected');
      isConnected = true;
      isConnecting = false;
      reconnectAttempts = 0;
    });
    
    client.on('end', () => {
      logger.info('Redis client disconnected');
      isConnected = false;
      
      // Attempt to reconnect
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
        logger.info(`Redis reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
        setTimeout(() => {
          reconnectAttempts++;
          logger.info('Redis client reconnecting');
          client.connect().catch((err) => {
            logger.error('Redis reconnection failed:', err);
          });
        }, delay);
      } else {
        logger.error(`Redis max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached`);
      }
    });
    
    // Connect to Redis
    await client.connect();
    
    return client;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    isConnecting = false;
    throw error;
  }
};

/**
 * Get value from Redis
 * @param {string} key - Redis key
 * @returns {Promise<string|null>} - Value or null if not found
 */
const get = async (key) => {
  try {
    if (!isConnected) {
      await connect();
    }
    
    return await client.get(key);
  } catch (error) {
    logger.error(`Redis get error for key ${key}:`, error);
    return null;
  }
};

/**
 * Set value in Redis
 * @param {string} key - Redis key
 * @param {string} value - Value to set
 * @param {Object} options - Options (e.g., { EX: 60 } for 60 seconds expiration)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const set = async (key, value, options = {}) => {
  try {
    if (!isConnected) {
      await connect();
    }
    
    await client.set(key, value, options);
    return true;
  } catch (error) {
    logger.error(`Redis set error for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete key from Redis
 * @param {string|Array} key - Redis key or array of keys
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const del = async (key) => {
  try {
    if (!isConnected) {
      await connect();
    }
    
    if (Array.isArray(key)) {
      await client.del(key);
    } else {
      await client.del(key);
    }
    
    return true;
  } catch (error) {
    logger.error(`Redis del error for key ${key}:`, error);
    return false;
  }
};

/**
 * Find keys matching pattern
 * @param {string} pattern - Redis key pattern
 * @returns {Promise<Array>} - Array of matching keys
 */
const keys = async (pattern) => {
  try {
    if (!isConnected) {
      await connect();
    }
    
    return await client.keys(pattern);
  } catch (error) {
    logger.error(`Redis keys error for pattern ${pattern}:`, error);
    return [];
  }
};

/**
 * Check if Redis is connected
 * @returns {boolean} - True if connected, false otherwise
 */
const isRedisConnected = () => {
  return isConnected;
};

module.exports = {
  connect,
  get,
  set,
  del,
  keys,
  isConnected: isRedisConnected,
};
