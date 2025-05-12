/**
 * Permission Middleware
 * Checks if the user has the required permissions to access a resource
 */

const { logger } = require('../utils/logger');

/**
 * Middleware to check if the user has the required permissions
 * @param {string} resource - Resource name (e.g., 'division', 'position')
 * @param {string} action - Action name (e.g., 'read', 'create', 'update', 'delete')
 * @returns {Function} Express middleware
 */
const permissionMiddleware = (resource, action) => {
  return (req, res, next) => {
    try {
      // Skip permission check in development mode if specified
      if (process.env.SKIP_PERMISSION_CHECK === 'true' && process.env.NODE_ENV === 'development') {
        return next();
      }
      
      // Check if user exists in request (set by authMiddleware)
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }
      
      // In a real implementation, this would check against a permissions database or service
      // For now, we'll use a simple role-based check
      const { roles } = req.user;
      
      // Check if user has admin role (full access)
      if (roles.includes('admin')) {
        return next();
      }
      
      // Check if user has the specific permission
      const hasPermission = checkPermission(roles, resource, action);
      
      if (hasPermission) {
        return next();
      }
      
      // If no permission, return forbidden
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
      });
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error checking permissions',
      });
    }
  };
};

/**
 * Check if the user has the required permission based on roles
 * @param {Array} roles - User roles
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @returns {boolean} Whether the user has permission
 */
const checkPermission = (roles, resource, action) => {
  // This is a simplified permission check
  // In a real implementation, this would check against a permissions database or service
  
  // Define role-based permissions
  const rolePermissions = {
    'hr_manager': {
      'division': ['read', 'create', 'update', 'delete'],
      'position': ['read', 'create', 'update', 'delete'],
    },
    'hr_staff': {
      'division': ['read', 'create', 'update'],
      'position': ['read', 'create', 'update'],
    },
    'manager': {
      'division': ['read'],
      'position': ['read'],
    },
    'employee': {
      'division': ['read'],
      'position': ['read'],
    },
  };
  
  // Check if any of the user's roles have the required permission
  return roles.some(role => {
    const permissions = rolePermissions[role];
    if (!permissions) return false;
    
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) return false;
    
    return resourcePermissions.includes(action);
  });
};

module.exports = { permissionMiddleware };
