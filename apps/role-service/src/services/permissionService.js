/**
 * Permission Service
 * Handles permission checking, role inheritance, and permission aggregation
 */

const Role = require('../models/Role');
const Permission = require('../models/Permission');
const RolePermission = require('../models/RolePermission');
const UserRole = require('../models/UserRole');
const SecurityLog = require('../models/SecurityLog');
const { logger } = require('../utils/logger');
const redis = require('../utils/redis');

// Cache TTL in seconds
const CACHE_TTL = 3600; // 1 hour

/**
 * Get all permissions for a role, including inherited permissions
 * @param {string} roleId - Role ID
 * @returns {Promise<Array>} - Array of permissions
 */
const getRolePermissions = async (roleId) => {
  try {
    // Check cache first
    const cacheKey = `role:permissions:${roleId}`;
    const cachedPermissions = await redis.get(cacheKey);
    
    if (cachedPermissions) {
      return JSON.parse(cachedPermissions);
    }
    
    // Get role
    const role = await Role.findById(roleId);
    if (!role || !role.isActive) {
      return [];
    }
    
    // Get direct permissions
    const directPermissions = await RolePermission.findByRoleId(roleId);
    
    // Get permissions from parent roles
    let inheritedPermissions = [];
    if (role.parentId) {
      inheritedPermissions = await getRolePermissions(role.parentId);
    }
    
    // Combine and deduplicate permissions
    const allPermissions = [...directPermissions, ...inheritedPermissions];
    const uniquePermissions = [];
    const permissionIds = new Set();
    
    for (const permission of allPermissions) {
      const permissionId = permission.permissionId._id.toString();
      if (!permissionIds.has(permissionId)) {
        permissionIds.add(permissionId);
        uniquePermissions.push(permission);
      }
    }
    
    // Cache the result
    await redis.set(cacheKey, JSON.stringify(uniquePermissions), { EX: CACHE_TTL });
    
    return uniquePermissions;
  } catch (error) {
    logger.error('Error getting role permissions:', error);
    return [];
  }
};

/**
 * Get all permissions for a user
 * @param {string} userId - User ID
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Array of permissions
 */
const getUserPermissions = async (userId, options = {}) => {
  try {
    const { scope, scopeId } = options;
    
    // Check cache first
    const cacheKey = `user:permissions:${userId}:${scope || 'global'}:${scopeId || 'all'}`;
    const cachedPermissions = await redis.get(cacheKey);
    
    if (cachedPermissions) {
      return JSON.parse(cachedPermissions);
    }
    
    // Get user roles
    const userRoles = await UserRole.findByUserId(userId, { scope, scopeId });
    
    // Get permissions for each role
    const allPermissions = [];
    for (const userRole of userRoles) {
      if (userRole.isValid()) {
        const rolePermissions = await getRolePermissions(userRole.roleId._id);
        allPermissions.push(...rolePermissions);
      }
    }
    
    // Deduplicate permissions
    const uniquePermissions = [];
    const permissionIds = new Set();
    
    for (const permission of allPermissions) {
      const permissionId = permission.permissionId._id.toString();
      if (!permissionIds.has(permissionId)) {
        permissionIds.add(permissionId);
        uniquePermissions.push(permission);
      }
    }
    
    // Cache the result
    await redis.set(cacheKey, JSON.stringify(uniquePermissions), { EX: CACHE_TTL });
    
    return uniquePermissions;
  } catch (error) {
    logger.error('Error getting user permissions:', error);
    return [];
  }
};

/**
 * Check if user has permission
 * @param {string} userId - User ID
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @param {Object} context - Additional context for conditional permissions
 * @returns {Promise<boolean>} - True if user has permission, false otherwise
 */
const hasPermission = async (userId, resource, action, context = {}) => {
  try {
    // Get permission
    const permission = await Permission.findByResourceAndAction(resource, action);
    if (!permission) {
      logger.warn(`Permission not found: ${resource}:${action}`);
      return false;
    }
    
    // Get user permissions
    const userPermissions = await getUserPermissions(userId, context);
    
    // Check if user has the specific permission
    const hasSpecificPermission = userPermissions.some(p => 
      p.permissionId._id.toString() === permission._id.toString()
    );
    
    // Check if user has the 'manage' permission for the resource
    const managePermission = await Permission.findByResourceAndAction(resource, 'manage');
    const hasManagePermission = managePermission && userPermissions.some(p => 
      p.permissionId._id.toString() === managePermission._id.toString()
    );
    
    // Check ownership if required
    let ownershipValid = true;
    if (context.requireOwnership && !hasManagePermission) {
      ownershipValid = await validateOwnership(userId, resource, context.resourceId);
    }
    
    // Check conditional constraints
    let conditionsMet = true;
    for (const userPermission of userPermissions) {
      if (userPermission.permissionId._id.toString() === permission._id.toString() || 
          (managePermission && userPermission.permissionId._id.toString() === managePermission._id.toString())) {
        
        conditionsMet = evaluateConditions(userPermission.constraints, context);
        if (conditionsMet) break;
      }
    }
    
    const result = (hasSpecificPermission || hasManagePermission) && ownershipValid && conditionsMet;
    
    // Log permission check
    await SecurityLog.logEvent({
      userId,
      eventType: result ? 'PERMISSION_CHECK_SUCCEEDED' : 'PERMISSION_CHECK_FAILED',
      details: {
        resource,
        action,
        context,
        hasSpecificPermission,
        hasManagePermission,
        ownershipValid,
        conditionsMet,
      },
      status: result ? 'SUCCESS' : 'FAILURE',
      severity: 'LOW',
    });
    
    return result;
  } catch (error) {
    logger.error('Error checking permission:', error);
    return false;
  }
};

