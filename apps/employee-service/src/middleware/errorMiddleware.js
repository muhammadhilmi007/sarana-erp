/**
 * Error Middleware
 * Handles errors in the application
 */

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);

  // Default error status and message
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = [];

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
  } else if (err.name === 'CastError') {
    // Mongoose cast error (e.g., invalid ObjectId)
    statusCode = 400;
    message = 'Invalid ID format';
    errors = [{ field: err.path, message: 'Invalid format' }];
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    message = 'Duplicate Key Error';
    const field = Object.keys(err.keyValue)[0];
    errors = [{ field, message: `${field} already exists` }];
  } else if (err.statusCode) {
    // Custom error with status code
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * Custom error class with status code
 */
class AppError extends Error {
  /**
   * Create a new AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Array} errors - Array of error objects
   */
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'AppError';
  }
}

/**
 * Not found error
 * @param {string} resource - Resource name
 * @param {string} id - Resource ID
 * @returns {AppError} Not found error
 */
const notFoundError = (resource, id) => {
  return new AppError(`${resource} not found with id: ${id}`, 404);
};

/**
 * Unauthorized error
 * @param {string} message - Error message
 * @returns {AppError} Unauthorized error
 */
const unauthorizedError = (message = 'Unauthorized access') => {
  return new AppError(message, 401);
};

/**
 * Forbidden error
 * @param {string} message - Error message
 * @returns {AppError} Forbidden error
 */
const forbiddenError = (message = 'Forbidden access') => {
  return new AppError(message, 403);
};

/**
 * Bad request error
 * @param {string} message - Error message
 * @param {Array} errors - Array of error objects
 * @returns {AppError} Bad request error
 */
const badRequestError = (message = 'Bad request', errors = []) => {
  return new AppError(message, 400, errors);
};

/**
 * Conflict error
 * @param {string} message - Error message
 * @returns {AppError} Conflict error
 */
const conflictError = (message = 'Resource conflict') => {
  return new AppError(message, 409);
};

module.exports = {
  errorHandler,
  AppError,
  notFoundError,
  unauthorizedError,
  forbiddenError,
  badRequestError,
  conflictError
};
