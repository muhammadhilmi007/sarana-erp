/**
 * Seed Data Script
 * Creates initial roles and permissions for the Role & Authorization Service
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const RolePermission = require('../models/RolePermission');
const { logger } = require('../utils/logger');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sarana-role', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('Connected to MongoDB');
  seedData().then(() => {
    logger.info('Seed data completed');
    process.exit(0);
  }).catch(error => {
    logger.error('Seed data failed:', error);
    process.exit(1);
  });
}).catch(error => {
  logger.error('MongoDB connection error:', error);
  process.exit(1);
});

/**
 * Seed initial data
 */
const seedData = async () => {
  try {
    // Create system roles
    const roles = [
      {
        name: 'ADMIN',
        description: 'System administrator with full access',
        level: 0,
        isActive: true,
        isSystem: true,
      },
      {
        name: 'MANAGER',
        description: 'Manager with access to management features',
        level: 1,
        isActive: true,
        isSystem: true,
      },
      {
        name: 'STAFF',
        description: 'Staff with access to operational features',
        parentId: null, // Will be set to MANAGER later
        level: 2,
        isActive: true,
        isSystem: true,
      },
      {
        name: 'DRIVER',
        description: 'Driver with access to delivery features',
        level: 2,
        isActive: true,
        isSystem: true,
      },
      {
        name: 'CUSTOMER',
        description: 'Customer with access to customer features',
        level: 2,
        isActive: true,
        isSystem: true,
      },
    ];

    // Create roles
    logger.info('Creating roles...');
    const createdRoles = {};
    
    for (const role of roles) {
      // Check if role already exists
      const existingRole = await Role.findOne({ name: role.name });
      
      if (existingRole) {
        logger.info(`Role ${role.name} already exists`);
        createdRoles[role.name] = existingRole;
      } else {
        const newRole = await Role.create(role);
        logger.info(`Created role ${newRole.name}`);
        createdRoles[role.name] = newRole;
      }
    }
    
    // Set parent roles
    if (createdRoles.STAFF && createdRoles.MANAGER) {
      createdRoles.STAFF.parentId = createdRoles.MANAGER._id;
      await createdRoles.STAFF.save();
      logger.info('Set MANAGER as parent of STAFF');
    }
    
    // Create system permissions
    const resources = [
      'user',
      'role',
      'permission',
      'user-role',
    ];
    
    const actions = [
      'create',
      'read',
      'update',
      'delete',
      'manage',
    ];
    
    logger.info('Creating permissions...');
    const createdPermissions = {};
    
    for (const resource of resources) {
      for (const action of actions) {
        const name = `${resource}:${action}`;
        
        // Check if permission already exists
        const existingPermission = await Permission.findOne({ resource, action });
        
        if (existingPermission) {
          logger.info(`Permission ${name} already exists`);
          createdPermissions[name] = existingPermission;
        } else {
          const newPermission = await Permission.create({
            resource,
            action,
            name,
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
            isActive: true,
            isSystem: true,
          });
          
          logger.info(`Created permission ${newPermission.name}`);
          createdPermissions[name] = newPermission;
        }
      }
    }
    
    // Assign permissions to roles
    logger.info('Assigning permissions to roles...');
    
    // ADMIN gets all permissions
    for (const permissionName in createdPermissions) {
      await RolePermission.assignPermission(
        createdRoles.ADMIN._id,
        createdPermissions[permissionName]._id
      );
    }
    logger.info('Assigned all permissions to ADMIN');
    
    // MANAGER gets read access to everything and manage access to some resources
    for (const resource of resources) {
      await RolePermission.assignPermission(
        createdRoles.MANAGER._id,
        createdPermissions[`${resource}:read`]._id
      );
    }
    
    // MANAGER can manage users and user-roles
    await RolePermission.assignPermission(
      createdRoles.MANAGER._id,
      createdPermissions['user:manage']._id
    );
    
    await RolePermission.assignPermission(
      createdRoles.MANAGER._id,
      createdPermissions['user-role:manage']._id
    );
    
    logger.info('Assigned permissions to MANAGER');
    
    // STAFF gets read access to users and user-roles
    await RolePermission.assignPermission(
      createdRoles.STAFF._id,
      createdPermissions['user:read']._id
    );
    
    await RolePermission.assignPermission(
      createdRoles.STAFF._id,
      createdPermissions['user-role:read']._id
    );
    
    logger.info('Assigned permissions to STAFF');
    
    // DRIVER gets minimal permissions
    await RolePermission.assignPermission(
      createdRoles.DRIVER._id,
      createdPermissions['user:read']._id
    );
    
    logger.info('Assigned permissions to DRIVER');
    
    // CUSTOMER gets minimal permissions
    await RolePermission.assignPermission(
      createdRoles.CUSTOMER._id,
      createdPermissions['user:read']._id
    );
    
    logger.info('Assigned permissions to CUSTOMER');
    
    logger.info('Seed data completed successfully');
  } catch (error) {
    logger.error('Error seeding data:', error);
    throw error;
  }
};
