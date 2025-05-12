/**
 * Error Handler Middleware
 * Centralized error handling for the forwarder service
 */

const { logger } = require('../utils/logger');

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Error response
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user._id : 'unauthenticated',
  });

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.name === 'CastError') {
    // Mongoose cast error (invalid ID)
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY';
    message = 'Duplicate key error';
    
    // Extract duplicate field
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `${field} '${value}' already exists`;
  } else if (err.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Token expired';
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    errorCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
