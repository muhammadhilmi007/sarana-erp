/**
 * Division Routes
 * Defines API routes for division management
 */

const express = require('express');
const router = express.Router();
const divisionController = require('../controllers/divisionController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');
const { validate } = require('../utils/validationUtil');
const { divisionSchema } = require('../utils/validationUtil');

/**
 * @swagger
 * tags:
 *   name: Divisions
 *   description: Division management endpoints
 */

/**
 * @swagger
 * /api/v1/divisions:
 *   get:
 *     summary: Get all divisions
 *     description: Retrieve a list of all divisions with pagination and filtering
 *     tags: [Divisions]
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
 *         description: Search term for division name or code
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, restructuring]
 *         description: Filter by division status
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         description: Filter by branch ID
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
 *         description: A list of divisions
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
  permissionMiddleware('division', 'read'),
  divisionController.getAllDivisions
);

/**
 * @swagger
 * /api/v1/divisions/{id}:
 *   get:
 *     summary: Get division by ID
 *     description: Retrieve a division by its ID
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Division ID
 *     responses:
 *       200:
 *         description: Division details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Division not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('division', 'read'),
  validate(divisionSchema.id, 'params'),
  divisionController.getDivisionById
);

/**
 * @swagger
 * /api/v1/divisions:
 *   post:
 *     summary: Create a new division
 *     description: Create a new division with the provided data
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DivisionInput'
 *     responses:
 *       201:
 *         description: Division created successfully
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
  permissionMiddleware('division', 'create'),
  validate(divisionSchema.create),
  divisionController.createDivision
);

/**
 * @swagger
 * /api/v1/divisions/{id}:
 *   put:
 *     summary: Update a division
 *     description: Update a division with the provided data
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Division ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DivisionUpdateInput'
 *     responses:
 *       200:
 *         description: Division updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Division not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('division', 'update'),
  validate(divisionSchema.id, 'params'),
  validate(divisionSchema.update),
  divisionController.updateDivision
);

/**
 * @swagger
 * /api/v1/divisions/{id}:
 *   delete:
 *     summary: Delete a division
 *     description: Delete a division by its ID
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Division ID
 *     responses:
 *       200:
 *         description: Division deleted successfully
 *       400:
 *         description: Cannot delete division with children or positions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Division not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('division', 'delete'),
  validate(divisionSchema.id, 'params'),
  divisionController.deleteDivision
);

/**
 * @swagger
 * /api/v1/divisions/{id}/status:
 *   patch:
 *     summary: Update division status
 *     description: Update a division's status
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Division ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DivisionStatusInput'
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Division not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/status',
  authMiddleware,
  permissionMiddleware('division', 'update'),
  validate(divisionSchema.id, 'params'),
  validate(divisionSchema.status),
  divisionController.updateDivisionStatus
);

/**
 * @swagger
 * /api/v1/divisions/hierarchy:
 *   get:
 *     summary: Get division hierarchy
 *     description: Retrieve the division hierarchy
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         description: Filter by branch ID
 *     responses:
 *       200:
 *         description: Division hierarchy
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
  permissionMiddleware('division', 'read'),
  divisionController.getDivisionHierarchy
);

/**
 * @swagger
 * /api/v1/divisions/{id}/children:
 *   get:
 *     summary: Get division children
 *     description: Retrieve a division's children
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Division ID
 *     responses:
 *       200:
 *         description: Division children
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Division not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id/children',
  authMiddleware,
  permissionMiddleware('division', 'read'),
  validate(divisionSchema.id, 'params'),
  divisionController.getDivisionChildren
);

/**
 * @swagger
 * /api/v1/divisions/{id}/ancestors:
 *   get:
 *     summary: Get division ancestors
 *     description: Retrieve a division's ancestors
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Division ID
 *     responses:
 *       200:
 *         description: Division ancestors
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Division not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id/ancestors',
  authMiddleware,
  permissionMiddleware('division', 'read'),
  validate(divisionSchema.id, 'params'),
  divisionController.getDivisionAncestors
);

/**
 * @swagger
 * /api/v1/divisions/{id}/kpis:
 *   patch:
 *     summary: Update division KPIs
 *     description: Update a division's KPIs
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Division ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DivisionKPIsInput'
 *     responses:
 *       200:
 *         description: KPIs updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Division not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/kpis',
  authMiddleware,
  permissionMiddleware('division', 'update'),
  validate(divisionSchema.id, 'params'),
  validate(divisionSchema.kpis),
  divisionController.updateDivisionKPIs
);

/**
 * @swagger
 * /api/v1/divisions/{id}/budget:
 *   patch:
 *     summary: Update division budget
 *     description: Update a division's budget
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Division ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DivisionBudgetInput'
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Division not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/budget',
  authMiddleware,
  permissionMiddleware('division', 'update'),
  validate(divisionSchema.id, 'params'),
  validate(divisionSchema.budget),
  divisionController.updateDivisionBudget
);

/**
 * @swagger
 * /api/v1/divisions/{id}/history:
 *   get:
 *     summary: Get division history
 *     description: Retrieve a division's history
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Division ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, update, delete, status_change, budget_update, kpi_update]
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
 *         description: Division history
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Division not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id/history',
  authMiddleware,
  permissionMiddleware('division', 'read'),
  validate(divisionSchema.id, 'params'),
  divisionController.getDivisionHistory
);

module.exports = router;
