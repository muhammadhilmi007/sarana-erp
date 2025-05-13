/**
 * Permissions Middleware
 * Handles role-based access control for API routes
 */

const logger = require('../utils/logger');

/**
 * Permission mapping for different roles
 */
const rolePermissions = {
  admin: [
    'attendance:view', 'attendance:create', 'attendance:update', 'attendance:delete',
    'leave:view', 'leave:create', 'leave:approve', 'leave:manage',
    'workSchedule:view', 'workSchedule:create', 'workSchedule:update', 'workSchedule:delete', 'workSchedule:assign',
    'holiday:view', 'holiday:create', 'holiday:update', 'holiday:delete',
    'report:view', 'report:generate', 'report:delete'
  ],
  manager: [
    'attendance:view', 'attendance:create', 'attendance:update',
    'leave:view', 'leave:create', 'leave:approve',
    'workSchedule:view', 'workSchedule:assign',
    'holiday:view',
    'report:view', 'report:generate'
  ],
  hr: [
    'attendance:view', 'attendance:create', 'attendance:update',
    'leave:view', 'leave:create', 'leave:approve', 'leave:manage',
    'workSchedule:view', 'workSchedule:create', 'workSchedule:update', 'workSchedule:assign',
    'holiday:view', 'holiday:create', 'holiday:update',
    'report:view', 'report:generate'
  ],
  employee: [
    'attendance:view',
    'leave:view', 'leave:create',
    'workSchedule:view',
    'holiday:view'
  ]
};

/**
 * Check if user has required permission
 * @param {String} permission - Required permission
 * @returns {Function} - Express middleware
 */
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    try {
      // Get user role from request
      const { role } = req.user;
      
      // Check if role exists
      if (!role || !rolePermissions[role]) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Invalid role.'
        });
      }
      
      // Check if role has required permission
      if (!rolePermissions[role].includes(permission)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }
      
      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Permission check failed.',
        error: error.message
      });
    }
  };
};

module.exports = exports;
