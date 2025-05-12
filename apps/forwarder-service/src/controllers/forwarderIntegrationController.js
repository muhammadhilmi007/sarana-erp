/**
 * Forwarder Integration Controller
 * Handles forwarder integration points with API adapters
 */

const Forwarder = require('../models/Forwarder');
const ForwarderIntegration = require('../models/ForwarderIntegration');
const ForwarderHistory = require('../models/ForwarderHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get forwarder integrations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderIntegrations = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    }
    
    // Find forwarder
    const forwarder = await Forwarder.findById(id);
    
    if (!forwarder) {
      return res.status(404).json({
        status: 'error',
        message: 'Forwarder not found',
      });
    }
    
    // Find integrations for this forwarder
    const integrations = await ForwarderIntegration.findByForwarder(id);
    
    res.status(200).json({
      status: 'success',
      data: {
        integrations,
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder integrations ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get integration by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getIntegrationById = async (req, res, next) => {
  try {
    const { id, integrationId } = req.params;
    
    if (!isValidObjectId(id) || !isValidObjectId(integrationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find integration
    const integration = await ForwarderIntegration.findById(integrationId);
    
    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }
    
    // Verify forwarder ID
    if (integration.forwarderId.toString() !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Integration does not belong to this forwarder',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        integration,
      },
    });
  } catch (error) {
    logger.error(`Error getting integration ${req.params.integrationId}:`, error);
    next(error);
  }
};

/**
 * Create forwarder integration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createIntegration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const integrationData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    }
    
    // Find forwarder
    const forwarder = await Forwarder.findById(id);
    
    if (!forwarder) {
      return res.status(404).json({
        status: 'error',
        message: 'Forwarder not found',
      });
    }
    
    // Set forwarder ID and metadata
    integrationData.forwarderId = id;
    integrationData.createdBy = userId;
    integrationData.updatedBy = userId;
    
    // Initialize status history
    integrationData.statusHistory = [{
      status: integrationData.status || 'testing',
      reason: 'Initial creation',
      changedBy: userId,
      changedAt: new Date(),
    }];
    
    // Create integration
    const integration = await ForwarderIntegration.create(integrationData);
    
    // Update forwarder integration details
    forwarder.integration = {
      ...forwarder.integration,
      apiEnabled: true,
      isActive: true,
      lastSyncTime: new Date(),
    };
    
    forwarder.updatedBy = userId;
    await forwarder.save();
    
    // Record update in forwarder history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'integration',
      { integration: forwarder.integration },
      { integration: forwarder.integration },
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        integration,
      },
    });
  } catch (error) {
    logger.error(`Error creating integration for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update forwarder integration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateIntegration = async (req, res, next) => {
  try {
    const { id, integrationId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(integrationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find integration
    const integration = await ForwarderIntegration.findById(integrationId);
    
    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }
    
    // Verify forwarder ID
    if (integration.forwarderId.toString() !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Integration does not belong to this forwarder',
      });
    }
    
    // Update integration
    updateData.updatedBy = userId;
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      // Skip statusHistory, it's handled separately
      if (key !== 'statusHistory') {
        integration[key] = updateData[key];
      }
    });
    
    await integration.save();
    
    // Update forwarder integration details if status changed
    if (updateData.status) {
      const forwarder = await Forwarder.findById(id);
      
      if (forwarder) {
        forwarder.integration = {
          ...forwarder.integration,
          isActive: updateData.status === 'active',
          lastSyncTime: new Date(),
        };
        
        forwarder.updatedBy = userId;
        await forwarder.save();
        
        // Record update in forwarder history
        await ForwarderHistory.recordUpdate(
          forwarder._id,
          'integration',
          { integration: forwarder.integration },
          { integration: forwarder.integration },
          userId
        );
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        integration,
      },
    });
  } catch (error) {
    logger.error(`Error updating integration ${req.params.integrationId}:`, error);
    next(error);
  }
};

/**
 * Delete forwarder integration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteIntegration = async (req, res, next) => {
  try {
    const { id, integrationId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(integrationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find integration
    const integration = await ForwarderIntegration.findById(integrationId);
    
    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }
    
    // Verify forwarder ID
    if (integration.forwarderId.toString() !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Integration does not belong to this forwarder',
      });
    }
    
    // Delete integration
    await integration.remove();
    
    // Update forwarder integration details
    const forwarder = await Forwarder.findById(id);
    
    if (forwarder) {
      // Check if there are any other active integrations
      const activeIntegrations = await ForwarderIntegration.find({
        forwarderId: id,
        status: 'active',
      });
      
      forwarder.integration = {
        ...forwarder.integration,
        apiEnabled: activeIntegrations.length > 0,
        isActive: activeIntegrations.length > 0,
      };
      
      forwarder.updatedBy = userId;
      await forwarder.save();
      
      // Record update in forwarder history
      await ForwarderHistory.recordUpdate(
        forwarder._id,
        'integration',
        { integration: forwarder.integration },
        { integration: forwarder.integration },
        userId
      );
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Integration deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting integration ${req.params.integrationId}:`, error);
    next(error);
  }
};

/**
 * Update integration status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateIntegrationStatus = async (req, res, next) => {
  try {
    const { id, integrationId } = req.params;
    const { status, reason } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(integrationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find integration
    const integration = await ForwarderIntegration.findById(integrationId);
    
    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }
    
    // Verify forwarder ID
    if (integration.forwarderId.toString() !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Integration does not belong to this forwarder',
      });
    }
    
    // Store old status for history
    const oldStatus = integration.status;
    
    // Update status and add to history
    integration.addStatusHistory(status, reason, userId);
    integration.updatedBy = userId;
    
    await integration.save();
    
    // Update forwarder integration details
    const forwarder = await Forwarder.findById(id);
    
    if (forwarder) {
      forwarder.integration = {
        ...forwarder.integration,
        isActive: status === 'active',
        lastSyncTime: new Date(),
      };
      
      forwarder.updatedBy = userId;
      await forwarder.save();
      
      // Record update in forwarder history
      await ForwarderHistory.recordUpdate(
        forwarder._id,
        'integration',
        { integration: forwarder.integration },
        { integration: forwarder.integration },
        userId
      );
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        integration,
      },
    });
  } catch (error) {
    logger.error(`Error updating integration status ${req.params.integrationId}:`, error);
    next(error);
  }
};

/**
 * Add endpoint mapping to integration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addEndpointMapping = async (req, res, next) => {
  try {
    const { id, integrationId } = req.params;
    const mappingData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(integrationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find integration
    const integration = await ForwarderIntegration.findById(integrationId);
    
    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }
    
    // Verify forwarder ID
    if (integration.forwarderId.toString() !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Integration does not belong to this forwarder',
      });
    }
    
    // Add endpoint mapping
    integration.addEndpointMapping(mappingData);
    integration.updatedBy = userId;
    
    await integration.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        endpointMapping: integration.endpointMappings[integration.endpointMappings.length - 1],
        integration,
      },
    });
  } catch (error) {
    logger.error(`Error adding endpoint mapping to integration ${req.params.integrationId}:`, error);
    next(error);
  }
};

/**
 * Update endpoint mapping
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateEndpointMapping = async (req, res, next) => {
  try {
    const { id, integrationId, mappingId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(integrationId) || !isValidObjectId(mappingId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find integration
    const integration = await ForwarderIntegration.findById(integrationId);
    
    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }
    
    // Verify forwarder ID
    if (integration.forwarderId.toString() !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Integration does not belong to this forwarder',
      });
    }
    
    // Find endpoint mapping
    const mapping = integration.endpointMappings.id(mappingId);
    
    if (!mapping) {
      return res.status(404).json({
        status: 'error',
        message: 'Endpoint mapping not found',
      });
    }
    
    // Update endpoint mapping
    integration.updateEndpointMapping(mappingId, updateData);
    integration.updatedBy = userId;
    
    await integration.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        endpointMapping: integration.endpointMappings.id(mappingId),
        integration,
      },
    });
  } catch (error) {
    logger.error(`Error updating endpoint mapping ${req.params.mappingId} for integration ${req.params.integrationId}:`, error);
    next(error);
  }
};

/**
 * Delete endpoint mapping
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteEndpointMapping = async (req, res, next) => {
  try {
    const { id, integrationId, mappingId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(integrationId) || !isValidObjectId(mappingId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find integration
    const integration = await ForwarderIntegration.findById(integrationId);
    
    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }
    
    // Verify forwarder ID
    if (integration.forwarderId.toString() !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Integration does not belong to this forwarder',
      });
    }
    
    // Find endpoint mapping
    const mapping = integration.endpointMappings.id(mappingId);
    
    if (!mapping) {
      return res.status(404).json({
        status: 'error',
        message: 'Endpoint mapping not found',
      });
    }
    
    // Remove endpoint mapping
    integration.removeEndpointMapping(mappingId);
    integration.updatedBy = userId;
    
    await integration.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Endpoint mapping deleted successfully',
      data: {
        integration,
      },
    });
  } catch (error) {
    logger.error(`Error deleting endpoint mapping ${req.params.mappingId} for integration ${req.params.integrationId}:`, error);
    next(error);
  }
};

/**
 * Add integration log
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addIntegrationLog = async (req, res, next) => {
  try {
    const { id, integrationId } = req.params;
    const logData = req.body;
    
    if (!isValidObjectId(id) || !isValidObjectId(integrationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find integration
    const integration = await ForwarderIntegration.findById(integrationId);
    
    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }
    
    // Verify forwarder ID
    if (integration.forwarderId.toString() !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Integration does not belong to this forwarder',
      });
    }
    
    // Add integration log
    integration.addIntegrationLog(logData);
    
    await integration.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        log: integration.integrationLogs[integration.integrationLogs.length - 1],
      },
    });
  } catch (error) {
    logger.error(`Error adding integration log to integration ${req.params.integrationId}:`, error);
    next(error);
  }
};

/**
 * Get integration logs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getIntegrationLogs = async (req, res, next) => {
  try {
    const { id, integrationId } = req.params;
    const { status, operation, startDate, endDate, limit = 100 } = req.query;
    
    if (!isValidObjectId(id) || !isValidObjectId(integrationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find integration
    const integration = await ForwarderIntegration.findById(integrationId);
    
    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }
    
    // Verify forwarder ID
    if (integration.forwarderId.toString() !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Integration does not belong to this forwarder',
      });
    }
    
    // Filter logs
    let logs = integration.integrationLogs || [];
    
    if (status) {
      logs = logs.filter(log => log.status === status);
    }
    
    if (operation) {
      logs = logs.filter(log => log.operation === operation);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      logs = logs.filter(log => log.timestamp >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      logs = logs.filter(log => log.timestamp <= end);
    }
    
    // Sort by timestamp (descending)
    logs.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply limit
    logs = logs.slice(0, parseInt(limit));
    
    res.status(200).json({
      status: 'success',
      data: {
        logs,
        count: logs.length,
      },
    });
  } catch (error) {
    logger.error(`Error getting integration logs for integration ${req.params.integrationId}:`, error);
    next(error);
  }
};

/**
 * Test integration endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const testIntegrationEndpoint = async (req, res, next) => {
  try {
    const { id, integrationId, mappingId } = req.params;
    const testData = req.body;
    
    if (!isValidObjectId(id) || !isValidObjectId(integrationId) || !isValidObjectId(mappingId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find integration
    const integration = await ForwarderIntegration.findById(integrationId);
    
    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      });
    }
    
    // Verify forwarder ID
    if (integration.forwarderId.toString() !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Integration does not belong to this forwarder',
      });
    }
    
    // Find endpoint mapping
    const mapping = integration.endpointMappings.id(mappingId);
    
    if (!mapping) {
      return res.status(404).json({
        status: 'error',
        message: 'Endpoint mapping not found',
      });
    }
    
    // Check if using mock
    if (mapping.useMock) {
      // Return mock response
      return res.status(200).json({
        status: 'success',
        data: {
          response: mapping.mockResponse ? JSON.parse(mapping.mockResponse) : { message: 'Mock response' },
          isMock: true,
        },
      });
    }
    
    // In a real implementation, this would make an actual API call to the forwarder's endpoint
    // For now, we'll simulate a successful response
    const simulatedResponse = {
      success: true,
      data: {
        requestId: `test-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'processed',
      },
    };
    
    // Add integration log
    integration.addIntegrationLog({
      operation: mapping.operationType,
      endpoint: mapping.endpoint,
      requestData: testData,
      responseData: simulatedResponse,
      status: 'success',
      processingTime: 150, // milliseconds
      ipAddress: req.ip,
    });
    
    await integration.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        response: simulatedResponse,
        isMock: false,
      },
    });
  } catch (error) {
    logger.error(`Error testing endpoint mapping ${req.params.mappingId} for integration ${req.params.integrationId}:`, error);
    
    // Add integration log for error
    try {
      const integration = await ForwarderIntegration.findById(req.params.integrationId);
      
      if (integration) {
        integration.addIntegrationLog({
          operation: 'test',
          endpoint: req.params.mappingId,
          requestData: req.body,
          status: 'error',
          errorMessage: error.message,
          processingTime: 0,
          ipAddress: req.ip,
        });
        
        await integration.save();
      }
    } catch (logError) {
      logger.error('Error saving integration log:', logError);
    }
    
    next(error);
  }
};

module.exports = {
  getForwarderIntegrations,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  updateIntegrationStatus,
  addEndpointMapping,
  updateEndpointMapping,
  deleteEndpointMapping,
  addIntegrationLog,
  getIntegrationLogs,
  testIntegrationEndpoint,
};
