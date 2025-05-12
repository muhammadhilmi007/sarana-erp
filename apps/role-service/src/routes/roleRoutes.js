/**
 * Role Routes
 * API routes for role management
 */

const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const roleController = require('../controllers/roleController');
const router = express.Router();

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get all roles
 *     description: Retrieve a list of all roles with pagination
 *     tags: [Roles]
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
 *         description: Search term for role name or description
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Filter by parent role ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name
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
 *         description: List of roles
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, requirePermission('role', 'read'), roleController.getAllRoles);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     description: Retrieve a role by its ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 */
router.get('/:id', authenticate, requirePermission('role', 'read'), roleController.getRoleById);

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create a new role
 *     description: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Role name
 *               description:
 *                 type: string
 *                 description: Role description
 *               parentId:
 *                 type: string
 *                 description: Parent role ID
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Role active status
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Role already exists
 */
router.post('/', authenticate, requirePermission('role', 'create'), roleController.createRole);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   put:
 *     summary: Update role
 *     description: Update an existing role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Role name
 *               description:
 *                 type: string
 *                 description: Role description
 *               parentId:
 *                 type: string
 *                 description: Parent role ID
 *               isActive:
 *                 type: boolean
 *                 description: Role active status
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role name already exists
 */
router.put('/:id', authenticate, requirePermission('role', 'update'), roleController.updateRole);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     summary: Delete role
 *     description: Delete an existing role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 */
router.delete('/:id', authenticate, requirePermission('role', 'delete'), roleController.deleteRole);

/**
 * @swagger
 * /api/v1/roles/hierarchy:
 *   get:
 *     summary: Get role hierarchy
 *     description: Retrieve the role hierarchy
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role hierarchy
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/hierarchy', authenticate, requirePermission('role', 'read'), roleController.getRoleHierarchy);

/**
 * @swagger
 * /api/v1/roles/{id}/permissions:
 *   get:
 *     summary: Get role permissions
 *     description: Retrieve permissions for a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *       - in: query
 *         name: includeInherited
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include inherited permissions
 *     responses:
 *       200:
 *         description: Role permissions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 */
router.get('/:id/permissions', authenticate, requirePermission('role', 'read'), roleController.getRolePermissions);

module.exports = router;
