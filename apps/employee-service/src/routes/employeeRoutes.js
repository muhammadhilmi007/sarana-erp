/**
 * Employee Routes
 * Defines API routes for employee management
 */

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const employeeStatusController = require('../controllers/employeeStatusController');
const employeeAssignmentController = require('../controllers/employeeAssignmentController');
const employeeDocumentController = require('../controllers/employeeDocumentController');
const employeeSkillController = require('../controllers/employeeSkillController');
const employeePerformanceController = require('../controllers/employeePerformanceController');
const employeeCareerController = require('../controllers/employeeCareerController');
const employeeTrainingController = require('../controllers/employeeTrainingController');
const employeeContractController = require('../controllers/employeeContractController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');
const { validate } = require('../utils/validationUtil');
const { employeeSchema } = require('../utils/validationSchemas');

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management endpoints
 */

/**
 * @swagger
 * /api/v1/employees:
 *   get:
 *     summary: Get all employees
 *     description: Retrieve a list of all employees with pagination and filtering
 *     tags: [Employees]
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
 *         description: Search term for employee name or ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, on-leave, terminated]
 *         description: Filter by employee status
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         description: Filter by branch ID
 *       - in: query
 *         name: divisionId
 *         schema:
 *           type: string
 *         description: Filter by division ID
 *       - in: query
 *         name: positionId
 *         schema:
 *           type: string
 *         description: Filter by position ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: fullName
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
 *         description: A list of employees
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
  permissionMiddleware('employee', 'read'),
  employeeController.getAllEmployees
);

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     description: Retrieve an employee by their ID
 *     tags: [Employees]
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
 *         description: Employee details
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
  '/:id',
  authMiddleware,
  permissionMiddleware('employee', 'read'),
  validate(employeeSchema.id, 'params'),
  employeeController.getEmployeeById
);

/**
 * @swagger
 * /api/v1/employees:
 *   post:
 *     summary: Create a new employee
 *     description: Create a new employee with the provided data
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeInput'
 *     responses:
 *       201:
 *         description: Employee created successfully
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
  permissionMiddleware('employee', 'create'),
  validate(employeeSchema.create),
  employeeController.createEmployee
);

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   put:
 *     summary: Update an employee
 *     description: Update an employee with the provided data
 *     tags: [Employees]
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
 *             $ref: '#/components/schemas/EmployeeUpdateInput'
 *     responses:
 *       200:
 *         description: Employee updated successfully
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
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('employee', 'update'),
  validate(employeeSchema.id, 'params'),
  validate(employeeSchema.update),
  employeeController.updateEmployee
);

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     description: Delete an employee by their ID
 *     tags: [Employees]
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
 *         description: Employee deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('employee', 'delete'),
  validate(employeeSchema.id, 'params'),
  employeeController.deleteEmployee
);

/**
 * @swagger
 * /api/v1/employees/{id}/status:
 *   patch:
 *     summary: Update employee status
 *     description: Update an employee's status
 *     tags: [Employees]
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
 *             $ref: '#/components/schemas/EmployeeStatusInput'
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
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:id/status',
  authMiddleware,
  permissionMiddleware('employee', 'update'),
  validate(employeeSchema.id, 'params'),
  validate(employeeSchema.status),
  employeeStatusController.updateEmployeeStatus
);

/**
 * @swagger
 * /api/v1/employees/{id}/status/history:
 *   get:
 *     summary: Get employee status history
 *     description: Retrieve an employee's status history
 *     tags: [Employees]
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
 *         description: Employee status history
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
  '/:id/status/history',
  authMiddleware,
  permissionMiddleware('employee', 'read'),
  validate(employeeSchema.id, 'params'),
  employeeStatusController.getEmployeeStatusHistory
);

/**
 * @swagger
 * /api/v1/employees/status/{status}:
 *   get:
 *     summary: Get employees by status
 *     description: Retrieve employees by their status
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [active, inactive, on-leave, terminated]
 *         description: Employee status
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
 *         description: List of employees with the specified status
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/status/:status',
  authMiddleware,
  permissionMiddleware('employee', 'read'),
  employeeStatusController.getEmployeesByStatus
);

/**
 * @swagger
 * /api/v1/employees/{id}/position:
 *   patch:
 *     summary: Assign employee to position
 *     description: Assign an employee to a position
 *     tags: [Employees]
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
 *             $ref: '#/components/schemas/EmployeePositionInput'
 *     responses:
 *       200:
 *         description: Position assigned successfully
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
  '/:id/position',
  authMiddleware,
  permissionMiddleware('employee', 'update'),
  validate(employeeSchema.id, 'params'),
  validate(employeeSchema.position),
  employeeAssignmentController.assignEmployeeToPosition
);

/**
 * @swagger
 * /api/v1/employees/{id}/position/history:
 *   get:
 *     summary: Get employee position history
 *     description: Retrieve an employee's position history
 *     tags: [Employees]
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
 *         description: Employee position history
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
  '/:id/position/history',
  authMiddleware,
  permissionMiddleware('employee', 'read'),
  validate(employeeSchema.id, 'params'),
  employeeAssignmentController.getEmployeePositionHistory
);

/**
 * @swagger
 * /api/v1/employees/position/{positionId}:
 *   get:
 *     summary: Get employees by position
 *     description: Retrieve employees by their position
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
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
 *         description: List of employees in the specified position
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
  '/position/:positionId',
  authMiddleware,
  permissionMiddleware('employee', 'read'),
  employeeAssignmentController.getEmployeesByPosition
);

/**
 * @swagger
 * /api/v1/employees/branch/{branchId}:
 *   get:
 *     summary: Get employees by branch
 *     description: Retrieve employees by their branch
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
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
 *         description: List of employees in the specified branch
 *       400:
 *         description: Invalid branch ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/branch/:branchId',
  authMiddleware,
  permissionMiddleware('employee', 'read'),
  employeeAssignmentController.getEmployeesByBranch
);

/**
 * @swagger
 * /api/v1/employees/division/{divisionId}:
 *   get:
 *     summary: Get employees by division
 *     description: Retrieve employees by their division
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: divisionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Division ID
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
 *         description: List of employees in the specified division
 *       400:
 *         description: Invalid division ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/division/:divisionId',
  authMiddleware,
  permissionMiddleware('employee', 'read'),
  employeeAssignmentController.getEmployeesByDivision
);

module.exports = router;
