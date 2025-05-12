/**
 * Employee Status Controller
 * Handles employee status management operations
 */

const Employee = require('../models/Employee');
const EmployeeHistory = require('../models/EmployeeHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Update employee status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason, effectiveDate, endDate } = req.body;
    const userId = req.user._id;
    
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
    
    // Store previous status for history
    const previousStatus = employee.employmentInfo.employmentStatus;
    
    // Update status
    employee.addStatusHistory(
      status,
      reason,
      effectiveDate ? new Date(effectiveDate) : new Date(),
      endDate ? new Date(endDate) : null,
      userId
    );
    
    // Handle termination
    if (status === 'terminated') {
      employee.employmentInfo.terminationDate = effectiveDate ? new Date(effectiveDate) : new Date();
      employee.employmentInfo.terminationReason = reason;
    }
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record status change in history
    await EmployeeHistory.recordStatusChange(
      employee._id,
      previousStatus,
      status,
      reason,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { employee },
    });
  } catch (error) {
    logger.error(`Error updating employee status ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get employee status history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getEmployeeStatusHistory = async (req, res, next) => {
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
    
    // Get status history
    const statusHistory = employee.employmentInfo.statusHistory;
    
    res.status(200).json({
      status: 'success',
      data: { statusHistory },
    });
  } catch (error) {
    logger.error(`Error getting employee status history ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get employees by status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getEmployeesByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Validate status
    const validStatuses = ['active', 'inactive', 'on-leave', 'terminated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value',
      });
    }
    
    // Find employees by status
    const employees = await Employee.find({ 'employmentInfo.employmentStatus': status })
      .sort({ fullName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('positionAssignment.current.positionId', 'title code')
      .populate('positionAssignment.current.branchId', 'name code')
      .populate('positionAssignment.current.divisionId', 'name code');
    
    // Get total count
    const total = await Employee.countDocuments({ 'employmentInfo.employmentStatus': status });
    
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
    logger.error(`Error getting employees by status ${req.params.status}:`, error);
    next(error);
  }
};

module.exports = {
  updateEmployeeStatus,
  getEmployeeStatusHistory,
  getEmployeesByStatus,
};
