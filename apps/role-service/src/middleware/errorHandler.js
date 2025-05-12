/**
 * Error Handler Middleware
 * Centralized error handling for the Role & Authorization Service
 */

const { logger } = require('../utils/logger');

// Error codes for standardized error responses
const ErrorCodes = {
  // Client errors (4xx)
  BAD_REQUEST_ERROR: 'BAD_REQUEST_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  
  // Server errors (5xx)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE_ERROR: 'SERVICE_UNAVAILABLE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
};

/**
 * Custom API Error class
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Object} details - Additional error details
   */
  constructor(statusCode, message, code = ErrorCodes.INTERNAL_SERVER_ERROR, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || ErrorCodes.INTERNAL_SERVER_ERROR;
  let details = err.details || null;
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    code = ErrorCodes.VALIDATION_ERROR;
    details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
  }
  
  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    code = ErrorCodes.VALIDATION_ERROR;
  }
  
  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error';
    code = ErrorCodes.CONFLICT_ERROR;
    details = err.keyValue;
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = ErrorCodes.AUTHENTICATION_ERROR;
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = ErrorCodes.AUTHENTICATION_ERROR;
  }
  
  // Log error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](`${statusCode} - ${message}`, {
    error: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id,
  });
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Not found handler middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const notFoundHandler = (req, res, next) => {
  const err = new ApiError(
    404,
    `Not Found - ${req.originalUrl}`,
    ErrorCodes.NOT_FOUND_ERROR
  );
  next(err);
};

module.exports = {
  ApiError,
  ErrorCodes,
  errorHandler,
  notFoundHandler,
};
