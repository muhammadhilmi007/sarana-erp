/**
 * Permission Middleware
 * Handles permission checking for API routes
 */

const { logger } = require('../utils/logger');
const redis = require('../utils/redis');

/**
 * Check if user has permission for resource and action
 * @param {string} resource - Resource name
 * @param {string} action - Action name (create, read, update, delete, manage)
 * @param {Object} options - Additional options
 * @returns {Function} - Express middleware function
 */
const permissionMiddleware = (resource, action, options = {}) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }
      
      // Admin role has all permissions
      const isAdmin = req.user.roles.some(role => 
        role.name === 'ADMIN' || role.name === 'admin'
      );
      
      if (isAdmin) {
        return next();
      }
      
      // Check if user has permission
      const hasPermission = await checkPermission(req.user, resource, action, options);
      
      if (!hasPermission) {
        logger.warn(`Permission denied: ${resource}:${action}`, {
          userId: req.user._id,
          resource,
          action,
          method: req.method,
          path: req.path,
        });
        
        return res.status(403).json({
          status: 'error',
          message: 'Permission denied',
        });
      }
      
      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };
};

/**
 * Check if user has permission
 * @param {Object} user - User object
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @param {Object} options - Additional options
 * @returns {Promise<boolean>} - True if user has permission, false otherwise
 */
const checkPermission = async (user, resource, action, options = {}) => {
  try {
    // Try to get from cache first
    const cacheKey = `permission:${user._id}:${resource}:${action}`;
    const cachedResult = await redis.get(cacheKey);
    
    if (cachedResult !== null) {
      return cachedResult === 'true';
    }
    
    // Check user permissions
    const permissions = user.permissions || [];
    
    // Check for direct permission
    const hasDirectPermission = permissions.some(permission => {
      return (
        (permission.resource === resource && permission.action === action) ||
        (permission.resource === resource && permission.action === 'manage') ||
        (permission.resource === '*' && permission.action === '*')
      );
    });
    
    if (hasDirectPermission) {
      // Cache result
      await redis.set(cacheKey, 'true', { EX: process.env.PERMISSION_CACHE_TTL || 3600 });
      return true;
    }
    
    // If resource ownership validation is required
    if (options.requireOwnership && options.resourceId) {
      const isOwner = await checkResourceOwnership(user._id, resource, options.resourceId);
      
      if (isOwner) {
        // Cache result
        await redis.set(cacheKey, 'true', { EX: process.env.PERMISSION_CACHE_TTL || 3600 });
        return true;
      }
    }
    
    // Cache result
    await redis.set(cacheKey, 'false', { EX: process.env.PERMISSION_CACHE_TTL || 3600 });
    return false;
  } catch (error) {
    logger.error('Error checking permission:', error);
    return false;
  }
};

/**
 * Check if user owns resource
 * @param {string} userId - User ID
 * @param {string} resource - Resource name
 * @param {string} resourceId - Resource ID
 * @returns {Promise<boolean>} - True if user owns resource, false otherwise
 */
const checkResourceOwnership = async (userId, resource, resourceId) => {
  try {
    // For branch resource, check if user is the creator or manager
    if (resource === 'branch') {
      const Branch = require('../models/Branch');
      const branch = await Branch.findById(resourceId);
      
      if (!branch) {
        return false;
      }
      
      return branch.createdBy.toString() === userId.toString();
    }
    
    return false;
  } catch (error) {
    logger.error('Error checking resource ownership:', error);
    return false;
  }
};

module.exports = {
  permissionMiddleware,
  checkPermission,
  checkResourceOwnership,
};
