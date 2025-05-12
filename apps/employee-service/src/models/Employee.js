/**
 * Employee Model
 * Defines the schema for employees with comprehensive profile information
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Employee schema
const employeeSchema = new Schema({
  // Basic Information
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    sparse: true,
    index: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  nickname: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  birthPlace: {
    type: String,
    required: true,
    trim: true,
  },
  nationality: {
    type: String,
    required: true,
    trim: true,
  },
  religion: {
    type: String,
    trim: true,
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed'],
    required: true,
  },
  
  // Contact Information
  contactInfo: {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    alternativePhoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      postalCode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        default: 'Indonesia',
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },
  },
  
  // Emergency Contact
  emergencyContacts: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  
  // Employment Information
  employmentInfo: {
    joinDate: {
      type: Date,
      required: true,
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'probation'],
      required: true,
    },
    employmentStatus: {
      type: String,
      enum: ['active', 'inactive', 'on-leave', 'terminated'],
      default: 'active',
      index: true,
    },
    statusHistory: [{
      status: {
        type: String,
        enum: ['active', 'inactive', 'on-leave', 'terminated'],
        required: true,
      },
      reason: {
        type: String,
        trim: true,
      },
      effectiveDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
      },
      changedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      changedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    terminationDate: {
      type: Date,
    },
    terminationReason: {
      type: String,
      trim: true,
    },
  },
  
  // Position and Branch Assignment
  positionAssignment: {
    current: {
      positionId: {
        type: Schema.Types.ObjectId,
        ref: 'Position',
        required: true,
        index: true,
      },
      branchId: {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
        index: true,
      },
      divisionId: {
        type: Schema.Types.ObjectId,
        ref: 'Division',
        required: true,
        index: true,
      },
      assignedDate: {
        type: Date,
        required: true,
      },
      isActing: {
        type: Boolean,
        default: false,
      },
    },
    history: [{
      positionId: {
        type: Schema.Types.ObjectId,
        ref: 'Position',
        required: true,
      },
      branchId: {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
      },
      divisionId: {
        type: Schema.Types.ObjectId,
        ref: 'Division',
        required: true,
      },
      assignedDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
      },
      isActing: {
        type: Boolean,
        default: false,
      },
      reason: {
        type: String,
        trim: true,
      },
      changedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      changedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  
  // Identification Documents
  identificationDocuments: {
    nationalId: {
      number: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      expiryDate: {
        type: Date,
      },
      documentUrl: {
        type: String,
        trim: true,
      },
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
    },
    taxId: {
      number: {
        type: String,
        trim: true,
        index: true,
      },
      documentUrl: {
        type: String,
        trim: true,
      },
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
    },
    drivingLicense: {
      number: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        trim: true,
      },
      expiryDate: {
        type: Date,
      },
      documentUrl: {
        type: String,
        trim: true,
      },
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
    },
    passport: {
      number: {
        type: String,
        trim: true,
      },
      issuingCountry: {
        type: String,
        trim: true,
      },
      expiryDate: {
        type: Date,
      },
      documentUrl: {
        type: String,
        trim: true,
      },
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
    },
    bankAccount: {
      bankName: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        trim: true,
      },
      accountHolderName: {
        type: String,
        trim: true,
      },
      branch: {
        type: String,
        trim: true,
      },
      documentUrl: {
        type: String,
        trim: true,
      },
    },
    bpjsKesehatan: {
      number: {
        type: String,
        trim: true,
      },
      documentUrl: {
        type: String,
        trim: true,
      },
    },
    bpjsKetenagakerjaan: {
      number: {
        type: String,
        trim: true,
      },
      documentUrl: {
        type: String,
        trim: true,
      },
    },
  },
  
  // Education
  education: [{
    degree: {
      type: String,
      required: true,
      trim: true,
    },
    institution: {
      type: String,
      required: true,
      trim: true,
    },
    field: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    grade: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    documentUrl: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  }],
  
  // Skills and Competencies
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    certifications: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      issuingOrganization: {
        type: String,
        required: true,
        trim: true,
      },
      issueDate: {
        type: Date,
        required: true,
      },
      expiryDate: {
        type: Date,
      },
      credentialId: {
        type: String,
        trim: true,
      },
      documentUrl: {
        type: String,
        trim: true,
      },
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
    }],
    lastEvaluated: {
      type: Date,
    },
  }],
  
  // Performance Evaluations
  performanceEvaluations: [{
    evaluationPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    evaluationAreas: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comments: {
        type: String,
        trim: true,
      },
    }],
    strengths: [{
      type: String,
      trim: true,
    }],
    areasForImprovement: [{
      type: String,
      trim: true,
    }],
    goals: [{
      description: {
        type: String,
        required: true,
        trim: true,
      },
      targetDate: {
        type: Date,
      },
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending',
      },
    }],
    evaluator: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    evaluationDate: {
      type: Date,
      required: true,
    },
    employeeAcknowledgement: {
      acknowledged: {
        type: Boolean,
        default: false,
      },
      date: {
        type: Date,
      },
      comments: {
        type: String,
        trim: true,
      },
    },
    documentUrl: {
      type: String,
      trim: true,
    },
  }],
  
  // Career Development
  careerDevelopment: {
    careerPath: [{
      targetPosition: {
        type: Schema.Types.ObjectId,
        ref: 'Position',
        required: true,
      },
      readinessLevel: {
        type: String,
        enum: ['not-ready', 'developing', 'ready-soon', 'ready-now'],
        required: true,
      },
      developmentNeeds: [{
        type: String,
        trim: true,
      }],
      timeline: {
        type: Date,
      },
    }],
    mentorship: [{
      mentor: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
      },
      focus: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active',
      },
    }],
    successorFor: [{
      positionId: {
        type: Schema.Types.ObjectId,
        ref: 'Position',
      },
      readinessLevel: {
        type: String,
        enum: ['not-ready', 'developing', 'ready-soon', 'ready-now'],
      },
    }],
  },
  
  // Training History
  trainingHistory: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['internal', 'external', 'online', 'conference', 'workshop'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ['hours', 'days', 'weeks', 'months'],
        required: true,
      },
    },
    description: {
      type: String,
      trim: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    completionStatus: {
      type: String,
      enum: ['registered', 'in-progress', 'completed', 'failed', 'cancelled'],
      default: 'registered',
    },
    certificateUrl: {
      type: String,
      trim: true,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comments: {
        type: String,
        trim: true,
      },
    },
  }],
  
  // Employment Contracts
  contracts: [{
    type: {
      type: String,
      enum: ['probation', 'fixed-term', 'permanent', 'extension'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    documentUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'expired', 'terminated', 'renewed'],
      default: 'draft',
    },
    terminationReason: {
      type: String,
      trim: true,
    },
    terms: {
      type: String,
      trim: true,
    },
    signedByEmployee: {
      type: Boolean,
      default: false,
    },
    signedByCompany: {
      type: Boolean,
      default: false,
    },
    alertSettings: {
      expiryAlert: {
        type: Boolean,
        default: true,
      },
      alertDays: {
        type: Number,
        default: 30,
      },
    },
  }],
  
  // Payroll Information
  payrollInfo: {
    salaryGrade: {
      type: String,
      trim: true,
    },
    basicSalary: {
      amount: {
        type: Number,
      },
      currency: {
        type: String,
        default: 'IDR',
        trim: true,
      },
    },
    bankAccount: {
      bankName: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        trim: true,
      },
      accountHolderName: {
        type: String,
        trim: true,
      },
    },
    taxStatus: {
      type: String,
      enum: ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'],
      trim: true,
    },
  },
  
  // Additional Information
  additionalInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    allergies: [{
      type: String,
      trim: true,
    }],
    chronicDiseases: [{
      type: String,
      trim: true,
    }],
    disabilities: [{
      type: String,
      trim: true,
    }],
    uniformSize: {
      type: String,
      trim: true,
    },
    shoeSize: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  
  // System Fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Create indexes
employeeSchema.index({ 'contactInfo.email': 1 });
employeeSchema.index({ 'contactInfo.phoneNumber': 1 });
employeeSchema.index({ 'identificationDocuments.nationalId.number': 1 });
employeeSchema.index({ 'employmentInfo.employmentStatus': 1 });
employeeSchema.index({ 'positionAssignment.current.positionId': 1 });
employeeSchema.index({ 'positionAssignment.current.branchId': 1 });
employeeSchema.index({ 'positionAssignment.current.divisionId': 1 });
employeeSchema.index({ 'contactInfo.address.coordinates': '2dsphere' });

/**
 * Pre-save middleware to generate fullName
 */
