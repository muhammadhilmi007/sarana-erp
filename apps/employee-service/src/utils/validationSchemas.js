/**
 * Validation Schemas
 * Defines validation schemas for request validation
 */

const Joi = require('joi');

// Common schemas
const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);
const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
};

// Employee schemas
const employeeSchema = {
  id: {
    id: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid employee ID format',
      'any.required': 'Employee ID is required'
    })
  },
  create: Joi.object({
    employeeId: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    birthDate: Joi.date().iso().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed').required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required()
    }).required(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phoneNumber: Joi.string().required()
    }).required(),
    joinDate: Joi.date().iso().required(),
    divisionId: objectIdSchema.required(),
    branchId: objectIdSchema.required(),
    positionId: objectIdSchema.required(),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'intern', 'probation').required(),
    bankAccount: Joi.object({
      bankName: Joi.string().required(),
      accountNumber: Joi.string().required(),
      accountName: Joi.string().required()
    }).required(),
    taxInfo: Joi.object({
      taxId: Joi.string().required(),
      taxStatus: Joi.string().required()
    }).required(),
    createdBy: objectIdSchema.required()
  }).required(),
  update: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    phoneNumber: Joi.string(),
    birthDate: Joi.date().iso(),
    gender: Joi.string().valid('male', 'female', 'other'),
    maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed'),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required()
    }),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phoneNumber: Joi.string().required()
    }),
    bankAccount: Joi.object({
      bankName: Joi.string().required(),
      accountNumber: Joi.string().required(),
      accountName: Joi.string().required()
    }),
    taxInfo: Joi.object({
      taxId: Joi.string().required(),
      taxStatus: Joi.string().required()
    }),
    updatedBy: objectIdSchema.required()
  }).min(1).required(),
  query: Joi.object({
    search: Joi.string(),
    status: Joi.string().valid('active', 'inactive', 'terminated', 'on-leave', 'suspended'),
    divisionId: objectIdSchema,
    branchId: objectIdSchema,
    positionId: objectIdSchema,
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'intern', 'probation'),
    joinDateStart: Joi.date().iso(),
    joinDateEnd: Joi.date().iso(),
    ...paginationSchema
  })
};

// Status schemas
const statusSchema = {
  employeeId: {
    id: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid employee ID format',
      'any.required': 'Employee ID is required'
    })
  },
  update: Joi.object({
    status: Joi.string().valid('active', 'inactive', 'terminated', 'on-leave', 'suspended').required(),
    reason: Joi.string().required(),
    effectiveDate: Joi.date().iso().required(),
    notes: Joi.string(),
    updatedBy: objectIdSchema.required()
  }).required()
};

// Assignment schemas
const assignmentSchema = {
  employeeId: {
    id: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid employee ID format',
      'any.required': 'Employee ID is required'
    })
  },
  position: Joi.object({
    positionId: objectIdSchema.required(),
    effectiveDate: Joi.date().iso().required(),
    reason: Joi.string().required(),
    notes: Joi.string(),
    updatedBy: objectIdSchema.required()
  }).required(),
  branch: Joi.object({
    branchId: objectIdSchema.required(),
    effectiveDate: Joi.date().iso().required(),
    reason: Joi.string().required(),
    notes: Joi.string(),
    updatedBy: objectIdSchema.required()
  }).required()
};

// Document schemas
const documentSchema = {
  employeeId: {
    employeeId: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid employee ID format',
      'any.required': 'Employee ID is required'
    })
  },
  id: {
    id: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid document ID format',
      'any.required': 'Document ID is required'
    })
  },
  create: Joi.object({
    documentType: Joi.string().valid(
      'ktp', 'npwp', 'ijazah', 'sertifikat', 'sim', 'passport', 
      'bpjs_kesehatan', 'bpjs_ketenagakerjaan', 'bank_account', 
      'contract', 'performance_review', 'training_certificate', 'other'
    ).required(),
    documentNumber: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string(),
    issueDate: Joi.date().iso().required(),
    expiryDate: Joi.date().iso(),
    issuingAuthority: Joi.string().required(),
    fileUrl: Joi.string().uri().required(),
    fileName: Joi.string().required(),
    fileSize: Joi.number().required(),
    fileType: Joi.string().required(),
    uploadedBy: objectIdSchema.required()
  }).required(),
  reject: Joi.object({
    reason: Joi.string().required(),
    updatedBy: objectIdSchema.required()
  }).required()
};

