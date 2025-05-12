/**
 * Validation Utility
 * Provides validation schemas and helpers for the Branch Management Service
 */

const Joi = require('joi');
const mongoose = require('mongoose');
const { logger } = require('./logger');

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, params, query)
 * @returns {Function} - Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errorDetails = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));
      
      logger.warn('Validation error', { path: req.path, errors: errorDetails });
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errorDetails,
      });
    }
    
    // Replace request data with validated data
    req[property] = value;
    next();
  };
};

// Branch validation schemas
const branchSchema = {
  create: Joi.object({
    code: Joi.string().trim().min(2).max(20).required()
      .messages({
        'string.base': 'Code must be a string',
        'string.empty': 'Code is required',
        'string.min': 'Code must be at least 2 characters long',
        'string.max': 'Code cannot exceed 20 characters',
        'any.required': 'Code is required',
      }),
    name: Joi.string().trim().min(2).max(100).required()
      .messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required',
      }),
    type: Joi.string().valid('headquarters', 'regional', 'branch').required()
      .messages({
        'string.base': 'Type must be a string',
        'string.empty': 'Type is required',
        'any.only': 'Type must be one of: headquarters, regional, branch',
        'any.required': 'Type is required',
      }),
    parentId: Joi.string().custom((value, helpers) => {
      if (value && !isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).allow(null),
    address: Joi.object({
      street: Joi.string().trim().min(2).max(200).required(),
      city: Joi.string().trim().min(2).max(100).required(),
      state: Joi.string().trim().min(2).max(100).required(),
      postalCode: Joi.string().trim().min(2).max(20).required(),
      country: Joi.string().trim().min(2).max(100).default('Indonesia'),
      coordinates: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).default([0, 0]),
      }).default({ type: 'Point', coordinates: [0, 0] }),
    }).required(),
    contactInfo: Joi.object({
      phone: Joi.string().trim().min(5).max(20).required(),
      email: Joi.string().trim().email().required(),
      fax: Joi.string().trim().min(5).max(20).allow('', null),
      website: Joi.string().trim().uri().allow('', null),
    }).required(),
    operationalHours: Joi.array().items(
      Joi.object({
        day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
        isOpen: Joi.boolean().default(true),
        openTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default('08:00'),
        closeTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default('17:00'),
      })
    ).default([]),
    resources: Joi.object({
      employeeCount: Joi.number().integer().min(0).default(0),
      vehicleCount: Joi.number().integer().min(0).default(0),
      storageCapacity: Joi.number().min(0).default(0),
      maxDailyPackages: Joi.number().integer().min(0).default(0),
    }).default({}),
    status: Joi.string().valid('active', 'inactive', 'pending', 'closed').default('active'),
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(2).max(100)
      .messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
      }),
    type: Joi.string().valid('headquarters', 'regional', 'branch'),
    parentId: Joi.string().custom((value, helpers) => {
      if (value && !isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).allow(null),
    address: Joi.object({
      street: Joi.string().trim().min(2).max(200),
      city: Joi.string().trim().min(2).max(100),
      state: Joi.string().trim().min(2).max(100),
      postalCode: Joi.string().trim().min(2).max(20),
      country: Joi.string().trim().min(2).max(100),
      coordinates: Joi.object({
        type: Joi.string().valid('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2),
      }),
    }),
    contactInfo: Joi.object({
      phone: Joi.string().trim().min(5).max(20),
      email: Joi.string().trim().email(),
      fax: Joi.string().trim().min(5).max(20).allow('', null),
      website: Joi.string().trim().uri().allow('', null),
    }),
    status: Joi.string().valid('active', 'inactive', 'pending', 'closed'),
  }),
  
  id: Joi.object({
    id: Joi.string().custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required()
    .messages({
      'any.required': 'Branch ID is required',
      'any.invalid': 'Invalid branch ID format',
    }),
  }),
  
  status: Joi.object({
    status: Joi.string().valid('active', 'inactive', 'pending', 'closed').required()
      .messages({
        'string.base': 'Status must be a string',
        'string.empty': 'Status is required',
        'any.only': 'Status must be one of: active, inactive, pending, closed',
        'any.required': 'Status is required',
      }),
    reason: Joi.string().trim().min(2).max(200).allow('', null),
  }),
  
  resources: Joi.object({
    employeeCount: Joi.number().integer().min(0),
    vehicleCount: Joi.number().integer().min(0),
    storageCapacity: Joi.number().min(0),
    maxDailyPackages: Joi.number().integer().min(0),
  }).min(1),
  
  performanceMetrics: Joi.object({
    monthlyRevenue: Joi.number().min(0),
    monthlyPackages: Joi.number().integer().min(0),
    customerSatisfaction: Joi.number().min(0).max(100),
    deliverySuccessRate: Joi.number().min(0).max(100),
  }).min(1),
  
  document: Joi.object({
    name: Joi.string().trim().min(2).max(100).required()
      .messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required',
      }),
    type: Joi.string().valid('license', 'permit', 'certificate', 'contract', 'other').required()
      .messages({
        'string.base': 'Type must be a string',
        'string.empty': 'Type is required',
        'any.only': 'Type must be one of: license, permit, certificate, contract, other',
        'any.required': 'Type is required',
      }),
    fileUrl: Joi.string().uri().required()
      .messages({
        'string.base': 'File URL must be a string',
        'string.empty': 'File URL is required',
        'string.uri': 'File URL must be a valid URI',
        'any.required': 'File URL is required',
      }),
    expiryDate: Joi.date().iso().allow(null),
    isActive: Joi.boolean().default(true),
  }),
  
  documentUpdate: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    type: Joi.string().valid('license', 'permit', 'certificate', 'contract', 'other'),
    fileUrl: Joi.string().uri(),
    expiryDate: Joi.date().iso().allow(null),
    isActive: Joi.boolean(),
  }).min(1),
  
  operationalHours: Joi.object({
    operationalHours: Joi.array().items(
      Joi.object({
        day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
        isOpen: Joi.boolean().required(),
        openTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).when('isOpen', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        closeTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).when('isOpen', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
      })
    ).min(1).required(),
  }),
};

// Pagination and search validation schema
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('', null),
  sortBy: Joi.string().trim().allow('', null),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

module.exports = {
  validate,
  isValidObjectId,
  branchSchema,
  paginationSchema,
};
