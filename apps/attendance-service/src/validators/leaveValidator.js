/**
 * Leave Validator
 * Validates leave-related requests
 */

const Joi = require('joi');

/**
 * Validate leave data
 * @param {Object} data - Data to validate
 * @param {String} type - Type of validation (submit, update, adjustBalance)
 * @returns {Object} - Validation result
 */
exports.validateLeave = (data, type) => {
  let schema;

  const contactInfoSchema = Joi.object({
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    address: Joi.string().allow('', null)
  });

  switch (type) {
    case 'submit':
      schema = Joi.object({
        employeeId: Joi.string().required(),
        leaveType: Joi.string().valid('annual', 'sick', 'maternity', 'paternity', 'bereavement', 'unpaid', 'other').required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required().min(Joi.ref('startDate')),
        reason: Joi.string().required(),
        contactInfo: contactInfoSchema,
        attachments: Joi.array().items(
          Joi.object({
            fileUrl: Joi.string().required(),
            fileName: Joi.string().required(),
            fileType: Joi.string().required(),
            fileSize: Joi.number()
          })
        )
      });
      break;

    case 'update':
      schema = Joi.object({
        leaveType: Joi.string().valid('annual', 'sick', 'maternity', 'paternity', 'bereavement', 'unpaid', 'other'),
        startDate: Joi.date(),
        endDate: Joi.date().min(Joi.ref('startDate')),
        reason: Joi.string(),
        contactInfo: contactInfoSchema,
        status: Joi.string().valid('pending', 'approved', 'rejected', 'cancelled'),
        attachments: Joi.array().items(
          Joi.object({
            fileUrl: Joi.string().required(),
            fileName: Joi.string().required(),
            fileType: Joi.string().required(),
            fileSize: Joi.number()
          })
        )
      });
      break;

    case 'adjustBalance':
      schema = Joi.object({
        leaveType: Joi.string().valid('annual', 'sick', 'maternity', 'paternity', 'bereavement', 'unpaid', 'other').required(),
        amount: Joi.number().required(),
        reason: Joi.string(),
        year: Joi.number().integer().min(2000).max(2100)
      });
      break;

    default:
      schema = Joi.object({});
  }

  return schema.validate(data);
};

module.exports = exports;
