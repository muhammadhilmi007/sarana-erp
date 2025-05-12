/**
 * Skill Routes
 * Defines API routes for employee skills and competencies management
 */

const express = require('express');
const router = express.Router();
const employeeSkillController = require('../controllers/employeeSkillController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');
const { validate } = require('../utils/validationUtil');
const { skillSchema } = require('../utils/validationSchemas');

/**
 * @swagger
 * tags:
 *   name: EmployeeSkills
 *   description: Employee skills and competencies management endpoints
 */

/**
 * @swagger
 * /api/v1/employees/{id}/skills:
 *   patch:
 *     summary: Update employee skill
 *     description: Add or update a skill for an employee
 *     tags: [EmployeeSkills]
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
 *             $ref: '#/components/schemas/SkillInput'
 *     responses:
 *       200:
 *         description: Skill updated successfully
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
  '/employees/:id/skills',
  authMiddleware,
  permissionMiddleware('employee.skill', 'update'),
  validate(skillSchema.employeeId, 'params'),
  validate(skillSchema.update),
  employeeSkillController.updateEmployeeSkill
);

/**
 * @swagger
 * /api/v1/employees/{id}/skills/{skillName}:
 *   delete:
 *     summary: Remove employee skill
 *     description: Remove a skill from an employee
 *     tags: [EmployeeSkills]
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
 *         name: skillName
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill name
 *     responses:
 *       200:
 *         description: Skill removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or skill not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/employees/:id/skills/:skillName',
  authMiddleware,
  permissionMiddleware('employee.skill', 'delete'),
  validate(skillSchema.employeeId, 'params'),
  employeeSkillController.removeEmployeeSkill
);

/**
 * @swagger
 * /api/v1/employees/{id}/skills:
 *   get:
 *     summary: Get employee skills
 *     description: Retrieve skills for an employee
 *     tags: [EmployeeSkills]
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
 *         description: List of employee skills
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
  '/employees/:id/skills',
  authMiddleware,
  permissionMiddleware('employee.skill', 'read'),
  validate(skillSchema.employeeId, 'params'),
  employeeSkillController.getEmployeeSkills
);

/**
 * @swagger
 * /api/v1/employees/{id}/skills/{skillName}/certifications:
 *   post:
 *     summary: Add skill certification
 *     description: Add a certification to an employee skill
 *     tags: [EmployeeSkills]
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
 *         name: skillName
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificationInput'
 *     responses:
 *       201:
 *         description: Certification added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or skill not found
 *       500:
 *         description: Server error
 */
router.post(
  '/employees/:id/skills/:skillName/certifications',
  authMiddleware,
  permissionMiddleware('employee.skill', 'update'),
  validate(skillSchema.employeeId, 'params'),
  validate(skillSchema.certification),
  employeeSkillController.addSkillCertification
);

/**
 * @swagger
 * /api/v1/employees/skills/{skillName}:
 *   get:
 *     summary: Find employees by skill
 *     description: Find employees with a specific skill
 *     tags: [EmployeeSkills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillName
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill name
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced, expert]
 *         description: Filter by skill level
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
 *     responses:
 *       200:
 *         description: List of employees with the specified skill
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/employees/skills/:skillName',
  authMiddleware,
  permissionMiddleware('employee.skill', 'read'),
  employeeSkillController.findEmployeesBySkill
);

/**
 * @swagger
 * /api/v1/employees/skills/matrix:
 *   get:
 *     summary: Get skill matrix
 *     description: Get skill matrix for employees
 *     tags: [EmployeeSkills]
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
 *     responses:
 *       200:
 *         description: Skill matrix
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/employees/skills/matrix',
  authMiddleware,
  permissionMiddleware('employee.skill', 'read'),
  employeeSkillController.getSkillMatrix
);

module.exports = router;
