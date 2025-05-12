/**
 * Role Model
 * Defines the schema for roles with fields for name, description, and hierarchy
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const roleSchema = new Schema({
  // Basic information
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
  
  // Hierarchy
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    index: true,
  },
  level: {
    type: Number,
    default: 0,
    index: true,
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
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ parentId: 1 });
roleSchema.index({ level: 1 });
roleSchema.index({ isActive: 1 });

/**
 * Get child roles
 * @returns {Promise<Array>} - Array of child roles
 */
roleSchema.methods.getChildRoles = async function() {
  return this.model('Role').find({ parentId: this._id });
};

/**
 * Get all descendant roles
 * @returns {Promise<Array>} - Array of descendant roles
 */
roleSchema.methods.getAllDescendants = async function() {
  const descendants = [];
  const queue = [this._id];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = await this.model('Role').find({ parentId: currentId });
    
    for (const child of children) {
      descendants.push(child);
      queue.push(child._id);
    }
  }
  
  return descendants;
};

/**
 * Get parent role
 * @returns {Promise<Role>} - Parent role
 */
roleSchema.methods.getParentRole = async function() {
  if (!this.parentId) return null;
  return this.model('Role').findById(this.parentId);
};

/**
 * Get all ancestor roles
 * @returns {Promise<Array>} - Array of ancestor roles
 */
roleSchema.methods.getAllAncestors = async function() {
  const ancestors = [];
  let currentRole = this;
  
  while (currentRole.parentId) {
    const parent = await currentRole.getParentRole();
    if (!parent) break;
    
    ancestors.push(parent);
    currentRole = parent;
  }
  
  return ancestors;
};

/**
 * Static method to find role by name
 * @param {string} name - Role name
 * @returns {Promise<Role>} - Role document
 */
roleSchema.statics.findByName = function(name) {
  return this.findOne({ name, isActive: true });
};

/**
 * Static method to find system roles
 * @returns {Promise<Array>} - Array of system roles
 */
roleSchema.statics.findSystemRoles = function() {
  return this.find({ isSystem: true, isActive: true });
};

// Create the model
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
