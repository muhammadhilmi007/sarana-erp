/**
 * Centralized error handling middleware
 * Provides standardized error responses across the API Gateway
 */

const { logger } = require('../utils/logger');

/**
 * Error response structure
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {string} message - Human-readable error message
 * @property {string} errorCode - Unique error code for tracking
 * @property {Object} [details] - Additional error details (optional)
 */

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, errorCode, details = null) {
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
  VALIDATION_ERROR: 'ERR_VALIDATION',
  AUTHENTICATION_ERROR: 'ERR_AUTH',
  AUTHORIZATION_ERROR: 'ERR_FORBIDDEN',
  NOT_FOUND_ERROR: 'ERR_NOT_FOUND',
  RATE_LIMIT_ERROR: 'ERR_RATE_LIMIT',
  SERVICE_UNAVAILABLE: 'ERR_SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'ERR_INTERNAL',
};

/**
 * Central error handling middleware
 * Formats all errors into a consistent response format
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 internal server error
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || ErrorCodes.INTERNAL_ERROR;
  
  // Log the error
  logger.error(`[${req.requestId}] Error: ${err.message}`, {
    statusCode,
    errorCode,
    stack: err.stack,
    details: err.details || {},
    path: req.path,
    method: req.method,
  });
  
  // Build error response
  const errorResponse = {
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    errorCode,
  };
  
  // Add details if available and not in production
  if (err.details && process.env.NODE_ENV !== 'production') {
    errorResponse.details = err.details;
  }
  
  // Add request ID for tracking
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }
  
  res.status(statusCode).json(errorResponse);
};

module.exports = {
  errorHandler,
  ApiError,
  ErrorCodes,
};
