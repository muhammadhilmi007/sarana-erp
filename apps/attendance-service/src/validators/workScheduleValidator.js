/**
 * Work Schedule Validator
 * Validates work schedule-related requests
 */

const Joi = require('joi');

/**
 * Validate work schedule data
 * @param {Object} data - Data to validate
 * @param {String} type - Type of validation (create, update, assign, override, bulkAssign)
 * @returns {Object} - Validation result
 */
exports.validateWorkSchedule = (data, type) => {
  let schema;

  const timeSchema = Joi.object({
    hours: Joi.number().integer().min(0).max(23).required(),
    minutes: Joi.number().integer().min(0).max(59).required()
  });

  const workHoursSchema = Joi.object({
    start: timeSchema.required(),
    end: timeSchema.required()
  });

  const breakTimeSchema = Joi.object({
    start: timeSchema,
    end: timeSchema,
    duration: Joi.number().integer().min(0)
  });

  const shiftSchema = Joi.object({
    name: Joi.string().required(),
    startTime: timeSchema.required(),
    endTime: timeSchema.required(),
    breakDuration: Joi.number().integer().min(0)
  });

  const flexibleHoursSchema = Joi.object({
    coreHoursStart: timeSchema,
    coreHoursEnd: timeSchema,
    minWorkHours: Joi.number().min(0)
  });

  switch (type) {
    case 'create':
      schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow('', null),
        scheduleType: Joi.string().valid('regular', 'shift', 'flexible').required(),
        workDays: Joi.array().items(Joi.number().integer().min(0).max(6)),
        workHours: workHoursSchema.when('scheduleType', {
          is: 'regular',
          then: Joi.required(),
          otherwise: Joi.optional()
        }),
        breakTime: breakTimeSchema,
        shifts: Joi.array().items(shiftSchema).when('scheduleType', {
          is: 'shift',
          then: Joi.required().min(1),
          otherwise: Joi.optional()
        }),
        flexibleHours: flexibleHoursSchema.when('scheduleType', {
          is: 'flexible',
          then: Joi.required(),
          otherwise: Joi.optional()
        }),
        isActive: Joi.boolean()
      });
      break;

    case 'update':
      schema = Joi.object({
        name: Joi.string(),
        description: Joi.string().allow('', null),
        scheduleType: Joi.string().valid('regular', 'shift', 'flexible'),
        workDays: Joi.array().items(Joi.number().integer().min(0).max(6)),
        workHours: workHoursSchema,
        breakTime: breakTimeSchema,
        shifts: Joi.array().items(shiftSchema),
        flexibleHours: flexibleHoursSchema,
        isActive: Joi.boolean()
      });
      break;

    case 'assign':
      schema = Joi.object({
        scheduleId: Joi.string().required(),
        effectiveDate: Joi.date().required(),
        expiryDate: Joi.date()
      });
      break;

    case 'override':
      schema = Joi.object({
        date: Joi.date().required(),
        scheduleId: Joi.string().required(),
        reason: Joi.string().allow('', null)
      });
      break;

    case 'bulkAssign':
      schema = Joi.object({
        employeeIds: Joi.array().items(Joi.string()).min(1).required(),
        scheduleId: Joi.string().required(),
        effectiveDate: Joi.date().required(),
        expiryDate: Joi.date()
      });
      break;

    default:
      schema = Joi.object({});
  }

  return schema.validate(data);
};

module.exports = exports;
