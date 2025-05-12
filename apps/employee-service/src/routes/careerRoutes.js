/**
 * Career Routes
 * Defines API routes for employee career development management
 */

const express = require('express');
const router = express.Router();
const employeeCareerController = require('../controllers/employeeCareerController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');
const { validate } = require('../utils/validationUtil');
const { careerSchema } = require('../utils/validationSchemas');

/**
 * @swagger
 * tags:
 *   name: EmployeeCareer
 *   description: Employee career development management endpoints
 */

/**
 * @swagger
 * /api/v1/employees/{id}/career/path:
 *   patch:
 *     summary: Update career path
 *     description: Update career path for an employee
 *     tags: [EmployeeCareer]
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
 *             $ref: '#/components/schemas/CareerPathInput'
 *     responses:
 *       200:
 *         description: Career path updated successfully
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
router.patch(
  '/employees/:id/career/path',
  authMiddleware,
  permissionMiddleware('employee.career', 'update'),
  validate(careerSchema.employeeId, 'params'),
  validate(careerSchema.careerPath),
  employeeCareerController.updateCareerPath
);

/**
 * @swagger
 * /api/v1/employees/{id}/career/mentorship:
 *   post:
 *     summary: Add mentorship
 *     description: Add a mentorship record for an employee
 *     tags: [EmployeeCareer]
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
 *             $ref: '#/components/schemas/MentorshipInput'
 *     responses:
 *       201:
 *         description: Mentorship added successfully
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
  '/employees/:id/career/mentorship',
  authMiddleware,
  permissionMiddleware('employee.career', 'create'),
  validate(careerSchema.employeeId, 'params'),
  validate(careerSchema.mentorship),
  employeeCareerController.addMentorship
);

/**
 * @swagger
 * /api/v1/employees/{id}/career/mentorship/{mentorshipId}:
 *   patch:
 *     summary: Update mentorship status
 *     description: Update the status of a mentorship record
 *     tags: [EmployeeCareer]
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
 *         name: mentorshipId
 *         required: true
 *         schema:
 *           type: string
 *         description: Mentorship ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MentorshipStatusInput'
 *     responses:
 *       200:
 *         description: Mentorship status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or mentorship not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/employees/:id/career/mentorship/:mentorshipId',
  authMiddleware,
  permissionMiddleware('employee.career', 'update'),
  validate(careerSchema.employeeId, 'params'),
  validate(careerSchema.mentorshipId, 'params'),
  validate(careerSchema.mentorshipStatus),
  employeeCareerController.updateMentorshipStatus
);

/**
 * @swagger
 * /api/v1/employees/{id}/career/successor:
 *   patch:
 *     summary: Update successor information
 *     description: Update successor information for an employee
 *     tags: [EmployeeCareer]
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
 *             $ref: '#/components/schemas/SuccessorInput'
 *     responses:
 *       200:
 *         description: Successor information updated successfully
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
router.patch(
  '/employees/:id/career/successor',
  authMiddleware,
  permissionMiddleware('employee.career', 'update'),
  validate(careerSchema.employeeId, 'params'),
  validate(careerSchema.successor),
  employeeCareerController.updateSuccessorInfo
);

/**
 * @swagger
 * /api/v1/employees/{id}/career:
 *   get:
 *     summary: Get career development
 *     description: Retrieve career development information for an employee
 *     tags: [EmployeeCareer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Career development information
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
  '/employees/:id/career',
  authMiddleware,
  permissionMiddleware('employee.career', 'read'),
  validate(careerSchema.employeeId, 'params'),
  employeeCareerController.getCareerDevelopment
);

/**
 * @swagger
 * /api/v1/employees/career/successors/{positionId}:
 *   get:
 *     summary: Find successors for position
 *     description: Find employees who are successors for a position
 *     tags: [EmployeeCareer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     responses:
 *       200:
 *         description: List of successors for the position
 *       400:
 *         description: Invalid position ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/employees/career/successors/:positionId',
  authMiddleware,
  permissionMiddleware('employee.career', 'read'),
  validate(careerSchema.positionId, 'params'),
  employeeCareerController.findSuccessorsForPosition
);

/**
 * @swagger
 * /api/v1/employees/career/succession-planning:
 *   get:
 *     summary: Get succession planning report
 *     description: Get succession planning report for employees
 *     tags: [EmployeeCareer]
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
 *         description: Succession planning report
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/employees/career/succession-planning',
  authMiddleware,
  permissionMiddleware('employee.career', 'read'),
  employeeCareerController.getSuccessionPlanningReport
);

module.exports = router;
