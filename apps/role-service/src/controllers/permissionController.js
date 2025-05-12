/**
 * Permission Controller
 * Handles permission management operations
 */

const { ApiError, ErrorCodes } = require('../middleware/errorHandler');
const Permission = require('../models/Permission');
const RolePermission = require('../models/RolePermission');
const Role = require('../models/Role');
const SecurityLog = require('../models/SecurityLog');
const permissionService = require('../services/permissionService');
const { logger } = require('../utils/logger');

/**
 * Get all permissions with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllPermissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, resource, action, isActive, sortBy = 'resource', sortOrder = 'asc' } = req.query;
    
    // Build query
    const query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Add resource filter
    if (resource) {
      query.resource = resource;
    }
    
    // Add action filter
    if (action) {
      query.action = action;
    }
    
    // Add isActive filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get permissions with pagination
    const permissions = await Permission.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const totalPermissions = await Permission.countDocuments(query);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalPermissions / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        permissions,
        pagination: {
          total: totalPermissions,
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
 * Get permission by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPermissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find permission
    const permission = await Permission.findById(id);
    if (!permission) {
      throw new ApiError(404, 'Permission not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    res.status(200).json({
      success: true,
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createPermission = async (req, res, next) => {
  try {
    const { resource, action, name, description, constraints, isActive = true } = req.body;
    
    // Check if permission already exists
    const existingPermission = await Permission.findOne({ 
      $or: [
        { resource, action },
        { name }
      ]
    });
    
    if (existingPermission) {
      throw new ApiError(409, 'Permission with this resource/action or name already exists', ErrorCodes.CONFLICT_ERROR);
    }
    
    // Create new permission
    const permission = new Permission({
      resource,
      action,
      name,
      description,
      constraints: constraints || {},
      isActive,
      isSystem: false,
      createdBy: req.user._id,
    });
    
    // Save permission
    await permission.save();
    
    // Log permission creation
    await SecurityLog.logEvent({
      userId: req.user._id,
      eventType: 'PERMISSION_CREATED',
      details: {
        permissionId: permission._id,
        resource: permission.resource,
        action: permission.action,
        name: permission.name,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'MEDIUM',
    });
    
    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updatePermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, constraints, isActive } = req.body;
    
    // Find permission
    const permission = await Permission.findById(id);
    if (!permission) {
      throw new ApiError(404, 'Permission not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Check if system permission
    if (permission.isSystem) {
      throw new ApiError(403, 'System permissions cannot be modified', ErrorCodes.AUTHORIZATION_ERROR);
    }
    
    // Check if name is being changed and already exists
    if (name && name !== permission.name) {
      const existingPermission = await Permission.findOne({ name });
      if (existingPermission) {
        throw new ApiError(409, 'Permission with this name already exists', ErrorCodes.CONFLICT_ERROR);
      }
    }
    
    // Update permission
    permission.name = name || permission.name;
    permission.description = description !== undefined ? description : permission.description;
    permission.constraints = constraints || permission.constraints;
    permission.isActive = isActive !== undefined ? isActive : permission.isActive;
    permission.updatedBy = req.user._id;
    
    // Save permission
    await permission.save();
    
    // Log permission update
    await SecurityLog.logEvent({
      userId: req.user._id,
      eventType: 'PERMISSION_UPDATED',
      details: {
        permissionId: permission._id,
        resource: permission.resource,
        action: permission.action,
        name: permission.name,
        changes: req.body,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'MEDIUM',
    });
    
    res.status(200).json({
      success: true,
      message: 'Permission updated successfully',
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deletePermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find permission
    const permission = await Permission.findById(id);
    if (!permission) {
      throw new ApiError(404, 'Permission not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Check if system permission
    if (permission.isSystem) {
      throw new ApiError(403, 'System permissions cannot be deleted', ErrorCodes.AUTHORIZATION_ERROR);
    }
    
    // Check if permission is assigned to roles
    const rolePermissions = await RolePermission.find({ permissionId: id });
    if (rolePermissions.length > 0) {
      throw new ApiError(400, 'Cannot delete permission assigned to roles', ErrorCodes.BAD_REQUEST_ERROR);
    }
    
    // Delete permission
    await permission.deleteOne();
    
    // Log permission deletion
    await SecurityLog.logEvent({
      userId: req.user._id,
      eventType: 'PERMISSION_DELETED',
      details: {
        permissionId: id,
        resource: permission.resource,
        action: permission.action,
        name: permission.name,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'HIGH',
    });
    
    res.status(200).json({
      success: true,
      message: 'Permission deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get permissions by resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPermissionsByResource = async (req, res, next) => {
  try {
    const { resource } = req.params;
    
    // Get permissions for resource
    const permissions = await Permission.find({ resource, isActive: true });
    
    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all resources
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllResources = async (req, res, next) => {
  try {
    // Get distinct resources
    const resources = await Permission.distinct('resource');
    
    res.status(200).json({
      success: true,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign permission to role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const assignPermissionToRole = async (req, res, next) => {
  try {
    const { roleId, permissionId } = req.params;
    const { constraints } = req.body;
    
    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      throw new ApiError(404, 'Role not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Check if permission exists
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      throw new ApiError(404, 'Permission not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Assign permission to role
    const rolePermission = await RolePermission.assignPermission(roleId, permissionId, {
      constraints,
      createdBy: req.user._id,
    });
    
    // Invalidate role permissions cache
    await permissionService.invalidateRolePermissionsCache(roleId);
    
    // Log permission assignment
    await SecurityLog.logEvent({
      userId: req.user._id,
      eventType: 'PERMISSION_ASSIGNED',
      details: {
        roleId,
        roleName: role.name,
        permissionId,
        permissionName: permission.name,
        resource: permission.resource,
        action: permission.action,
        constraints,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'MEDIUM',
    });
    
    res.status(200).json({
      success: true,
      message: 'Permission assigned to role successfully',
      data: {
        roleId,
        permissionId,
        constraints: rolePermission.constraints,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke permission from role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const revokePermissionFromRole = async (req, res, next) => {
  try {
    const { roleId, permissionId } = req.params;
    
    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      throw new ApiError(404, 'Role not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Check if permission exists
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      throw new ApiError(404, 'Permission not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Revoke permission from role
    const result = await RolePermission.revokePermission(roleId, permissionId);
    
    if (!result) {
      throw new ApiError(404, 'Permission not assigned to role', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Invalidate role permissions cache
    await permissionService.invalidateRolePermissionsCache(roleId);
    
    // Log permission revocation
    await SecurityLog.logEvent({
      userId: req.user._id,
      eventType: 'PERMISSION_REVOKED',
      details: {
        roleId,
        roleName: role.name,
        permissionId,
        permissionName: permission.name,
        resource: permission.resource,
        action: permission.action,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'MEDIUM',
    });
    
    res.status(200).json({
      success: true,
      message: 'Permission revoked from role successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionsByResource,
  getAllResources,
  assignPermissionToRole,
  revokePermissionFromRole,
};
