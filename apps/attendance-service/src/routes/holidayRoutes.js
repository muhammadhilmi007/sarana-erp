/**
 * Holiday Routes
 * Defines API routes for holiday management operations
 */

const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

/**
 * @swagger
 * /api/holiday:
 *   post:
 *     summary: Create a new holiday
 *     tags: [Holiday]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Holiday'
 *     responses:
 *       201:
 *         description: Holiday created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, checkPermission('holiday:create'), holidayController.createHoliday);

/**
 * @swagger
 * /api/holiday/{id}:
 *   get:
 *     summary: Get holiday by ID
 *     tags: [Holiday]
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
 *         description: Holiday retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Holiday not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, holidayController.getHolidayById);

/**
 * @swagger
 * /api/holiday:
 *   get:
 *     summary: Get all holidays
 *     tags: [Holiday]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [national, religious, company]
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Holidays retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, holidayController.getAllHolidays);

/**
 * @swagger
 * /api/holiday/{id}:
 *   put:
 *     summary: Update holiday
 *     tags: [Holiday]
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
 *             $ref: '#/components/schemas/Holiday'
 *     responses:
 *       200:
 *         description: Holiday updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Holiday not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, checkPermission('holiday:update'), holidayController.updateHoliday);

/**
 * @swagger
 * /api/holiday/{id}:
 *   delete:
 *     summary: Delete holiday
 *     tags: [Holiday]
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
 *         description: Holiday deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Holiday not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, checkPermission('holiday:delete'), holidayController.deleteHoliday);

/**
 * @swagger
 * /api/holiday/check:
 *   get:
 *     summary: Check if a date is a holiday
 *     tags: [Holiday]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Holiday check completed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/check', authenticate, holidayController.checkHoliday);

/**
 * @swagger
 * /api/holiday/range:
 *   get:
 *     summary: Get holidays in a date range
 *     tags: [Holiday]
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
 *         name: branchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Holidays retrieved successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/range', authenticate, holidayController.getHolidaysInRange);

/**
 * @swagger
 * /api/holiday/generate-recurring:
 *   post:
 *     summary: Generate recurring holidays for a year
 *     tags: [Holiday]
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
 *             properties:
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Recurring holidays generated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/generate-recurring', authenticate, checkPermission('holiday:create'), holidayController.generateRecurringHolidays);

/**
 * @swagger
 * /api/holiday/import:
 *   post:
 *     summary: Import holidays from CSV
 *     tags: [Holiday]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - holidays
 *             properties:
 *               holidays:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Holiday'
 *     responses:
 *       200:
 *         description: Holidays imported successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/import', authenticate, checkPermission('holiday:create'), holidayController.importHolidays);

module.exports = router;
