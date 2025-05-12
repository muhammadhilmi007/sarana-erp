/**
 * User Role Routes
 * API routes for user-role assignment management
 */

const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const userRoleController = require('../controllers/userRoleController');
const router = express.Router();

/**
 * @swagger
 * /api/v1/user-roles/users/{userId}/roles:
 *   get:
 *     summary: Get roles for a user
 *     description: Retrieve roles assigned to a user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [global, organization, department, project]
 *         description: Filter by scope
 *       - in: query
 *         name: scopeId
 *         schema:
 *           type: string
 *         description: Filter by scope ID
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive role assignments
 *     responses:
 *       200:
 *         description: List of roles for the user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/users/:userId/roles', authenticate, requirePermission('user-role', 'read'), userRoleController.getUserRoles);

/**
 * @swagger
 * /api/v1/user-roles/roles/{roleId}/users:
 *   get:
 *     summary: Get users for a role
 *     description: Retrieve users assigned to a role
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [global, organization, department, project]
 *         description: Filter by scope
 *       - in: query
 *         name: scopeId
 *         schema:
 *           type: string
 *         description: Filter by scope ID
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive role assignments
 *     responses:
 *       200:
 *         description: List of users for the role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 */
router.get('/roles/:roleId/users', authenticate, requirePermission('user-role', 'read'), userRoleController.getRoleUsers);

/**
 * @swagger
 * /api/v1/user-roles/users/{userId}/roles/{roleId}:
 *   post:
 *     summary: Assign role to user
 *     description: Assign a role to a user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scope:
 *                 type: string
 *                 enum: [global, organization, department, project]
 *                 default: global
 *                 description: Assignment scope
 *               scopeId:
 *                 type: string
 *                 description: Scope ID (required for non-global scopes)
 *               isPrimary:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this is the primary role
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of role validity
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *                 description: End date of role validity
 *     responses:
 *       200:
 *         description: Role assigned to user successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User or role not found
 */
router.post('/users/:userId/roles/:roleId', authenticate, requirePermission('user-role', 'create'), userRoleController.assignRoleToUser);

/**
 * @swagger
 * /api/v1/user-roles/{userRoleId}:
 *   put:
 *     summary: Update user role
 *     description: Update a user-role assignment
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userRoleId
 *         required: true
 *         schema:
 *           type: string
 *         description: User-Role assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPrimary:
 *                 type: boolean
 *                 description: Whether this is the primary role
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of role validity
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *                 description: End date of role validity
 *               isActive:
 *                 type: boolean
 *                 description: Whether the assignment is active
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User role not found
 */
router.put('/:userRoleId', authenticate, requirePermission('user-role', 'update'), userRoleController.updateUserRole);

/**
 * @swagger
 * /api/v1/user-roles/users/{userId}/roles/{roleId}:
 *   delete:
 *     summary: Revoke role from user
 *     description: Revoke a role from a user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [global, organization, department, project]
 *           default: global
 *         description: Assignment scope
 *       - in: query
 *         name: scopeId
 *         schema:
 *           type: string
 *         description: Scope ID
 *     responses:
 *       200:
 *         description: Role revoked from user successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User, role, or assignment not found
 */
router.delete('/users/:userId/roles/:roleId', authenticate, requirePermission('user-role', 'delete'), userRoleController.revokeRoleFromUser);

/**
 * @swagger
 * /api/v1/user-roles/users/{userId}/permissions:
 *   get:
 *     summary: Get user permissions
 *     description: Retrieve permissions for a user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [global, organization, department, project]
 *         description: Filter by scope
 *       - in: query
 *         name: scopeId
 *         schema:
 *           type: string
 *         description: Filter by scope ID
 *     responses:
 *       200:
 *         description: List of permissions for the user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/users/:userId/permissions', authenticate, requirePermission('user-role', 'read'), userRoleController.getUserPermissions);

/**
 * @swagger
 * /api/v1/user-roles/users/{userId}/check-permission:
 *   post:
 *     summary: Check if user has permission
 *     description: Check if a user has a specific permission
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *               - action
 *             properties:
 *               resource:
 *                 type: string
 *                 description: Resource name
 *               action:
 *                 type: string
 *                 description: Action name
 *               context:
 *                 type: object
 *                 description: Additional context for permission check
 *     responses:
 *       200:
 *         description: Permission check result
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/users/:userId/check-permission', authenticate, requirePermission('user-role', 'read'), userRoleController.checkUserPermission);

module.exports = router;
