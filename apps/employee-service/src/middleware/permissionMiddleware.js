/**
 * Permission Middleware
 * Handles role-based access control for API requests
 */

const { forbiddenError } = require('./errorMiddleware');

/**
 * Permission mapping for different roles
 * Format: { resource: { action: [roles] } }
 */
const permissionMap = {
  'employee': {
    'create': ['admin', 'hr_manager', 'hr_staff'],
    'read': ['admin', 'hr_manager', 'hr_staff', 'manager', 'employee'],
    'update': ['admin', 'hr_manager', 'hr_staff'],
    'delete': ['admin', 'hr_manager']
  },
  'employee.status': {
    'read': ['admin', 'hr_manager', 'hr_staff', 'manager', 'employee'],
    'update': ['admin', 'hr_manager', 'hr_staff']
  },
  'employee.assignment': {
    'read': ['admin', 'hr_manager', 'hr_staff', 'manager', 'employee'],
    'update': ['admin', 'hr_manager', 'hr_staff']
  },
  'employee.document': {
    'create': ['admin', 'hr_manager', 'hr_staff', 'employee'],
    'read': ['admin', 'hr_manager', 'hr_staff', 'manager', 'employee'],
    'update': ['admin', 'hr_manager', 'hr_staff'],
    'delete': ['admin', 'hr_manager', 'hr_staff']
  },
  'employee.skill': {
    'read': ['admin', 'hr_manager', 'hr_staff', 'manager', 'employee'],
    'update': ['admin', 'hr_manager', 'hr_staff', 'employee'],
    'delete': ['admin', 'hr_manager', 'hr_staff']
  },
  'employee.performance': {
    'create': ['admin', 'hr_manager', 'hr_staff', 'manager'],
    'read': ['admin', 'hr_manager', 'hr_staff', 'manager', 'employee'],
    'update': ['admin', 'hr_manager', 'hr_staff', 'manager']
  },
  'employee.career': {
    'create': ['admin', 'hr_manager', 'hr_staff'],
    'read': ['admin', 'hr_manager', 'hr_staff', 'manager', 'employee'],
    'update': ['admin', 'hr_manager', 'hr_staff', 'manager']
  },
  'employee.training': {
    'create': ['admin', 'hr_manager', 'hr_staff'],
    'read': ['admin', 'hr_manager', 'hr_staff', 'manager', 'employee'],
    'update': ['admin', 'hr_manager', 'hr_staff']
  },
  'employee.contract': {
    'create': ['admin', 'hr_manager', 'hr_staff'],
    'read': ['admin', 'hr_manager', 'hr_staff', 'manager', 'employee'],
    'update': ['admin', 'hr_manager', 'hr_staff'],
    'delete': ['admin', 'hr_manager']
  }
};

/**
 * Check if user has permission for a resource and action
 * @param {string} resource - Resource name
 * @param {string} action - Action (create, read, update, delete)
 * @param {string} role - User role
 * @returns {boolean} Whether user has permission
 */
const hasPermission = (resource, action, role) => {
  // Check if resource exists in permission map
  if (!permissionMap[resource]) {
    return false;
  }
  
  // Check if action exists for resource
  if (!permissionMap[resource][action]) {
    return false;
  }
  
  // Check if role has permission for action on resource
  return permissionMap[resource][action].includes(role);
};

/**
 * Middleware for permission checking
 * @param {string} resource - Resource name
 * @param {string} action - Action (create, read, update, delete)
 * @returns {Function} Express middleware function
 */
const permissionMiddleware = (resource, action) => {
  return (req, res, next) => {
    // Get user role from request
    const { role } = req.user;
    
    // Check if user has permission
    if (!hasPermission(resource, action, role)) {
      return next(forbiddenError(`You don't have permission to ${action} ${resource}`));
    }
    
    next();
  };
};

/**
 * Middleware for owner or permission checking
 * Allows access if user is the owner of the resource or has the required permission
 * @param {string} resource - Resource name
 * @param {string} action - Action (create, read, update, delete)
 * @param {Function} getOwnerId - Function to get owner ID from request
 * @returns {Function} Express middleware function
 */
const ownerOrPermissionMiddleware = (resource, action, getOwnerId) => {
  return async (req, res, next) => {
    // Get user ID and role from request
    const { id: userId, role } = req.user;
    
    try {
      // Get owner ID
      const ownerId = await getOwnerId(req);
      
      // Allow access if user is the owner
      if (ownerId && userId.toString() === ownerId.toString()) {
        return next();
      }
      
      // Check if user has permission
      if (!hasPermission(resource, action, role)) {
        return next(forbiddenError(`You don't have permission to ${action} ${resource}`));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  permissionMiddleware,
  ownerOrPermissionMiddleware,
  hasPermission
};
