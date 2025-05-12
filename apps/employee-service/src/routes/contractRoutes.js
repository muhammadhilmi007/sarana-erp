/**
 * Contract Routes
 * Defines API routes for employee contract management
 */

const express = require('express');
const router = express.Router();
const employeeContractController = require('../controllers/employeeContractController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');
const { validate } = require('../utils/validationUtil');
const { contractSchema } = require('../utils/validationSchemas');

/**
 * @swagger
 * tags:
 *   name: EmployeeContracts
 *   description: Employee contract management endpoints
 */

/**
 * @swagger
 * /api/v1/employees/{id}/contracts:
 *   post:
 *     summary: Add employee contract
 *     description: Add a new contract for an employee
 *     tags: [EmployeeContracts]
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
 *             $ref: '#/components/schemas/ContractInput'
 *     responses:
 *       201:
 *         description: Contract added successfully
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
  '/employees/:id/contracts',
  authMiddleware,
  permissionMiddleware('employee.contract', 'create'),
  validate(contractSchema.employeeId, 'params'),
  validate(contractSchema.create),
  employeeContractController.addContract
);

/**
 * @swagger
 * /api/v1/employees/{id}/contracts/{contractId}:
 *   put:
 *     summary: Update employee contract
 *     description: Update an employee contract
 *     tags: [EmployeeContracts]
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
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractUpdateInput'
 *     responses:
 *       200:
 *         description: Contract updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or contract not found
 *       500:
 *         description: Server error
 */
router.put(
  '/employees/:id/contracts/:contractId',
  authMiddleware,
  permissionMiddleware('employee.contract', 'update'),
  validate(contractSchema.employeeId, 'params'),
  validate(contractSchema.contractId, 'params'),
  validate(contractSchema.update),
  employeeContractController.updateContractDetails
);

/**
 * @swagger
 * /api/v1/employees/{id}/contracts/{contractId}/status:
 *   patch:
 *     summary: Update contract status
 *     description: Update the status of an employee contract
 *     tags: [EmployeeContracts]
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
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractStatusInput'
 *     responses:
 *       200:
 *         description: Contract status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or contract not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/employees/:id/contracts/:contractId/status',
  authMiddleware,
  permissionMiddleware('employee.contract', 'update'),
  validate(contractSchema.employeeId, 'params'),
  validate(contractSchema.contractId, 'params'),
  validate(contractSchema.status),
  employeeContractController.updateContractStatus
);

/**
 * @swagger
 * /api/v1/employees/{id}/contracts:
 *   get:
 *     summary: Get employee contracts
 *     description: Retrieve contracts for an employee
 *     tags: [EmployeeContracts]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, terminated, draft]
 *         description: Filter by contract status
 *     responses:
 *       200:
 *         description: List of employee contracts
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
  '/employees/:id/contracts',
  authMiddleware,
  permissionMiddleware('employee.contract', 'read'),
  validate(contractSchema.employeeId, 'params'),
  employeeContractController.getEmployeeContracts
);

/**
 * @swagger
 * /api/v1/employees/{id}/contracts/{contractId}:
 *   get:
 *     summary: Get contract by ID
 *     description: Retrieve a contract by its ID
 *     tags: [EmployeeContracts]
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
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     responses:
 *       200:
 *         description: Contract details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee or contract not found
 *       500:
 *         description: Server error
 */
router.get(
  '/employees/:id/contracts/:contractId',
  authMiddleware,
  permissionMiddleware('employee.contract', 'read'),
  validate(contractSchema.employeeId, 'params'),
  validate(contractSchema.contractId, 'params'),
  employeeContractController.getContractById
);

/**
 * @swagger
 * /api/v1/employees/contracts/expiring:
 *   get:
 *     summary: Get contracts expiring soon
 *     description: Retrieve contracts that are expiring soon
 *     tags: [EmployeeContracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to check for expiration
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
 *         description: List of contracts expiring soon
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/employees/contracts/expiring',
  authMiddleware,
  permissionMiddleware('employee.contract', 'read'),
  employeeContractController.getContractsExpiringSoon
);

/**
 * @swagger
 * /api/v1/employees/contracts/statistics:
 *   get:
 *     summary: Get contract statistics
 *     description: Get contract statistics for employees
 *     tags: [EmployeeContracts]
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
 *         description: Contract statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/employees/contracts/statistics',
  authMiddleware,
  permissionMiddleware('employee.contract', 'read'),
  employeeContractController.getContractStatistics
);

module.exports = router;
