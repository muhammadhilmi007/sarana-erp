/**
 * Forwarder Routes
 * Defines API routes for forwarder management
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const forwarderController = require('../controllers/forwarderController');
const forwarderCoverageController = require('../controllers/forwarderCoverageController');
const forwarderRateController = require('../controllers/forwarderRateController');
const forwarderIntegrationController = require('../controllers/forwarderIntegrationController');
const forwarderPerformanceController = require('../controllers/forwarderPerformanceController');
const forwarderAllocationController = require('../controllers/forwarderAllocationController');
const forwarderDocumentController = require('../controllers/forwarderDocumentController');
const forwarderFinancialController = require('../controllers/forwarderFinancialController');
const forwarderCommunicationController = require('../controllers/forwarderCommunicationController');
const forwarderServiceLevelController = require('../controllers/forwarderServiceLevelController');

/**
 * @swagger
 * tags:
 *   name: Forwarders
 *   description: Forwarder management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Forwarder:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *           description: Forwarder ID
 *         name:
 *           type: string
 *           description: Forwarder name
 *         code:
 *           type: string
 *           description: Forwarder unique code
 *         type:
 *           type: string
 *           enum: [national, international, regional, specialized]
 *           description: Forwarder type
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended, pending]
 *           description: Forwarder status
 *         contactInfo:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             province:
 *               type: string
 *             postalCode:
 *               type: string
 *             country:
 *               type: string
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *             website:
 *               type: string
 *             contactPerson:
 *               type: string
 *         contractDetails:
 *           type: object
 *           properties:
 *             contractNumber:
 *               type: string
 *             startDate:
 *               type: string
 *               format: date
 *             endDate:
 *               type: string
 *               format: date
 *             renewalDate:
 *               type: string
 *               format: date
 *             contractTerms:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Main forwarder routes
/**
 * @swagger
 * /api/forwarders:
 *   get:
 *     summary: Get all forwarders
 *     tags: [Forwarders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of forwarders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     forwarders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Forwarder'
 *                     count:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 */
router.get('/', authenticate, forwarderController.getAllForwarders);

/**
 * @swagger
 * /api/forwarders/search:
 *   get:
 *     summary: Search forwarders
 *     tags: [Forwarders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Forwarder name
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Forwarder type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Forwarder status
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', authenticate, forwarderController.searchForwarders);

/**
 * @swagger
 * /api/forwarders:
 *   post:
 *     summary: Create a new forwarder
 *     tags: [Forwarders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Forwarder'
 *     responses:
 *       201:
 *         description: Forwarder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     forwarder:
 *                       $ref: '#/components/schemas/Forwarder'
 */
router.post('/', authenticate, authorize(['admin', 'manager']), forwarderController.createForwarder);

/**
 * @swagger
 * /api/forwarders/{id}:
 *   get:
 *     summary: Get forwarder by ID
 *     tags: [Forwarders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Forwarder ID
 *     responses:
 *       200:
 *         description: Forwarder details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     forwarder:
 *                       $ref: '#/components/schemas/Forwarder'
 */
router.get('/:id', authenticate, forwarderController.getForwarderById);

/**
 * @swagger
 * /api/forwarders/{id}:
 *   put:
 *     summary: Update forwarder
 *     tags: [Forwarders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Forwarder ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Forwarder'
 *     responses:
 *       200:
 *         description: Forwarder updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     forwarder:
 *                       $ref: '#/components/schemas/Forwarder'
 */
router.put('/:id', authenticate, authorize(['admin', 'manager']), forwarderController.updateForwarder);

/**
 * @swagger
 * /api/forwarders/{id}:
 *   delete:
 *     summary: Delete forwarder
 *     tags: [Forwarders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Forwarder ID
 *     responses:
 *       200:
 *         description: Forwarder deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.delete('/:id', authenticate, authorize(['admin']), forwarderController.deleteForwarder);

/**
 * @swagger
 * /api/forwarders/{id}/status:
 *   patch:
 *     summary: Update forwarder status
 *     tags: [Forwarders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Forwarder ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended, pending]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Forwarder status updated successfully
 */
router.patch('/:id/status', authenticate, authorize(['admin', 'manager']), forwarderController.updateForwarderStatus);

