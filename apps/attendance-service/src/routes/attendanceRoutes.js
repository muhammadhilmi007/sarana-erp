/**
 * Attendance Routes
 * Defines API routes for attendance operations
 */

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

/**
 * @swagger
 * /api/attendance/check-in:
 *   post:
 *     summary: Record employee check-in
 *     tags: [Attendance]
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
 *             properties:
 *               employeeId:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   address:
 *                     type: string
 *               deviceId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Check-in recorded successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/check-in', authenticate, attendanceController.checkIn);

/**
 * @swagger
 * /api/attendance/check-out:
 *   post:
 *     summary: Record employee check-out
 *     tags: [Attendance]
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
 *             properties:
 *               employeeId:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   address:
 *                     type: string
 *               deviceId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Check-out recorded successfully
 *       400:
 *         description: Invalid request data or no check-in found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No check-in record found
 *       500:
 *         description: Server error
 */
router.post('/check-out', authenticate, attendanceController.checkOut);

/**
 * @swagger
 * /api/attendance/{id}:
 *   get:
 *     summary: Get attendance record by ID
 *     tags: [Attendance]
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
 *         description: Attendance record retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, attendanceController.getAttendanceById);

/**
 * @swagger
 * /api/attendance/employee/{employeeId}:
 *   get:
 *     summary: Get attendance records for an employee
 *     tags: [Attendance]
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
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [present, absent, late, half-day, leave, holiday]
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/employee/:employeeId', authenticate, attendanceController.getEmployeeAttendance);

/**
 * @swagger
 * /api/attendance/today:
 *   get:
 *     summary: Get today's attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [present, absent, late, half-day, leave, holiday]
 *     responses:
 *       200:
 *         description: Today's attendance records retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/today', authenticate, checkPermission('attendance:view'), attendanceController.getTodayAttendance);

/**
 * @swagger
 * /api/attendance/{id}:
 *   put:
 *     summary: Update attendance record
 *     tags: [Attendance]
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
 *             type: object
 *             properties:
 *               checkInTime:
 *                 type: string
 *                 format: date-time
 *               checkOutTime:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [present, absent, late, half-day, leave, holiday]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, checkPermission('attendance:update'), attendanceController.updateAttendance);

/**
 * @swagger
 * /api/attendance/{id}:
 *   delete:
 *     summary: Delete attendance record
 *     tags: [Attendance]
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
 *         description: Attendance record deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, checkPermission('attendance:delete'), attendanceController.deleteAttendance);

/**
 * @swagger
 * /api/attendance/correction:
 *   post:
 *     summary: Submit attendance correction request
 *     tags: [Attendance]
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
 *               - attendanceId
 *               - requestType
 *               - reason
 *             properties:
 *               employeeId:
 *                 type: string
 *               attendanceId:
 *                 type: string
 *               requestType:
 *                 type: string
 *                 enum: [check_in, check_out, both, status]
 *               newCheckInTime:
 *                 type: string
 *                 format: date-time
 *               newCheckOutTime:
 *                 type: string
 *                 format: date-time
 *               newStatus:
 *                 type: string
 *                 enum: [present, absent, late, half-day, leave, holiday]
 *               reason:
 *                 type: string
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
 *         description: Correction request submitted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Server error
 */
router.post('/correction', authenticate, attendanceController.submitCorrectionRequest);

/**
 * @swagger
 * /api/attendance/stats:
 *   get:
 *     summary: Get attendance statistics
 *     tags: [Attendance]
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
router.get('/stats', authenticate, checkPermission('attendance:view'), attendanceController.getAttendanceStats);

module.exports = router;
