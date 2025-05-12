/**
 * Validation Utility
 * Provides validation schemas and middleware for request validation
 */

const Joi = require('joi');
const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId
 */
const objectIdSchema = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'MongoDB ObjectId validation');

/**
 * Division validation schemas
 */
const divisionSchema = {
  id: Joi.object({
    id: objectIdSchema.required().messages({
      'any.required': 'Division ID is required',
      'any.invalid': 'Invalid division ID format',
    }),
  }),
  
  create: Joi.object({
    code: Joi.string().required().trim().messages({
      'any.required': 'Division code is required',
      'string.empty': 'Division code cannot be empty',
    }),
    name: Joi.string().required().trim().messages({
      'any.required': 'Division name is required',
      'string.empty': 'Division name cannot be empty',
    }),
    description: Joi.string().allow('').trim(),
    parentId: objectIdSchema.allow(null),
    branchId: objectIdSchema.required().messages({
      'any.required': 'Branch ID is required',
      'any.invalid': 'Invalid branch ID format',
    }),
    headPositionId: objectIdSchema.allow(null),
    status: Joi.string().valid('active', 'inactive', 'restructuring').default('active'),
    performanceMetrics: Joi.object({
      kpis: Joi.array().items(
        Joi.object({
          name: Joi.string().required().trim(),
          description: Joi.string().allow('').trim(),
          target: Joi.number().required(),
          unit: Joi.string().required().trim(),
          current: Joi.number().default(0),
        })
      ).default([]),
    }).default({ kpis: [] }),
    budget: Joi.object({
      allocated: Joi.number().default(0),
      spent: Joi.number().default(0),
      currency: Joi.string().default('IDR').trim(),
      fiscalYear: Joi.string().trim(),
    }).default({
      allocated: 0,
      spent: 0,
      currency: 'IDR',
    }),
  }),
  
  update: Joi.object({
    code: Joi.string().trim(),
    name: Joi.string().trim(),
    description: Joi.string().allow('').trim(),
    parentId: objectIdSchema.allow(null),
    branchId: objectIdSchema,
    headPositionId: objectIdSchema.allow(null),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),
  
  status: Joi.object({
    status: Joi.string().valid('active', 'inactive', 'restructuring').required().messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be one of: active, inactive, restructuring',
    }),
    reason: Joi.string().required().trim().messages({
      'any.required': 'Reason for status change is required',
      'string.empty': 'Reason cannot be empty',
    }),
  }),
  
  kpis: Joi.object({
    kpis: Joi.array().items(
      Joi.object({
        _id: objectIdSchema.allow(null),
        name: Joi.string().required().trim().messages({
          'any.required': 'KPI name is required',
          'string.empty': 'KPI name cannot be empty',
        }),
        description: Joi.string().allow('').trim(),
        target: Joi.number().required().messages({
          'any.required': 'KPI target is required',
        }),
        unit: Joi.string().required().trim().messages({
          'any.required': 'KPI unit is required',
          'string.empty': 'KPI unit cannot be empty',
        }),
        current: Joi.number().default(0),
      })
    ).required().min(1).messages({
      'any.required': 'KPIs are required',
      'array.min': 'At least one KPI must be provided',
    }),
  }),
  
  budget: Joi.object({
    allocated: Joi.number().required().min(0).messages({
      'any.required': 'Allocated budget is required',
      'number.min': 'Allocated budget cannot be negative',
    }),
    spent: Joi.number().min(0).default(0).messages({
      'number.min': 'Spent budget cannot be negative',
    }),
    currency: Joi.string().default('IDR').trim(),
    fiscalYear: Joi.string().required().trim().messages({
      'any.required': 'Fiscal year is required',
      'string.empty': 'Fiscal year cannot be empty',
    }),
  }),
};

/**
 * Position validation schemas
 */
