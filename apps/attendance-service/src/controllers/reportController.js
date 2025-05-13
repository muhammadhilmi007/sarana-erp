/**
 * Report Controller
 * Handles attendance reporting and statistics
 */

const mongoose = require('mongoose');
const AttendanceReport = require('../models/AttendanceReport');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const logger = require('../utils/logger');
const { validateReport } = require('../validators/reportValidator');

/**
 * Generate a daily attendance report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateDailyReport = async (req, res) => {
  try {
    // Validate request
    const { error, value } = validateReport(req.body, 'daily');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { date, filters, format } = value;
    
    // Generate report
    const report = await AttendanceReport.generateDailyReport(
      new Date(date),
      filters,
      format || 'json',
      req.user.id
    );
    
    return res.status(201).json({
      success: true,
      message: 'Daily attendance report generated successfully',
      data: report
    });
  } catch (error) {
    logger.error('Error in generateDailyReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate daily attendance report',
      error: error.message
    });
  }
};

/**
 * Generate a weekly attendance report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateWeeklyReport = async (req, res) => {
  try {
    // Validate request
    const { error, value } = validateReport(req.body, 'weekly');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { startDate, endDate, filters, format } = value;
    
    // Generate report
    const report = await AttendanceReport.generateWeeklyReport(
      new Date(startDate),
      new Date(endDate),
      filters,
      format || 'json',
      req.user.id
    );
    
    return res.status(201).json({
      success: true,
      message: 'Weekly attendance report generated successfully',
      data: report
    });
  } catch (error) {
    logger.error('Error in generateWeeklyReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate weekly attendance report',
      error: error.message
    });
  }
};

/**
 * Generate a monthly attendance report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateMonthlyReport = async (req, res) => {
  try {
    // Validate request
    const { error, value } = validateReport(req.body, 'monthly');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { year, month, filters, format } = value;
    
    // Generate report
    const report = await AttendanceReport.generateMonthlyReport(
      parseInt(year),
      parseInt(month) - 1, // Convert to 0-indexed month
      filters,
      format || 'json',
      req.user.id
    );
    
    return res.status(201).json({
      success: true,
      message: 'Monthly attendance report generated successfully',
      data: report
    });
  } catch (error) {
    logger.error('Error in generateMonthlyReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate monthly attendance report',
      error: error.message
    });
  }
};

/**
 * Generate a custom attendance report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateCustomReport = async (req, res) => {
  try {
    // Validate request
    const { error, value } = validateReport(req.body, 'custom');
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { startDate, endDate, filters, format } = value;
    
    // Generate report
    const report = await AttendanceReport.generateCustomReport(
      new Date(startDate),
      new Date(endDate),
      filters,
      format || 'json',
      req.user.id
    );
    
    return res.status(201).json({
      success: true,
      message: 'Custom attendance report generated successfully',
      data: report
    });
  } catch (error) {
    logger.error('Error in generateCustomReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate custom attendance report',
      error: error.message
    });
  }
};

/**
 * Get report by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await AttendanceReport.findById(id)
      .populate('generatedBy', 'name');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error in getReportById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get report',
      error: error.message
    });
  }
};

/**
 * Get all reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllReports = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    // Add report type filter if provided
    if (reportType) {
      query.reportType = reportType;
    }
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query['period.startDate'] = { $gte: new Date(startDate) };
      query['period.endDate'] = { $lte: new Date(endDate) };
    }
    
    // Get reports with pagination
    const reports = await AttendanceReport.find(query)
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('generatedBy', 'name');
    
    // Get total count for pagination
    const total = await AttendanceReport.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      count: reports.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: reports
    });
  } catch (error) {
    logger.error('Error in getAllReports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get reports',
      error: error.message
    });
  }
};

/**
 * Delete report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await AttendanceReport.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    await report.remove();
    
    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete report',
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
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Build aggregation pipeline for attendance
    const attendancePipeline = [
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
          totalWorkHours: {
            $sum: { $ifNull: ['$workHours', 0] }
          }
        }
      }
    ];
    
    // Add department filter if provided
    if (departmentId) {
      attendancePipeline[1].$lookup.pipeline = [
        {
          $match: {
            'employmentInfo.departmentId': mongoose.Types.ObjectId(departmentId)
          }
        }
      ];
    }
    
    // Add branch filter if provided
    if (branchId) {
      attendancePipeline[1].$lookup.pipeline = attendancePipeline[1].$lookup.pipeline || [];
      attendancePipeline[1].$lookup.pipeline.push({
        $match: {
          'employmentInfo.branchId': mongoose.Types.ObjectId(branchId)
        }
      });
    }
    
    // Build aggregation pipeline for leave
    const leavePipeline = [
      {
        $match: {
          status: 'approved',
          $or: [
            // Leave starts within range
            { startDate: { $gte: start, $lte: end } },
            // Leave ends within range
            { endDate: { $gte: start, $lte: end } },
            // Leave spans the entire range
            {
              startDate: { $lte: start },
              endDate: { $gte: end }
            }
          ]
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
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$duration' }
        }
      }
    ];
    
    // Add department filter if provided
    if (departmentId) {
      leavePipeline[1].$lookup.pipeline = [
        {
          $match: {
            'employmentInfo.departmentId': mongoose.Types.ObjectId(departmentId)
          }
        }
      ];
    }
    
    // Add branch filter if provided
    if (branchId) {
      leavePipeline[1].$lookup.pipeline = leavePipeline[1].$lookup.pipeline || [];
      leavePipeline[1].$lookup.pipeline.push({
        $match: {
          'employmentInfo.branchId': mongoose.Types.ObjectId(branchId)
        }
      });
    }
    
    // Execute aggregations
    const attendanceStats = await Attendance.aggregate(attendancePipeline);
    const leaveStats = await Leave.aggregate(leavePipeline);
    
    // Calculate total employees
    const employeePipeline = [
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'employeeId',
          as: 'attendance'
        }
      },
      {
        $match: {
          'attendance.checkInTime': { $gte: start, $lte: end }
        }
      },
      {
        $count: 'total'
      }
    ];
    
    // Add department filter if provided
    if (departmentId) {
      employeePipeline.unshift({
        $match: {
          'employmentInfo.departmentId': mongoose.Types.ObjectId(departmentId)
        }
      });
    }
    
    // Add branch filter if provided
    if (branchId) {
      employeePipeline.unshift({
        $match: {
          'employmentInfo.branchId': mongoose.Types.ObjectId(branchId)
        }
      });
    }
    
    const employeeCount = await mongoose.model('Employee').aggregate(employeePipeline);
    
    // Format results
    const result = {
      attendance: {
        present: 0,
        absent: 0,
        late: 0,
        'half-day': 0,
        leave: 0,
        holiday: 0,
        totalWorkHours: 0,
        averageWorkHours: 0
      },
      leave: {
        annual: 0,
        sick: 0,
        maternity: 0,
        paternity: 0,
        bereavement: 0,
        unpaid: 0,
        other: 0,
        totalDays: 0
      },
      totalEmployees: employeeCount.length > 0 ? employeeCount[0].total : 0,
      dateRange: {
        startDate: start,
        endDate: end
      }
    };
    
    // Process attendance stats
    attendanceStats.forEach(stat => {
      result.attendance[stat._id] = stat.count;
      result.attendance.totalWorkHours += stat.totalWorkHours;
    });
    
    // Calculate average work hours
    const totalAttendanceRecords = Object.values(result.attendance).reduce((sum, count) => {
      return typeof count === 'number' && count !== result.attendance.totalWorkHours ? sum + count : sum;
    }, 0);
    
    if (totalAttendanceRecords > 0) {
      result.attendance.averageWorkHours = result.attendance.totalWorkHours / totalAttendanceRecords;
    }
    
    // Process leave stats
    leaveStats.forEach(stat => {
      result.leave[stat._id] = stat.totalDays;
      result.leave.totalDays += stat.totalDays;
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

/**
 * Get employee attendance summary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEmployeeAttendanceSummary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get attendance records
    const attendanceRecords = await Attendance.find({
      employeeId,
      checkInTime: { $gte: start, $lte: end }
    }).sort({ checkInTime: 1 });
    
    // Get leave records
    const leaveRecords = await Leave.find({
      employeeId,
      status: 'approved',
      $or: [
        // Leave starts within range
        { startDate: { $gte: start, $lte: end } },
        // Leave ends within range
        { endDate: { $gte: start, $lte: end } },
        // Leave spans the entire range
        {
          startDate: { $lte: start },
          endDate: { $gte: end }
        }
      ]
    }).sort({ startDate: 1 });
    
    // Calculate summary
    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      'half-day': 0,
      leave: 0,
      holiday: 0,
      totalWorkHours: 0,
      averageWorkHours: 0,
      leaveBreakdown: {
        annual: 0,
        sick: 0,
        maternity: 0,
        paternity: 0,
        bereavement: 0,
        unpaid: 0,
        other: 0
      },
      attendanceRecords: [],
      leaveRecords: []
    };
    
    // Process attendance records
    attendanceRecords.forEach(record => {
      summary[record.status]++;
      
      if (record.workHours) {
        summary.totalWorkHours += record.workHours;
      }
      
      summary.attendanceRecords.push({
        date: record.checkInTime,
        status: record.status,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        workHours: record.workHours || 0,
        id: record._id
      });
    });
    
    // Calculate average work hours
    const workDays = summary.present + summary.late + summary['half-day'];
    if (workDays > 0) {
      summary.averageWorkHours = summary.totalWorkHours / workDays;
    }
    
    // Process leave records
    leaveRecords.forEach(record => {
      summary.leaveBreakdown[record.leaveType] += record.duration;
      
      summary.leaveRecords.push({
        startDate: record.startDate,
        endDate: record.endDate,
        leaveType: record.leaveType,
        duration: record.duration,
        reason: record.reason,
        id: record._id
      });
    });
    
    return res.status(200).json({
      success: true,
      data: {
        summary,
        dateRange: {
          startDate: start,
          endDate: end
        }
      }
    });
  } catch (error) {
    logger.error('Error in getEmployeeAttendanceSummary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get employee attendance summary',
      error: error.message
    });
  }
};

module.exports = exports;
