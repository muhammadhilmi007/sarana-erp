/**
 * RolePermission Model
 * Defines the schema for role-permission relationships
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const rolePermissionSchema = new Schema({
  // Relationship
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    index: true,
  },
  permissionId: {
    type: Schema.Types.ObjectId,
    ref: 'Permission',
    required: true,
    index: true,
  },
  
  // Additional constraints
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
rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });
rolePermissionSchema.index({ isActive: 1 });

/**
 * Static method to find permissions for a role
 * @param {string} roleId - Role ID
 * @returns {Promise<Array>} - Array of role-permission relationships
 */
rolePermissionSchema.statics.findByRoleId = function(roleId) {
  return this.find({ roleId, isActive: true })
    .populate('permissionId');
};

/**
 * Static method to find roles for a permission
 * @param {string} permissionId - Permission ID
 * @returns {Promise<Array>} - Array of role-permission relationships
 */
rolePermissionSchema.statics.findByPermissionId = function(permissionId) {
  return this.find({ permissionId, isActive: true })
    .populate('roleId');
};

/**
 * Static method to check if a role has a permission
 * @param {string} roleId - Role ID
 * @param {string} permissionId - Permission ID
 * @returns {Promise<boolean>} - True if role has permission, false otherwise
 */
rolePermissionSchema.statics.hasPermission = async function(roleId, permissionId) {
  const count = await this.countDocuments({ roleId, permissionId, isActive: true });
  return count > 0;
};

/**
 * Static method to assign permission to role
 * @param {string} roleId - Role ID
 * @param {string} permissionId - Permission ID
 * @param {Object} options - Additional options
 * @returns {Promise<RolePermission>} - Created or updated role-permission relationship
 */
rolePermissionSchema.statics.assignPermission = async function(roleId, permissionId, options = {}) {
  const { constraints = {}, createdBy } = options;
  
  const existing = await this.findOne({ roleId, permissionId });
  
  if (existing) {
    existing.constraints = constraints;
    existing.isActive = true;
    existing.updatedBy = createdBy;
    return existing.save();
  }
  
  return this.create({
    roleId,
    permissionId,
    constraints,
    createdBy,
  });
};

/**
 * Static method to revoke permission from role
 * @param {string} roleId - Role ID
 * @param {string} permissionId - Permission ID
 * @returns {Promise<boolean>} - True if permission was revoked, false otherwise
 */
rolePermissionSchema.statics.revokePermission = async function(roleId, permissionId) {
  const result = await this.updateOne(
    { roleId, permissionId },
    { isActive: false }
  );
  
  return result.modifiedCount > 0;
};

// Create the model
const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);

module.exports = RolePermission;