// Forwarder coverage search route
router.get('/coverage/search', authenticate, forwarderCoverageController.searchForwardersByCoverage);

// Forwarder coverage routes
router.get('/:id/coverage', authenticate, forwarderCoverageController.getForwarderCoverageAreas);
router.post('/:id/coverage', authenticate, authorize(['admin', 'manager']), forwarderCoverageController.addCoverageArea);
router.put('/:id/coverage/:areaId', authenticate, authorize(['admin', 'manager']), forwarderCoverageController.updateCoverageArea);
router.delete('/:id/coverage/:areaId', authenticate, authorize(['admin', 'manager']), forwarderCoverageController.deleteCoverageArea);

// Forwarder rate routes
router.get('/:id/rates', authenticate, forwarderRateController.getForwarderRateCards);
router.post('/:id/rates', authenticate, authorize(['admin', 'manager']), forwarderRateController.addRateCard);
router.put('/:id/rates/:rateId', authenticate, authorize(['admin', 'manager']), forwarderRateController.updateRateCard);
router.delete('/:id/rates/:rateId', authenticate, authorize(['admin', 'manager']), forwarderRateController.deleteRateCard);
router.post('/:id/rates/:rateId/weight-breaks', authenticate, authorize(['admin', 'manager']), forwarderRateController.addWeightBreak);
router.put('/:id/rates/:rateId/weight-breaks/:breakId', authenticate, authorize(['admin', 'manager']), forwarderRateController.updateWeightBreak);
router.delete('/:id/rates/:rateId/weight-breaks/:breakId', authenticate, authorize(['admin', 'manager']), forwarderRateController.deleteWeightBreak);
router.get('/rates/compare', authenticate, forwarderRateController.compareRateCards);

// Forwarder integration routes
router.get('/:id/integrations', authenticate, forwarderIntegrationController.getForwarderIntegrations);
router.post('/:id/integrations', authenticate, authorize(['admin', 'manager']), forwarderIntegrationController.createIntegration);
router.put('/:id/integrations/:integrationId', authenticate, authorize(['admin', 'manager']), forwarderIntegrationController.updateIntegration);
router.delete('/:id/integrations/:integrationId', authenticate, authorize(['admin', 'manager']), forwarderIntegrationController.deleteIntegration);
router.get('/:id/integrations/:integrationId/logs', authenticate, forwarderIntegrationController.getIntegrationLogs);
router.post('/:id/integrations/:integrationId/test', authenticate, authorize(['admin', 'manager']), forwarderIntegrationController.testIntegrationEndpoint);

// Forwarder performance routes
router.get('/:id/performance', authenticate, forwarderPerformanceController.getForwarderPerformanceMetrics);
router.post('/:id/performance', authenticate, authorize(['admin', 'manager']), forwarderPerformanceController.updateForwarderPerformanceMetrics);
router.get('/:id/performance/reports', authenticate, forwarderPerformanceController.getForwarderPerformanceReports);
router.get('/:id/performance/report/:period', authenticate, forwarderPerformanceController.getForwarderPerformanceReport);
router.get('/:id/performance/trends', authenticate, forwarderPerformanceController.analyzeForwarderPerformanceTrends);
router.get('/performance/top', authenticate, forwarderPerformanceController.getTopPerformingForwarders);
router.get('/:id/performance/sla', authenticate, forwarderPerformanceController.getForwarderSLACompliance);

// Forwarder allocation routes
router.get('/allocations/strategies', authenticate, forwarderAllocationController.getAllAllocationStrategies);
router.get('/allocations/strategies/:id', authenticate, forwarderAllocationController.getAllocationStrategyById);
router.post('/allocations/strategies', authenticate, authorize(['admin']), forwarderAllocationController.createAllocationStrategy);
router.put('/allocations/strategies/:id', authenticate, authorize(['admin']), forwarderAllocationController.updateAllocationStrategy);
router.delete('/allocations/strategies/:id', authenticate, authorize(['admin']), forwarderAllocationController.deleteAllocationStrategy);
router.post('/allocate', authenticate, authorize(['admin', 'manager']), forwarderAllocationController.allocateShipment);
router.get('/allocations/history', authenticate, forwarderAllocationController.getAllocationHistory);
router.post('/allocations/rebalance', authenticate, authorize(['admin', 'manager']), forwarderAllocationController.rebalanceAllocations);

