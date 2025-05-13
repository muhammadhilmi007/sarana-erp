/**
 * Report Validator
 * Validates report-related requests
 */

const Joi = require('joi');

/**
 * Validate report data
 * @param {Object} data - Data to validate
 * @param {String} type - Type of validation (daily, weekly, monthly, custom)
 * @returns {Object} - Validation result
 */
exports.validateReport = (data, type) => {
  let schema;

  const filtersSchema = Joi.object({
    departmentIds: Joi.array().items(Joi.string()),
    branchIds: Joi.array().items(Joi.string()),
    employeeIds: Joi.array().items(Joi.string()),
    statuses: Joi.array().items(Joi.string().valid('present', 'absent', 'late', 'half-day', 'leave', 'holiday'))
  });

  switch (type) {
    case 'daily':
      schema = Joi.object({
        date: Joi.date().required(),
        filters: filtersSchema,
        format: Joi.string().valid('json', 'csv', 'pdf', 'excel')
      });
      break;

    case 'weekly':
      schema = Joi.object({
        startDate: Joi.date().required(),
        endDate: Joi.date().required().min(Joi.ref('startDate')),
        filters: filtersSchema,
        format: Joi.string().valid('json', 'csv', 'pdf', 'excel')
      });
      break;

    case 'monthly':
      schema = Joi.object({
        year: Joi.number().integer().min(2000).max(2100).required(),
        month: Joi.number().integer().min(1).max(12).required(),
        filters: filtersSchema,
        format: Joi.string().valid('json', 'csv', 'pdf', 'excel')
      });
      break;

    case 'custom':
      schema = Joi.object({
        startDate: Joi.date().required(),
        endDate: Joi.date().required().min(Joi.ref('startDate')),
        filters: filtersSchema,
        format: Joi.string().valid('json', 'csv', 'pdf', 'excel')
      });
      break;

    default:
      schema = Joi.object({});
  }

  return schema.validate(data);
};

module.exports = exports;
