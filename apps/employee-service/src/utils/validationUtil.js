/**
 * Validation Utility
 * Provides middleware for request validation
 */

/**
 * Middleware for request validation
 * @param {Object} schema - Joi schema for validation
 * @param {String} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: property === 'query' // Allow unknown fields in query params
    });
    
    if (!error) {
      return next();
    }

    const validationErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: validationErrors
    });
  };
};

module.exports = {
  validate
};
