/**
 * Leave Routes
 * Defines API routes for leave management operations
 */

const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

/**
 * @swagger
 * /api/leave:
 *   post:
 *     summary: Submit a leave request
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - leaveType
 *               - startDate
 *               - endDate
 *               - reason
 *             properties:
 *               employeeId:
 *                 type: string
 *               leaveType:
 *                 type: string
 *                 enum: [annual, sick, maternity, paternity, bereavement, unpaid, other]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   address:
 *                     type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fileUrl:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     fileType:
 *                       type: string
 *     responses:
 *       201:
 *         description: Leave request submitted successfully
 *       400:
 *         description: Invalid request data or insufficient leave balance
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, leaveController.submitLeaveRequest);

/**
 * @swagger
 * /api/leave/{id}:
 *   get:
 *     summary: Get leave request by ID
 *     tags: [Leave]
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
 *         description: Leave request retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave request not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, leaveController.getLeaveById);

/**
 * @swagger
 * /api/leave/employee/{employeeId}:
 *   get:
 *     summary: Get leave requests for an employee
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
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
 *         name: leaveType
 *         schema:
 *           type: string
 *           enum: [annual, sick, maternity, paternity, bereavement, unpaid, other]
 *     responses:
 *       200:
 *         description: Leave requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/employee/:employeeId', authenticate, leaveController.getEmployeeLeaves);

/**
 * @swagger
 * /api/leave:
 *   get:
 *     summary: Get all leave requests
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
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
 *         name: leaveType
 *         schema:
 *           type: string
 *           enum: [annual, sick, maternity, paternity, bereavement, unpaid, other]
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
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
 *         description: Leave requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, checkPermission('leave:view'), leaveController.getAllLeaves);

/**
 * @swagger
 * /api/leave/{id}/approve:
 *   put:
 *     summary: Approve a leave request
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave request approved successfully
 *       400:
 *         description: Invalid request or leave request already processed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Leave request not found
 *       500:
 *         description: Server error
 */
router.put('/:id/approve', authenticate, checkPermission('leave:approve'), leaveController.approveLeave);

/**
 * @swagger
 * /api/leave/{id}/reject:
 *   put:
 *     summary: Reject a leave request
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave request rejected successfully
 *       400:
 *         description: Invalid request or leave request already processed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Leave request not found
 *       500:
 *         description: Server error
 */
router.put('/:id/reject', authenticate, checkPermission('leave:approve'), leaveController.rejectLeave);

/**
 * @swagger
 * /api/leave/{id}/cancel:
 *   put:
 *     summary: Cancel a leave request
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave request cancelled successfully
 *       400:
 *         description: Invalid request or leave already started
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave request not found
 *       500:
 *         description: Server error
 */
router.put('/:id/cancel', authenticate, leaveController.cancelLeave);

/**
 * @swagger
 * /api/leave/balance/{employeeId}:
 *   get:
 *     summary: Get leave balance for an employee
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Leave balance retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.get('/balance/:employeeId', authenticate, leaveController.getLeaveBalance);

/**
 * @swagger
 * /api/leave/balance/{employeeId}/adjust:
 *   post:
 *     summary: Adjust leave balance for an employee
 *     tags: [Leave]
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
 *               - leaveType
 *               - amount
 *             properties:
 *               leaveType:
 *                 type: string
 *                 enum: [annual, sick, maternity, paternity, bereavement, unpaid, other]
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Leave balance adjusted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.post('/balance/:employeeId/adjust', authenticate, checkPermission('leave:manage'), leaveController.adjustLeaveBalance);

/**
 * @swagger
 * /api/leave/accrual/monthly:
 *   post:
 *     summary: Process monthly leave accruals
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Monthly accruals processed successfully
 *       400:
 *         description: Invalid request data or future month
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/accrual/monthly', authenticate, checkPermission('leave:manage'), leaveController.processMonthlyAccruals);

/**
 * @swagger
 * /api/leave/accrual/year-end:
 *   post:
 *     summary: Process year-end leave carry over
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromYear:
 *                 type: integer
 *               maxCarryOver:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Year-end carry over processed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/accrual/year-end', authenticate, checkPermission('leave:manage'), leaveController.processYearEndCarryOver);

module.exports = router;
