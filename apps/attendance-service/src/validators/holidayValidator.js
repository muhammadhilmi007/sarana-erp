/**
 * Holiday Validator
 * Validates holiday-related requests
 */

const Joi = require('joi');

/**
 * Validate holiday data
 * @param {Object} data - Data to validate
 * @returns {Object} - Validation result
 */
exports.validateHoliday = (data) => {
  const recurringPatternSchema = Joi.object({
    month: Joi.number().integer().min(0).max(11),
    day: Joi.number().integer().min(1).max(31),
    nthDay: Joi.number().integer().min(1).max(5),
    dayOfWeek: Joi.number().integer().min(0).max(6)
  });

  const schema = Joi.object({
    name: Joi.string().required(),
    date: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('date')),
    type: Joi.string().valid('national', 'religious', 'company').required(),
    description: Joi.string().allow('', null),
    isRecurring: Joi.boolean(),
    recurringPattern: Joi.when('isRecurring', {
      is: true,
      then: recurringPatternSchema.required(),
      otherwise: Joi.optional()
    }),
    branchIds: Joi.array().items(Joi.string())
  });

  return schema.validate(data);
};

module.exports = exports;
