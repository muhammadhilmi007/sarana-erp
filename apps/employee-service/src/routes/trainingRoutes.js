/**
 * Training Routes
 * Defines API routes for employee training management
 */

const express = require('express');
const router = express.Router();
const employeeTrainingController = require('../controllers/employeeTrainingController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');
const { validate } = require('../utils/validationUtil');
const { trainingSchema } = require('../utils/validationSchemas');

/**
 * @swagger
 * tags:
 *   name: EmployeeTraining
 *   description: Employee training management endpoints
 */

/**
 * @swagger
 * /api/v1/employees/{id}/training:
 *   post:
 *     summary: Add training record
 *     description: Add a training record for an employee
 *     tags: [EmployeeTraining]
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
 *             $ref: '#/components/schemas/TrainingInput'
 *     responses:
 *       201:
 *         description: Training record added successfully
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
  '/employees/:id/training',
  authMiddleware,
  permissionMiddleware('employee.training', 'create'),
  validate(trainingSchema.employeeId, 'params'),
  validate(trainingSchema.create),
  employeeTrainingController.addTrainingRecord
);

/**
 * @swagger
 * /api/v1/employees/{id}/training/{trainingId}:
 *   put:
 *     summary: Update training record
 *     description: Update a training record for an employee
 *     tags: [EmployeeTraining]
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
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Training ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrainingUpdateInput'
 *     responses:
 *       200:
 *         description: Training record updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or training record not found
 *       500:
 *         description: Server error
 */
router.put(
  '/employees/:id/training/:trainingId',
  authMiddleware,
  permissionMiddleware('employee.training', 'update'),
  validate(trainingSchema.employeeId, 'params'),
  validate(trainingSchema.trainingId, 'params'),
  validate(trainingSchema.update),
  employeeTrainingController.updateTrainingRecord
);

/**
 * @swagger
 * /api/v1/employees/{id}/training/{trainingId}/status:
 *   patch:
 *     summary: Update training status
 *     description: Update the status of a training record
 *     tags: [EmployeeTraining]
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
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Training ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrainingStatusInput'
 *     responses:
 *       200:
 *         description: Training status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or training record not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/employees/:id/training/:trainingId/status',
  authMiddleware,
  permissionMiddleware('employee.training', 'update'),
  validate(trainingSchema.employeeId, 'params'),
  validate(trainingSchema.trainingId, 'params'),
  validate(trainingSchema.status),
  employeeTrainingController.updateTrainingStatus
);

/**
 * @swagger
 * /api/v1/employees/{id}/training:
 *   get:
 *     summary: Get employee training history
 *     description: Retrieve training history for an employee
 *     tags: [EmployeeTraining]
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [internal, external, online, conference, workshop]
 *         description: Filter by training type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [registered, in-progress, completed, failed, cancelled]
 *         description: Filter by training status
 *     responses:
 *       200:
 *         description: List of training records
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
  '/employees/:id/training',
  authMiddleware,
  permissionMiddleware('employee.training', 'read'),
  validate(trainingSchema.employeeId, 'params'),
  employeeTrainingController.getEmployeeTrainingHistory
);

/**
 * @swagger
 * /api/v1/employees/{id}/training/{trainingId}:
 *   get:
 *     summary: Get training record by ID
 *     description: Retrieve a training record by its ID
 *     tags: [EmployeeTraining]
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
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Training ID
 *     responses:
 *       200:
 *         description: Training record details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or training record not found
 *       500:
 *         description: Server error
 */
router.get(
  '/employees/:id/training/:trainingId',
  authMiddleware,
  permissionMiddleware('employee.training', 'read'),
  validate(trainingSchema.employeeId, 'params'),
  validate(trainingSchema.trainingId, 'params'),
  employeeTrainingController.getTrainingById
);

/**
 * @swagger
 * /api/v1/employees/training/statistics:
 *   get:
 *     summary: Get training statistics
 *     description: Get training statistics for employees
 *     tags: [EmployeeTraining]
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
 *         description: Training statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/employees/training/statistics',
  authMiddleware,
  permissionMiddleware('employee.training', 'read'),
  employeeTrainingController.getTrainingStatistics
);

module.exports = router;