// Skill schemas
const skillSchema = {
  employeeId: {
    id: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid employee ID format',
      'any.required': 'Employee ID is required'
    })
  },
  update: Joi.object({
    name: Joi.string().required(),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').required(),
    description: Joi.string(),
    yearsOfExperience: Joi.number().min(0),
    updatedBy: objectIdSchema.required()
  }).required(),
  certification: Joi.object({
    name: Joi.string().required(),
    issuer: Joi.string().required(),
    issueDate: Joi.date().iso().required(),
    expiryDate: Joi.date().iso(),
    credentialId: Joi.string(),
    credentialUrl: Joi.string().uri(),
    fileUrl: Joi.string().uri(),
    updatedBy: objectIdSchema.required()
  }).required()
};

// Performance schemas
const performanceSchema = {
  employeeId: {
    id: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid employee ID format',
      'any.required': 'Employee ID is required'
    })
  },
  evaluationId: {
    evaluationId: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid evaluation ID format',
      'any.required': 'Evaluation ID is required'
    })
  },
  create: Joi.object({
    evaluationPeriod: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().required()
    }).required(),
    evaluationType: Joi.string().valid('annual', 'semi-annual', 'quarterly', 'probation', 'project').required(),
    evaluator: objectIdSchema.required(),
    ratings: Joi.object({
      jobKnowledge: Joi.number().min(1).max(5).required(),
      workQuality: Joi.number().min(1).max(5).required(),
      attendance: Joi.number().min(1).max(5).required(),
      communication: Joi.number().min(1).max(5).required(),
      teamwork: Joi.number().min(1).max(5).required(),
      problemSolving: Joi.number().min(1).max(5).required(),
      initiative: Joi.number().min(1).max(5).required(),
      leadership: Joi.number().min(1).max(5).required()
    }).required(),
    overallRating: Joi.number().min(1).max(5).required(),
    strengths: Joi.array().items(Joi.string()).required(),
    areasForImprovement: Joi.array().items(Joi.string()).required(),
    goals: Joi.array().items(Joi.object({
      description: Joi.string().required(),
      targetDate: Joi.date().iso().required()
    })).required(),
    comments: Joi.string().required(),
    createdBy: objectIdSchema.required()
  }).required(),
  update: Joi.object({
    ratings: Joi.object({
      jobKnowledge: Joi.number().min(1).max(5),
      workQuality: Joi.number().min(1).max(5),
      attendance: Joi.number().min(1).max(5),
      communication: Joi.number().min(1).max(5),
      teamwork: Joi.number().min(1).max(5),
      problemSolving: Joi.number().min(1).max(5),
      initiative: Joi.number().min(1).max(5),
      leadership: Joi.number().min(1).max(5)
    }),
    overallRating: Joi.number().min(1).max(5),
    strengths: Joi.array().items(Joi.string()),
    areasForImprovement: Joi.array().items(Joi.string()),
    goals: Joi.array().items(Joi.object({
      description: Joi.string().required(),
      targetDate: Joi.date().iso().required()
    })),
    comments: Joi.string(),
    updatedBy: objectIdSchema.required()
  }).min(1).required(),
  acknowledge: Joi.object({
    acknowledgement: Joi.boolean().required(),
    employeeComments: Joi.string().allow(''),
    acknowledgedAt: Joi.date().iso().required()
  }).required()
};

// Career schemas
const careerSchema = {
  employeeId: {
    id: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid employee ID format',
      'any.required': 'Employee ID is required'
    })
  },
  positionId: {
    positionId: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid position ID format',
      'any.required': 'Position ID is required'
    })
  },
  mentorshipId: {
    mentorshipId: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid mentorship ID format',
      'any.required': 'Mentorship ID is required'
    })
  },
  careerPath: Joi.object({
    targetPositions: Joi.array().items(objectIdSchema).min(1).required(),
    careerGoals: Joi.array().items(Joi.string()).required(),
    timeframe: Joi.string().required(),
    developmentAreas: Joi.array().items(Joi.string()).required(),
    updatedBy: objectIdSchema.required()
  }).required(),
  mentorship: Joi.object({
    mentorId: objectIdSchema.required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso(),
    goals: Joi.array().items(Joi.string()).required(),
    meetingFrequency: Joi.string().required(),
    createdBy: objectIdSchema.required()
  }).required(),
  mentorshipStatus: Joi.object({
    status: Joi.string().valid('active', 'completed', 'cancelled').required(),
    notes: Joi.string(),
    updatedBy: objectIdSchema.required()
  }).required(),
  successor: Joi.object({
    isSuccessorFor: Joi.array().items(objectIdSchema).min(1).required(),
    readinessLevel: Joi.string().valid('ready-now', 'ready-1-year', 'ready-2-years', 'development-needed').required(),
    developmentPlan: Joi.string().required(),
    updatedBy: objectIdSchema.required()
  }).required()
};

