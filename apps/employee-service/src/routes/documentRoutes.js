/**
 * Document Routes
 * Defines API routes for employee document management
 */

const express = require('express');
const router = express.Router();
const employeeDocumentController = require('../controllers/employeeDocumentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');
const { validate } = require('../utils/validationUtil');
const { documentSchema } = require('../utils/validationSchemas');

/**
 * @swagger
 * tags:
 *   name: EmployeeDocuments
 *   description: Employee document management endpoints
 */

/**
 * @swagger
 * /api/v1/employees/{employeeId}/documents:
 *   post:
 *     summary: Upload employee document
 *     description: Upload a document for an employee
 *     tags: [EmployeeDocuments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentInput'
 *     responses:
 *       201:
 *         description: Document uploaded successfully
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
  '/employees/:employeeId/documents',
  authMiddleware,
  permissionMiddleware('employee.document', 'create'),
  validate(documentSchema.employeeId, 'params'),
  validate(documentSchema.create),
  employeeDocumentController.uploadDocument
);

/**
 * @swagger
 * /api/v1/employees/{employeeId}/documents:
 *   get:
 *     summary: Get employee documents
 *     description: Retrieve documents for an employee
 *     tags: [EmployeeDocuments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: query
 *         name: documentType
 *         schema:
 *           type: string
 *           enum: [ktp, npwp, ijazah, sertifikat, sim, passport, bpjs_kesehatan, bpjs_ketenagakerjaan, bank_account, contract, performance_review, training_certificate, other]
 *         description: Filter by document type
 *     responses:
 *       200:
 *         description: List of employee documents
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
  '/employees/:employeeId/documents',
  authMiddleware,
  permissionMiddleware('employee.document', 'read'),
  validate(documentSchema.employeeId, 'params'),
  employeeDocumentController.getEmployeeDocuments
);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     description: Retrieve a document by its ID
 *     tags: [EmployeeDocuments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.get(
  '/documents/:id',
  authMiddleware,
  permissionMiddleware('employee.document', 'read'),
  validate(documentSchema.id, 'params'),
  employeeDocumentController.getDocumentById
);

/**
 * @swagger
 * /api/v1/documents/{id}/verify:
 *   patch:
 *     summary: Verify document
 *     description: Verify a document
 *     tags: [EmployeeDocuments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document verified successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/documents/:id/verify',
  authMiddleware,
  permissionMiddleware('employee.document', 'update'),
  validate(documentSchema.id, 'params'),
  employeeDocumentController.verifyDocument
);

/**
 * @swagger
 * /api/v1/documents/{id}/reject:
 *   patch:
 *     summary: Reject document
 *     description: Reject a document
 *     tags: [EmployeeDocuments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentRejectInput'
 *     responses:
 *       200:
 *         description: Document rejected successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/documents/:id/reject',
  authMiddleware,
  permissionMiddleware('employee.document', 'update'),
  validate(documentSchema.id, 'params'),
  validate(documentSchema.reject),
  employeeDocumentController.rejectDocument
);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   delete:
 *     summary: Delete document
 *     description: Delete a document
 *     tags: [EmployeeDocuments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/documents/:id',
  authMiddleware,
  permissionMiddleware('employee.document', 'delete'),
  validate(documentSchema.id, 'params'),
  employeeDocumentController.deleteDocument
);

/**
 * @swagger
 * /api/v1/documents/expiring:
 *   get:
 *     summary: Get documents expiring soon
 *     description: Retrieve documents that are expiring soon
 *     tags: [EmployeeDocuments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to check for expiration
 *     responses:
 *       200:
 *         description: List of documents expiring soon
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/documents/expiring',
  authMiddleware,
  permissionMiddleware('employee.document', 'read'),
  employeeDocumentController.getDocumentsExpiringSoon
);

module.exports = router;
