/**
 * Permission Routes
 * API routes for permission management
 */

const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const permissionController = require('../controllers/permissionController');
const router = express.Router();

/**
 * @swagger
 * /api/v1/permissions:
 *   get:
 *     summary: Get all permissions
 *     description: Retrieve a list of all permissions with pagination
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for permission name, description, or resource
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *         description: Filter by resource
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: resource
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of permissions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, requirePermission('permission', 'read'), permissionController.getAllPermissions);

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     description: Retrieve a permission by its ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Permission not found
 */
router.get('/:id', authenticate, requirePermission('permission', 'read'), permissionController.getPermissionById);

/**
 * @swagger
 * /api/v1/permissions:
 *   post:
 *     summary: Create a new permission
 *     description: Create a new permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *               - action
 *               - name
 *             properties:
 *               resource:
 *                 type: string
 *                 description: Resource name
 *               action:
 *                 type: string
 *                 enum: [create, read, update, delete, manage, execute]
 *                 description: Action name
 *               name:
 *                 type: string
 *                 description: Permission name
 *               description:
 *                 type: string
 *                 description: Permission description
 *               constraints:
 *                 type: object
 *                 description: Permission constraints
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Permission active status
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Permission already exists
 */
router.post('/', authenticate, requirePermission('permission', 'create'), permissionController.createPermission);

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   put:
 *     summary: Update permission
 *     description: Update an existing permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Permission name
 *               description:
 *                 type: string
 *                 description: Permission description
 *               constraints:
 *                 type: object
 *                 description: Permission constraints
 *               isActive:
 *                 type: boolean
 *                 description: Permission active status
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Permission not found
 *       409:
 *         description: Permission name already exists
 */
router.put('/:id', authenticate, requirePermission('permission', 'update'), permissionController.updatePermission);

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   delete:
 *     summary: Delete permission
 *     description: Delete an existing permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Permission not found
 */
router.delete('/:id', authenticate, requirePermission('permission', 'delete'), permissionController.deletePermission);

/**
 * @swagger
 * /api/v1/permissions/resources:
 *   get:
 *     summary: Get all resources
 *     description: Retrieve a list of all resources
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of resources
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/resources', authenticate, requirePermission('permission', 'read'), permissionController.getAllResources);

/**
 * @swagger
 * /api/v1/permissions/resources/{resource}:
 *   get:
 *     summary: Get permissions by resource
 *     description: Retrieve permissions for a resource
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource name
 *     responses:
 *       200:
 *         description: List of permissions for the resource
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/resources/:resource', authenticate, requirePermission('permission', 'read'), permissionController.getPermissionsByResource);

/**
 * @swagger
 * /api/v1/permissions/roles/{roleId}/{permissionId}:
 *   post:
 *     summary: Assign permission to role
 *     description: Assign a permission to a role
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               constraints:
 *                 type: object
 *                 description: Permission constraints
 *     responses:
 *       200:
 *         description: Permission assigned to role successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role or permission not found
 */
router.post('/roles/:roleId/:permissionId', authenticate, requirePermission('role', 'update'), permissionController.assignPermissionToRole);

/**
 * @swagger
 * /api/v1/permissions/roles/{roleId}/{permissionId}:
 *   delete:
 *     summary: Revoke permission from role
 *     description: Revoke a permission from a role
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission revoked from role successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role, permission, or assignment not found
 */
router.delete('/roles/:roleId/:permissionId', authenticate, requirePermission('role', 'update'), permissionController.revokePermissionFromRole);

module.exports = router;