employeeSchema.pre('save', function(next) {
  this.fullName = `${this.firstName} ${this.lastName}`;
  next();
});

/**
 * Add employment status history entry
 * @param {string} status - New status
 * @param {string} reason - Reason for status change
 * @param {Date} effectiveDate - Effective date of the status change
 * @param {Date} endDate - End date of the status (if applicable)
 * @param {ObjectId} userId - User ID who changed the status
 */
employeeSchema.methods.addStatusHistory = function(status, reason, effectiveDate, endDate, userId) {
  this.employmentInfo.employmentStatus = status;
  this.employmentInfo.statusHistory.push({
    status,
    reason,
    effectiveDate,
    endDate,
    changedBy: userId,
    changedAt: new Date(),
  });
};

/**
 * Add position assignment history entry
 * @param {Object} assignment - Position assignment data
 * @param {ObjectId} userId - User ID who made the assignment
 */
employeeSchema.methods.addPositionAssignment = function(assignment, userId) {
  // Add current assignment to history if exists
  if (this.positionAssignment.current && this.positionAssignment.current.positionId) {
    const currentAssignment = {
      ...this.positionAssignment.current.toObject(),
      endDate: new Date(),
      reason: assignment.reason || 'Position change',
      changedBy: userId,
      changedAt: new Date(),
    };
    this.positionAssignment.history.push(currentAssignment);
  }
  
  // Set new current assignment
  this.positionAssignment.current = {
    positionId: assignment.positionId,
    branchId: assignment.branchId,
    divisionId: assignment.divisionId,
    assignedDate: assignment.assignedDate || new Date(),
    isActing: assignment.isActing || false,
  };
};

