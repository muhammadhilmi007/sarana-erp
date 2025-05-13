/**
 * Attendance Validator
 * Validates attendance-related requests
 */

const Joi = require('joi');

/**
 * Validate attendance data
 * @param {Object} data - Data to validate
 * @param {String} type - Type of validation (checkIn, checkOut, update, correction)
 * @returns {Object} - Validation result
 */
exports.validateAttendance = (data, type) => {
  let schema;

  const locationSchema = Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    address: Joi.string().allow('', null)
  });

  switch (type) {
    case 'checkIn':
      schema = Joi.object({
        employeeId: Joi.string().required(),
        location: locationSchema,
        deviceId: Joi.string().allow('', null),
        notes: Joi.string().allow('', null)
      });
      break;

    case 'checkOut':
      schema = Joi.object({
        employeeId: Joi.string().required(),
        location: locationSchema,
        deviceId: Joi.string().allow('', null),
        notes: Joi.string().allow('', null)
      });
      break;

    case 'update':
      schema = Joi.object({
        checkInTime: Joi.date(),
        checkOutTime: Joi.date(),
        status: Joi.string().valid('present', 'absent', 'late', 'half-day', 'leave', 'holiday'),
        location: locationSchema,
        checkOutLocation: locationSchema,
        deviceId: Joi.string().allow('', null),
        checkOutDeviceId: Joi.string().allow('', null),
        notes: Joi.string().allow('', null),
        workHours: Joi.number().min(0)
      });
      break;

    case 'correction':
      schema = Joi.object({
        employeeId: Joi.string().required(),
        attendanceId: Joi.string().required(),
        requestType: Joi.string().valid('check_in', 'check_out', 'both', 'status').required(),
        newCheckInTime: Joi.date().when('requestType', {
          is: Joi.valid('check_in', 'both'),
          then: Joi.required(),
          otherwise: Joi.optional()
        }),
        newCheckOutTime: Joi.date().when('requestType', {
          is: Joi.valid('check_out', 'both'),
          then: Joi.required(),
          otherwise: Joi.optional()
        }),
        newStatus: Joi.string().valid('present', 'absent', 'late', 'half-day', 'leave', 'holiday').when('requestType', {
          is: 'status',
          then: Joi.required(),
          otherwise: Joi.optional()
        }),
        reason: Joi.string().required(),
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

    default:
      schema = Joi.object({});
  }

  return schema.validate(data);
};

module.exports = exports;
