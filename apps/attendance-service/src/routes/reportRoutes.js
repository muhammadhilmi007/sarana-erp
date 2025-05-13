/**
 * Report Routes
 * Defines API routes for attendance reporting operations
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

/**
 * @swagger
 * /api/report/daily:
 *   post:
 *     summary: Generate a daily attendance report
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               filters:
 *                 type: object
 *                 properties:
 *                   departmentIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   branchIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   employeeIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   statuses:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [present, absent, late, half-day, leave, holiday]
 *               format:
 *                 type: string
 *                 enum: [json, csv, pdf, excel]
 *                 default: json
 *     responses:
 *       201:
 *         description: Daily report generated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/daily', authenticate, checkPermission('report:generate'), reportController.generateDailyReport);

/**
 * @swagger
 * /api/report/weekly:
 *   post:
 *     summary: Generate a weekly attendance report
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               filters:
 *                 type: object
 *                 properties:
 *                   departmentIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   branchIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   employeeIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   statuses:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [present, absent, late, half-day, leave, holiday]
 *               format:
 *                 type: string
 *                 enum: [json, csv, pdf, excel]
 *                 default: json
 *     responses:
 *       201:
 *         description: Weekly report generated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/weekly', authenticate, checkPermission('report:generate'), reportController.generateWeeklyReport);

/**
 * @swagger
 * /api/report/monthly:
 *   post:
 *     summary: Generate a monthly attendance report
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *               - month
 *             properties:
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *               filters:
 *                 type: object
 *                 properties:
 *                   departmentIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   branchIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   employeeIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   statuses:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [present, absent, late, half-day, leave, holiday]
 *               format:
 *                 type: string
 *                 enum: [json, csv, pdf, excel]
 *                 default: json
 *     responses:
 *       201:
 *         description: Monthly report generated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/monthly', authenticate, checkPermission('report:generate'), reportController.generateMonthlyReport);

/**
 * @swagger
 * /api/report/custom:
 *   post:
 *     summary: Generate a custom attendance report
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               filters:
 *                 type: object
 *                 properties:
 *                   departmentIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   branchIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   employeeIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                   statuses:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [present, absent, late, half-day, leave, holiday]
 *               format:
 *                 type: string
 *                 enum: [json, csv, pdf, excel]
 *                 default: json
 *     responses:
 *       201:
 *         description: Custom report generated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/custom', authenticate, checkPermission('report:generate'), reportController.generateCustomReport);

/**
 * @swagger
 * /api/report/{id}:
 *   get:
 *     summary: Get report by ID
 *     tags: [Report]
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
 *         description: Report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, reportController.getReportById);

/**
 * @swagger
 * /api/report:
 *   get:
 *     summary: Get all reports
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, custom]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, checkPermission('report:view'), reportController.getAllReports);

/**
 * @swagger
 * /api/report/{id}:
 *   delete:
 *     summary: Delete report
 *     tags: [Report]
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
 *         description: Report deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, checkPermission('report:delete'), reportController.deleteReport);

/**
 * @swagger
 * /api/report/stats:
 *   get:
 *     summary: Get attendance statistics
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance statistics retrieved successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', authenticate, checkPermission('report:view'), reportController.getAttendanceStats);

/**
 * @swagger
 * /api/report/employee/{employeeId}/summary:
 *   get:
 *     summary: Get employee attendance summary
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Employee attendance summary retrieved successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/employee/:employeeId/summary', authenticate, reportController.getEmployeeAttendanceSummary);

module.exports = router;
