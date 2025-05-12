/**
 * Position Routes
 * Defines API routes for position management
 */

const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');
const { validate } = require('../utils/validationUtil');
const { positionSchema } = require('../utils/validationUtil');

/**
 * @swagger
 * tags:
 *   name: Positions
 *   description: Position management endpoints
 */

/**
 * @swagger
 * /api/v1/positions:
 *   get:
 *     summary: Get all positions
 *     description: Retrieve a list of all positions with pagination and filtering
 *     tags: [Positions]
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
 *         description: Search term for position title or code
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, draft]
 *         description: Filter by position status
 *       - in: query
 *         name: divisionId
 *         schema:
 *           type: string
 *         description: Filter by division ID
 *       - in: query
 *         name: salaryGrade
 *         schema:
 *           type: string
 *         description: Filter by salary grade
 *       - in: query
 *         name: isVacant
 *         schema:
 *           type: boolean
 *         description: Filter by vacancy status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: title
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
 *         description: A list of positions
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
  permissionMiddleware('position', 'read'),
  positionController.getAllPositions
);

/**
 * @swagger
 * /api/v1/positions/{id}:
 *   get:
 *     summary: Get position by ID
 *     description: Retrieve a position by its ID
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     responses:
 *       200:
 *         description: Position details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('position', 'read'),
  validate(positionSchema.id, 'params'),
  positionController.getPositionById
);

/**
 * @swagger
 * /api/v1/positions:
 *   post:
 *     summary: Create a new position
 *     description: Create a new position with the provided data
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PositionInput'
 *     responses:
 *       201:
 *         description: Position created successfully
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
  permissionMiddleware('position', 'create'),
  validate(positionSchema.create),
  positionController.createPosition
);

/**
 * @swagger
 * /api/v1/positions/{id}:
 *   put:
 *     summary: Update a position
 *     description: Update a position with the provided data
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PositionUpdateInput'
 *     responses:
 *       200:
 *         description: Position updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('position', 'update'),
  validate(positionSchema.id, 'params'),
  validate(positionSchema.update),
  positionController.updatePosition
);

/**
 * @swagger
 * /api/v1/positions/{id}:
 *   delete:
 *     summary: Delete a position
 *     description: Delete a position by its ID
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     responses:
 *       200:
 *         description: Position deleted successfully
 *       400:
 *         description: Cannot delete position with direct reports
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('position', 'delete'),
  validate(positionSchema.id, 'params'),
  positionController.deletePosition
);

/**
 * @swagger
 * /api/v1/positions/{id}/status:
 *   patch:
 *     summary: Update position status
 *     description: Update a position's status
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PositionStatusInput'
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
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/status',
  authMiddleware,
  permissionMiddleware('position', 'update'),
  validate(positionSchema.id, 'params'),
  validate(positionSchema.status),
  positionController.updatePositionStatus
);

/**
 * @swagger
 * /api/v1/positions/hierarchy:
 *   get:
 *     summary: Get position hierarchy
 *     description: Retrieve the position hierarchy
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: divisionId
 *         schema:
 *           type: string
 *         description: Filter by division ID
 *     responses:
 *       200:
 *         description: Position hierarchy
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
  permissionMiddleware('position', 'read'),
  positionController.getPositionHierarchy
);

/**
 * @swagger
 * /api/v1/positions/{id}/direct-reports:
 *   get:
 *     summary: Get direct reports
 *     description: Retrieve a position's direct reports
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     responses:
 *       200:
 *         description: Direct reports
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id/direct-reports',
  authMiddleware,
  permissionMiddleware('position', 'read'),
  validate(positionSchema.id, 'params'),
  positionController.getDirectReports
);

/**
 * @swagger
 * /api/v1/positions/{id}/reporting-chain:
 *   get:
 *     summary: Get reporting chain
 *     description: Retrieve a position's reporting chain
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     responses:
 *       200:
 *         description: Reporting chain
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id/reporting-chain',
  authMiddleware,
  permissionMiddleware('position', 'read'),
  validate(positionSchema.id, 'params'),
  positionController.getReportingChain
);

/**
 * @swagger
 * /api/v1/positions/{id}/requirements:
 *   patch:
 *     summary: Update position requirements
 *     description: Update a position's requirements
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PositionRequirementsInput'
 *     responses:
 *       200:
 *         description: Requirements updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/requirements',
  authMiddleware,
  permissionMiddleware('position', 'update'),
  validate(positionSchema.id, 'params'),
  validate(positionSchema.requirements),
  positionController.updatePositionRequirements
);

/**
 * @swagger
 * /api/v1/positions/{id}/responsibilities:
 *   patch:
 *     summary: Update position responsibilities
 *     description: Update a position's responsibilities
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PositionResponsibilitiesInput'
 *     responses:
 *       200:
 *         description: Responsibilities updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/responsibilities',
  authMiddleware,
  permissionMiddleware('position', 'update'),
  validate(positionSchema.id, 'params'),
  validate(positionSchema.responsibilities),
  positionController.updatePositionResponsibilities
);

/**
 * @swagger
 * /api/v1/positions/{id}/authorities:
 *   patch:
 *     summary: Update position authorities
 *     description: Update a position's authorities
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PositionAuthoritiesInput'
 *     responses:
 *       200:
 *         description: Authorities updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/authorities',
  authMiddleware,
  permissionMiddleware('position', 'update'),
  validate(positionSchema.id, 'params'),
  validate(positionSchema.authorities),
  positionController.updatePositionAuthorities
);

/**
 * @swagger
 * /api/v1/positions/{id}/compensation:
 *   patch:
 *     summary: Update position compensation
 *     description: Update a position's compensation
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PositionCompensationInput'
 *     responses:
 *       200:
 *         description: Compensation updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/compensation',
  authMiddleware,
  permissionMiddleware('position', 'update'),
  validate(positionSchema.id, 'params'),
  validate(positionSchema.compensation),
  positionController.updatePositionCompensation
);

/**
 * @swagger
 * /api/v1/positions/{id}/history:
 *   get:
 *     summary: Get position history
 *     description: Retrieve a position's history
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, update, delete, status_change, reporting_change, vacancy_change]
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
 *         description: Position history
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id/history',
  authMiddleware,
  permissionMiddleware('position', 'read'),
  validate(positionSchema.id, 'params'),
  positionController.getPositionHistory
);

module.exports = router;
