/**
 * Attendance Controller
 * Handles attendance-related operations
 */

const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Holiday = require('../models/Holiday');
const { WorkSchedule, EmployeeSchedule } = require('../models/WorkSchedule');
const AttendanceCorrection = require('../models/AttendanceCorrection');
const logger = require('../utils/logger');
const { validateAttendance } = require('../validators/attendanceValidator');

/**
 * Record employee check-in
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.checkIn = async (req, res) => {
  try {
    // Validate request
    const { error, value } = validateAttendance(req.body, 'checkIn');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { employeeId, location, deviceId, notes } = value;
    
    // Check if employee already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingAttendance = await Attendance.findOne({
      employeeId,
      checkInTime: { $gte: today, $lt: tomorrow }
    });
    
    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Employee has already checked in today',
        data: existingAttendance
      });
    }
    
    // Check if today is a holiday
    const isHoliday = await Holiday.isHoliday(today);
    
    // Get employee's work schedule
    const workSchedule = await EmployeeSchedule.getEmployeeScheduleForDate(employeeId, today);
    
    // Determine attendance status
    let status = 'present';
    
    if (isHoliday) {
      status = 'holiday';
    } else if (workSchedule) {
      const scheduleDetails = workSchedule.calculateWorkHours(today);
      
      if (!scheduleDetails.isWorkDay) {
        status = 'present'; // Weekend or non-working day but employee is working
      } else if (scheduleDetails.startTime) {
        // Check if employee is late
        const now = new Date();
        const lateThreshold = new Date(scheduleDetails.startTime);
        lateThreshold.setMinutes(lateThreshold.getMinutes() + 15); // 15-minute grace period
        
        if (now > lateThreshold) {
          status = 'late';
        }
      }
    }
    
    // Create new attendance record
    const attendance = new Attendance({
      employeeId,
      checkInTime: new Date(),
      location: location || {},
      deviceId,
      notes,
      status,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    await attendance.save();
    
    return res.status(201).json({
      success: true,
      message: 'Check-in recorded successfully',
      data: attendance
    });
  } catch (error) {
    logger.error('Error in checkIn:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record check-in',
      error: error.message
    });
  }
};

/**
 * Record employee check-out
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.checkOut = async (req, res) => {
  try {
    // Validate request
    const { error, value } = validateAttendance(req.body, 'checkOut');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { employeeId, location, deviceId, notes } = value;
    
    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const attendance = await Attendance.findOne({
      employeeId,
      checkInTime: { $gte: today, $lt: tomorrow }
    });
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }
    
    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Employee has already checked out today',
        data: attendance
      });
    }
    
    // Update attendance record
    attendance.checkOutTime = new Date();
    
    // Update location if provided
    if (location) {
      attendance.checkOutLocation = location;
    }
    
    // Update device ID if provided
    if (deviceId) {
      attendance.checkOutDeviceId = deviceId;
    }
    
    // Update notes if provided
    if (notes) {
      attendance.notes = attendance.notes ? `${attendance.notes}\nCheck-out: ${notes}` : `Check-out: ${notes}`;
    }
    
    // Calculate work hours
    attendance.workHours = (attendance.checkOutTime - attendance.checkInTime) / (1000 * 60 * 60);
    
    // Update half-day status if applicable
    if (attendance.workHours < 4) {
      attendance.status = 'half-day';
    }
    
    // Update updatedBy
    attendance.updatedBy = req.user.id;
    
    await attendance.save();
    
    return res.status(200).json({
      success: true,
      message: 'Check-out recorded successfully',
      data: attendance
    });
  } catch (error) {
    logger.error('Error in checkOut:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record check-out',
      error: error.message
    });
  }
};

/**
 * Get attendance record by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findById(id)
      .populate('employeeId', 'firstName lastName employeeNumber');
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    logger.error('Error in getAttendanceById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get attendance record',
      error: error.message
    });
  }
};

/**
 * Get attendance records for an employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, status } = req.query;
    
    // Build query
    const query = { employeeId };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.checkInTime = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    const attendance = await Attendance.find(query)
      .sort({ checkInTime: -1 })
      .populate('employeeId', 'firstName lastName employeeNumber');
    
    return res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    logger.error('Error in getEmployeeAttendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get employee attendance records',
      error: error.message
    });
  }
};

/**
 * Get today's attendance records
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTodayAttendance = async (req, res) => {
  try {
    const { departmentId, branchId, status } = req.query;
    
    // Set time to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set time to end of day
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Build query
    const query = {
      checkInTime: { $gte: today, $lt: tomorrow }
    };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Get attendance records
    let attendance = await Attendance.find(query)
      .populate({
        path: 'employeeId',
        select: 'firstName lastName employeeNumber employmentInfo',
        populate: [
          { path: 'employmentInfo.departmentId', select: 'name' },
          { path: 'employmentInfo.branchId', select: 'name' }
        ]
      });
    
    // Apply department filter if provided
    if (departmentId) {
      attendance = attendance.filter(record => 
        record.employeeId.employmentInfo.departmentId && 
        record.employeeId.employmentInfo.departmentId._id.toString() === departmentId
      );
    }
    
    // Apply branch filter if provided
    if (branchId) {
      attendance = attendance.filter(record => 
        record.employeeId.employmentInfo.branchId && 
        record.employeeId.employmentInfo.branchId._id.toString() === branchId
      );
    }
    
    return res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    logger.error('Error in getTodayAttendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get today\'s attendance records',
      error: error.message
    });
  }
};

/**
 * Update attendance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request
    const { error, value } = validateAttendance(req.body, 'update');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }
    
    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    // Update fields
    Object.keys(value).forEach(key => {
      attendance[key] = value[key];
    });
    
    // Recalculate work hours if check-in or check-out time changed
    if (attendance.checkInTime && attendance.checkOutTime) {
      attendance.workHours = (attendance.checkOutTime - attendance.checkInTime) / (1000 * 60 * 60);
      
      // Update half-day status if applicable
      if (attendance.workHours < 4) {
        attendance.status = 'half-day';
      }
    }
    
    // Update updatedBy
    attendance.updatedBy = req.user.id;
    
    await attendance.save();
    
    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: attendance
    });
  } catch (error) {
    logger.error('Error in updateAttendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update attendance record',
      error: error.message
    });
  }
};

/**
 * Delete attendance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    await attendance.remove();
    
    return res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteAttendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete attendance record',
      error: error.message
    });
  }
};

/**
 * Submit attendance correction request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.submitCorrectionRequest = async (req, res) => {
  try {
    // Validate request
    const { error, value } = validateAttendance(req.body, 'correction');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { 
      employeeId, 
      attendanceId, 
      requestType, 
      newCheckInTime, 
      newCheckOutTime, 
      newStatus, 
      reason 
    } = value;
    
    // Get the attendance record
    const attendance = await Attendance.findById(attendanceId);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    // Create correction request
    const correction = new AttendanceCorrection({
      employeeId,
      attendanceId,
      date: attendance.checkInTime,
      requestType,
      oldCheckInTime: attendance.checkInTime,
      newCheckInTime: newCheckInTime || attendance.checkInTime,
      oldCheckOutTime: attendance.checkOutTime,
      newCheckOutTime: newCheckOutTime || attendance.checkOutTime,
      oldStatus: attendance.status,
      newStatus: newStatus || attendance.status,
      reason,
      status: 'pending',
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    // Add attachments if provided
    if (req.body.attachments) {
      correction.attachments = req.body.attachments.map(attachment => ({
        ...attachment,
        uploadedBy: req.user.id
      }));
    }
    
    await correction.save();
    
    return res.status(201).json({
      success: true,
      message: 'Correction request submitted successfully',
      data: correction
    });
  } catch (error) {
    logger.error('Error in submitCorrectionRequest:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit correction request',
      error: error.message
    });
  }
};

/**
 * Get attendance statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate, departmentId, branchId } = req.query;
    
    // Validate date range
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          checkInTime: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          employees: { $addToSet: '$employeeId' }
        }
      }
    ];
    
    // Add department filter if provided
    if (departmentId) {
      pipeline[1].$lookup.pipeline = [
        {
          $match: {
            'employmentInfo.departmentId': mongoose.Types.ObjectId(departmentId)
          }
        }
      ];
    }
    
    // Add branch filter if provided
    if (branchId) {
      pipeline[1].$lookup.pipeline = pipeline[1].$lookup.pipeline || [];
      pipeline[1].$lookup.pipeline.push({
        $match: {
          'employmentInfo.branchId': mongoose.Types.ObjectId(branchId)
        }
      });
    }
    
    const stats = await Attendance.aggregate(pipeline);
    
    // Format results
    const result = {
      present: 0,
      absent: 0,
      late: 0,
      'half-day': 0,
      leave: 0,
      holiday: 0,
      totalEmployees: 0
    };
    
    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.totalEmployees += stat.employees.length;
    });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error in getAttendanceStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get attendance statistics',
      error: error.message
    });
  }
};

module.exports = exports;
