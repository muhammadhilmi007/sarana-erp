/**
 * Request Validation Middleware
 * Validates incoming requests against Joi schemas
 */

const { ApiError, ErrorCodes } = require('./errorHandler');

/**
 * Creates a validation middleware using the provided schema
 * @param {Object} schema - Joi schema for validation
 * @param {string} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware
 */
const requestValidator = (schema, property = 'body') => {
  return (req, res, next) => {
    if (!schema) {
      return next();
    }
    
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown properties
    });
    
    if (error) {
      // Format validation errors
      const details = error.details.map(detail => ({
        message: detail.message,
        path: detail.path,
        type: detail.type,
      }));
      
      return next(new ApiError(
        400,
        'Validation error',
        ErrorCodes.VALIDATION_ERROR,
        { details }
      ));
    }
    
    // Replace request data with validated data
    req[property] = value;
    next();
  };
};

module.exports = {
  requestValidator,
};
