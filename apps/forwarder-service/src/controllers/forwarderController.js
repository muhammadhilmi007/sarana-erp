/**
 * Forwarder Controller
 * Handles forwarder partner management operations
 */

const Forwarder = require('../models/Forwarder');
const ForwarderHistory = require('../models/ForwarderHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get all forwarders with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getAllForwarders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      type,
      status = 'active',
      city,
      state,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortDirection };
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'companyInfo.legalName': { $regex: search, $options: 'i' } },
        { 'contactInfo.primaryContact.name': { $regex: search, $options: 'i' } },
      ];
    }
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (city) {
      query['contactInfo.address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (state) {
      query['contactInfo.address.state'] = { $regex: state, $options: 'i' };
    }
    
    // Execute query with pagination
    const forwarders = await Forwarder.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Forwarder.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        forwarders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting forwarders:', error);
    next(error);
  }
};

/**
 * Get forwarder by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    }
    
    const forwarder = await Forwarder.findById(id);
    
    if (!forwarder) {
      return res.status(404).json({
        status: 'error',
        message: 'Forwarder not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { forwarder },
    });
  } catch (error) {
    logger.error(`Error getting forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create new forwarder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createForwarder = async (req, res, next) => {
  try {
    const forwarderData = req.body;
    const userId = req.user._id;
    
    // Set created by and updated by
    forwarderData.createdBy = userId;
    forwarderData.updatedBy = userId;
    
    // Initialize status history
    forwarderData.statusHistory = [{
      status: forwarderData.status || 'active',
      reason: 'Initial creation',
      changedBy: userId,
      changedAt: new Date(),
    }];
    
    // Create forwarder
    const forwarder = await Forwarder.create(forwarderData);
    
    // Record creation in history
    await ForwarderHistory.recordCreation(forwarder._id, forwarderData, userId);
    
    res.status(201).json({
      status: 'success',
      data: { forwarder },
    });
  } catch (error) {
    logger.error('Error creating forwarder:', error);
    next(error);
  }
};

/**
 * Update forwarder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateForwarder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
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
    
    // Store old data for history
    const oldData = forwarder.toObject();
    
    // Update updatedBy
    updateData.updatedBy = userId;
    
    // Update forwarder
    Object.keys(updateData).forEach(key => {
      // Skip statusHistory, it's handled separately
      if (key !== 'statusHistory') {
        forwarder[key] = updateData[key];
      }
    });
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'general',
      oldData,
      forwarder.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { forwarder },
    });
  } catch (error) {
    logger.error(`Error updating forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete forwarder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteForwarder = async (req, res, next) => {
  try {
    const { id } = req.params;
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
    
    // Store forwarder data for history
    const forwarderData = forwarder.toObject();
    
    // Delete forwarder
    await forwarder.remove();
    
    // Record deletion in history
    await ForwarderHistory.recordDeletion(id, forwarderData, userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Forwarder deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update forwarder status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateForwarderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
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
    
    // Store old status for history
    const oldStatus = forwarder.status;
    
    // Update status and add to history
    forwarder.addStatusHistory(status, reason, userId);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record status change in history
    await ForwarderHistory.recordStatusChange(
      forwarder._id,
      oldStatus,
      status,
      reason,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { forwarder },
    });
  } catch (error) {
    logger.error(`Error updating forwarder status ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get forwarders by location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwardersByLocation = async (req, res, next) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        status: 'error',
        message: 'Longitude and latitude are required',
      });
    }
    
    // Find forwarders by location
    const forwarders = await Forwarder.findByLocation(
      parseFloat(longitude),
      parseFloat(latitude),
      parseInt(maxDistance)
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        forwarders,
        count: forwarders.length,
        center: {
          longitude: parseFloat(longitude),
          latitude: parseFloat(latitude),
        },
        maxDistance: parseInt(maxDistance),
      },
    });
  } catch (error) {
    logger.error('Error getting forwarders by location:', error);
    next(error);
  }
};

/**
 * Get forwarders by type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwardersByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    if (!type) {
      return res.status(400).json({
        status: 'error',
        message: 'Forwarder type is required',
      });
    }
    
    // Find forwarders by type
    const forwarders = await Forwarder.findByType(type);
    
    res.status(200).json({
      status: 'success',
      data: {
        forwarders,
        count: forwarders.length,
        type,
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarders by type ${req.params.type}:`, error);
    next(error);
  }
};

/**
 * Get forwarders with expiring contracts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwardersWithExpiringContracts = async (req, res, next) => {
  try {
    const { daysThreshold = 30 } = req.query;
    
    // Find forwarders with expiring contracts
    const forwarders = await Forwarder.findWithExpiringContracts(parseInt(daysThreshold));
    
    res.status(200).json({
      status: 'success',
      data: {
        forwarders,
        count: forwarders.length,
        daysThreshold: parseInt(daysThreshold),
      },
    });
  } catch (error) {
    logger.error('Error getting forwarders with expiring contracts:', error);
    next(error);
  }
};

/**
 * Get forwarder history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, startDate, endDate, page = 1, limit = 20 } = req.query;
    
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
    
    // Get history with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const history = await ForwarderHistory.getForwarderHistory(id, {
      action,
      startDate,
      endDate,
      limit: parseInt(limit),
      skip,
    });
    
    // Get total count
    const query = { forwarderId: id };
    if (action) query.action = action;
    if (startDate || endDate) {
      query.performedAt = {};
      if (startDate) query.performedAt.$gte = new Date(startDate);
      if (endDate) query.performedAt.$lte = new Date(endDate);
    }
    
    const total = await ForwarderHistory.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        history,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder history ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Search forwarders based on various criteria
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const searchForwarders = async (req, res, next) => {
  try {
    const {
      name,
      type,
      status,
      city,
      province,
      serviceLevel,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortDirection };
    
    // Build query
    const query = {};
    
    if (name) {
      query.$or = [
        { name: { $regex: name, $options: 'i' } },
        { code: { $regex: name, $options: 'i' } },
        { 'companyInfo.legalName': { $regex: name, $options: 'i' } },
      ];
    }
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (city) {
      query['contactInfo.address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (province) {
      query['contactInfo.address.state'] = { $regex: province, $options: 'i' };
    }
    
    if (serviceLevel) {
      query['serviceLevel.deliveryTimeStandard'] = { $lte: parseInt(serviceLevel) };
    }
    
    // Execute query with pagination
    const forwarders = await Forwarder.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Forwarder.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        forwarders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error searching forwarders:', error);
    next(error);
  }
};

module.exports = {
  getAllForwarders,
  getForwarderById,
  createForwarder,
  updateForwarder,
  deleteForwarder,
  updateForwarderStatus,
  getForwardersByLocation,
  getForwardersByType,
  getForwardersWithExpiringContracts,
  getForwarderHistory,
  searchForwarders,
};
