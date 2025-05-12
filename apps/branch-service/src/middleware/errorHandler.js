/**
 * Error Handler Middleware
 * Provides centralized error handling for the Branch Management Service
 */

const { logger } = require('../utils/logger');

/**
 * Handle 404 Not Found errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Handle all errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error
  logger.error(err.message, {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.id,
    userId: req.user?._id,
  });
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message,
      })),
    });
  }
  
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(409).json({
        status: 'error',
        message: 'Duplicate key error',
        error: err.message,
      });
    }
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired',
    });
  }
  
  // Default error response
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
