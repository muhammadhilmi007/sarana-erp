/**
 * Work Schedule Routes
 * Defines API routes for work schedule operations
 */

const express = require('express');
const router = express.Router();
const workScheduleController = require('../controllers/workScheduleController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

/**
 * @swagger
 * /api/work-schedule:
 *   post:
 *     summary: Create a new work schedule
 *     tags: [WorkSchedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkSchedule'
 *     responses:
 *       201:
 *         description: Work schedule created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, checkPermission('workSchedule:create'), workScheduleController.createWorkSchedule);

/**
 * @swagger
 * /api/work-schedule/{id}:
 *   get:
 *     summary: Get work schedule by ID
 *     tags: [WorkSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Work schedule retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Work schedule not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, workScheduleController.getWorkScheduleById);

/**
 * @swagger
 * /api/work-schedule:
 *   get:
 *     summary: Get all work schedules
 *     tags: [WorkSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scheduleType
 *         schema:
 *           type: string
 *           enum: [regular, shift, flexible]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Work schedules retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, workScheduleController.getAllWorkSchedules);

/**
 * @swagger
 * /api/work-schedule/{id}:
 *   put:
 *     summary: Update work schedule
 *     tags: [WorkSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkSchedule'
 *     responses:
 *       200:
 *         description: Work schedule updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Work schedule not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, checkPermission('workSchedule:update'), workScheduleController.updateWorkSchedule);

/**
 * @swagger
 * /api/work-schedule/{id}:
 *   delete:
 *     summary: Delete work schedule
 *     tags: [WorkSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Work schedule deleted successfully
 *       400:
 *         description: Work schedule is in use
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Work schedule not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, checkPermission('workSchedule:delete'), workScheduleController.deleteWorkSchedule);

/**
 * @swagger
 * /api/work-schedule/employee/{employeeId}:
 *   post:
 *     summary: Assign work schedule to employee
 *     tags: [WorkSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduleId
 *               - effectiveDate
 *             properties:
 *               scheduleId:
 *                 type: string
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Work schedule assigned to employee successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or work schedule not found
 *       500:
 *         description: Server error
 */
router.post('/employee/:employeeId', authenticate, checkPermission('workSchedule:assign'), workScheduleController.assignScheduleToEmployee);

/**
 * @swagger
 * /api/work-schedule/employee/{employeeId}:
 *   get:
 *     summary: Get employee's work schedule
 *     tags: [WorkSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Employee work schedule retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found or no schedule found
 *       500:
 *         description: Server error
 */
router.get('/employee/:employeeId', authenticate, workScheduleController.getEmployeeSchedule);

/**
 * @swagger
 * /api/work-schedule/employee/{employeeId}/override:
 *   post:
 *     summary: Add schedule override for an employee
 *     tags: [WorkSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - scheduleId
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               scheduleId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Schedule override added successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or work schedule not found
 *       500:
 *         description: Server error
 */
router.post('/employee/:employeeId/override', authenticate, checkPermission('workSchedule:assign'), workScheduleController.addScheduleOverride);

/**
 * @swagger
 * /api/work-schedule/employee/{employeeId}/override:
 *   delete:
 *     summary: Remove schedule override for an employee
 *     tags: [WorkSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Schedule override removed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or override not found
 *       500:
 *         description: Server error
 */
router.delete('/employee/:employeeId/override', authenticate, checkPermission('workSchedule:assign'), workScheduleController.removeScheduleOverride);

/**
 * @swagger
 * /api/work-schedule/bulk-assign:
 *   post:
 *     summary: Bulk assign work schedule to employees
 *     tags: [WorkSchedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeIds
 *               - scheduleId
 *               - effectiveDate
 *             properties:
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               scheduleId:
 *                 type: string
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Work schedules assigned successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Work schedule not found
 *       500:
 *         description: Server error
 */
router.post('/bulk-assign', authenticate, checkPermission('workSchedule:assign'), workScheduleController.bulkAssignSchedule);

module.exports = router;
