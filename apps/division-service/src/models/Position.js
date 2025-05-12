/**
 * Position Model
 * Defines the schema for positions with hierarchical structure
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Position schema
const positionSchema = new Schema({
  // Basic Information
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  
  // Hierarchical Structure
  reportingTo: {
    type: Schema.Types.ObjectId,
    ref: 'Position',
    default: null,
    index: true,
  },
  level: {
    type: Number,
    default: 0,
    index: true,
  },
  path: {
    type: String,
    default: '',
    index: true,
  },
  
  // Organizational Structure
  divisionId: {
    type: Schema.Types.ObjectId,
    ref: 'Division',
    required: true,
    index: true,
  },
  
  // Position Requirements
  requirements: {
    education: [{
      degree: {
        type: String,
        required: true,
        trim: true,
      },
      field: {
        type: String,
        required: true,
        trim: true,
      },
      isRequired: {
        type: Boolean,
        default: true,
      },
    }],
    experience: [{
      description: {
        type: String,
        required: true,
        trim: true,
      },
      yearsRequired: {
        type: Number,
        required: true,
      },
      isRequired: {
        type: Boolean,
        default: true,
      },
    }],
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
      isRequired: {
        type: Boolean,
        default: true,
      },
    }],
    certifications: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      isRequired: {
        type: Boolean,
        default: false,
      },
    }],
  },
  
  // Responsibilities and Authority
  responsibilities: [{
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
  }],
  authorities: [{
    description: {
      type: String,
      required: true,
      trim: true,
    },
    scope: {
      type: String,
      trim: true,
    },
  }],
  
  // Compensation
  salaryGrade: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  salaryRange: {
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'IDR',
      trim: true,
    },
  },
  benefits: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    value: {
      type: Number,
    },
  }],
  
  // Status Information
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active',
    index: true,
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      required: true,
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
  
  // Vacancy Information
  isVacant: {
    type: Boolean,
    default: true,
    index: true,
  },
  headcount: {
    authorized: {
      type: Number,
      default: 1,
    },
    filled: {
      type: Number,
      default: 0,
    },
  },
  
  // Metadata
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

/**
 * Pre-save middleware to update path and level
 */
positionSchema.pre('save', async function(next) {
  try {
    if (this.isNew || this.isModified('reportingTo')) {
      await this.updatePathAndLevel();
    }
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Update position path and level based on reporting line
 */
positionSchema.methods.updatePathAndLevel = async function() {
  if (!this.reportingTo) {
    // Top position
    this.path = this._id.toString();
    this.level = 0;
  } else {
    const supervisor = await this.constructor.findById(this.reportingTo);
    if (!supervisor) {
      throw new Error('Reporting position not found');
    }
    
    this.path = `${supervisor.path},${this._id.toString()}`;
    this.level = supervisor.level + 1;
  }
};

/**
 * Get direct reports
 * @returns {Promise<Array>} - Direct reporting positions
 */
positionSchema.methods.getDirectReports = async function() {
  return this.constructor.find({ reportingTo: this._id });
};

/**
 * Get all subordinates
 * @returns {Promise<Array>} - All subordinate positions
 */
positionSchema.methods.getAllSubordinates = async function() {
  return this.constructor.find({
    path: { $regex: new RegExp(`^${this.path},`) },
  });
};

/**
 * Get position reporting chain
 * @returns {Promise<Array>} - Reporting chain positions
 */
positionSchema.methods.getReportingChain = async function() {
  if (!this.path || this.path === this._id.toString()) {
    return [];
  }
  
  const supervisorIds = this.path.split(',').slice(0, -1);
  return this.constructor.find({
    _id: { $in: supervisorIds },
  }).sort({ level: 1 });
};

/**
 * Add status history entry
 * @param {string} status - New status
 * @param {string} reason - Reason for status change
 * @param {ObjectId} userId - User ID who changed the status
 */
positionSchema.methods.addStatusHistory = function(status, reason, userId) {
  this.status = status;
  this.statusHistory.push({
    status,
    reason,
    changedBy: userId,
    changedAt: new Date(),
  });
};

/**
 * Update vacancy status
 * @param {boolean} isVacant - Vacancy status
 * @param {number} filled - Number of positions filled
 */
positionSchema.methods.updateVacancy = function(isVacant, filled) {
  this.isVacant = isVacant;
  this.headcount.filled = filled;
};

/**
 * Find active positions
 * @returns {Promise<Array>} - Active positions
 */
positionSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

/**
 * Find positions by division
 * @param {ObjectId} divisionId - Division ID
 * @returns {Promise<Array>} - Positions in the division
 */
positionSchema.statics.findByDivision = function(divisionId) {
  return this.find({ divisionId, status: 'active' });
};

/**
 * Find vacant positions
 * @returns {Promise<Array>} - Vacant positions
 */
positionSchema.statics.findVacant = function() {
  return this.find({ isVacant: true, status: 'active' });
};

// Create the Position model
const Position = mongoose.model('Position', positionSchema);

module.exports = Position;
