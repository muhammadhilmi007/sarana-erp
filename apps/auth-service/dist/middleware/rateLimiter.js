/**
 * Rate Limiter Middleware
 * Implements rate limiting to prevent brute force attacks
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../utils/redis');
const {
  logger
} = require('../utils/logger');
const {
  ApiError,
  ErrorCodes
} = require('./errorHandler');
const config = require('../config');

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000,
    // 15 minutes
    max: 100,
    // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,
    // Disable the `X-RateLimit-*` headers
    message: 'Too many requests, please try again later',
    keyGenerator: req => req.ip // Use IP as default key
  };

  // Merge default options with provided options
  const limiterOptions = {
    ...defaultOptions,
    ...options
  };

  // Use Redis store if Redis is available
  if (redis.isReady) {
    limiterOptions.store = new RedisStore({
      sendCommand: (...args) => redis.client.sendCommand(args),
      prefix: 'rl:'
    });
  } else {
    logger.warn('Redis not available, using memory store for rate limiting');
  }

  // Custom handler for rate limit exceeded
  limiterOptions.handler = (req, res, next, options) => {
    logger.warn(`Rate limit exceeded: ${req.ip}`, {
      ip: req.ip,
      path: req.path,
      method: req.method,
      requestId: req.requestId,
      userAgent: req.headers['user-agent']
    });
    const error = new ApiError(429, options.message || 'Too many requests, please try again later', ErrorCodes.RATE_LIMIT_ERROR);
    next(error);
  };
  return rateLimit(limiterOptions);
};

/**
 * Global rate limiter for all requests
 */
const globalLimiter = createRateLimiter({
  windowMs: config.security?.rateLimit?.global?.windowMs || 15 * 60 * 1000,
  max: config.security?.rateLimit?.global?.max || 100
});

/**
 * Auth rate limiter for login/register endpoints
 */
const authLimiter = createRateLimiter({
  windowMs: config.security?.rateLimit?.login?.windowMs || 15 * 60 * 1000,
  max: config.security?.rateLimit?.login?.max || 5,
  message: 'Too many authentication attempts, please try again later',
  keyGenerator: req => {
    // Use email as key if available, otherwise use IP
    return req.body.email ? `auth:${req.body.email}` : `auth:${req.ip}`;
  }
});

/**
 * Password reset rate limiter
 */
const passwordResetLimiter = createRateLimiter({
  windowMs: config.security?.rateLimit?.passwordReset?.windowMs || 60 * 60 * 1000,
  max: config.security?.rateLimit?.passwordReset?.max || 3,
  message: 'Too many password reset attempts, please try again later',
  keyGenerator: req => {
    // Use email as key if available, otherwise use IP
    return req.body.email ? `reset:${req.body.email}` : `reset:${req.ip}`;
  }
});

/**
 * Email verification rate limiter
 */
const emailVerificationLimiter = createRateLimiter({
  windowMs: config.security?.rateLimit?.emailVerification?.windowMs || 60 * 60 * 1000,
  max: config.security?.rateLimit?.emailVerification?.max || 5,
  message: 'Too many email verification attempts, please try again later'
});
module.exports = {
  createRateLimiter,
  globalLimiter,
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter
};