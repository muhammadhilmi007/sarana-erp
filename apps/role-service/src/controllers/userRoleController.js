/**
 * User Role Controller
 * Handles user-role assignment operations
 */

const { ApiError, ErrorCodes } = require('../middleware/errorHandler');
const UserRole = require('../models/UserRole');
const Role = require('../models/Role');
const SecurityLog = require('../models/SecurityLog');
const permissionService = require('../services/permissionService');
const { logger } = require('../utils/logger');

/**
 * Get roles for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserRoles = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { scope, scopeId, includeInactive } = req.query;
    
    // Get user roles
    const userRoles = await UserRole.findByUserId(userId, {
      scope,
      scopeId,
      includeInactive: includeInactive === 'true',
    });
    
    res.status(200).json({
      success: true,
      data: userRoles.map(userRole => ({
        _id: userRole._id,
        userId: userRole.userId,
        role: {
          _id: userRole.roleId._id,
          name: userRole.roleId.name,
          description: userRole.roleId.description,
        },
        scope: userRole.scope,
        scopeId: userRole.scopeId,
        isPrimary: userRole.isPrimary,
        isActive: userRole.isActive,
        validFrom: userRole.validFrom,
        validUntil: userRole.validUntil,
        createdAt: userRole.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get users for a role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getRoleUsers = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const { page = 1, limit = 10, scope, scopeId, includeInactive } = req.query;
    
    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      throw new ApiError(404, 'Role not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Build query
    const query = { roleId };
    
    if (scope) {
      query.scope = scope;
      
      if (scopeId) {
        query.scopeId = scopeId;
      }
    }
    
    if (includeInactive !== 'true') {
      query.isActive = true;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get user roles with pagination
    const userRoles = await UserRole.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const totalUserRoles = await UserRole.countDocuments(query);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalUserRoles / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        role: {
          _id: role._id,
          name: role.name,
        },
        users: userRoles.map(userRole => ({
          _id: userRole._id,
          user: userRole.userId,
          scope: userRole.scope,
          scopeId: userRole.scopeId,
          isPrimary: userRole.isPrimary,
          isActive: userRole.isActive,
          validFrom: userRole.validFrom,
          validUntil: userRole.validUntil,
          createdAt: userRole.createdAt,
        })),
        pagination: {
          total: totalUserRoles,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign role to user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const assignRoleToUser = async (req, res, next) => {
  try {
    const { userId, roleId } = req.params;
    const { scope = 'global', scopeId, isPrimary = false, validFrom, validUntil } = req.body;
    
    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      throw new ApiError(404, 'Role not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Check if role is active
    if (!role.isActive) {
      throw new ApiError(400, 'Cannot assign inactive role', ErrorCodes.BAD_REQUEST_ERROR);
    }
    
    // Assign role to user
    const userRole = await UserRole.assignRole(userId, roleId, {
      scope,
      scopeId,
      isPrimary,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      createdBy: req.user._id,
    });
    
    // If this is a primary role, update other roles to non-primary
    if (isPrimary) {
      await UserRole.updateMany(
        { 
          userId, 
          scope, 
          scopeId: scopeId || null,
          _id: { $ne: userRole._id },
          isPrimary: true 
        },
        { isPrimary: false }
      );
    }
    
    // Invalidate user permissions cache
    await permissionService.invalidateUserPermissionsCache(userId);
    
    // Log role assignment
    await SecurityLog.logEvent({
      userId: req.user._id,
      eventType: 'ROLE_ASSIGNED',
      details: {
        targetUserId: userId,
        roleId,
        roleName: role.name,
        scope,
        scopeId,
        isPrimary,
        validFrom: userRole.validFrom,
        validUntil: userRole.validUntil,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'MEDIUM',
    });
    
    res.status(200).json({
      success: true,
      message: 'Role assigned to user successfully',
      data: {
        _id: userRole._id,
        userId,
        roleId,
        roleName: role.name,
        scope: userRole.scope,
        scopeId: userRole.scopeId,
        isPrimary: userRole.isPrimary,
        validFrom: userRole.validFrom,
        validUntil: userRole.validUntil,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { userRoleId } = req.params;
    const { isPrimary, validFrom, validUntil, isActive } = req.body;
    
    // Find user role
    const userRole = await UserRole.findById(userRoleId);
    if (!userRole) {
      throw new ApiError(404, 'User role not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Get role
    const role = await Role.findById(userRole.roleId);
    if (!role) {
      throw new ApiError(404, 'Role not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Update user role
    if (isPrimary !== undefined) {
      userRole.isPrimary = isPrimary;
      
      // If this is a primary role, update other roles to non-primary
      if (isPrimary) {
        await UserRole.updateMany(
          { 
            userId: userRole.userId, 
            scope: userRole.scope, 
            scopeId: userRole.scopeId,
            _id: { $ne: userRole._id },
            isPrimary: true 
          },
          { isPrimary: false }
        );
      }
    }
    
    if (validFrom !== undefined) {
      userRole.validFrom = new Date(validFrom);
    }
    
    if (validUntil !== undefined) {
      userRole.validUntil = validUntil ? new Date(validUntil) : null;
    }
    
    if (isActive !== undefined) {
      userRole.isActive = isActive;
    }
    
    userRole.updatedBy = req.user._id;
    
    // Save user role
    await userRole.save();
    
    // Invalidate user permissions cache
    await permissionService.invalidateUserPermissionsCache(userRole.userId);
    
    // Log user role update
    await SecurityLog.logEvent({
      userId: req.user._id,
      eventType: 'ROLE_ASSIGNMENT_UPDATED',
      details: {
        userRoleId,
        targetUserId: userRole.userId,
        roleId: userRole.roleId,
        roleName: role.name,
        changes: req.body,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'MEDIUM',
    });
    
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: userRole,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke role from user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const revokeRoleFromUser = async (req, res, next) => {
  try {
    const { userId, roleId } = req.params;
    const { scope = 'global', scopeId } = req.query;
    
    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      throw new ApiError(404, 'Role not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Revoke role from user
    const result = await UserRole.revokeRole(userId, roleId, {
      scope,
      scopeId,
    });
    
    if (!result) {
      throw new ApiError(404, 'Role not assigned to user', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Invalidate user permissions cache
    await permissionService.invalidateUserPermissionsCache(userId);
    
    // Log role revocation
    await SecurityLog.logEvent({
      userId: req.user._id,
      eventType: 'ROLE_REVOKED',
      details: {
        targetUserId: userId,
        roleId,
        roleName: role.name,
        scope,
        scopeId,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'MEDIUM',
    });
    
    res.status(200).json({
      success: true,
      message: 'Role revoked from user successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserPermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { scope, scopeId } = req.query;
    
    // Get user permissions
    const permissions = await permissionService.getUserPermissions(userId, {
      scope,
      scopeId,
    });
    
    res.status(200).json({
      success: true,
      data: permissions.map(p => ({
        _id: p.permissionId._id,
        name: p.permissionId.name,
        resource: p.permissionId.resource,
        action: p.permissionId.action,
        constraints: p.constraints,
        roleId: p.roleId._id,
        roleName: p.roleId.name,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const checkUserPermission = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { resource, action, context } = req.body;
    
    if (!resource || !action) {
      throw new ApiError(400, 'Resource and action are required', ErrorCodes.BAD_REQUEST_ERROR);
    }
    
    // Check permission
    const hasPermission = await permissionService.hasPermission(
      userId,
      resource,
      action,
      context || {}
    );
    
    res.status(200).json({
      success: true,
      data: {
        userId,
        resource,
        action,
        hasPermission,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserRoles,
  getRoleUsers,
  assignRoleToUser,
  updateUserRole,
  revokeRoleFromUser,
  getUserPermissions,
  checkUserPermission,
};
