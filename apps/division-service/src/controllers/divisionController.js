/**
 * Division Controller
 * Handles division management operations
 */

const Division = require('../models/Division');
const DivisionHistory = require('../models/DivisionHistory');
const Position = require('../models/Position');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get all divisions with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getAllDivisions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'active',
      branchId,
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
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (branchId) {
      if (!isValidObjectId(branchId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid branch ID',
        });
      }
      query.branchId = branchId;
    }
    
    // Execute query with pagination
    const divisions = await Division.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('parentId', 'name code')
      .populate('branchId', 'name code')
      .populate('headPositionId', 'title code');
    
    // Get total count
    const total = await Division.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        divisions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting divisions:', error);
    next(error);
  }
};

/**
 * Get division by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getDivisionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid division ID',
      });
    }
    
    const division = await Division.findById(id)
      .populate('parentId', 'name code')
      .populate('branchId', 'name code')
      .populate('headPositionId', 'title code');
    
    if (!division) {
      return res.status(404).json({
        status: 'error',
        message: 'Division not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { division },
    });
  } catch (error) {
    logger.error(`Error getting division ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create new division
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createDivision = async (req, res, next) => {
  try {
    const divisionData = req.body;
    const userId = req.user._id;
    
    // Check if parent exists if parentId is provided
    if (divisionData.parentId) {
      if (!isValidObjectId(divisionData.parentId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid parent division ID',
        });
      }
      
      const parentDivision = await Division.findById(divisionData.parentId);
      if (!parentDivision) {
        return res.status(404).json({
          status: 'error',
          message: 'Parent division not found',
        });
      }
    }
    
    // Check if branch exists
    if (!isValidObjectId(divisionData.branchId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    // Set created by and updated by
    divisionData.createdBy = userId;
    divisionData.updatedBy = userId;
    
    // Initialize status history
    divisionData.statusHistory = [{
      status: divisionData.status || 'active',
      reason: 'Initial creation',
      changedBy: userId,
      changedAt: new Date(),
    }];
    
    // Create division
    const division = await Division.create(divisionData);
    
    // Record creation in history
    await DivisionHistory.recordCreation(division._id, division.toObject(), userId);
    
    res.status(201).json({
      status: 'success',
      data: { division },
    });
  } catch (error) {
    logger.error('Error creating division:', error);
    next(error);
  }
};

/**
 * Update division
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateDivision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid division ID',
      });
    }
    
    // Find division
    const division = await Division.findById(id);
    if (!division) {
      return res.status(404).json({
        status: 'error',
        message: 'Division not found',
      });
    }
    
    // Check if parent exists if parentId is provided
    if (updateData.parentId) {
      if (!isValidObjectId(updateData.parentId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid parent division ID',
        });
      }
      
      // Prevent circular reference
      if (updateData.parentId.toString() === id) {
        return res.status(400).json({
          status: 'error',
          message: 'Division cannot be its own parent',
        });
      }
      
      const parentDivision = await Division.findById(updateData.parentId);
      if (!parentDivision) {
        return res.status(404).json({
          status: 'error',
          message: 'Parent division not found',
        });
      }
      
      // Check if the new parent is not a descendant of this division
      const descendants = await division.getDescendants();
      const isDescendant = descendants.some(d => d._id.toString() === updateData.parentId.toString());
      if (isDescendant) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot set a descendant as parent',
        });
      }
    }
    
    // Check if branch exists if branchId is provided
    if (updateData.branchId) {
      if (!isValidObjectId(updateData.branchId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid branch ID',
        });
      }
    }
    
    // Check if head position exists if headPositionId is provided
    if (updateData.headPositionId) {
      if (!isValidObjectId(updateData.headPositionId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid head position ID',
        });
      }
      
      const headPosition = await Position.findById(updateData.headPositionId);
      if (!headPosition) {
        return res.status(404).json({
          status: 'error',
          message: 'Head position not found',
        });
      }
    }
    
    // Store original values for history
    const originalDivision = division.toObject();
    
    // Update fields
    const fieldsToUpdate = [
      'name', 'code', 'description', 'parentId', 'branchId', 
      'headPositionId'
    ];
    
    for (const field of fieldsToUpdate) {
      if (updateData[field] !== undefined) {
        // Record change in history if value is different
        if (division[field] !== updateData[field]) {
          await DivisionHistory.recordUpdate(
            division._id,
            field,
            division[field],
            updateData[field],
            userId
          );
        }
        division[field] = updateData[field];
      }
    }
    
    // Update updatedBy
    division.updatedBy = userId;
    
    // Save division
    await division.save();
    
    res.status(200).json({
      status: 'success',
      data: { division },
    });
  } catch (error) {
    logger.error(`Error updating division ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete division
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteDivision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid division ID',
      });
    }
    
    // Find division
    const division = await Division.findById(id);
    if (!division) {
      return res.status(404).json({
        status: 'error',
        message: 'Division not found',
      });
    }
    
    // Check if division has children
    const children = await division.getChildren();
    if (children.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete division with child divisions',
      });
    }
    
    // Check if division has positions
    const positions = await Position.find({ divisionId: id });
    if (positions.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete division with associated positions',
      });
    }
    
    // Store division data for history
    const divisionData = division.toObject();
    
    // Delete division
    await division.deleteOne();
    
    // Record deletion in history
    await DivisionHistory.recordDeletion(id, divisionData, userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Division deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting division ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update division status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateDivisionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid division ID',
      });
    }
    
    // Find division
    const division = await Division.findById(id);
    if (!division) {
      return res.status(404).json({
        status: 'error',
        message: 'Division not found',
      });
    }
    
    // Check if status is different
    if (division.status === status) {
      return res.status(400).json({
        status: 'error',
        message: `Division is already ${status}`,
      });
    }
    
    // Store old status for history
    const oldStatus = division.status;
    
    // Update status and add to history
    division.addStatusHistory(status, reason, userId);
    division.updatedBy = userId;
    await division.save();
    
    // Record status change in history
    await DivisionHistory.recordStatusChange(
      division._id,
      oldStatus,
      status,
      reason,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { division },
    });
  } catch (error) {
    logger.error(`Error updating division status ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get division hierarchy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getDivisionHierarchy = async (req, res, next) => {
  try {
    const { branchId } = req.query;
    
    // Query to find top-level divisions
    const query = { parentId: null };
    
    if (branchId) {
      if (!isValidObjectId(branchId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid branch ID',
        });
      }
      query.branchId = branchId;
    }
    
    // Find top-level divisions
    const topLevelDivisions = await Division.find(query)
      .sort({ name: 1 })
      .populate('branchId', 'name code');
    
    // Build hierarchy tree
    const hierarchy = [];
    
    for (const division of topLevelDivisions) {
      const hierarchyItem = {
        _id: division._id,
        name: division.name,
        code: division.code,
        level: division.level,
        branch: division.branchId ? {
          _id: division.branchId._id,
          name: division.branchId.name,
          code: division.branchId.code,
        } : null,
        children: await buildDivisionHierarchy(division._id),
      };
      
      hierarchy.push(hierarchyItem);
    }
    
    res.status(200).json({
      status: 'success',
      data: { hierarchy },
    });
  } catch (error) {
    logger.error('Error getting division hierarchy:', error);
    next(error);
  }
};

/**
 * Helper function to build division hierarchy
 * @param {ObjectId} parentId - Parent division ID
 * @returns {Promise<Array>} - Hierarchy tree
 */
