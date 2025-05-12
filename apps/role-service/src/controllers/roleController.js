/**
 * Role Controller
 * Handles role management operations
 */

const { ApiError, ErrorCodes } = require('../middleware/errorHandler');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const RolePermission = require('../models/RolePermission');
const SecurityLog = require('../models/SecurityLog');
const permissionService = require('../services/permissionService');
const { logger } = require('../utils/logger');

/**
 * Get all roles with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllRoles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, parentId, isActive, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    // Build query
    const query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Add parentId filter
    if (parentId) {
      if (parentId === 'null') {
        query.parentId = null;
      } else {
        query.parentId = parentId;
      }
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
    
    // Get roles with pagination
    const roles = await Role.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('parentId', 'name');
    
    // Get total count
    const totalRoles = await Role.countDocuments(query);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalRoles / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        roles,
        pagination: {
          total: totalRoles,
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
 * Get role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find role
    const role = await Role.findById(id).populate('parentId', 'name');
    if (!role) {
      throw new ApiError(404, 'Role not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createRole = async (req, res, next) => {
  try {
    const { name, description, parentId, isActive = true } = req.body;
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      throw new ApiError(409, 'Role with this name already exists', ErrorCodes.CONFLICT_ERROR);
    }
    
    // Check parent role if provided
    let level = 0;
    if (parentId) {
      const parentRole = await Role.findById(parentId);
      if (!parentRole) {
        throw new ApiError(404, 'Parent role not found', ErrorCodes.NOT_FOUND_ERROR);
      }
      
      level = parentRole.level + 1;
    }
    
    // Create new role
    const role = new Role({
      name,
      description,
      parentId: parentId || null,
      level,
      isActive,
      isSystem: false,
      createdBy: req.user._id,
    });
    
    // Save role
    await role.save();
    
    // Log role creation
    await SecurityLog.logEvent({
      userId: req.user._id,
      eventType: 'ROLE_CREATED',
      details: {
        roleId: role._id,
        name: role.name,
        parentId: role.parentId,
        level: role.level,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'MEDIUM',
    });
    
    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, parentId, isActive } = req.body;
    
    // Find role
    const role = await Role.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Check if system role
    if (role.isSystem) {
      throw new ApiError(403, 'System roles cannot be modified', ErrorCodes.AUTHORIZATION_ERROR);
    }
    
    // Check if name is being changed and already exists
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        throw new ApiError(409, 'Role with this name already exists', ErrorCodes.CONFLICT_ERROR);
      }
    }
    
    // Check parent role if provided and different from current
    let level = role.level;
    if (parentId !== undefined && parentId !== role.parentId?.toString()) {
      // Check for circular reference
      if (parentId === id) {
        throw new ApiError(400, 'Role cannot be its own parent', ErrorCodes.BAD_REQUEST_ERROR);
      }
      
      // Check if new parent exists
      if (parentId) {
        const parentRole = await Role.findById(parentId);
        if (!parentRole) {
          throw new ApiError(404, 'Parent role not found', ErrorCodes.NOT_FOUND_ERROR);
        }
        
        // Check if new parent is a descendant of this role (would create a cycle)
        const descendants = await role.getAllDescendants();
        if (descendants.some(desc => desc._id.toString() === parentId)) {
          throw new ApiError(400, 'Cannot set a descendant role as parent', ErrorCodes.BAD_REQUEST_ERROR);
        }
        
        level = parentRole.level + 1;
      } else {
        level = 0;
      }
    }
    
    // Update role
    role.name = name || role.name;
    role.description = description !== undefined ? description : role.description;
    role.parentId = parentId !== undefined ? (parentId || null) : role.parentId;
    role.level = level;
    role.isActive = isActive !== undefined ? isActive : role.isActive;
    role.updatedBy = req.user._id;
    
    // Save role
    await role.save();
    
    // Update level of all descendant roles
    const updateDescendants = async (roleId, parentLevel) => {
      const children = await Role.find({ parentId: roleId });
      
      for (const child of children) {
        child.level = parentLevel + 1;
        await child.save();
        
        // Recursively update descendants
        await updateDescendants(child._id, child.level);
      }
    };
    
    await updateDescendants(role._id, role.level);
    
    // Invalidate role permissions cache
    await permissionService.invalidateRolePermissionsCache(role._id);
    
    // Log role update
    await SecurityLog.logEvent({
      userId: req.user._id,
      eventType: 'ROLE_UPDATED',
      details: {
        roleId: role._id,
        name: role.name,
        parentId: role.parentId,
        level: role.level,
        changes: req.body,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'MEDIUM',
    });
    
    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find role
    const role = await Role.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Check if system role
    if (role.isSystem) {
      throw new ApiError(403, 'System roles cannot be deleted', ErrorCodes.AUTHORIZATION_ERROR);
    }
    
    // Check if role has child roles
    const childRoles = await Role.find({ parentId: id });
    if (childRoles.length > 0) {
      throw new ApiError(400, 'Cannot delete role with child roles', ErrorCodes.BAD_REQUEST_ERROR);
    }
    
    // Check if role is assigned to users
    const userRoles = await UserRole.find({ roleId: id, isActive: true });
    if (userRoles.length > 0) {
      throw new ApiError(400, 'Cannot delete role assigned to users', ErrorCodes.BAD_REQUEST_ERROR);
    }
    
    // Delete role permissions
    await RolePermission.deleteMany({ roleId: id });
    
    // Delete role
    await role.deleteOne();
    
    // Log role deletion
    await SecurityLog.logEvent({
      userId: req.user._id,
      eventType: 'ROLE_DELETED',
      details: {
        roleId: id,
        name: role.name,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'HIGH',
    });
    
    res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get role hierarchy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getRoleHierarchy = async (req, res, next) => {
  try {
    // Get all roles
    const roles = await Role.find({ isActive: true }).sort({ level: 1, name: 1 });
    
    // Build hierarchy
    const hierarchy = [];
    const roleMap = {};
    
    // Create map of roles
    roles.forEach(role => {
      roleMap[role._id.toString()] = {
        _id: role._id,
        name: role.name,
        description: role.description,
        level: role.level,
        isSystem: role.isSystem,
        children: [],
      };
    });
    
    // Build hierarchy
    roles.forEach(role => {
      const roleNode = roleMap[role._id.toString()];
      
      if (role.parentId) {
        // Add as child to parent
        const parentNode = roleMap[role.parentId.toString()];
        if (parentNode) {
          parentNode.children.push(roleNode);
        }
      } else {
        // Add as root node
        hierarchy.push(roleNode);
      }
    });
    
    res.status(200).json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get role permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { includeInherited = 'true' } = req.query;
    
    // Find role
    const role = await Role.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Get permissions
    let permissions;
    
    if (includeInherited === 'true') {
      // Get all permissions including inherited
      permissions = await permissionService.getRolePermissions(id);
    } else {
      // Get only direct permissions
      permissions = await RolePermission.findByRoleId(id);
    }
    
    res.status(200).json({
      success: true,
      data: {
        role: {
          _id: role._id,
          name: role.name,
        },
        permissions: permissions.map(p => ({
          _id: p.permissionId._id,
          name: p.permissionId.name,
          resource: p.permissionId.resource,
          action: p.permissionId.action,
          constraints: p.constraints,
          inherited: includeInherited === 'true' && p.roleId && p.roleId.toString() !== id,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRoleHierarchy,
  getRolePermissions,
};
