/**
 * Position Controller
 * Handles position management operations
 */

const Position = require('../models/Position');
const PositionHistory = require('../models/PositionHistory');
const Division = require('../models/Division');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get all positions with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getAllPositions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'active',
      divisionId,
      salaryGrade,
      isVacant,
      sortBy = 'title',
      sortOrder = 'asc',
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortDirection };
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (divisionId) {
      if (!isValidObjectId(divisionId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid division ID',
        });
      }
      query.divisionId = divisionId;
    }
    
    if (salaryGrade) {
      query.salaryGrade = salaryGrade;
    }
    
    if (isVacant !== undefined) {
      query.isVacant = isVacant === 'true';
    }
    
    // Execute query with pagination
    const positions = await Position.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reportingTo', 'title code')
      .populate('divisionId', 'name code');
    
    // Get total count
    const total = await Position.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        positions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting positions:', error);
    next(error);
  }
};

/**
 * Get position by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getPositionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    const position = await Position.findById(id)
      .populate('reportingTo', 'title code')
      .populate('divisionId', 'name code');
    
    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { position },
    });
  } catch (error) {
    logger.error(`Error getting position ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create new position
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createPosition = async (req, res, next) => {
  try {
    const positionData = req.body;
    const userId = req.user._id;
    
    // Check if reporting position exists if reportingTo is provided
    if (positionData.reportingTo) {
      if (!isValidObjectId(positionData.reportingTo)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid reporting position ID',
        });
      }
      
      const reportingPosition = await Position.findById(positionData.reportingTo);
      if (!reportingPosition) {
        return res.status(404).json({
          status: 'error',
          message: 'Reporting position not found',
        });
      }
    }
    
    // Check if division exists
    if (!isValidObjectId(positionData.divisionId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid division ID',
      });
    }
    
    const division = await Division.findById(positionData.divisionId);
    if (!division) {
      return res.status(404).json({
        status: 'error',
        message: 'Division not found',
      });
    }
    
    // Set created by and updated by
    positionData.createdBy = userId;
    positionData.updatedBy = userId;
    
    // Initialize status history
    positionData.statusHistory = [{
      status: positionData.status || 'active',
      reason: 'Initial creation',
      changedBy: userId,
      changedAt: new Date(),
    }];
    
    // Create position
    const position = await Position.create(positionData);
    
    // Record creation in history
    await PositionHistory.recordCreation(position._id, position.toObject(), userId);
    
    res.status(201).json({
      status: 'success',
      data: { position },
    });
  } catch (error) {
    logger.error('Error creating position:', error);
    next(error);
  }
};

/**
 * Update position
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updatePosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    // Find position
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found',
      });
    }
    
    // Check if reporting position exists if reportingTo is provided
    if (updateData.reportingTo) {
      if (!isValidObjectId(updateData.reportingTo)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid reporting position ID',
        });
      }
      
      // Prevent circular reference
      if (updateData.reportingTo.toString() === id) {
        return res.status(400).json({
          status: 'error',
          message: 'Position cannot report to itself',
        });
      }
      
      const reportingPosition = await Position.findById(updateData.reportingTo);
      if (!reportingPosition) {
        return res.status(404).json({
          status: 'error',
          message: 'Reporting position not found',
        });
      }
      
      // Check if the new reporting position is not a subordinate of this position
      const subordinates = await position.getAllSubordinates();
      const isSubordinate = subordinates.some(s => s._id.toString() === updateData.reportingTo.toString());
      if (isSubordinate) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot report to a subordinate position',
        });
      }
      
      // Record reporting line change
      if (position.reportingTo?.toString() !== updateData.reportingTo.toString()) {
        await PositionHistory.recordReportingChange(
          position._id,
          position.reportingTo,
          updateData.reportingTo,
          userId
        );
      }
    }
    
    // Check if division exists if divisionId is provided
    if (updateData.divisionId) {
      if (!isValidObjectId(updateData.divisionId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid division ID',
        });
      }
      
      const division = await Division.findById(updateData.divisionId);
      if (!division) {
        return res.status(404).json({
          status: 'error',
          message: 'Division not found',
        });
      }
    }
    
    // Store original values for history
    const originalPosition = position.toObject();
    
    // Update fields
    const fieldsToUpdate = [
      'title', 'code', 'description', 'reportingTo', 'divisionId', 
      'salaryGrade', 'salaryRange', 'benefits'
    ];
    
    for (const field of fieldsToUpdate) {
      if (updateData[field] !== undefined) {
        // Record change in history if value is different
        if (JSON.stringify(position[field]) !== JSON.stringify(updateData[field])) {
          await PositionHistory.recordUpdate(
            position._id,
            field,
            position[field],
            updateData[field],
            userId
          );
        }
        position[field] = updateData[field];
      }
    }
    
    // Update requirements if provided
    if (updateData.requirements) {
      await PositionHistory.recordUpdate(
        position._id,
        'requirements',
        position.requirements,
        updateData.requirements,
        userId
      );
      position.requirements = updateData.requirements;
    }
    
    // Update responsibilities if provided
    if (updateData.responsibilities) {
      await PositionHistory.recordUpdate(
        position._id,
        'responsibilities',
        position.responsibilities,
        updateData.responsibilities,
        userId
      );
      position.responsibilities = updateData.responsibilities;
    }
    
    // Update authorities if provided
    if (updateData.authorities) {
      await PositionHistory.recordUpdate(
        position._id,
        'authorities',
        position.authorities,
        updateData.authorities,
        userId
      );
      position.authorities = updateData.authorities;
    }
    
    // Update vacancy status if provided
    if (updateData.isVacant !== undefined || updateData.headcount) {
      const oldVacancy = {
        isVacant: position.isVacant,
        headcount: { ...position.headcount.toObject() },
      };
      
      if (updateData.isVacant !== undefined) {
        position.isVacant = updateData.isVacant;
      }
      
      if (updateData.headcount) {
        position.headcount = {
          ...position.headcount.toObject(),
          ...updateData.headcount,
        };
      }
      
      const newVacancy = {
        isVacant: position.isVacant,
        headcount: position.headcount,
      };
      
      await PositionHistory.recordVacancyChange(
        position._id,
        oldVacancy,
        newVacancy,
        userId
      );
    }
    
    // Update updatedBy
    position.updatedBy = userId;
    
    // Save position
    await position.save();
    
    res.status(200).json({
      status: 'success',
      data: { position },
    });
  } catch (error) {
    logger.error(`Error updating position ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete position
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deletePosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    // Find position
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found',
      });
    }
    
    // Check if position has direct reports
    const directReports = await position.getDirectReports();
    if (directReports.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete position with direct reports',
      });
    }
    
    // Check if position is a division head
    const divisionAsHead = await Division.findOne({ headPositionId: id });
    if (divisionAsHead) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete position that is a division head',
      });
    }
    
    // Store position data for history
    const positionData = position.toObject();
    
    // Delete position
    await position.deleteOne();
    
    // Record deletion in history
    await PositionHistory.recordDeletion(id, positionData, userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Position deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting position ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update position status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updatePositionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    // Find position
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found',
      });
    }
    
    // Check if status is different
    if (position.status === status) {
      return res.status(400).json({
        status: 'error',
        message: `Position is already ${status}`,
      });
    }
    
    // Store old status for history
    const oldStatus = position.status;
    
    // Update status and add to history
    position.addStatusHistory(status, reason, userId);
    position.updatedBy = userId;
    await position.save();
    
    // Record status change in history
    await PositionHistory.recordStatusChange(
      position._id,
      oldStatus,
      status,
      reason,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { position },
    });
  } catch (error) {
    logger.error(`Error updating position status ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get position hierarchy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getPositionHierarchy = async (req, res, next) => {
  try {
    const { divisionId } = req.query;
    
    // Query to find top-level positions
    const query = { reportingTo: null };
    
    if (divisionId) {
      if (!isValidObjectId(divisionId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid division ID',
        });
      }
      query.divisionId = divisionId;
    }
    
    // Find top-level positions
    const topLevelPositions = await Position.find(query)
      .sort({ title: 1 })
      .populate('divisionId', 'name code');
    
    // Build hierarchy tree
    const hierarchy = [];
    
    for (const position of topLevelPositions) {
      const hierarchyItem = {
        _id: position._id,
        title: position.title,
        code: position.code,
        level: position.level,
        isVacant: position.isVacant,
        division: position.divisionId ? {
          _id: position.divisionId._id,
          name: position.divisionId.name,
          code: position.divisionId.code,
        } : null,
        directReports: await buildPositionHierarchy(position._id),
      };
      
      hierarchy.push(hierarchyItem);
    }
    
    res.status(200).json({
      status: 'success',
      data: { hierarchy },
    });
  } catch (error) {
    logger.error('Error getting position hierarchy:', error);
    next(error);
  }
};

/**
 * Helper function to build position hierarchy
 * @param {ObjectId} reportingTo - Reporting position ID
 * @returns {Promise<Array>} - Hierarchy tree
 */