const buildDivisionHierarchy = async (parentId) => {
  const children = await Division.find({ parentId })
    .sort({ name: 1 })
    .populate('branchId', 'name code');
  
  const childrenHierarchy = [];
  
  for (const child of children) {
    const hierarchyItem = {
      _id: child._id,
      name: child.name,
      code: child.code,
      level: child.level,
      branch: child.branchId ? {
        _id: child.branchId._id,
        name: child.branchId.name,
        code: child.branchId.code,
      } : null,
      children: await buildDivisionHierarchy(child._id),
    };
    
    childrenHierarchy.push(hierarchyItem);
  }
  
  return childrenHierarchy;
};

/**
 * Get division children
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getDivisionChildren = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid division ID',
      });
    }
    
    // Find division
    const division = await Division.findById(id);
    if (!division) {
      return res.status(404).json({
        status: 'error',
        message: 'Division not found',
      });
    }
    
    // Get children
    const children = await division.getChildren();
    
    res.status(200).json({
      status: 'success',
      data: { children },
    });
  } catch (error) {
    logger.error(`Error getting division children ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get division ancestors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getDivisionAncestors = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid division ID',
      });
    }
    
    // Find division
    const division = await Division.findById(id);
    if (!division) {
      return res.status(404).json({
        status: 'error',
        message: 'Division not found',
      });
    }
    
    // Get ancestors
    const ancestors = await division.getAncestors();
    
    res.status(200).json({
      status: 'success',
      data: { ancestors },
    });
  } catch (error) {
    logger.error(`Error getting division ancestors ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update division KPIs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateDivisionKPIs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { kpis } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid division ID',
      });
    }
    
    // Find division
    const division = await Division.findById(id);
    if (!division) {
      return res.status(404).json({
        status: 'error',
        message: 'Division not found',
      });
    }
    
    // Store old KPIs for history
    const oldKPIs = [...division.performanceMetrics.kpis];
    
    // Update KPIs
    division.performanceMetrics.kpis = kpis;
    division.performanceMetrics.lastUpdated = new Date();
    division.updatedBy = userId;
    await division.save();
    
    // Record KPI update in history
    await DivisionHistory.recordKPIUpdate(
      division._id,
      oldKPIs,
      kpis,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { division },
    });
  } catch (error) {
    logger.error(`Error updating division KPIs ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update division budget
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateDivisionBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const budgetData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid division ID',
      });
    }
    
    // Find division
    const division = await Division.findById(id);
    if (!division) {
      return res.status(404).json({
        status: 'error',
        message: 'Division not found',
      });
    }
    
    // Store old budget for history
    const oldBudget = { ...division.budget.toObject() };
    
    // Calculate remaining budget
    budgetData.remaining = budgetData.allocated - (budgetData.spent || 0);
    
    // Update budget
    division.budget = {
      ...division.budget.toObject(),
      ...budgetData,
      lastUpdated: new Date(),
    };
    
    division.updatedBy = userId;
    await division.save();
    
    // Record budget update in history
    await DivisionHistory.recordBudgetUpdate(
      division._id,
      oldBudget,
      division.budget.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { division },
    });
  } catch (error) {
    logger.error(`Error updating division budget ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get division history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getDivisionHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid division ID',
      });
    }
    
    // Find division
    const division = await Division.findById(id);
    if (!division) {
      return res.status(404).json({
        status: 'error',
        message: 'Division not found',
      });
    }
    
    // Get history with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const history = await DivisionHistory.getDivisionHistory(id, {
      action,
      startDate,
      endDate,
      limit: parseInt(limit),
      skip,
    });
    
    // Get total count
    const query = { divisionId: id };
    if (action) query.action = action;
    if (startDate || endDate) {
      query.performedAt = {};
      if (startDate) query.performedAt.$gte = new Date(startDate);
      if (endDate) query.performedAt.$lte = new Date(endDate);
    }
    
    const total = await DivisionHistory.countDocuments(query);
    
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
    logger.error(`Error getting division history ${req.params.id}:`, error);
    next(error);
  }
};

module.exports = {
  getAllDivisions,
  getDivisionById,
  createDivision,
  updateDivision,
  deleteDivision,
  updateDivisionStatus,
  getDivisionHierarchy,
  getDivisionChildren,
  getDivisionAncestors,
  updateDivisionKPIs,
  updateDivisionBudget,
  getDivisionHistory,
};
