/**
 * Performance Routes
 * Defines API routes for employee performance evaluation management
 */

const express = require('express');
const router = express.Router();
const employeePerformanceController = require('../controllers/employeePerformanceController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');
const { validate } = require('../utils/validationUtil');
const { performanceSchema } = require('../utils/validationSchemas');

/**
 * @swagger
 * tags:
 *   name: EmployeePerformance
 *   description: Employee performance evaluation management endpoints
 */

/**
 * @swagger
 * /api/v1/employees/{id}/performance:
 *   post:
 *     summary: Add performance evaluation
 *     description: Add a performance evaluation for an employee
 *     tags: [EmployeePerformance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerformanceEvaluationInput'
 *     responses:
 *       201:
 *         description: Performance evaluation added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.post(
  '/employees/:id/performance',
  authMiddleware,
  permissionMiddleware('employee.performance', 'create'),
  validate(performanceSchema.employeeId, 'params'),
  validate(performanceSchema.create),
  employeePerformanceController.addPerformanceEvaluation
);

/**
 * @swagger
 * /api/v1/employees/{id}/performance/{evaluationId}:
 *   put:
 *     summary: Update performance evaluation
 *     description: Update a performance evaluation for an employee
 *     tags: [EmployeePerformance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Evaluation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerformanceEvaluationUpdateInput'
 *     responses:
 *       200:
 *         description: Performance evaluation updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or evaluation not found
 *       500:
 *         description: Server error
 */
router.put(
  '/employees/:id/performance/:evaluationId',
  authMiddleware,
  permissionMiddleware('employee.performance', 'update'),
  validate(performanceSchema.employeeId, 'params'),
  validate(performanceSchema.evaluationId, 'params'),
  validate(performanceSchema.update),
  employeePerformanceController.updatePerformanceEvaluation
);

/**
 * @swagger
 * /api/v1/employees/{id}/performance:
 *   get:
 *     summary: Get employee performance evaluations
 *     description: Retrieve performance evaluations for an employee
 *     tags: [EmployeePerformance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of performance evaluations
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.get(
  '/employees/:id/performance',
  authMiddleware,
  permissionMiddleware('employee.performance', 'read'),
  validate(performanceSchema.employeeId, 'params'),
  employeePerformanceController.getEmployeePerformanceEvaluations
);

/**
 * @swagger
 * /api/v1/employees/{id}/performance/{evaluationId}:
 *   get:
 *     summary: Get performance evaluation by ID
 *     description: Retrieve a performance evaluation by its ID
 *     tags: [EmployeePerformance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Evaluation ID
 *     responses:
 *       200:
 *         description: Performance evaluation details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or evaluation not found
 *       500:
 *         description: Server error
 */
router.get(
  '/employees/:id/performance/:evaluationId',
  authMiddleware,
  permissionMiddleware('employee.performance', 'read'),
  validate(performanceSchema.employeeId, 'params'),
  validate(performanceSchema.evaluationId, 'params'),
  employeePerformanceController.getPerformanceEvaluationById
);

/**
 * @swagger
 * /api/v1/employees/{id}/performance/{evaluationId}/acknowledge:
 *   patch:
 *     summary: Acknowledge performance evaluation
 *     description: Acknowledge a performance evaluation by the employee
 *     tags: [EmployeePerformance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Evaluation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcknowledgementInput'
 *     responses:
 *       200:
 *         description: Performance evaluation acknowledged successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or evaluation not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/employees/:id/performance/:evaluationId/acknowledge',
  authMiddleware,
  validate(performanceSchema.employeeId, 'params'),
  validate(performanceSchema.evaluationId, 'params'),
  validate(performanceSchema.acknowledge),
  employeePerformanceController.acknowledgePerformanceEvaluation
);

/**
 * @swagger
 * /api/v1/employees/performance/statistics:
 *   get:
 *     summary: Get performance statistics
 *     description: Get performance statistics for employees
 *     tags: [EmployeePerformance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: divisionId
 *         schema:
 *           type: string
 *         description: Filter by division ID
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         description: Filter by branch ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *     responses:
 *       200:
 *         description: Performance statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/employees/performance/statistics',
  authMiddleware,
  permissionMiddleware('employee.performance', 'read'),
  employeePerformanceController.getPerformanceStatistics
);

module.exports = router;