// Training schemas
const trainingSchema = {
  employeeId: {
    id: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid employee ID format',
      'any.required': 'Employee ID is required'
    })
  },
  trainingId: {
    trainingId: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid training ID format',
      'any.required': 'Training ID is required'
    })
  },
  create: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().valid('internal', 'external', 'online', 'conference', 'workshop').required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    provider: Joi.string().required(),
    location: Joi.string(),
    cost: Joi.number().min(0),
    status: Joi.string().valid('registered', 'in-progress', 'completed', 'failed', 'cancelled').required(),
    createdBy: objectIdSchema.required()
  }).required(),
  update: Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    type: Joi.string().valid('internal', 'external', 'online', 'conference', 'workshop'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    provider: Joi.string(),
    location: Joi.string(),
    cost: Joi.number().min(0),
    updatedBy: objectIdSchema.required()
  }).min(1).required(),
  status: Joi.object({
    status: Joi.string().valid('registered', 'in-progress', 'completed', 'failed', 'cancelled').required(),
    completionDate: Joi.date().iso().when('status', {
      is: 'completed',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    certificateUrl: Joi.string().uri().when('status', {
      is: 'completed',
      then: Joi.optional(),
      otherwise: Joi.optional()
    }),
    notes: Joi.string(),
    updatedBy: objectIdSchema.required()
  }).required()
};

// Contract schemas
const contractSchema = {
  employeeId: {
    id: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid employee ID format',
      'any.required': 'Employee ID is required'
    })
  },
  contractId: {
    contractId: objectIdSchema.required().messages({
      'string.pattern.base': 'Invalid contract ID format',
      'any.required': 'Contract ID is required'
    })
  },
  create: Joi.object({
    contractType: Joi.string().valid('probation', 'fixed-term', 'permanent', 'internship').required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().when('contractType', {
      is: Joi.valid('fixed-term', 'internship', 'probation'),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    position: Joi.string().required(),
    salary: Joi.number().min(0).required(),
    benefits: Joi.array().items(Joi.string()),
    workingHours: Joi.object({
      hoursPerWeek: Joi.number().required(),
      daysPerWeek: Joi.number().required(),
      shiftType: Joi.string().valid('day', 'night', 'rotating', 'flexible').required()
    }).required(),
    documentUrl: Joi.string().uri(),
    status: Joi.string().valid('draft', 'active', 'expired', 'terminated').required(),
    createdBy: objectIdSchema.required()
  }).required(),
  update: Joi.object({
    contractType: Joi.string().valid('probation', 'fixed-term', 'permanent', 'internship'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    position: Joi.string(),
    salary: Joi.number().min(0),
    benefits: Joi.array().items(Joi.string()),
    workingHours: Joi.object({
      hoursPerWeek: Joi.number().required(),
      daysPerWeek: Joi.number().required(),
      shiftType: Joi.string().valid('day', 'night', 'rotating', 'flexible').required()
    }),
    documentUrl: Joi.string().uri(),
    updatedBy: objectIdSchema.required()
  }).min(1).required(),
  status: Joi.object({
    status: Joi.string().valid('draft', 'active', 'expired', 'terminated').required(),
    reason: Joi.string().when('status', {
      is: 'terminated',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    terminationDate: Joi.date().iso().when('status', {
      is: 'terminated',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    updatedBy: objectIdSchema.required()
  }).required()
};

module.exports = {
  employeeSchema,
  statusSchema,
  assignmentSchema,
  documentSchema,
  skillSchema,
  performanceSchema,
  careerSchema,
  trainingSchema,
  contractSchema
};
