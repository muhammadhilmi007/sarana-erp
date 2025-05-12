/**
 * Forwarder Communication Controller
 * Handles forwarder contact information and communication log operations
 */

const Forwarder = require('../models/Forwarder');
const ForwarderHistory = require('../models/ForwarderHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get forwarder contact information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderContactInfo = async (req, res, next) => {
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
    
    res.status(200).json({
      status: 'success',
      data: {
        contactInfo: forwarder.contactInfo || {},
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder contact info ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update forwarder contact information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateForwarderContactInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contactData = req.body;
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
    
    // Store old contact info for history
    const oldContactInfo = { ...forwarder.contactInfo };
    
    // Update contact information
    forwarder.contactInfo = {
      ...forwarder.contactInfo,
      ...contactData,
    };
    
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'contactInfo',
      oldContactInfo,
      forwarder.contactInfo,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        contactInfo: forwarder.contactInfo,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating forwarder contact info ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get forwarder communication logs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderCommunicationLogs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, startDate, endDate, limit = 20 } = req.query;
    
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
    
    // Filter communication logs
    let logs = forwarder.communicationLogs || [];
    
    if (type) {
      logs = logs.filter(log => log.type === type);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      logs = logs.filter(log => log.date >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      logs = logs.filter(log => log.date <= end);
    }
    
    // Sort by date (descending)
    logs.sort((a, b) => b.date - a.date);
    
    // Apply limit
    logs = logs.slice(0, parseInt(limit));
    
    res.status(200).json({
      status: 'success',
      data: {
        communicationLogs: logs,
        count: logs.length,
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder communication logs ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add communication log to forwarder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addCommunicationLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const logData = req.body;
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
    
    // Set recorded by
    logData.recordedBy = userId;
    
    // Add communication log
    forwarder.addCommunicationLog(logData);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        communicationLog: forwarder.communicationLogs[forwarder.communicationLogs.length - 1],
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error adding communication log to forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update communication log
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateCommunicationLog = async (req, res, next) => {
  try {
    const { id, logId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(logId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
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
    
    // Find communication log
    const log = forwarder.communicationLogs.id(logId);
    
    if (!log) {
      return res.status(404).json({
        status: 'error',
        message: 'Communication log not found',
      });
    }
    
    // Update communication log
    Object.keys(updateData).forEach(key => {
      // Don't update date, recordedBy
      if (key !== 'date' && key !== 'recordedBy') {
        log[key] = updateData[key];
      }
    });
    
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        communicationLog: log,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating communication log ${req.params.logId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete communication log
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteCommunicationLog = async (req, res, next) => {
  try {
    const { id, logId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(logId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
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
    
    // Find communication log
    const log = forwarder.communicationLogs.id(logId);
    
    if (!log) {
      return res.status(404).json({
        status: 'error',
        message: 'Communication log not found',
      });
    }
    
    // Remove communication log
    log.remove();
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Communication log deleted successfully',
      data: {
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error deleting communication log ${req.params.logId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get communication logs with follow-up required
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getFollowUpCommunicationLogs = async (req, res, next) => {
  try {
    // Find forwarders with follow-up required
    const forwarders = await Forwarder.find({
      'communicationLogs.followUpRequired': true,
      status: 'active',
    });
    
    // Extract logs requiring follow-up
    const followUpLogs = [];
    
    forwarders.forEach(forwarder => {
      const logs = forwarder.communicationLogs
        .filter(log => log.followUpRequired)
        .map(log => ({
          ...log.toObject(),
          forwarderId: forwarder._id,
          forwarderName: forwarder.name,
          forwarderCode: forwarder.code,
          daysUntilFollowUp: log.followUpDate ? 
            Math.ceil((log.followUpDate - new Date()) / (1000 * 60 * 60 * 24)) : 
            null,
        }));
      
      followUpLogs.push(...logs);
    });
    
    // Sort by follow-up date (ascending)
    followUpLogs.sort((a, b) => {
      if (!a.followUpDate) return 1;
      if (!b.followUpDate) return -1;
      return a.followUpDate - b.followUpDate;
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        followUpLogs,
        count: followUpLogs.length,
      },
    });
  } catch (error) {
    logger.error('Error getting follow-up communication logs:', error);
    next(error);
  }
};

/**
 * Mark communication log as followed up
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const markCommunicationLogAsFollowedUp = async (req, res, next) => {
  try {
    const { id, logId } = req.params;
    const { outcome, notes } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(logId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
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
    
    // Find communication log
    const log = forwarder.communicationLogs.id(logId);
    
    if (!log) {
      return res.status(404).json({
        status: 'error',
        message: 'Communication log not found',
      });
    }
    
    // Update communication log
    log.followUpRequired = false;
    
    if (outcome) {
      log.outcome = outcome;
    }
    
    if (notes) {
      log.summary = log.summary ? `${log.summary}\n\nFollow-up: ${notes}` : `Follow-up: ${notes}`;
    }
    
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        communicationLog: log,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error marking communication log as followed up ${req.params.logId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

module.exports = {
  getForwarderContactInfo,
  updateForwarderContactInfo,
  getForwarderCommunicationLogs,
  addCommunicationLog,
  updateCommunicationLog,
  deleteCommunicationLog,
  getFollowUpCommunicationLogs,
  markCommunicationLogAsFollowedUp,
};