/**
 * Validate resource ownership
 * @param {string} userId - User ID
 * @param {string} resource - Resource name
 * @param {string} resourceId - Resource ID
 * @returns {Promise<boolean>} - True if user owns resource, false otherwise
 */
const validateOwnership = async (userId, resource, resourceId) => {
  try {
    if (!resourceId) return false;
    
    // Different ownership validation logic based on resource type
    switch (resource) {
      case 'user':
        return userId === resourceId;
        
      case 'role':
        // Check if user created the role
        const role = await Role.findById(resourceId);
        return role && role.createdBy.toString() === userId;
        
      case 'permission':
        // Check if user created the permission
        const permission = await Permission.findById(resourceId);
        return permission && permission.createdBy.toString() === userId;
        
      // Add more resource types as needed
        
      default:
        // For unknown resource types, default to false
        return false;
    }
  } catch (error) {
    logger.error('Error validating ownership:', error);
    return false;
  }
};

/**
 * Evaluate permission conditions
 * @param {Object} constraints - Permission constraints
 * @param {Object} context - Request context
 * @returns {boolean} - True if conditions are met, false otherwise
 */
const evaluateConditions = (constraints, context) => {
  // If no constraints, conditions are met
  if (!constraints || Object.keys(constraints).length === 0) {
    return true;
  }
  
  // Evaluate each constraint
  for (const [key, value] of Object.entries(constraints)) {
    // Skip if context doesn't have the key
    if (!(key in context)) {
      continue;
    }
    
    // Handle different types of constraints
    if (Array.isArray(value)) {
      // Array constraint (one of many values)
      if (!value.includes(context[key])) {
        return false;
      }
    } else if (typeof value === 'object') {
      // Object constraint with operators
      if (value.$eq !== undefined && context[key] !== value.$eq) {
        return false;
      }
      if (value.$ne !== undefined && context[key] === value.$ne) {
        return false;
      }
      if (value.$gt !== undefined && context[key] <= value.$gt) {
        return false;
      }
      if (value.$gte !== undefined && context[key] < value.$gte) {
        return false;
      }
      if (value.$lt !== undefined && context[key] >= value.$lt) {
        return false;
      }
      if (value.$lte !== undefined && context[key] > value.$lte) {
        return false;
      }
      if (value.$in !== undefined && !value.$in.includes(context[key])) {
        return false;
      }
      if (value.$nin !== undefined && value.$nin.includes(context[key])) {
        return false;
      }
    } else {
      // Simple equality constraint
      if (context[key] !== value) {
        return false;
      }
    }
  }
  
  // All constraints passed
  return true;
};

/**
 * Invalidate role permissions cache
 * @param {string} roleId - Role ID
 * @returns {Promise<void>}
 */
const invalidateRolePermissionsCache = async (roleId) => {
  try {
    // Delete role permissions cache
    await redis.del(`role:permissions:${roleId}`);
    
    // Get child roles and invalidate their cache too
    const role = await Role.findById(roleId);
    if (role) {
      const childRoles = await role.getChildRoles();
      for (const childRole of childRoles) {
        await invalidateRolePermissionsCache(childRole._id);
      }
    }
    
    // Invalidate user permissions cache for users with this role
    const userRoles = await UserRole.findByRoleId(roleId);
    for (const userRole of userRoles) {
      await invalidateUserPermissionsCache(userRole.userId);
    }
  } catch (error) {
    logger.error('Error invalidating role permissions cache:', error);
  }
};

/**
 * Invalidate user permissions cache
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const invalidateUserPermissionsCache = async (userId) => {
  try {
    // Get all cache keys for this user
    const keys = await redis.keys(`user:permissions:${userId}:*`);
    
    // Delete all matching keys
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    logger.error('Error invalidating user permissions cache:', error);
  }
};

module.exports = {
  getRolePermissions,
  getUserPermissions,
  hasPermission,
  validateOwnership,
  evaluateConditions,
  invalidateRolePermissionsCache,
  invalidateUserPermissionsCache,
};
