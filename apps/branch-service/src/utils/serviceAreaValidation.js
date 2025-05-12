/**
 * Service Area Validation Utility
 * Provides validation schemas and helpers for service areas
 */

const Joi = require('joi');
const mongoose = require('mongoose');
const { isValidObjectId } = require('./validationUtil');

// Validate GeoJSON Point
const pointSchema = Joi.object({
  type: Joi.string().valid('Point').required(),
  coordinates: Joi.array().items(Joi.number()).length(2).required()
    .messages({
      'array.length': 'Coordinates must contain exactly 2 values [longitude, latitude]',
      'array.base': 'Coordinates must be an array',
    }),
});

// Validate GeoJSON Polygon
const polygonSchema = Joi.object({
  type: Joi.string().valid('Polygon').required(),
  coordinates: Joi.array().items(
    Joi.array().items(
      Joi.array().items(Joi.number()).min(2).required()
    ).min(4).required()
    .messages({
      'array.min': 'Polygon must have at least 4 points and the first and last points must be identical',
    })
  ).required(),
});

// Service Area validation schemas
const serviceAreaSchema = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(100).required()
      .messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required',
      }),
    code: Joi.string().trim().min(2).max(20).required()
      .messages({
        'string.base': 'Code must be a string',
        'string.empty': 'Code is required',
        'string.min': 'Code must be at least 2 characters long',
        'string.max': 'Code cannot exceed 20 characters',
        'any.required': 'Code is required',
      }),
    description: Joi.string().trim().max(500).allow('', null),
    boundaries: polygonSchema.required(),
    center: pointSchema.required(),
    coverageRadius: Joi.number().min(0).default(0),
    type: Joi.string().valid('delivery', 'pickup', 'both').default('both'),
    branches: Joi.array().items(
      Joi.object({
        branchId: Joi.string().custom((value, helpers) => {
          if (!isValidObjectId(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        }).required()
        .messages({
          'any.required': 'Branch ID is required',
          'any.invalid': 'Invalid branch ID format',
        }),
        isPrimary: Joi.boolean().default(false),
      })
    ).default([]),
    pricing: Joi.object({
      basePrice: Joi.number().min(0).default(0),
      pricePerKm: Joi.number().min(0).default(0),
      minimumDistance: Joi.number().min(0).default(0),
      maximumDistance: Joi.number().min(0).default(0),
      specialRates: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          description: Joi.string().allow('', null),
          rate: Joi.number().required(),
          conditions: Joi.object().default({}),
        })
      ).default([]),
    }).default({}),
    status: Joi.string().valid('active', 'inactive', 'pending').default('active'),
    metadata: Joi.object().default({}),
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(2).max(100)
      .messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
      }),
    description: Joi.string().trim().max(500).allow('', null),
    boundaries: polygonSchema,
    center: pointSchema,
    coverageRadius: Joi.number().min(0),
    type: Joi.string().valid('delivery', 'pickup', 'both'),
    status: Joi.string().valid('active', 'inactive', 'pending'),
    metadata: Joi.object(),
  }).min(1),
  
  id: Joi.object({
    id: Joi.string().custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required()
    .messages({
      'any.required': 'Service Area ID is required',
      'any.invalid': 'Invalid service area ID format',
    }),
  }),
  
  status: Joi.object({
    status: Joi.string().valid('active', 'inactive', 'pending').required()
      .messages({
        'string.base': 'Status must be a string',
        'string.empty': 'Status is required',
        'any.only': 'Status must be one of: active, inactive, pending',
        'any.required': 'Status is required',
      }),
    reason: Joi.string().trim().min(2).max(200).allow('', null),
  }),
  
  assignBranch: Joi.object({
    branchId: Joi.string().custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required()
    .messages({
      'any.required': 'Branch ID is required',
      'any.invalid': 'Invalid branch ID format',
    }),
    isPrimary: Joi.boolean().default(false),
  }),
  
  pricing: Joi.object({
    basePrice: Joi.number().min(0),
    pricePerKm: Joi.number().min(0),
    minimumDistance: Joi.number().min(0),
    maximumDistance: Joi.number().min(0),
    specialRates: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow('', null),
        rate: Joi.number().required(),
        conditions: Joi.object().default({}),
      })
    ),
  }).min(1),
  
  pointQuery: Joi.object({
    longitude: Joi.number().required()
      .messages({
        'number.base': 'Longitude must be a number',
        'any.required': 'Longitude is required',
      }),
    latitude: Joi.number().required()
      .messages({
        'number.base': 'Latitude must be a number',
        'any.required': 'Latitude is required',
      }),
  }),
  
  import: Joi.object({
    file: Joi.any().required()
      .messages({
        'any.required': 'File is required',
      }),
    format: Joi.string().valid('geojson', 'csv', 'kml').default('geojson')
      .messages({
        'string.base': 'Format must be a string',
        'any.only': 'Format must be one of: geojson, csv, kml',
      }),
    overwrite: Joi.boolean().default(false),
  }),
};

// Search and pagination validation schema
const searchSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('', null),
  status: Joi.string().valid('active', 'inactive', 'pending').allow('', null),
  type: Joi.string().valid('delivery', 'pickup', 'both').allow('', null),
  branchId: Joi.string().custom((value, helpers) => {
    if (value && !isValidObjectId(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }).allow('', null),
  near: Joi.object({
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
    maxDistance: Joi.number().min(0).default(10), // in kilometers
  }).allow(null),
  sortBy: Joi.string().valid('name', 'code', 'createdAt', 'updatedAt').default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

module.exports = {
  serviceAreaSchema,
  searchSchema,
  pointSchema,
  polygonSchema,
};