const buildPositionHierarchy = async (reportingTo) => {
  const directReports = await Position.find({ reportingTo })
    .sort({ title: 1 })
    .populate('divisionId', 'name code');
  
  const reportHierarchy = [];
  
  for (const report of directReports) {
    const hierarchyItem = {
      _id: report._id,
      title: report.title,
      code: report.code,
      level: report.level,
      isVacant: report.isVacant,
      division: report.divisionId ? {
        _id: report.divisionId._id,
        name: report.divisionId.name,
        code: report.divisionId.code,
      } : null,
      directReports: await buildPositionHierarchy(report._id),
    };
    
    reportHierarchy.push(hierarchyItem);
  }
  
  return reportHierarchy;
};

/**
 * Get direct reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getDirectReports = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    // Find position
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found',
      });
    }
    
    // Get direct reports
    const directReports = await position.getDirectReports();
    
    res.status(200).json({
      status: 'success',
      data: { directReports },
    });
  } catch (error) {
    logger.error(`Error getting direct reports ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get reporting chain
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getReportingChain = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    // Find position
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found',
      });
    }
    
    // Get reporting chain
    const reportingChain = await position.getReportingChain();
    
    res.status(200).json({
      status: 'success',
      data: { reportingChain },
    });
  } catch (error) {
    logger.error(`Error getting reporting chain ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update position requirements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updatePositionRequirements = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { requirements } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    // Find position
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found',
      });
    }
    
    // Store old requirements for history
    const oldRequirements = position.requirements.toObject();
    
    // Update requirements
    position.requirements = requirements;
    position.updatedBy = userId;
    await position.save();
    
    // Record requirements update in history
    await PositionHistory.recordUpdate(
      position._id,
      'requirements',
      oldRequirements,
      requirements,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { position },
    });
  } catch (error) {
    logger.error(`Error updating position requirements ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update position responsibilities
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updatePositionResponsibilities = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { responsibilities } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    // Find position
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found',
      });
    }
    
    // Store old responsibilities for history
    const oldResponsibilities = position.responsibilities;
    
    // Update responsibilities
    position.responsibilities = responsibilities;
    position.updatedBy = userId;
    await position.save();
    
    // Record responsibilities update in history
    await PositionHistory.recordUpdate(
      position._id,
      'responsibilities',
      oldResponsibilities,
      responsibilities,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { position },
    });
  } catch (error) {
    logger.error(`Error updating position responsibilities ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update position authorities
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updatePositionAuthorities = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { authorities } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    // Find position
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found',
      });
    }
    
    // Store old authorities for history
    const oldAuthorities = position.authorities;
    
    // Update authorities
    position.authorities = authorities;
    position.updatedBy = userId;
    await position.save();
    
    // Record authorities update in history
    await PositionHistory.recordUpdate(
      position._id,
      'authorities',
      oldAuthorities,
      authorities,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { position },
    });
  } catch (error) {
    logger.error(`Error updating position authorities ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update position compensation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updatePositionCompensation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { salaryGrade, salaryRange, benefits } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    // Find position
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found',
      });
    }
    
    // Store old compensation data for history
    const oldCompensation = {
      salaryGrade: position.salaryGrade,
      salaryRange: position.salaryRange.toObject(),
      benefits: position.benefits,
    };
    
    // Update compensation data
    if (salaryGrade) {
      position.salaryGrade = salaryGrade;
    }
    
    if (salaryRange) {
      position.salaryRange = salaryRange;
    }
    
    if (benefits) {
      position.benefits = benefits;
    }
    
    position.updatedBy = userId;
    await position.save();
    
    // Record compensation update in history
    const newCompensation = {
      salaryGrade: position.salaryGrade,
      salaryRange: position.salaryRange.toObject(),
      benefits: position.benefits,
    };
    
    await PositionHistory.recordUpdate(
      position._id,
      'compensation',
      oldCompensation,
      newCompensation,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { position },
    });
  } catch (error) {
    logger.error(`Error updating position compensation ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get position history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getPositionHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    // Find position
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: 'Position not found',
      });
    }
    
    // Get history with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const history = await PositionHistory.getPositionHistory(id, {
      action,
      startDate,
      endDate,
      limit: parseInt(limit),
      skip,
    });
    
    // Get total count
    const query = { positionId: id };
    if (action) query.action = action;
    if (startDate || endDate) {
      query.performedAt = {};
      if (startDate) query.performedAt.$gte = new Date(startDate);
      if (endDate) query.performedAt.$lte = new Date(endDate);
    }
    
    const total = await PositionHistory.countDocuments(query);
    
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
    logger.error(`Error getting position history ${req.params.id}:`, error);
    next(error);
  }
};

module.exports = {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
  updatePositionStatus,
  getPositionHierarchy,
  getDirectReports,
  getReportingChain,
  updatePositionRequirements,
  updatePositionResponsibilities,
  updatePositionAuthorities,
  updatePositionCompensation,
  getPositionHistory,
};
