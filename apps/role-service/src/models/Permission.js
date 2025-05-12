/**
 * Permission Model
 * Defines the schema for permissions with fields for resource, action, and constraints
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const permissionSchema = new Schema({
  // Resource and action
  resource: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'manage', 'execute'],
    index: true,
  },
  
  // Permission details
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  
  // Constraints
  constraints: {
    type: Object,
    default: {},
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
  
  // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Create indexes for frequently queried fields
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });
permissionSchema.index({ name: 1 }, { unique: true });
permissionSchema.index({ isActive: 1 });

/**
 * Static method to find permission by resource and action
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @returns {Promise<Permission>} - Permission document
 */
permissionSchema.statics.findByResourceAndAction = function(resource, action) {
  return this.findOne({ resource, action, isActive: true });
};

/**
 * Static method to find permission by name
 * @param {string} name - Permission name
 * @returns {Promise<Permission>} - Permission document
 */
permissionSchema.statics.findByName = function(name) {
  return this.findOne({ name, isActive: true });
};

/**
 * Static method to find permissions for a resource
 * @param {string} resource - Resource name
 * @returns {Promise<Array>} - Array of permissions
 */
permissionSchema.statics.findByResource = function(resource) {
  return this.find({ resource, isActive: true });
};

/**
 * Static method to find system permissions
 * @returns {Promise<Array>} - Array of system permissions
 */
permissionSchema.statics.findSystemPermissions = function() {
  return this.find({ isSystem: true, isActive: true });
};

// Create the model
const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
