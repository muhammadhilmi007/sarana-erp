/**
 * Permission Middleware
 * Middleware for checking permissions on API routes
 */

const { ApiError, ErrorCodes } = require('./errorHandler');
const permissionService = require('../services/permissionService');
const SecurityLog = require('../models/SecurityLog');
const { logger } = require('../utils/logger');

/**
 * Middleware to check if user has permission
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @param {Object} options - Additional options
 * @returns {Function} - Express middleware function
 */
const requirePermission = (resource, action, options = {}) => {
  return async (req, res, next) => {
    try {
      const { requireOwnership = false } = options;
      
      // Get user ID from authenticated request
      const userId = req.user?._id;
      
      if (!userId) {
        throw new ApiError(401, 'Authentication required', ErrorCodes.AUTHENTICATION_ERROR);
      }
      
      // Build context for permission check
      const context = {
        requireOwnership,
        resourceId: req.params.id || req.body.id,
        scope: options.scope || req.query.scope || 'global',
        scopeId: options.scopeId || req.query.scopeId || req.params.scopeId,
        ...options.context,
      };
      
      // Check permission
      const hasPermission = await permissionService.hasPermission(
        userId,
        resource,
        action,
        context
      );
      
      if (!hasPermission) {
        // Log permission denied
        await SecurityLog.logEvent({
          userId,
          eventType: 'PERMISSION_CHECK_FAILED',
          details: {
            resource,
            action,
            context,
            path: req.path,
            method: req.method,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          status: 'FAILURE',
          severity: 'MEDIUM',
        });
        
        throw new ApiError(403, 'Permission denied', ErrorCodes.AUTHORIZATION_ERROR);
      }
      
      // Add permission context to request
      req.permissionContext = {
        resource,
        action,
        context,
      };
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has any of the specified permissions
 * @param {Array} permissions - Array of permission objects with resource and action
 * @param {Object} options - Additional options
 * @returns {Function} - Express middleware function
 */
const requireAnyPermission = (permissions, options = {}) => {
  return async (req, res, next) => {
    try {
      const { requireOwnership = false } = options;
      
      // Get user ID from authenticated request
      const userId = req.user?._id;
      
      if (!userId) {
        throw new ApiError(401, 'Authentication required', ErrorCodes.AUTHENTICATION_ERROR);
      }
      
      // Build context for permission check
      const context = {
        requireOwnership,
        resourceId: req.params.id || req.body.id,
        scope: options.scope || req.query.scope || 'global',
        scopeId: options.scopeId || req.query.scopeId || req.params.scopeId,
        ...options.context,
      };
      
      // Check permissions
      let hasAnyPermission = false;
      let checkedPermissions = [];
      
      for (const { resource, action } of permissions) {
        const result = await permissionService.hasPermission(
          userId,
          resource,
          action,
          context
        );
        
        checkedPermissions.push({ resource, action, result });
        
        if (result) {
          hasAnyPermission = true;
          break;
        }
      }
      
      if (!hasAnyPermission) {
        // Log permission denied
        await SecurityLog.logEvent({
          userId,
          eventType: 'PERMISSION_CHECK_FAILED',
          details: {
            permissions: checkedPermissions,
            context,
            path: req.path,
            method: req.method,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          status: 'FAILURE',
          severity: 'MEDIUM',
        });
        
        throw new ApiError(403, 'Permission denied', ErrorCodes.AUTHORIZATION_ERROR);
      }
      
      // Add permission context to request
      req.permissionContext = {
        permissions: checkedPermissions,
        context,
      };
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has all of the specified permissions
 * @param {Array} permissions - Array of permission objects with resource and action
 * @param {Object} options - Additional options
 * @returns {Function} - Express middleware function
 */
const requireAllPermissions = (permissions, options = {}) => {
  return async (req, res, next) => {
    try {
      const { requireOwnership = false } = options;
      
      // Get user ID from authenticated request
      const userId = req.user?._id;
      
      if (!userId) {
        throw new ApiError(401, 'Authentication required', ErrorCodes.AUTHENTICATION_ERROR);
      }
      
      // Build context for permission check
      const context = {
        requireOwnership,
        resourceId: req.params.id || req.body.id,
        scope: options.scope || req.query.scope || 'global',
        scopeId: options.scopeId || req.query.scopeId || req.params.scopeId,
        ...options.context,
      };
      
      // Check permissions
      let hasAllPermissions = true;
      let checkedPermissions = [];
      
      for (const { resource, action } of permissions) {
        const result = await permissionService.hasPermission(
          userId,
          resource,
          action,
          context
        );
        
        checkedPermissions.push({ resource, action, result });
        
        if (!result) {
          hasAllPermissions = false;
        }
      }
      
      if (!hasAllPermissions) {
        // Log permission denied
        await SecurityLog.logEvent({
          userId,
          eventType: 'PERMISSION_CHECK_FAILED',
          details: {
            permissions: checkedPermissions,
            context,
            path: req.path,
            method: req.method,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          status: 'FAILURE',
          severity: 'MEDIUM',
        });
        
        throw new ApiError(403, 'Permission denied', ErrorCodes.AUTHORIZATION_ERROR);
      }
      
      // Add permission context to request
      req.permissionContext = {
        permissions: checkedPermissions,
        context,
      };
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check ownership of a resource
 * @param {string} resource - Resource name
 * @param {Object} options - Additional options
 * @returns {Function} - Express middleware function
 */
const requireOwnership = (resource, options = {}) => {
  return async (req, res, next) => {
    try {
      // Get user ID from authenticated request
      const userId = req.user?._id;
      
      if (!userId) {
        throw new ApiError(401, 'Authentication required', ErrorCodes.AUTHENTICATION_ERROR);
      }
      
      // Get resource ID
      const resourceId = req.params.id || req.body.id || options.resourceId;
      
      if (!resourceId) {
        throw new ApiError(400, 'Resource ID is required', ErrorCodes.BAD_REQUEST_ERROR);
      }
      
      // Check ownership
      const isOwner = await permissionService.validateOwnership(
        userId,
        resource,
        resourceId
      );
      
      if (!isOwner) {
        // Log ownership check failed
        await SecurityLog.logEvent({
          userId,
          eventType: 'PERMISSION_CHECK_FAILED',
          details: {
            resource,
            resourceId,
            path: req.path,
            method: req.method,
            ownershipCheck: true,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          status: 'FAILURE',
          severity: 'MEDIUM',
        });
        
        throw new ApiError(403, 'You do not have ownership of this resource', ErrorCodes.AUTHORIZATION_ERROR);
      }
      
      // Add ownership context to request
      req.ownershipContext = {
        resource,
        resourceId,
      };
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireOwnership,
};
