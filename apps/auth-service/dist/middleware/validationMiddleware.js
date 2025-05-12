/**
 * Validation Middleware
 * Validates request data against Joi schemas
 */

const {
  ApiError,
  ErrorCodes
} = require('./errorHandler');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi schema
 * @param {string} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const {
      error,
      value
    } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(new ApiError(400, 'Validation Error', ErrorCodes.VALIDATION_ERROR, details));
    }

    // Replace request data with validated data
    req[property] = value;
    next();
  };
};
module.exports = {
  validate
};