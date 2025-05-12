/**
 * Service Area Routes
 * Defines API routes for service area management
 */

const express = require('express');
const router = express.Router();
const serviceAreaController = require('../controllers/serviceAreaController');
const { validate } = require('../utils/validationUtil');
const { serviceAreaSchema, searchSchema } = require('../utils/serviceAreaValidation');
const { authMiddleware } = require('../middleware/authMiddleware');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');

/**
 * @swagger
 * tags:
 *   name: Service Areas
 *   description: Service area management endpoints
 */

/**
 * @swagger
 * /api/v1/service-areas:
 *   get:
 *     summary: Get all service areas
 *     tags: [Service Areas]
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
 *         description: Search term for name or code
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [delivery, pickup, both]
 *         description: Filter by type
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         description: Filter by assigned branch
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name
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
 *         description: List of service areas
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'read'), 
  validate(searchSchema, 'query'), 
  serviceAreaController.getAllServiceAreas
);

/**
 * @swagger
 * /api/v1/service-areas/{id}:
 *   get:
 *     summary: Get service area by ID
 *     tags: [Service Areas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service area ID
 *     responses:
 *       200:
 *         description: Service area details
 *       404:
 *         description: Service area not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'read'), 
  validate(serviceAreaSchema.id, 'params'), 
  serviceAreaController.getServiceAreaById
);

/**
 * @swagger
 * /api/v1/service-areas:
 *   post:
 *     summary: Create a new service area
 *     tags: [Service Areas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceAreaCreate'
 *     responses:
 *       201:
 *         description: Service area created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'create'), 
  validate(serviceAreaSchema.create), 
  serviceAreaController.createServiceArea
);

/**
 * @swagger
 * /api/v1/service-areas/{id}:
 *   put:
 *     summary: Update a service area
 *     tags: [Service Areas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service area ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceAreaUpdate'
 *     responses:
 *       200:
 *         description: Service area updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service area not found
 *       500:
 *         description: Server error
 */
router.put('/:id', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'update'), 
  validate(serviceAreaSchema.id, 'params'), 
  validate(serviceAreaSchema.update), 
  serviceAreaController.updateServiceArea
);

/**
 * @swagger
 * /api/v1/service-areas/{id}:
 *   delete:
 *     summary: Delete a service area
 *     tags: [Service Areas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service area ID
 *     responses:
 *       200:
 *         description: Service area deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service area not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'delete'), 
  validate(serviceAreaSchema.id, 'params'), 
  serviceAreaController.deleteServiceArea
);

/**
 * @swagger
 * /api/v1/service-areas/{id}/status:
 *   patch:
 *     summary: Update service area status
 *     tags: [Service Areas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service area ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceAreaStatus'
 *     responses:
 *       200:
 *         description: Service area status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service area not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/status', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'update'), 
  validate(serviceAreaSchema.id, 'params'), 
  validate(serviceAreaSchema.status), 
  serviceAreaController.updateServiceAreaStatus
);

/**
 * @swagger
 * /api/v1/service-areas/{id}/branches:
 *   post:
 *     summary: Assign a branch to a service area
 *     tags: [Service Areas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service area ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceAreaBranchAssignment'
 *     responses:
 *       200:
 *         description: Branch assigned successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service area or branch not found
 *       500:
 *         description: Server error
 */
router.post('/:id/branches', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'update'), 
  validate(serviceAreaSchema.id, 'params'), 
  validate(serviceAreaSchema.assignBranch), 
  serviceAreaController.assignBranchToServiceArea
);

/**
 * @swagger
 * /api/v1/service-areas/{id}/branches/{branchId}:
 *   delete:
 *     summary: Remove a branch from a service area
 *     tags: [Service Areas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service area ID
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service area or branch not found
 *       500:
 *         description: Server error
 */
router.delete('/:id/branches/:branchId', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'update'), 
  validate(serviceAreaSchema.id, 'params'), 
  serviceAreaController.removeBranchFromServiceArea
);

/**
 * @swagger
 * /api/v1/service-areas/{id}/pricing:
 *   patch:
 *     summary: Update service area pricing
 *     tags: [Service Areas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service area ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceAreaPricing'
 *     responses:
 *       200:
 *         description: Pricing updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service area not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/pricing', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'update'), 
  validate(serviceAreaSchema.id, 'params'), 
  validate(serviceAreaSchema.pricing), 
  serviceAreaController.updateServiceAreaPricing
);

/**
 * @swagger
 * /api/v1/service-areas/point:
 *   get:
 *     summary: Check if a point is within any service area
 *     tags: [Service Areas]
 *     parameters:
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude of the point
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude of the point
 *     responses:
 *       200:
 *         description: List of service areas containing the point
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/point', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'read'), 
  validate(serviceAreaSchema.pointQuery, 'query'), 
  serviceAreaController.checkPointInServiceArea
);

/**
 * @swagger
 * /api/v1/service-areas/location:
 *   get:
 *     summary: Get service areas near a location
 *     tags: [Service Areas]
 *     parameters:
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude of the location
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude of the location
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *           default: 10
 *         description: Maximum distance in kilometers
 *     responses:
 *       200:
 *         description: List of service areas near the location
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/location', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'read'), 
  validate(serviceAreaSchema.pointQuery, 'query'), 
  serviceAreaController.getServiceAreasByLocation
);

/**
 * @swagger
 * /api/v1/service-areas/{id}/history:
 *   get:
 *     summary: Get service area history
 *     tags: [Service Areas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service area ID
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
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, update, delete, status_change, branch_assignment, pricing_update]
 *         description: Filter by action type
 *     responses:
 *       200:
 *         description: Service area history
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service area not found
 *       500:
 *         description: Server error
 */
router.get('/:id/history', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'read'), 
  validate(serviceAreaSchema.id, 'params'), 
  serviceAreaController.getServiceAreaHistory
);

/**
 * @swagger
 * /api/v1/service-areas/{id}/overlaps:
 *   get:
 *     summary: Get service areas that overlap with a specific service area
 *     tags: [Service Areas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service area ID
 *     responses:
 *       200:
 *         description: List of overlapping service areas
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service area not found
 *       500:
 *         description: Server error
 */
router.get('/:id/overlaps', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'read'), 
  validate(serviceAreaSchema.id, 'params'), 
  serviceAreaController.getServiceAreaOverlaps
);

/**
 * @swagger
 * /api/v1/service-areas/import:
 *   post:
 *     summary: Import service areas from file
 *     tags: [Service Areas]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to import (GeoJSON, CSV, KML)
 *               format:
 *                 type: string
 *                 enum: [geojson, csv, kml]
 *                 default: geojson
 *                 description: File format
 *               overwrite:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to overwrite existing service areas
 *     responses:
 *       200:
 *         description: Import results
 *       400:
 *         description: Invalid input or file
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/import', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'create'), 
  serviceAreaController.importServiceAreas
);

/**
 * @swagger
 * /api/v1/service-areas/export:
 *   get:
 *     summary: Export service areas to file
 *     tags: [Service Areas]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [geojson, csv, zip]
 *           default: geojson
 *         description: Export format
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/export', 
  authMiddleware, 
  permissionMiddleware('serviceArea', 'read'), 
  serviceAreaController.exportServiceAreas
);

module.exports = router;
