/**
 * Validation Utility
 * Provides validation schemas and helpers for the Role & Authorization Service
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

// Role validation schemas
const roleSchema = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(50).required()
      .message({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required',
      }),
    description: Joi.string().trim().max(200).allow('', null),
    parentId: Joi.string().custom((value, helpers) => {
      if (value && !isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).allow(null),
    isActive: Joi.boolean().default(true),
    isSystem: Joi.boolean().default(false),
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(2).max(50)
      .message({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
      }),
    description: Joi.string().trim().max(200).allow('', null),
    parentId: Joi.string().custom((value, helpers) => {
      if (value && !isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).allow(null),
    isActive: Joi.boolean(),
  }),
  
  id: Joi.object({
    id: Joi.string().custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required(),
  }),
};

// Permission validation schemas
const permissionSchema = {
  create: Joi.object({
    resource: Joi.string().trim().min(2).max(50).required()
      .message({
        'string.base': 'Resource must be a string',
        'string.empty': 'Resource is required',
        'string.min': 'Resource must be at least 2 characters long',
        'string.max': 'Resource cannot exceed 50 characters',
        'any.required': 'Resource is required',
      }),
    action: Joi.string().trim().valid('create', 'read', 'update', 'delete', 'manage', 'execute').required()
      .message({
        'string.base': 'Action must be a string',
        'string.empty': 'Action is required',
        'any.only': 'Action must be one of: create, read, update, delete, manage, execute',
        'any.required': 'Action is required',
      }),
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().max(200).allow('', null),
    constraints: Joi.object().allow(null),
    isActive: Joi.boolean().default(true),
    isSystem: Joi.boolean().default(false),
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().max(200).allow('', null),
    constraints: Joi.object().allow(null),
    isActive: Joi.boolean(),
  }),
  
  id: Joi.object({
    id: Joi.string().custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required(),
  }),
};

// User role validation schemas
const userRoleSchema = {
  assign: Joi.object({
    userId: Joi.string().custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required(),
    roleId: Joi.string().custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required(),
    expiresAt: Joi.date().iso().min('now').allow(null),
    scope: Joi.string().trim().max(100).allow('', null),
    metadata: Joi.object().allow(null),
  }),
  
  update: Joi.object({
    expiresAt: Joi.date().iso().min('now').allow(null),
    scope: Joi.string().trim().max(100).allow('', null),
    metadata: Joi.object().allow(null),
    isActive: Joi.boolean(),
  }),
  
  id: Joi.object({
    id: Joi.string().custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required(),
  }),
  
  userIdRoleId: Joi.object({
    userId: Joi.string().custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required(),
    roleId: Joi.string().custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required(),
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

// Permission check validation schema
const permissionCheckSchema = Joi.object({
  resource: Joi.string().trim().required(),
  action: Joi.string().trim().valid('create', 'read', 'update', 'delete', 'manage', 'execute').required(),
  resourceId: Joi.string().custom((value, helpers) => {
    if (value && !isValidObjectId(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }).allow(null),
});

module.exports = {
  validate,
  isValidObjectId,
  roleSchema,
  permissionSchema,
  userRoleSchema,
  paginationSchema,
  permissionCheckSchema,
};