// Forwarder document routes
router.get('/:id/documents', authenticate, forwarderDocumentController.getForwarderDocuments);
router.post('/:id/documents', authenticate, authorize(['admin', 'manager']), forwarderDocumentController.addForwarderDocument);
router.get('/:id/documents/:documentId', authenticate, forwarderDocumentController.getForwarderDocumentById);
router.delete('/:id/documents/:documentId', authenticate, authorize(['admin', 'manager']), forwarderDocumentController.deleteForwarderDocument);
router.patch('/:id/documents/:documentId', authenticate, authorize(['admin', 'manager']), forwarderDocumentController.updateDocumentStatus);
router.get('/documents/type/:type', authenticate, forwarderDocumentController.getDocumentsByType);
router.get('/documents/expiring', authenticate, forwarderDocumentController.getDocumentsExpiringSoon);

// Forwarder financial routes
router.get('/:id/financial', authenticate, forwarderFinancialController.getForwarderFinancialDetails);
router.put('/:id/financial', authenticate, authorize(['admin', 'manager']), forwarderFinancialController.updateForwarderFinancialDetails);
router.put('/:id/financial/bank', authenticate, authorize(['admin', 'manager']), forwarderFinancialController.updateForwarderBankDetails);
router.post('/:id/financial/invoice', authenticate, authorize(['admin', 'manager']), forwarderFinancialController.recordForwarderInvoice);
router.post('/:id/financial/payment', authenticate, authorize(['admin', 'manager']), forwarderFinancialController.recordForwarderPayment);
router.put('/:id/financial/credit-limit', authenticate, authorize(['admin', 'manager']), forwarderFinancialController.updateForwarderCreditLimit);
router.get('/financial/outstanding', authenticate, forwarderFinancialController.getForwardersWithOutstandingBalance);
router.get('/financial/credit-exceeded', authenticate, forwarderFinancialController.getForwardersExceedingCreditLimit);

// Forwarder communication routes
router.get('/:id/contact', authenticate, forwarderCommunicationController.getForwarderContactInfo);
router.put('/:id/contact', authenticate, authorize(['admin', 'manager']), forwarderCommunicationController.updateForwarderContactInfo);
router.get('/:id/communications', authenticate, forwarderCommunicationController.getForwarderCommunicationLogs);
router.post('/:id/communications', authenticate, authorize(['admin', 'manager', 'support']), forwarderCommunicationController.addCommunicationLog);
router.put('/:id/communications/:logId', authenticate, authorize(['admin', 'manager', 'support']), forwarderCommunicationController.updateCommunicationLog);
router.delete('/:id/communications/:logId', authenticate, authorize(['admin', 'manager']), forwarderCommunicationController.deleteCommunicationLog);
router.get('/communications/follow-up', authenticate, forwarderCommunicationController.getFollowUpCommunicationLogs);
router.post('/:id/communications/:logId/follow-up', authenticate, authorize(['admin', 'manager', 'support']), forwarderCommunicationController.markCommunicationLogAsFollowedUp);

// Forwarder service level routes
router.get('/:id/service-level', authenticate, forwarderServiceLevelController.getForwarderServiceLevel);
router.put('/:id/service-level', authenticate, authorize(['admin', 'manager']), forwarderServiceLevelController.updateForwarderServiceLevel);
router.put('/:id/service-level/delivery-times', authenticate, authorize(['admin', 'manager']), forwarderServiceLevelController.updateDeliveryTimeStandards);
router.put('/:id/service-level/guarantees', authenticate, authorize(['admin', 'manager']), forwarderServiceLevelController.updateServiceGuarantees);
router.put('/:id/service-level/package-limitations', authenticate, authorize(['admin', 'manager']), forwarderServiceLevelController.updatePackageLimitations);
router.post('/service-level/compare', authenticate, forwarderServiceLevelController.compareServiceLevels);
router.get('/service-level/capabilities', authenticate, forwarderServiceLevelController.getForwardersByServiceCapabilities);

module.exports = router;
