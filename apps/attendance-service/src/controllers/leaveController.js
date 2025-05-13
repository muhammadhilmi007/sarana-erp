/**
 * Leave Controller
 * Handles leave request operations
 */

const mongoose = require('mongoose');
const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const Employee = require('../../../employee-service/src/models/Employee');
const logger = require('../utils/logger');
const { validateLeave } = require('../validators/leaveValidator');

/**
 * Submit a leave request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.submitLeaveRequest = async (req, res) => {
  try {
    // Validate request
    const { error, value } = validateLeave(req.body, 'submit');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { 
      employeeId, 
      leaveType, 
      startDate, 
      endDate, 
      reason, 
      contactInfo 
    } = value;
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Calculate duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = calculateBusinessDays(start, end);
    
    // Check for overlapping leave requests
    const overlappingLeave = await Leave.findOne({
      employeeId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });
    
    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: 'Employee already has an overlapping leave request',
        data: overlappingLeave
      });
    }
    
    // Check leave balance
    const year = new Date(startDate).getFullYear();
    const leaveBalance = await LeaveBalance.getOrCreate(employeeId, year, req.user.id);
    
    if (leaveType !== 'unpaid' && leaveBalance[leaveType].remaining < duration) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${leaveBalance[leaveType].remaining}, Requested: ${duration}`
      });
    }
    
    // Create leave request
    const leave = new Leave({
      employeeId,
      leaveType,
      startDate,
      endDate,
      duration,
      reason,
      contactInfo,
      status: 'pending',
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    // Add attachments if provided
    if (req.body.attachments) {
      leave.attachments = req.body.attachments.map(attachment => ({
        ...attachment,
        uploadedBy: req.user.id
      }));
    }
    
    await leave.save();
    
    // Update leave balance - add to pending
    if (leaveType !== 'unpaid') {
      await LeaveBalance.addTransaction(employeeId, year, {
        date: new Date(),
        leaveType,
        amount: duration,
        type: 'used',
        reason: 'Leave request pending',
        leaveRequestId: leave._id,
        updatedBy: req.user.id
      });
    }
    
    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave
    });
  } catch (error) {
    logger.error('Error in submitLeaveRequest:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit leave request',
      error: error.message
    });
  }
};

/**
 * Get leave request by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const leave = await Leave.findById(id)
      .populate('employeeId', 'firstName lastName employeeNumber')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('approvalHistory.approvedBy', 'name');
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    logger.error('Error in getLeaveById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get leave request',
      error: error.message
    });
  }
};

/**
 * Get leave requests for an employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEmployeeLeaves = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, startDate, endDate, leaveType } = req.query;
    
    // Build query
    const query = { employeeId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.$or = [
        { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { 
          startDate: { $lte: new Date(startDate) }, 
          endDate: { $gte: new Date(endDate) } 
        }
      ];
    }
    
    // Add leave type filter if provided
    if (leaveType) {
      query.leaveType = leaveType;
    }
    
    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate('employeeId', 'firstName lastName employeeNumber')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('approvalHistory.approvedBy', 'name');
    
    return res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    logger.error('Error in getEmployeeLeaves:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get employee leave requests',
      error: error.message
    });
  }
};

/**
 * Get all leave requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, startDate, endDate, leaveType, departmentId, branchId } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.$or = [
        { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { 
          startDate: { $lte: new Date(startDate) }, 
          endDate: { $gte: new Date(endDate) } 
        }
      ];
    }
    
    // Add leave type filter if provided
    if (leaveType) {
      query.leaveType = leaveType;
    }
    
    // Get leaves with pagination
    let leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'employeeId',
        select: 'firstName lastName employeeNumber employmentInfo',
        populate: [
          { path: 'employmentInfo.departmentId', select: 'name' },
          { path: 'employmentInfo.branchId', select: 'name' }
        ]
      })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('approvalHistory.approvedBy', 'name');
    
    // Apply department filter if provided
    if (departmentId) {
      leaves = leaves.filter(leave => 
        leave.employeeId.employmentInfo.departmentId && 
        leave.employeeId.employmentInfo.departmentId._id.toString() === departmentId
      );
    }
    
    // Apply branch filter if provided
    if (branchId) {
      leaves = leaves.filter(leave => 
        leave.employeeId.employmentInfo.branchId && 
        leave.employeeId.employmentInfo.branchId._id.toString() === branchId
      );
    }
    
    // Get total count for pagination
    const total = await Leave.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: leaves
    });
  } catch (error) {
    logger.error('Error in getAllLeaves:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get leave requests',
      error: error.message
    });
  }
};

/**
 * Approve a leave request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    
    const leave = await Leave.findById(id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been processed'
      });
    }
    
    // Update leave status
    leave.status = 'approved';
    
    // Add to approval history
    leave.approvalHistory.push({
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      comments: comments || ''
    });
    
    // Update the updatedBy field
    leave.updatedBy = req.user.id;
    
    await leave.save();
    
    // Update leave balance
    await LeaveBalance.updateForLeaveStatusChange(leave._id, 'approved', req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'Leave request approved successfully',
      data: leave
    });
  } catch (error) {
    logger.error('Error in approveLeave:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve leave request',
      error: error.message
    });
  }
};

/**
 * Reject a leave request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    
    const leave = await Leave.findById(id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been processed'
      });
    }
    
    // Update leave status
    leave.status = 'rejected';
    
    // Add to approval history
    leave.approvalHistory.push({
      status: 'rejected',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      comments: comments || ''
    });
    
    // Update the updatedBy field
    leave.updatedBy = req.user.id;
    
    await leave.save();
    
    // Update leave balance
    await LeaveBalance.updateForLeaveStatusChange(leave._id, 'rejected', req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'Leave request rejected successfully',
      data: leave
    });
  } catch (error) {
    logger.error('Error in rejectLeave:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject leave request',
      error: error.message
    });
  }
};

/**
 * Cancel a leave request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const leave = await Leave.findById(id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    if (leave.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been cancelled'
      });
    }
    
    // Check if leave has already started
    const now = new Date();
    if (leave.status === 'approved' && new Date(leave.startDate) <= now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a leave that has already started'
      });
    }
    
    // Update leave status
    leave.status = 'cancelled';
    leave.cancellationReason = reason || '';
    
    // Add to approval history
    leave.approvalHistory.push({
      status: 'cancelled',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      comments: reason || 'Cancelled by user'
    });
    
    // Update the updatedBy field
    leave.updatedBy = req.user.id;
    
    await leave.save();
    
    // Update leave balance
    await LeaveBalance.updateForLeaveStatusChange(leave._id, 'cancelled', req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: leave
    });
  } catch (error) {
    logger.error('Error in cancelLeave:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel leave request',
      error: error.message
    });
  }
};

/**
 * Get leave balance for an employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Get or create leave balance
    const leaveBalance = await LeaveBalance.getOrCreate(employeeId, year, req.user.id);
    
    return res.status(200).json({
      success: true,
      data: leaveBalance
    });
  } catch (error) {
    logger.error('Error in getLeaveBalance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get leave balance',
      error: error.message
    });
  }
};

/**
 * Adjust leave balance for an employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.adjustLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Validate request
    const { error, value } = validateLeave(req.body, 'adjustBalance');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { leaveType, amount, reason, year } = value;
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Get or create leave balance
    const leaveBalance = await LeaveBalance.getOrCreate(
      employeeId, 
      year || new Date().getFullYear(), 
      req.user.id
    );
    
    // Add transaction
    await LeaveBalance.addTransaction(employeeId, year || new Date().getFullYear(), {
      date: new Date(),
      leaveType,
      amount,
      type: 'adjustment',
      reason: reason || 'Manual adjustment',
      updatedBy: req.user.id
    });
    
    // Get updated leave balance
    const updatedBalance = await LeaveBalance.findById(leaveBalance._id);
    
    return res.status(200).json({
      success: true,
      message: 'Leave balance adjusted successfully',
      data: updatedBalance
    });
  } catch (error) {
    logger.error('Error in adjustLeaveBalance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to adjust leave balance',
      error: error.message
    });
  }
};

/**
 * Process monthly leave accruals
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processMonthlyAccruals = async (req, res) => {
  try {
    const { year, month } = req.body;
    
    // Validate year and month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const processYear = year || currentYear;
    const processMonth = month !== undefined ? month : currentMonth - 1; // Default to previous month
    
    // Validate that we're not processing future accruals
    if (processYear > currentYear || (processYear === currentYear && processMonth > currentMonth)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot process accruals for future months'
      });
    }
    
    // Process accruals
    const results = await LeaveBalance.processMonthlyAccruals(processYear, processMonth, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'Monthly accruals processed successfully',
      data: {
        year: processYear,
        month: processMonth,
        results
      }
    });
  } catch (error) {
    logger.error('Error in processMonthlyAccruals:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process monthly accruals',
      error: error.message
    });
  }
};

/**
 * Process year-end leave carry over
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processYearEndCarryOver = async (req, res) => {
  try {
    const { fromYear, maxCarryOver } = req.body;
    
    // Validate year
    const currentYear = new Date().getFullYear();
    
    const processFromYear = fromYear || currentYear - 1; // Default to previous year
    const processToYear = processFromYear + 1;
    const processMaxCarryOver = maxCarryOver || 5; // Default to 5 days
    
    // Process carry over
    const results = await LeaveBalance.processYearEndCarryOver(
      processFromYear, 
      processToYear, 
      processMaxCarryOver, 
      req.user.id
    );
    
    return res.status(200).json({
      success: true,
      message: 'Year-end carry over processed successfully',
      data: {
        fromYear: processFromYear,
        toYear: processToYear,
        maxCarryOver: processMaxCarryOver,
        results
      }
    });
  } catch (error) {
    logger.error('Error in processYearEndCarryOver:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process year-end carry over',
      error: error.message
    });
  }
};

/**
 * Calculate the number of business days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Number} - Number of business days
 */
function calculateBusinessDays(startDate, endDate) {
  let count = 0;
  const curDate = new Date(startDate.getTime());
  
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    
    curDate.setDate(curDate.getDate() + 1);
  }
  
  return count;
}

module.exports = exports;