const positionSchema = {
  id: Joi.object({
    id: objectIdSchema.required().messages({
      'any.required': 'Position ID is required',
      'any.invalid': 'Invalid position ID format',
    }),
  }),
  
  create: Joi.object({
    code: Joi.string().required().trim().messages({
      'any.required': 'Position code is required',
      'string.empty': 'Position code cannot be empty',
    }),
    title: Joi.string().required().trim().messages({
      'any.required': 'Position title is required',
      'string.empty': 'Position title cannot be empty',
    }),
    description: Joi.string().allow('').trim(),
    reportingTo: objectIdSchema.allow(null),
    divisionId: objectIdSchema.required().messages({
      'any.required': 'Division ID is required',
      'any.invalid': 'Invalid division ID format',
    }),
    requirements: Joi.object({
      education: Joi.array().items(
        Joi.object({
          degree: Joi.string().required().trim(),
          field: Joi.string().required().trim(),
          isRequired: Joi.boolean().default(true),
        })
      ).default([]),
      experience: Joi.array().items(
        Joi.object({
          description: Joi.string().required().trim(),
          yearsRequired: Joi.number().required().min(0),
          isRequired: Joi.boolean().default(true),
        })
      ).default([]),
      skills: Joi.array().items(
        Joi.object({
          name: Joi.string().required().trim(),
          level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').required(),
          isRequired: Joi.boolean().default(true),
        })
      ).default([]),
      certifications: Joi.array().items(
        Joi.object({
          name: Joi.string().required().trim(),
          isRequired: Joi.boolean().default(false),
        })
      ).default([]),
    }).default({
      education: [],
      experience: [],
      skills: [],
      certifications: [],
    }),
    responsibilities: Joi.array().items(
      Joi.object({
        description: Joi.string().required().trim(),
        priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
      })
    ).default([]),
    authorities: Joi.array().items(
      Joi.object({
        description: Joi.string().required().trim(),
        scope: Joi.string().allow('').trim(),
      })
    ).default([]),
    salaryGrade: Joi.string().required().trim().messages({
      'any.required': 'Salary grade is required',
      'string.empty': 'Salary grade cannot be empty',
    }),
    salaryRange: Joi.object({
      min: Joi.number().required().min(0).messages({
        'any.required': 'Minimum salary is required',
        'number.min': 'Minimum salary cannot be negative',
      }),
      max: Joi.number().required().min(Joi.ref('min')).messages({
        'any.required': 'Maximum salary is required',
        'number.min': 'Maximum salary cannot be less than minimum salary',
      }),
      currency: Joi.string().default('IDR').trim(),
    }).required().messages({
      'any.required': 'Salary range is required',
    }),
    benefits: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim(),
        description: Joi.string().allow('').trim(),
        value: Joi.number().allow(null),
      })
    ).default([]),
    status: Joi.string().valid('active', 'inactive', 'draft').default('active'),
    isVacant: Joi.boolean().default(true),
    headcount: Joi.object({
      authorized: Joi.number().integer().min(1).default(1),
      filled: Joi.number().integer().min(0).default(0),
    }).default({
      authorized: 1,
      filled: 0,
    }),
  }),
  
  update: Joi.object({
    code: Joi.string().trim(),
    title: Joi.string().trim(),
    description: Joi.string().allow('').trim(),
    reportingTo: objectIdSchema.allow(null),
    divisionId: objectIdSchema,
    salaryGrade: Joi.string().trim(),
    salaryRange: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(Joi.ref('min')),
      currency: Joi.string().trim(),
    }),
    benefits: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim(),
        description: Joi.string().allow('').trim(),
        value: Joi.number().allow(null),
      })
    ),
    isVacant: Joi.boolean(),
    headcount: Joi.object({
      authorized: Joi.number().integer().min(1),
      filled: Joi.number().integer().min(0),
    }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),
  
  status: Joi.object({
    status: Joi.string().valid('active', 'inactive', 'draft').required().messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be one of: active, inactive, draft',
    }),
    reason: Joi.string().required().trim().messages({
      'any.required': 'Reason for status change is required',
      'string.empty': 'Reason cannot be empty',
    }),
  }),
  
  requirements: Joi.object({
    requirements: Joi.object({
      education: Joi.array().items(
        Joi.object({
          degree: Joi.string().required().trim(),
          field: Joi.string().required().trim(),
          isRequired: Joi.boolean().default(true),
        })
      ).required(),
      experience: Joi.array().items(
        Joi.object({
          description: Joi.string().required().trim(),
          yearsRequired: Joi.number().required().min(0),
          isRequired: Joi.boolean().default(true),
        })
      ).required(),
      skills: Joi.array().items(
        Joi.object({
          name: Joi.string().required().trim(),
          level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').required(),
          isRequired: Joi.boolean().default(true),
        })
      ).required(),
      certifications: Joi.array().items(
        Joi.object({
          name: Joi.string().required().trim(),
          isRequired: Joi.boolean().default(false),
        })
      ).required(),
    }).required().messages({
      'any.required': 'Requirements are required',
    }),
  }),
  
  responsibilities: Joi.object({
    responsibilities: Joi.array().items(
      Joi.object({
        description: Joi.string().required().trim().messages({
          'any.required': 'Responsibility description is required',
          'string.empty': 'Responsibility description cannot be empty',
        }),
        priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
      })
    ).required().min(1).messages({
      'any.required': 'Responsibilities are required',
      'array.min': 'At least one responsibility must be provided',
    }),
  }),
  
  authorities: Joi.object({
    authorities: Joi.array().items(
      Joi.object({
        description: Joi.string().required().trim().messages({
          'any.required': 'Authority description is required',
          'string.empty': 'Authority description cannot be empty',
        }),
        scope: Joi.string().allow('').trim(),
      })
    ).required().min(1).messages({
      'any.required': 'Authorities are required',
      'array.min': 'At least one authority must be provided',
    }),
  }),
  
  compensation: Joi.object({
    salaryGrade: Joi.string().trim(),
    salaryRange: Joi.object({
      min: Joi.number().min(0).messages({
        'number.min': 'Minimum salary cannot be negative',
      }),
      max: Joi.number().min(Joi.ref('min')).messages({
        'number.min': 'Maximum salary cannot be less than minimum salary',
      }),
      currency: Joi.string().trim(),
    }),
    benefits: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim(),
        description: Joi.string().allow('').trim(),
        value: Joi.number().allow(null),
      })
    ),
  }).min(1).messages({
    'object.min': 'At least one compensation field must be provided',
  }),
};

/**
 * Validation middleware
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (!error) {
      return next();
    }
    
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors,
    });
  };
};

module.exports = {
  validate,
  divisionSchema,
  positionSchema,
};
