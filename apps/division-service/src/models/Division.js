/**
 * Division Model
 * Defines the schema for divisions with hierarchical structure
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Division schema
const divisionSchema = new Schema({
  // Basic Information
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  name: {
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
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Division',
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
  
  // Branch Association
  branchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true,
  },
  
  // Division Head
  headPositionId: {
    type: Schema.Types.ObjectId,
    ref: 'Position',
    index: true,
  },
  
  // Performance Metrics
  performanceMetrics: {
    kpis: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      target: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
        trim: true,
      },
      current: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    }],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  
  // Budget Information
  budget: {
    allocated: {
      type: Number,
      default: 0,
    },
    spent: {
      type: Number,
      default: 0,
    },
    remaining: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'IDR',
      trim: true,
    },
    fiscalYear: {
      type: String,
      trim: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  
  // Status Information
  status: {
    type: String,
    enum: ['active', 'inactive', 'restructuring'],
    default: 'active',
    index: true,
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['active', 'inactive', 'restructuring'],
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
divisionSchema.pre('save', async function(next) {
  try {
    if (this.isNew || this.isModified('parentId')) {
      await this.updatePathAndLevel();
    }
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Update division path and level based on parent
 */
divisionSchema.methods.updatePathAndLevel = async function() {
  if (!this.parentId) {
    // Root division
    this.path = this._id.toString();
    this.level = 0;
  } else {
    const parent = await this.constructor.findById(this.parentId);
    if (!parent) {
      throw new Error('Parent division not found');
    }
    
    this.path = `${parent.path},${this._id.toString()}`;
    this.level = parent.level + 1;
  }
};

/**
 * Get child divisions
 * @returns {Promise<Array>} - Child divisions
 */
divisionSchema.methods.getChildren = async function() {
  return this.constructor.find({ parentId: this._id });
};

/**
 * Get all descendants
 * @returns {Promise<Array>} - All descendant divisions
 */
divisionSchema.methods.getDescendants = async function() {
  return this.constructor.find({
    path: { $regex: new RegExp(`^${this.path},`) },
  });
};

/**
 * Get division ancestors
 * @returns {Promise<Array>} - Ancestor divisions
 */
divisionSchema.methods.getAncestors = async function() {
  if (!this.path || this.path === this._id.toString()) {
    return [];
  }
  
  const ancestorIds = this.path.split(',').slice(0, -1);
  return this.constructor.find({
    _id: { $in: ancestorIds },
  });
};

/**
 * Add status history entry
 * @param {string} status - New status
 * @param {string} reason - Reason for status change
 * @param {ObjectId} userId - User ID who changed the status
 */
divisionSchema.methods.addStatusHistory = function(status, reason, userId) {
  this.status = status;
  this.statusHistory.push({
    status,
    reason,
    changedBy: userId,
    changedAt: new Date(),
  });
};

/**
 * Update performance metrics
 * @param {Object} kpi - KPI to update
 */
divisionSchema.methods.updateKPI = function(kpi) {
  const existingKPI = this.performanceMetrics.kpis.find(
    k => k._id.toString() === kpi._id || k.name === kpi.name
  );
  
  if (existingKPI) {
    Object.assign(existingKPI, kpi, { lastUpdated: new Date() });
  } else {
    this.performanceMetrics.kpis.push({
      ...kpi,
      lastUpdated: new Date(),
    });
  }
  
  this.performanceMetrics.lastUpdated = new Date();
};

/**
 * Update budget allocation
 * @param {Object} budgetData - Budget data to update
 */
divisionSchema.methods.updateBudget = function(budgetData) {
  this.budget = {
    ...this.budget,
    ...budgetData,
    remaining: budgetData.allocated - (budgetData.spent || this.budget.spent),
    lastUpdated: new Date(),
  };
};

/**
 * Find active divisions
 * @returns {Promise<Array>} - Active divisions
 */
divisionSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

/**
 * Find divisions by branch
 * @param {ObjectId} branchId - Branch ID
 * @returns {Promise<Array>} - Divisions in the branch
 */
divisionSchema.statics.findByBranch = function(branchId) {
  return this.find({ branchId, status: 'active' });
};

// Create the Division model
const Division = mongoose.model('Division', divisionSchema);

module.exports = Division;
