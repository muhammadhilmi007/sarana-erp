/**
 * Branch Routes
 * Defines API routes for branch management
 */

const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');
const { validate } = require('../utils/validationUtil');
const { branchSchema } = require('../utils/validationUtil');

/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Branch management endpoints
 */

/**
 * @swagger
 * /api/v1/branches:
 *   get:
 *     summary: Get all branches
 *     description: Retrieve a list of all branches with pagination and filtering
 *     tags: [Branches]
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
 *         description: Search term for branch name or code
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [headquarters, regional, branch]
 *         description: Filter by branch type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending, closed]
 *         description: Filter by branch status
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
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
 *         description: A list of branches
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/',
  authMiddleware,
  permissionMiddleware('branch', 'read'),
  branchController.getAllBranches
);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   get:
 *     summary: Get branch by ID
 *     description: Retrieve a branch by its ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('branch', 'read'),
  validate(branchSchema.id, 'params'),
  branchController.getBranchById
);

/**
 * @swagger
 * /api/v1/branches:
 *   post:
 *     summary: Create a new branch
 *     description: Create a new branch with the provided data
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchInput'
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authMiddleware,
  permissionMiddleware('branch', 'create'),
  validate(branchSchema.create),
  branchController.createBranch
);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   put:
 *     summary: Update a branch
 *     description: Update a branch with the provided data
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchUpdateInput'
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('branch', 'update'),
  validate(branchSchema.id, 'params'),
  validate(branchSchema.update),
  branchController.updateBranch
);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   delete:
 *     summary: Delete a branch
 *     description: Delete a branch by its ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *       400:
 *         description: Cannot delete branch with children
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('branch', 'delete'),
  validate(branchSchema.id, 'params'),
  branchController.deleteBranch
);

/**
 * @swagger
 * /api/v1/branches/{id}/status:
 *   patch:
 *     summary: Update branch status
 *     description: Update a branch's status
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending, closed]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Branch status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/status',
  authMiddleware,
  permissionMiddleware('branch', 'update'),
  validate(branchSchema.id, 'params'),
  validate(branchSchema.status),
  branchController.updateBranchStatus
);

/**
 * @swagger
 * /api/v1/branches/hierarchy:
 *   get:
 *     summary: Get branch hierarchy
 *     description: Retrieve the branch hierarchy
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Branch hierarchy
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/hierarchy',
  authMiddleware,
  permissionMiddleware('branch', 'read'),
  branchController.getBranchHierarchy
);

/**
 * @swagger
 * /api/v1/branches/{id}/children:
 *   get:
 *     summary: Get branch children
 *     description: Retrieve a branch's children
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *       - in: query
 *         name: includeDescendants
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include all descendants
 *     responses:
 *       200:
 *         description: Branch children
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id/children',
  authMiddleware,
  permissionMiddleware('branch', 'read'),
  validate(branchSchema.id, 'params'),
  branchController.getBranchChildren
);

/**
 * @swagger
 * /api/v1/branches/{id}/ancestors:
 *   get:
 *     summary: Get branch ancestors
 *     description: Retrieve a branch's ancestors
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch ancestors
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id/ancestors',
  authMiddleware,
  permissionMiddleware('branch', 'read'),
  validate(branchSchema.id, 'params'),
  branchController.getBranchAncestors
);

/**
 * @swagger
 * /api/v1/branches/{id}/resources:
 *   patch:
 *     summary: Update branch resources
 *     description: Update a branch's resources
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchResourcesInput'
 *     responses:
 *       200:
 *         description: Branch resources updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/resources',
  authMiddleware,
  permissionMiddleware('branch', 'update'),
  validate(branchSchema.id, 'params'),
  validate(branchSchema.resources),
  branchController.updateBranchResources
);

/**
 * @swagger
 * /api/v1/branches/{id}/performance-metrics:
 *   patch:
 *     summary: Update branch performance metrics
 *     description: Update a branch's performance metrics
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchPerformanceMetricsInput'
 *     responses:
 *       200:
 *         description: Branch performance metrics updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/performance-metrics',
  authMiddleware,
  permissionMiddleware('branch', 'update'),
  validate(branchSchema.id, 'params'),
  validate(branchSchema.performanceMetrics),
  branchController.updateBranchPerformanceMetrics
);

/**
 * @swagger
 * /api/v1/branches/{id}/documents:
 *   post:
 *     summary: Add branch document
 *     description: Add a document to a branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchDocumentInput'
 *     responses:
 *       201:
 *         description: Document added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:id/documents',
  authMiddleware,
  permissionMiddleware('branch', 'update'),
  validate(branchSchema.id, 'params'),
  validate(branchSchema.document),
  branchController.addBranchDocument
);

/**
 * @swagger
 * /api/v1/branches/{id}/documents/{documentId}:
 *   put:
 *     summary: Update branch document
 *     description: Update a branch document
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchDocumentUpdateInput'
 *     responses:
 *       200:
 *         description: Document updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch or document not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id/documents/:documentId',
  authMiddleware,
  permissionMiddleware('branch', 'update'),
  validate(branchSchema.id, 'params'),
  validate(branchSchema.documentUpdate),
  branchController.updateBranchDocument
);

/**
 * @swagger
 * /api/v1/branches/{id}/documents/{documentId}:
 *   delete:
 *     summary: Delete branch document
 *     description: Delete a branch document
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch or document not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:id/documents/:documentId',
  authMiddleware,
  permissionMiddleware('branch', 'update'),
  validate(branchSchema.id, 'params'),
  branchController.deleteBranchDocument
);

/**
 * @swagger
 * /api/v1/branches/{id}/operational-hours:
 *   patch:
 *     summary: Update branch operational hours
 *     description: Update a branch's operational hours
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchOperationalHoursInput'
 *     responses:
 *       200:
 *         description: Operational hours updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/operational-hours',
  authMiddleware,
  permissionMiddleware('branch', 'update'),
  validate(branchSchema.id, 'params'),
  validate(branchSchema.operationalHours),
  branchController.updateBranchOperationalHours
);

/**
 * @swagger
 * /api/v1/branches/{id}/history:
 *   get:
 *     summary: Get branch history
 *     description: Retrieve a branch's history
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, update, delete, status_change, resource_update, document_add, document_update]
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
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
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Branch history
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id/history',
  authMiddleware,
  permissionMiddleware('branch', 'read'),
  validate(branchSchema.id, 'params'),
  branchController.getBranchHistory
);

/**
 * @swagger
 * /api/v1/branches/location:
 *   get:
 *     summary: Get branches by location
 *     description: Retrieve branches near a specific location
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *           default: 10000
 *         description: Maximum distance in meters
 *     responses:
 *       200:
 *         description: Branches near the specified location
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/location',
  authMiddleware,
  permissionMiddleware('branch', 'read'),
  branchController.getBranchesByLocation
);

module.exports = router;
