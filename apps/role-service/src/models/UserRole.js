/**
 * UserRole Model
 * Defines the schema for user-role assignments
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const userRoleSchema = new Schema({
  // Relationship
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    index: true,
  },
  
  // Assignment details
  scope: {
    type: String,
    enum: ['global', 'organization', 'department', 'project'],
    default: 'global',
  },
  scopeId: {
    type: String,
    index: true,
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  
  // Validity period
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validUntil: {
    type: Date,
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
userRoleSchema.index({ userId: 1, roleId: 1, scope: 1, scopeId: 1 }, { unique: true });
userRoleSchema.index({ userId: 1, isActive: 1 });
userRoleSchema.index({ roleId: 1, isActive: 1 });
userRoleSchema.index({ validFrom: 1, validUntil: 1 });

/**
 * Check if role assignment is valid
 * @returns {boolean} - True if role assignment is valid, false otherwise
 */
userRoleSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  
  if (this.validFrom && this.validFrom > now) return false;
  if (this.validUntil && this.validUntil < now) return false;
  
  return true;
};

/**
 * Static method to find roles for a user
 * @param {string} userId - User ID
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Array of user-role relationships
 */
userRoleSchema.statics.findByUserId = function(userId, options = {}) {
  const { scope, scopeId, includeInactive = false } = options;
  
  const query = { userId };
  
  if (!includeInactive) {
    query.isActive = true;
  }
  
  if (scope) {
    query.scope = scope;
    
    if (scopeId) {
      query.scopeId = scopeId;
    }
  }
  
  return this.find(query)
    .populate('roleId');
};

/**
 * Static method to find users for a role
 * @param {string} roleId - Role ID
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Array of user-role relationships
 */
userRoleSchema.statics.findByRoleId = function(roleId, options = {}) {
  const { scope, scopeId, includeInactive = false } = options;
  
  const query = { roleId };
  
  if (!includeInactive) {
    query.isActive = true;
  }
  
  if (scope) {
    query.scope = scope;
    
    if (scopeId) {
      query.scopeId = scopeId;
    }
  }
  
  return this.find(query)
    .populate('userId');
};

/**
 * Static method to assign role to user
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @param {Object} options - Additional options
 * @returns {Promise<UserRole>} - Created or updated user-role relationship
 */
userRoleSchema.statics.assignRole = async function(userId, roleId, options = {}) {
  const { 
    scope = 'global', 
    scopeId = null, 
    isPrimary = false, 
    validFrom = new Date(), 
    validUntil = null,
    createdBy 
  } = options;
  
  const existing = await this.findOne({ 
    userId, 
    roleId, 
    scope, 
    scopeId: scopeId || null 
  });
  
  if (existing) {
    existing.isActive = true;
    existing.isPrimary = isPrimary;
    existing.validFrom = validFrom;
    existing.validUntil = validUntil;
    existing.updatedBy = createdBy;
    return existing.save();
  }
  
  return this.create({
    userId,
    roleId,
    scope,
    scopeId,
    isPrimary,
    validFrom,
    validUntil,
    createdBy,
  });
};

/**
 * Static method to revoke role from user
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @param {Object} options - Additional options
 * @returns {Promise<boolean>} - True if role was revoked, false otherwise
 */
userRoleSchema.statics.revokeRole = async function(userId, roleId, options = {}) {
  const { scope = 'global', scopeId = null } = options;
  
  const query = { 
    userId, 
    roleId, 
    isActive: true 
  };
  
  if (scope) {
    query.scope = scope;
    
    if (scopeId) {
      query.scopeId = scopeId;
    }
  }
  
  const result = await this.updateOne(
    query,
    { isActive: false }
  );
  
  return result.modifiedCount > 0;
};

/**
 * Static method to get primary role for a user
 * @param {string} userId - User ID
 * @param {Object} options - Additional options
 * @returns {Promise<UserRole>} - Primary user-role relationship
 */
userRoleSchema.statics.getPrimaryRole = async function(userId, options = {}) {
  const { scope, scopeId } = options;
  
  const query = { 
    userId, 
    isActive: true,
    isPrimary: true 
  };
  
  if (scope) {
    query.scope = scope;
    
    if (scopeId) {
      query.scopeId = scopeId;
    }
  }
  
  return this.findOne(query)
    .populate('roleId');
};

// Create the model
const UserRole = mongoose.model('UserRole', userRoleSchema);

module.exports = UserRole;
