/**
 * Redis Utility
 * Provides Redis client for caching and session management
 */

const { createClient } = require('redis');
const { logger } = require('./logger');
const config = require('../config');

// Redis client configuration
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential backoff with max delay of 10 seconds
      const delay = Math.min(Math.pow(2, retries) * 1000, 10000);
      logger.info(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
      return delay;
    },
  },
};

// Create Redis client
const client = createClient(redisConfig);

// Track connection status
let isReady = false;

// Set up event handlers
client.on('connect', () => {
  logger.info('Redis client connecting');
});

client.on('ready', () => {
  isReady = true;
  logger.info('Redis client connected and ready');
});

client.on('error', (err) => {
  isReady = false;
  logger.error(`Redis client error: ${err.message}`, { error: err });
});

client.on('reconnecting', () => {
  isReady = false;
  logger.info('Redis client reconnecting');
});

client.on('end', () => {
  isReady = false;
  logger.info('Redis client disconnected');
});

/**
 * Initialize Redis connection
 */
const connect = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    return client;
  } catch (error) {
    logger.error(`Failed to connect to Redis: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get value from Redis
 * @param {string} key - Redis key
 * @returns {Promise<any>} Value or null if not found
 */
const get = async (key) => {
  try {
    if (!isReady) {
      logger.warn('Redis not ready, skipping get operation');
      return null;
    }
    
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error(`Redis get error: ${error.message}`, { key, error });
    return null;
  }
};

/**
 * Set value in Redis
 * @param {string} key - Redis key
 * @param {any} value - Value to store
 * @param {number} [expiry] - Expiry time in seconds
 * @returns {Promise<boolean>} Success status
 */
const set = async (key, value, expiry = null) => {
  try {
    if (!isReady) {
      logger.warn('Redis not ready, skipping set operation');
      return false;
    }
    
    const stringValue = JSON.stringify(value);
    
    if (expiry) {
      await client.setEx(key, expiry, stringValue);
    } else {
      await client.set(key, stringValue);
    }
    
    return true;
  } catch (error) {
    logger.error(`Redis set error: ${error.message}`, { key, error });
    return false;
  }
};

/**
 * Delete key from Redis
 * @param {string} key - Redis key
 * @returns {Promise<boolean>} Success status
 */
const del = async (key) => {
  try {
    if (!isReady) {
      logger.warn('Redis not ready, skipping delete operation');
      return false;
    }
    
    await client.del(key);
    return true;
  } catch (error) {
    logger.error(`Redis delete error: ${error.message}`, { key, error });
    return false;
  }
};

/**
 * Check if key exists in Redis
 * @param {string} key - Redis key
 * @returns {Promise<boolean>} True if key exists
 */
const exists = async (key) => {
  try {
    if (!isReady) {
      logger.warn('Redis not ready, skipping exists operation');
      return false;
    }
    
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    logger.error(`Redis exists error: ${error.message}`, { key, error });
    return false;
  }
};

/**
 * Set key expiry in Redis
 * @param {string} key - Redis key
 * @param {number} seconds - Expiry time in seconds
 * @returns {Promise<boolean>} Success status
 */
const expire = async (key, seconds) => {
  try {
    if (!isReady) {
      logger.warn('Redis not ready, skipping expire operation');
      return false;
    }
    
    await client.expire(key, seconds);
    return true;
  } catch (error) {
    logger.error(`Redis expire error: ${error.message}`, { key, seconds, error });
    return false;
  }
};

module.exports = {
  client,
  connect,
  get,
  set,
  del,
  exists,
  expire,
  isReady,
};
