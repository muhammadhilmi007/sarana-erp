/**
 * Forwarder Coverage Controller
 * Handles forwarder coverage area management operations
 */

const Forwarder = require('../models/Forwarder');
const ForwarderHistory = require('../models/ForwarderHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get forwarder coverage areas
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderCoverageAreas = async (req, res, next) => {
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
        coverageAreas: forwarder.coverageAreas || [],
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder coverage areas ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add coverage area to forwarder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addCoverageArea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coverageAreaData = req.body;
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
    
    // Check if coverage area with same code already exists
    const existingArea = forwarder.coverageAreas.find(
      area => area.code === coverageAreaData.code
    );
    
    if (existingArea) {
      return res.status(400).json({
        status: 'error',
        message: 'Coverage area with this code already exists',
      });
    }
    
    // Add coverage area
    forwarder.addCoverageArea(coverageAreaData);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordCoverageUpdate(
      forwarder._id,
      'add',
      null,
      coverageAreaData,
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        coverageArea: forwarder.coverageAreas[forwarder.coverageAreas.length - 1],
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error adding coverage area to forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update forwarder coverage area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateCoverageArea = async (req, res, next) => {
  try {
    const { id, areaId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(areaId)) {
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
    
    // Find coverage area
    const coverageArea = forwarder.coverageAreas.id(areaId);
    
    if (!coverageArea) {
      return res.status(404).json({
        status: 'error',
        message: 'Coverage area not found',
      });
    }
    
    // Store old data for history
    const oldData = coverageArea.toObject();
    
    // Update coverage area
    forwarder.updateCoverageArea(areaId, updateData);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Get updated coverage area
    const updatedCoverageArea = forwarder.coverageAreas.id(areaId);
    
    // Record update in history
    await ForwarderHistory.recordCoverageUpdate(
      forwarder._id,
      'update',
      oldData,
      updatedCoverageArea.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        coverageArea: updatedCoverageArea,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating coverage area ${req.params.areaId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete forwarder coverage area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteCoverageArea = async (req, res, next) => {
  try {
    const { id, areaId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(areaId)) {
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
    
    // Find coverage area
    const coverageArea = forwarder.coverageAreas.id(areaId);
    
    if (!coverageArea) {
      return res.status(404).json({
        status: 'error',
        message: 'Coverage area not found',
      });
    }
    
    // Store old data for history
    const oldData = coverageArea.toObject();
    
    // Remove coverage area
    forwarder.removeCoverageArea(areaId);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordCoverageUpdate(
      forwarder._id,
      'remove',
      oldData,
      null,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Coverage area deleted successfully',
      data: {
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error deleting coverage area ${req.params.areaId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get forwarders by coverage area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwardersByCoverageArea = async (req, res, next) => {
  try {
    const { areaCode } = req.params;
    
    if (!areaCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Area code is required',
      });
    }
    
    // Find forwarders by coverage area
    const forwarders = await Forwarder.findByCoverageArea(areaCode);
    
    res.status(200).json({
      status: 'success',
      data: {
        forwarders,
        count: forwarders.length,
        areaCode,
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarders by coverage area ${req.params.areaCode}:`, error);
    next(error);
  }
};

/**
 * Update coverage area status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateCoverageAreaStatus = async (req, res, next) => {
  try {
    const { id, areaId } = req.params;
    const { isActive } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(areaId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    if (isActive === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'isActive status is required',
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
    
    // Find coverage area
    const coverageArea = forwarder.coverageAreas.id(areaId);
    
    if (!coverageArea) {
      return res.status(404).json({
        status: 'error',
        message: 'Coverage area not found',
      });
    }
    
    // Store old data for history
    const oldData = coverageArea.toObject();
    
    // Update coverage area status
    forwarder.updateCoverageArea(areaId, { isActive });
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Get updated coverage area
    const updatedCoverageArea = forwarder.coverageAreas.id(areaId);
    
    // Record update in history
    await ForwarderHistory.recordCoverageUpdate(
      forwarder._id,
      'status',
      oldData,
      updatedCoverageArea.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        coverageArea: updatedCoverageArea,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating coverage area status ${req.params.areaId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Search forwarders by coverage area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const searchForwardersByCoverage = async (req, res, next) => {
  try {
    const { province, city, postalCode, serviceLevel } = req.query;
    
    // Build query
    const query = { status: 'active' };
    
    if (province) {
      query['coverageAreas.name'] = province;
      query['coverageAreas.type'] = 'province';
    }
    
    if (city) {
      query['coverageAreas.name'] = city;
      query['coverageAreas.type'] = 'city';
    }
    
    if (postalCode) {
      query['coverageAreas.postalCode'] = postalCode;
    }
    
    if (serviceLevel) {
      query['coverageAreas.serviceLevel'] = serviceLevel;
    }
    
    // Find forwarders
    const forwarders = await Forwarder.find(query)
      .select('name code type coverageAreas')
      .sort({ name: 1 });
    
    res.status(200).json({
      status: 'success',
      data: {
        forwarders,
        count: forwarders.length,
      },
    });
  } catch (error) {
    logger.error('Error searching forwarders by coverage:', error);
    next(error);
  }
};

module.exports = {
  getForwarderCoverageAreas,
  addCoverageArea,
  updateCoverageArea,
  deleteCoverageArea,
  getForwardersByCoverageArea,
  updateCoverageAreaStatus,
  searchForwardersByCoverage,
};
