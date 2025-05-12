/**
 * Error Handler Middleware
 * Provides centralized error handling for the Auth Service
 */

const { logger } = require('../utils/logger');

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error codes enum
 */
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  BAD_REQUEST_ERROR: 'BAD_REQUEST_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 internal server error
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || ErrorCodes.INTERNAL_ERROR;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    message = 'Validation Error';
    details = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
    }));
  }
  
  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoError' && err.code === 11000) {
    statusCode = 409;
    errorCode = ErrorCodes.CONFLICT_ERROR;
    message = 'Duplicate Key Error';
    details = {
      field: Object.keys(err.keyValue)[0],
      value: Object.values(err.keyValue)[0],
    };
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = ErrorCodes.AUTHENTICATION_ERROR;
    message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = ErrorCodes.AUTHENTICATION_ERROR;
    message = 'Token expired';
  }
  
  // Handle Joi validation errors
  if (err.name === 'ValidationError' && err.isJoi) {
    statusCode = 400;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    message = 'Validation Error';
    details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
  }
  
  // Log the error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](`Error: ${message}`, {
    statusCode,
    errorCode,
    details,
    stack: err.stack,
    requestId: req.requestId,
    path: req.path,
    method: req.method,
  });
  
  // Send error response
  const errorResponse = {
    success: false,
    message,
    errorCode,
  };
  
  // Add details if available and not in production
  if (details && process.env.NODE_ENV !== 'production') {
    errorResponse.details = details;
  }
  
  // Add request ID for tracking
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }
  
  res.status(statusCode).json(errorResponse);
};

/**
 * Not found middleware
 */
const notFoundHandler = (req, res, next) => {
  const err = new ApiError(404, 'Resource not found', ErrorCodes.NOT_FOUND_ERROR);
  next(err);
};

module.exports = {
  ApiError,
  ErrorCodes,
  errorHandler,
  notFoundHandler,
};