/**
 * Add education record
 * @param {Object} education - Education data
 */
employeeSchema.methods.addEducation = function(education) {
  this.education.push(education);
};

/**
 * Add skill record
 * @param {Object} skill - Skill data
 */
employeeSchema.methods.addSkill = function(skill) {
  const existingSkill = this.skills.find(s => s.name === skill.name);
  
  if (existingSkill) {
    Object.assign(existingSkill, skill);
  } else {
    this.skills.push(skill);
  }
};

/**
 * Add performance evaluation
 * @param {Object} evaluation - Performance evaluation data
 */
employeeSchema.methods.addPerformanceEvaluation = function(evaluation) {
  this.performanceEvaluations.push(evaluation);
};

/**
 * Add training record
 * @param {Object} training - Training data
 */
employeeSchema.methods.addTraining = function(training) {
  this.trainingHistory.push(training);
};

/**
 * Add contract
 * @param {Object} contract - Contract data
 */
employeeSchema.methods.addContract = function(contract) {
  this.contracts.push(contract);
};

/**
 * Update contract status
 * @param {ObjectId} contractId - Contract ID
 * @param {string} status - New status
 * @param {string} reason - Reason for status change (for termination)
 */
employeeSchema.methods.updateContractStatus = function(contractId, status, reason) {
  const contract = this.contracts.id(contractId);
  
  if (contract) {
    contract.status = status;
    
    if (status === 'terminated' && reason) {
      contract.terminationReason = reason;
    }
  }
};

/**
 * Get active contract
 * @returns {Object} - Active contract
 */
employeeSchema.methods.getActiveContract = function() {
  return this.contracts.find(c => c.status === 'active');
};

/**
 * Get contracts expiring soon
 * @param {number} days - Number of days to check
 * @returns {Array} - Contracts expiring within specified days
 */
employeeSchema.methods.getContractsExpiringSoon = function(days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return this.contracts.filter(c => 
    c.status === 'active' && 
    c.endDate && 
    c.endDate >= today && 
    c.endDate <= futureDate
  );
};

/**
 * Find employees by position
 * @param {ObjectId} positionId - Position ID
 * @returns {Promise<Array>} - Employees in the position
 */
employeeSchema.statics.findByPosition = function(positionId) {
  return this.find({
    'positionAssignment.current.positionId': positionId,
    'employmentInfo.employmentStatus': 'active',
  });
};

/**
 * Find employees by branch
 * @param {ObjectId} branchId - Branch ID
 * @returns {Promise<Array>} - Employees in the branch
 */
employeeSchema.statics.findByBranch = function(branchId) {
  return this.find({
    'positionAssignment.current.branchId': branchId,
    'employmentInfo.employmentStatus': 'active',
  });
};

/**
 * Find employees by division
 * @param {ObjectId} divisionId - Division ID
 * @returns {Promise<Array>} - Employees in the division
 */
employeeSchema.statics.findByDivision = function(divisionId) {
  return this.find({
    'positionAssignment.current.divisionId': divisionId,
    'employmentInfo.employmentStatus': 'active',
  });
};

/**
 * Find employees by employment status
 * @param {string} status - Employment status
 * @returns {Promise<Array>} - Employees with the specified status
 */
employeeSchema.statics.findByStatus = function(status) {
  return this.find({
    'employmentInfo.employmentStatus': status,
  });
};

/**
 * Find employees by skill
 * @param {string} skillName - Skill name
 * @param {string} level - Skill level (optional)
 * @returns {Promise<Array>} - Employees with the specified skill
 */
employeeSchema.statics.findBySkill = function(skillName, level) {
  const query = {
    'skills.name': skillName,
    'employmentInfo.employmentStatus': 'active',
  };
  
  if (level) {
    query['skills.level'] = level;
  }
  
  return this.find(query);
};

// Create the Employee model
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
