/**
 * Employee Assignment Controller
 * Handles employee position and branch assignment operations
 */

const Employee = require('../models/Employee');
const EmployeeHistory = require('../models/EmployeeHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Assign employee to position
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const assignEmployeeToPosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { positionId, branchId, divisionId, assignedDate, isActing, reason } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID',
      });
    }
    
    // Validate required fields
    if (!positionId || !branchId || !divisionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Position ID, branch ID, and division ID are required',
      });
    }
    
    // Validate ObjectIds
    if (!isValidObjectId(positionId) || !isValidObjectId(branchId) || !isValidObjectId(divisionId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID, branch ID, or division ID',
      });
    }
    
    // Find employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
    }
    
    // Store previous position for history
    const previousPosition = employee.positionAssignment.current ? 
      employee.positionAssignment.current.toObject() : null;
    
    // Create new position assignment
    const newAssignment = {
      positionId,
      branchId,
      divisionId,
      assignedDate: assignedDate ? new Date(assignedDate) : new Date(),
      isActing: isActing || false,
      reason,
    };
    
    // Update position assignment
    employee.addPositionAssignment(newAssignment, userId);
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record position change in history
    await EmployeeHistory.recordPositionChange(
      employee._id,
      previousPosition,
      employee.positionAssignment.current.toObject(),
      reason,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { employee },
    });
  } catch (error) {
    logger.error(`Error assigning employee ${req.params.id} to position:`, error);
    next(error);
  }
};

/**
 * Get employee position history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getEmployeePositionHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID',
      });
    }
    
    // Find employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
    }
    
    // Get position history with populated references
    const positionHistory = await Employee.findById(id)
      .select('positionAssignment')
      .populate('positionAssignment.current.positionId', 'title code')
      .populate('positionAssignment.current.branchId', 'name code')
      .populate('positionAssignment.current.divisionId', 'name code')
      .populate('positionAssignment.history.positionId', 'title code')
      .populate('positionAssignment.history.branchId', 'name code')
      .populate('positionAssignment.history.divisionId', 'name code')
      .populate('positionAssignment.history.changedBy', 'username email');
    
    res.status(200).json({
      status: 'success',
      data: { positionHistory: positionHistory.positionAssignment },
    });
  } catch (error) {
    logger.error(`Error getting employee position history ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get employees by position
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getEmployeesByPosition = async (req, res, next) => {
  try {
    const { positionId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!isValidObjectId(positionId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find employees by position
    const employees = await Employee.find({
      'positionAssignment.current.positionId': positionId,
      'employmentInfo.employmentStatus': 'active',
    })
      .sort({ fullName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('positionAssignment.current.positionId', 'title code')
      .populate('positionAssignment.current.branchId', 'name code')
      .populate('positionAssignment.current.divisionId', 'name code');
    
    // Get total count
    const total = await Employee.countDocuments({
      'positionAssignment.current.positionId': positionId,
      'employmentInfo.employmentStatus': 'active',
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        employees,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error(`Error getting employees by position ${req.params.positionId}:`, error);
    next(error);
  }
};

/**
 * Get employees by branch
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getEmployeesByBranch = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!isValidObjectId(branchId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find employees by branch
    const employees = await Employee.find({
      'positionAssignment.current.branchId': branchId,
      'employmentInfo.employmentStatus': 'active',
    })
      .sort({ fullName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('positionAssignment.current.positionId', 'title code')
      .populate('positionAssignment.current.branchId', 'name code')
      .populate('positionAssignment.current.divisionId', 'name code');
    
    // Get total count
    const total = await Employee.countDocuments({
      'positionAssignment.current.branchId': branchId,
      'employmentInfo.employmentStatus': 'active',
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        employees,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error(`Error getting employees by branch ${req.params.branchId}:`, error);
    next(error);
  }
};

/**
 * Get employees by division
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getEmployeesByDivision = async (req, res, next) => {
  try {
    const { divisionId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!isValidObjectId(divisionId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid division ID',
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find employees by division
    const employees = await Employee.find({
      'positionAssignment.current.divisionId': divisionId,
      'employmentInfo.employmentStatus': 'active',
    })
      .sort({ fullName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('positionAssignment.current.positionId', 'title code')
      .populate('positionAssignment.current.branchId', 'name code')
      .populate('positionAssignment.current.divisionId', 'name code');
    
    // Get total count
    const total = await Employee.countDocuments({
      'positionAssignment.current.divisionId': divisionId,
      'employmentInfo.employmentStatus': 'active',
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        employees,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error(`Error getting employees by division ${req.params.divisionId}:`, error);
    next(error);
  }
};

module.exports = {
  assignEmployeeToPosition,
  getEmployeePositionHistory,
  getEmployeesByPosition,
  getEmployeesByBranch,
  getEmployeesByDivision,
};
