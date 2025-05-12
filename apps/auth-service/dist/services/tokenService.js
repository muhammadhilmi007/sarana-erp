/**
 * Token Service
 * Handles JWT token generation, validation, and management
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const redis = require('redis');
const {
  promisify
} = require('util');
const config = require('../config');
const {
  logger
} = require('../utils/logger');

// Initialize Redis client
let redisClient;
let redisGetAsync;
let redisSetAsync;
let redisDelAsync;

/**
 * Initialize Redis client
 */
const initRedisClient = async () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      url: config.redis.url
    });
    redisClient.on('error', err => {
      logger.error('Redis error:', err);
    });
    await redisClient.connect();

    // Create promisified versions of Redis methods
    redisGetAsync = redisClient.get.bind(redisClient);
    redisSetAsync = redisClient.set.bind(redisClient);
    redisDelAsync = redisClient.del.bind(redisClient);
  }
  return redisClient;
};

/**
 * Generate a secure random token
 * @param {number} bytes - Number of bytes for token
 * @returns {string} - Random token
 */
const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload
 * @returns {string} - JWT token
 */
const generateAccessToken = payload => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    issuer: process.env.JWT_ISSUER || 'sarana-auth-service',
    audience: process.env.JWT_AUDIENCE || 'sarana-app'
  });
};

/**
 * Generate refresh token
 * @returns {string} - Refresh token
 */
const generateRefreshToken = () => {
  return generateSecureToken(40);
};

/**
 * Verify JWT access token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyAccessToken = token => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || 'sarana-auth-service',
      audience: process.env.JWT_AUDIENCE || 'sarana-app'
    });
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    throw error;
  }
};

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {Promise<boolean>} - True if blacklisted, false otherwise
 */
const isTokenBlacklisted = async token => {
  try {
    await initRedisClient();
    const result = await redisGetAsync(`auth:blacklist:${token}`);
    return !!result;
  } catch (error) {
    logger.error('Error checking token blacklist:', error);
    return false;
  }
};

/**
 * Blacklist a token
 * @param {string} token - JWT token to blacklist
 * @param {number} expiresIn - Seconds until token expiration
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const blacklistToken = async (token, expiresIn) => {
  try {
    await initRedisClient();
    await redisSetAsync(`auth:blacklist:${token}`, 'blacklisted', {
      EX: expiresIn
    });
    return true;
  } catch (error) {
    logger.error('Error blacklisting token:', error);
    return false;
  }
};

/**
 * Generate email verification token
 * @param {string} userId - User ID
 * @returns {string} - Verification token
 */
const generateEmailVerificationToken = () => {
  return generateSecureToken(32);
};

/**
 * Store email verification token in Redis
 * @param {string} token - Verification token
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const storeEmailVerificationToken = async (token, userId) => {
  try {
    await initRedisClient();
    const expiresIn = 24 * 60 * 60; // 24 hours
    await redisSetAsync(`auth:email_verification:${token}`, userId, {
      EX: expiresIn
    });
    return true;
  } catch (error) {
    logger.error('Error storing email verification token:', error);
    return false;
  }
};

/**
 * Verify email verification token
 * @param {string} token - Verification token
 * @returns {Promise<string|null>} - User ID if valid, null otherwise
 */
const verifyEmailVerificationToken = async token => {
  try {
    await initRedisClient();
    const userId = await redisGetAsync(`auth:email_verification:${token}`);
    if (userId) {
      // Delete token after verification
      await redisDelAsync(`auth:email_verification:${token}`);
    }
    return userId;
  } catch (error) {
    logger.error('Error verifying email verification token:', error);
    return null;
  }
};

/**
 * Generate password reset token
 * @returns {string} - Password reset token
 */
const generatePasswordResetToken = () => {
  return generateSecureToken(32);
};

/**
 * Store password reset token in Redis
 * @param {string} token - Password reset token
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const storePasswordResetToken = async (token, userId) => {
  try {
    await initRedisClient();
    const expiresIn = 60 * 60; // 1 hour
    await redisSetAsync(`auth:password_reset:${token}`, userId, {
      EX: expiresIn
    });
    return true;
  } catch (error) {
    logger.error('Error storing password reset token:', error);
    return false;
  }
};

/**
 * Verify password reset token
 * @param {string} token - Password reset token
 * @returns {Promise<string|null>} - User ID if valid, null otherwise
 */
const verifyPasswordResetToken = async token => {
  try {
    await initRedisClient();
    const userId = await redisGetAsync(`auth:password_reset:${token}`);
    return userId;
  } catch (error) {
    logger.error('Error verifying password reset token:', error);
    return null;
  }
};

/**
 * Delete password reset token
 * @param {string} token - Password reset token
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const deletePasswordResetToken = async token => {
  try {
    await initRedisClient();
    await redisDelAsync(`auth:password_reset:${token}`);
    return true;
  } catch (error) {
    logger.error('Error deleting password reset token:', error);
    return false;
  }
};
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  isTokenBlacklisted,
  blacklistToken,
  generateEmailVerificationToken,
  storeEmailVerificationToken,
  verifyEmailVerificationToken,
  generatePasswordResetToken,
  storePasswordResetToken,
  verifyPasswordResetToken,
  deletePasswordResetToken,
  initRedisClient
};