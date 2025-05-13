/**
 * Work Schedule Controller
 * Handles work schedule and employee schedule operations
 */

const mongoose = require('mongoose');
const { WorkSchedule, EmployeeSchedule } = require('../models/WorkSchedule');
const Employee = require('../../../employee-service/src/models/Employee');
const logger = require('../utils/logger');
const { validateWorkSchedule } = require('../validators/workScheduleValidator');

/**
 * Create a new work schedule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createWorkSchedule = async (req, res) => {
  try {
    // Validate request
    const { error, value } = validateWorkSchedule(req.body, 'create');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    // Check if schedule with same name already exists
    const existingSchedule = await WorkSchedule.findOne({ name: value.name });
    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Work schedule with this name already exists'
      });
    }
    
    // Create new work schedule
    const workSchedule = new WorkSchedule({
      ...value,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    await workSchedule.save();
    
    return res.status(201).json({
      success: true,
      message: 'Work schedule created successfully',
      data: workSchedule
    });
  } catch (error) {
    logger.error('Error in createWorkSchedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create work schedule',
      error: error.message
    });
  }
};

/**
 * Get work schedule by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getWorkScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const workSchedule = await WorkSchedule.findById(id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!workSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Work schedule not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: workSchedule
    });
  } catch (error) {
    logger.error('Error in getWorkScheduleById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get work schedule',
      error: error.message
    });
  }
};

/**
 * Get all work schedules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllWorkSchedules = async (req, res) => {
  try {
    const { scheduleType, isActive } = req.query;
    
    // Build query
    const query = {};
    
    // Add schedule type filter if provided
    if (scheduleType) {
      query.scheduleType = scheduleType;
    }
    
    // Add active status filter if provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const workSchedules = await WorkSchedule.find(query)
      .sort({ name: 1 })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    return res.status(200).json({
      success: true,
      count: workSchedules.length,
      data: workSchedules
    });
  } catch (error) {
    logger.error('Error in getAllWorkSchedules:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get work schedules',
      error: error.message
    });
  }
};

/**
 * Update work schedule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateWorkSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request
    const { error, value } = validateWorkSchedule(req.body, 'update');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }
    
    // Check if schedule exists
    const workSchedule = await WorkSchedule.findById(id);
    if (!workSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Work schedule not found'
      });
    }
    
    // Check if name is being changed and if new name already exists
    if (value.name && value.name !== workSchedule.name) {
      const existingSchedule = await WorkSchedule.findOne({ 
        name: value.name,
        _id: { $ne: id }
      });
      
      if (existingSchedule) {
        return res.status(400).json({
          success: false,
          message: 'Work schedule with this name already exists'
        });
      }
    }
    
    // Update schedule
    Object.keys(value).forEach(key => {
      workSchedule[key] = value[key];
    });
    
    // Update updatedBy
    workSchedule.updatedBy = req.user.id;
    
    await workSchedule.save();
    
    return res.status(200).json({
      success: true,
      message: 'Work schedule updated successfully',
      data: workSchedule
    });
  } catch (error) {
    logger.error('Error in updateWorkSchedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update work schedule',
      error: error.message
    });
  }
};

/**
 * Delete work schedule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteWorkSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if schedule exists
    const workSchedule = await WorkSchedule.findById(id);
    if (!workSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Work schedule not found'
      });
    }
    
    // Check if schedule is in use
    const employeeScheduleCount = await EmployeeSchedule.countDocuments({ scheduleId: id });
    if (employeeScheduleCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete work schedule that is assigned to ${employeeScheduleCount} employees`
      });
    }
    
    await workSchedule.remove();
    
    return res.status(200).json({
      success: true,
      message: 'Work schedule deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteWorkSchedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete work schedule',
      error: error.message
    });
  }
};

/**
 * Assign work schedule to employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.assignScheduleToEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Validate request
    const { error, value } = validateWorkSchedule(req.body, 'assign');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { scheduleId, effectiveDate, expiryDate } = value;
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if schedule exists
    const workSchedule = await WorkSchedule.findById(scheduleId);
    if (!workSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Work schedule not found'
      });
    }
    
    // Check if there's an existing schedule that overlaps
    const effectiveDate_ = new Date(effectiveDate);
    const expiryDate_ = expiryDate ? new Date(expiryDate) : null;
    
    if (expiryDate_ && effectiveDate_ >= expiryDate_) {
      return res.status(400).json({
        success: false,
        message: 'Effective date must be before expiry date'
      });
    }
    
    const overlappingSchedule = await EmployeeSchedule.findOne({
      employeeId,
      $or: [
        // New schedule starts during existing schedule
        {
          effectiveDate: { $lte: effectiveDate_ },
          $or: [
            { expiryDate: null },
            { expiryDate: { $gte: effectiveDate_ } }
          ]
        },
        // New schedule ends during existing schedule
        {
          effectiveDate: { $lte: expiryDate_ || new Date('2099-12-31') },
          $or: [
            { expiryDate: null },
            { expiryDate: { $gte: expiryDate_ || new Date('2099-12-31') } }
          ]
        }
      ]
    });
    
    if (overlappingSchedule) {
      // Update the expiry date of the overlapping schedule
      overlappingSchedule.expiryDate = new Date(effectiveDate_);
      overlappingSchedule.expiryDate.setDate(overlappingSchedule.expiryDate.getDate() - 1);
      overlappingSchedule.updatedBy = req.user.id;
      
      await overlappingSchedule.save();
    }
    
    // Create new employee schedule
    const employeeSchedule = new EmployeeSchedule({
      employeeId,
      scheduleId,
      effectiveDate: effectiveDate_,
      expiryDate: expiryDate_,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    await employeeSchedule.save();
    
    return res.status(201).json({
      success: true,
      message: 'Work schedule assigned to employee successfully',
      data: employeeSchedule
    });
  } catch (error) {
    logger.error('Error in assignScheduleToEmployee:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign work schedule to employee',
      error: error.message
    });
  }
};

/**
 * Get employee's work schedule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEmployeeSchedule = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query;
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    if (date) {
      // Get schedule for specific date
      const checkDate = new Date(date);
      const workSchedule = await EmployeeSchedule.getEmployeeScheduleForDate(employeeId, checkDate);
      
      if (!workSchedule) {
        return res.status(404).json({
          success: false,
          message: 'No work schedule found for this date'
        });
      }
      
      // Calculate work hours for this date
      const workHours = workSchedule.calculateWorkHours(checkDate);
      
      return res.status(200).json({
        success: true,
        data: {
          schedule: workSchedule,
          workHours
        }
      });
    } else {
      // Get all schedules for employee
      const employeeSchedules = await EmployeeSchedule.find({ employeeId })
        .sort({ effectiveDate: -1 })
        .populate('scheduleId')
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');
      
      return res.status(200).json({
        success: true,
        count: employeeSchedules.length,
        data: employeeSchedules
      });
    }
  } catch (error) {
    logger.error('Error in getEmployeeSchedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get employee work schedule',
      error: error.message
    });
  }
};

/**
 * Add schedule override for an employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addScheduleOverride = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Validate request
    const { error, value } = validateWorkSchedule(req.body, 'override');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { date, scheduleId, reason } = value;
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if schedule exists
    const workSchedule = await WorkSchedule.findById(scheduleId);
    if (!workSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Work schedule not found'
      });
    }
    
    // Add override
    const overrideDate = new Date(date);
    const updatedSchedule = await EmployeeSchedule.addScheduleOverride(
      employeeId,
      overrideDate,
      scheduleId,
      reason,
      req.user.id
    );
    
    return res.status(200).json({
      success: true,
      message: 'Schedule override added successfully',
      data: updatedSchedule
    });
  } catch (error) {
    logger.error('Error in addScheduleOverride:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add schedule override',
      error: error.message
    });
  }
};

/**
 * Remove schedule override for an employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.removeScheduleOverride = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    const overrideDate = new Date(date);
    
    // Find the employee schedule with this override
    const employeeSchedule = await EmployeeSchedule.findOne({
      employeeId,
      'overrides.date': overrideDate
    });
    
    if (!employeeSchedule) {
      return res.status(404).json({
        success: false,
        message: 'No schedule override found for this date'
      });
    }
    
    // Remove the override
    employeeSchedule.overrides = employeeSchedule.overrides.filter(
      override => override.date.getTime() !== overrideDate.getTime()
    );
    
    // Update updatedBy
    employeeSchedule.updatedBy = req.user.id;
    
    await employeeSchedule.save();
    
    return res.status(200).json({
      success: true,
      message: 'Schedule override removed successfully',
      data: employeeSchedule
    });
  } catch (error) {
    logger.error('Error in removeScheduleOverride:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove schedule override',
      error: error.message
    });
  }
};

/**
 * Bulk assign work schedule to employees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.bulkAssignSchedule = async (req, res) => {
  try {
    // Validate request
    const { error, value } = validateWorkSchedule(req.body, 'bulkAssign');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { employeeIds, scheduleId, effectiveDate, expiryDate } = value;
    
    // Check if schedule exists
    const workSchedule = await WorkSchedule.findById(scheduleId);
    if (!workSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Work schedule not found'
      });
    }
    
    const effectiveDate_ = new Date(effectiveDate);
    const expiryDate_ = expiryDate ? new Date(expiryDate) : null;
    
    if (expiryDate_ && effectiveDate_ >= expiryDate_) {
      return res.status(400).json({
        success: false,
        message: 'Effective date must be before expiry date'
      });
    }
    
    const results = [];
    
    // Process each employee
    for (const employeeId of employeeIds) {
      try {
        // Check if employee exists
        const employee = await Employee.findById(employeeId);
        if (!employee) {
          results.push({
            employeeId,
            success: false,
            message: 'Employee not found'
          });
          continue;
        }
        
        // Check if there's an existing schedule that overlaps
        const overlappingSchedule = await EmployeeSchedule.findOne({
          employeeId,
          $or: [
            // New schedule starts during existing schedule
            {
              effectiveDate: { $lte: effectiveDate_ },
              $or: [
                { expiryDate: null },
                { expiryDate: { $gte: effectiveDate_ } }
              ]
            },
            // New schedule ends during existing schedule
            {
              effectiveDate: { $lte: expiryDate_ || new Date('2099-12-31') },
              $or: [
                { expiryDate: null },
                { expiryDate: { $gte: expiryDate_ || new Date('2099-12-31') } }
              ]
            }
          ]
        });
        
        if (overlappingSchedule) {
          // Update the expiry date of the overlapping schedule
          overlappingSchedule.expiryDate = new Date(effectiveDate_);
          overlappingSchedule.expiryDate.setDate(overlappingSchedule.expiryDate.getDate() - 1);
          overlappingSchedule.updatedBy = req.user.id;
          
          await overlappingSchedule.save();
        }
        
        // Create new employee schedule
        const employeeSchedule = new EmployeeSchedule({
          employeeId,
          scheduleId,
          effectiveDate: effectiveDate_,
          expiryDate: expiryDate_,
          createdBy: req.user.id,
          updatedBy: req.user.id
        });
        
        await employeeSchedule.save();
        
        results.push({
          employeeId,
          success: true,
          message: 'Schedule assigned successfully'
        });
      } catch (error) {
        results.push({
          employeeId,
          success: false,
          message: error.message
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Bulk schedule assignment completed',
      data: {
        totalProcessed: employeeIds.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        results
      }
    });
  } catch (error) {
    logger.error('Error in bulkAssignSchedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to bulk assign work schedule',
      error: error.message
    });
  }
};

module.exports = exports;
