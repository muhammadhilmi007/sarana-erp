/**
 * Branch Model
 * Defines the schema for branches with hierarchical structure
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Branch schema
const branchSchema = new Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['headquarters', 'regional', 'branch'],
    default: 'branch',
    index: true,
  },
  
  // Hierarchical Structure
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
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
  
  // Location Information
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
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      default: 'Indonesia',
      trim: true,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
  },
  
  // Contact Information
  contactInfo: {
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    fax: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
  },
  
  // Operational Information
  operationalHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    openTime: {
      type: String,
      default: '08:00',
    },
    closeTime: {
      type: String,
      default: '17:00',
    },
  }],
  
  // Resource Allocation
  resources: {
    employeeCount: {
      type: Number,
      default: 0,
    },
    vehicleCount: {
      type: Number,
      default: 0,
    },
    storageCapacity: {
      type: Number, // in cubic meters
      default: 0,
    },
    maxDailyPackages: {
      type: Number,
      default: 0,
    },
  },
  
  // Performance Metrics
  performanceMetrics: {
    monthlyRevenue: {
      type: Number,
      default: 0,
    },
    monthlyPackages: {
      type: Number,
      default: 0,
    },
    customerSatisfaction: {
      type: Number, // 0-100
      default: 0,
    },
    deliverySuccessRate: {
      type: Number, // 0-100
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  
  // Documents
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['license', 'permit', 'certificate', 'contract', 'other'],
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
  
  // Status Information
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'closed'],
    default: 'active',
    index: true,
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'closed'],
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

// Create geospatial index for location coordinates
branchSchema.index({ 'address.coordinates': '2dsphere' });

/**
 * Pre-save middleware to update path and level
 */
branchSchema.pre('save', async function(next) {
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
 * Update branch path and level based on parent
 */
branchSchema.methods.updatePathAndLevel = async function() {
  if (!this.parentId) {
    // Root branch
    this.path = this._id.toString();
    this.level = 0;
  } else {
    const parent = await this.constructor.findById(this.parentId);
    if (!parent) {
      throw new Error('Parent branch not found');
    }
    
    this.path = `${parent.path},${this._id.toString()}`;
    this.level = parent.level + 1;
  }
};

/**
 * Get child branches
 * @returns {Promise<Array>} - Child branches
 */
branchSchema.methods.getChildren = async function() {
  return this.constructor.find({ parentId: this._id });
};

/**
 * Get all descendants
 * @returns {Promise<Array>} - All descendant branches
 */
branchSchema.methods.getDescendants = async function() {
  return this.constructor.find({
    path: { $regex: new RegExp(`^${this.path},`) },
  });
};

/**
 * Get branch ancestors
 * @returns {Promise<Array>} - Ancestor branches
 */
branchSchema.methods.getAncestors = async function() {
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
branchSchema.methods.addStatusHistory = function(status, reason, userId) {
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
 * @param {Object} metrics - Performance metrics to update
 */
branchSchema.methods.updatePerformanceMetrics = function(metrics) {
  this.performanceMetrics = {
    ...this.performanceMetrics,
    ...metrics,
    lastUpdated: new Date(),
  };
};

/**
 * Update resources allocation
 * @param {Object} resources - Resources to update
 */
branchSchema.methods.updateResources = function(resources) {
  this.resources = {
    ...this.resources,
    ...resources,
  };
};

/**
 * Add document to branch
 * @param {Object} document - Document to add
 */
branchSchema.methods.addDocument = function(document) {
  this.documents.push(document);
};

/**
 * Update document status
 * @param {ObjectId} documentId - Document ID
 * @param {boolean} isActive - Document active status
 */
branchSchema.methods.updateDocumentStatus = function(documentId, isActive) {
  const document = this.documents.id(documentId);
  if (document) {
    document.isActive = isActive;
  }
};

/**
 * Find branches by location
 * @param {number} longitude - Longitude
 * @param {number} latitude - Latitude
 * @param {number} maxDistance - Maximum distance in meters
 * @returns {Promise<Array>} - Branches within the specified distance
 */
branchSchema.statics.findByLocation = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
  });
};

/**
 * Find branches by type
 * @param {string} type - Branch type
 * @returns {Promise<Array>} - Branches of the specified type
 */
branchSchema.statics.findByType = function(type) {
  return this.find({ type, status: 'active' });
};

/**
 * Find active branches
 * @returns {Promise<Array>} - Active branches
 */
branchSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Create the Branch model
const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
