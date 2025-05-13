/**
 * Attendance Report Model
 * Defines the schema for attendance reports and statistics
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     AttendanceReport:
 *       type: object
 *       required:
 *         - reportType
 *         - period
 *         - generatedBy
 *       properties:
 *         reportType:
 *           type: string
 *           enum: [daily, weekly, monthly, custom]
 *           description: Type of report
 *         period:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *             endDate:
 *               type: string
 *               format: date
 *         filters:
 *           type: object
 *           properties:
 *             departmentIds:
 *               type: array
 *               items:
 *                 type: string
 *             branchIds:
 *               type: array
 *               items:
 *                 type: string
 *             employeeIds:
 *               type: array
 *               items:
 *                 type: string
 *         summary:
 *           type: object
 *           properties:
 *             totalEmployees:
 *               type: number
 *             presentCount:
 *               type: number
 *             absentCount:
 *               type: number
 *             lateCount:
 *               type: number
 *             leaveCount:
 *               type: number
 *             averageWorkHours:
 *               type: number
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: string
 *               employeeName:
 *                 type: string
 *               department:
 *                 type: string
 *               branch:
 *                 type: string
 *               attendanceStats:
 *                 type: object
 *                 properties:
 *                   presentDays:
 *                     type: number
 *                   absentDays:
 *                     type: number
 *                   lateDays:
 *                     type: number
 *                   leaveDays:
 *                     type: number
 *                   totalWorkHours:
 *                     type: number
 *                   averageWorkHours:
 *                     type: number
 *         reportFormat:
 *           type: string
 *           enum: [json, csv, pdf]
 *           description: Format of the report
 *         reportUrl:
 *           type: string
 *           description: URL to the generated report file
 *         generatedBy:
 *           type: string
 *           description: User who generated the report
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: When the report was generated
 */

const periodSchema = new Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
}, { _id: false });

const filtersSchema = new Schema({
  departmentIds: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
  branchIds: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
  employeeIds: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
  statuses: [{ 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day', 'leave', 'holiday']
  }]
}, { _id: false });

const summarySchema = new Schema({
  totalEmployees: { type: Number, default: 0 },
  presentCount: { type: Number, default: 0 },
  absentCount: { type: Number, default: 0 },
  lateCount: { type: Number, default: 0 },
  halfDayCount: { type: Number, default: 0 },
  leaveCount: { type: Number, default: 0 },
  holidayCount: { type: Number, default: 0 },
  totalWorkHours: { type: Number, default: 0 },
  averageWorkHours: { type: Number, default: 0 },
  attendanceRate: { type: Number, default: 0 }, // Percentage
  lateRate: { type: Number, default: 0 }, // Percentage
  leaveRate: { type: Number, default: 0 } // Percentage
}, { _id: false });

const employeeAttendanceStatsSchema = new Schema({
  presentDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  lateDays: { type: Number, default: 0 },
  halfDayDays: { type: Number, default: 0 },
  leaveDays: { type: Number, default: 0 },
  holidayDays: { type: Number, default: 0 },
  totalWorkHours: { type: Number, default: 0 },
  averageWorkHours: { type: Number, default: 0 },
  attendanceRate: { type: Number, default: 0 }, // Percentage
  lateRate: { type: Number, default: 0 }, // Percentage
  leaveRate: { type: Number, default: 0 } // Percentage
}, { _id: false });

const detailSchema = new Schema({
  employeeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee',
    required: true
  },
  employeeName: { type: String },
  employeeNumber: { type: String },
  department: { type: String },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  branch: { type: String },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  position: { type: String },
  attendanceStats: { 
    type: employeeAttendanceStatsSchema,
    default: () => ({})
  },
  dailyRecords: [{
    date: { type: Date },
    status: { 
      type: String, 
      enum: ['present', 'absent', 'late', 'half-day', 'leave', 'holiday']
    },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    workHours: { type: Number },
    attendanceId: { type: Schema.Types.ObjectId, ref: 'Attendance' }
  }]
}, { _id: false });

const attendanceReportSchema = new Schema({
  reportType: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: true
  },
  period: { 
    type: periodSchema,
    required: true
  },
  filters: { 
    type: filtersSchema,
    default: () => ({})
  },
  summary: { 
    type: summarySchema,
    default: () => ({})
  },
  details: [detailSchema],
  reportFormat: { 
    type: String, 
    enum: ['json', 'csv', 'pdf', 'excel'],
    default: 'json'
  },
  reportUrl: { type: String },
  generatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  generatedAt: { 
    type: Date,
    default: Date.now,
    required: true
  }
}, { 
  timestamps: true 
});

/**
 * Static method to generate a daily attendance report
 * @param {Date} date - Date for the report
 * @param {Object} filters - Filters for the report
 * @param {String} format - Report format
 * @param {ObjectId} userId - User ID generating the report
 * @returns {Promise<Object>} - Generated report
 */
attendanceReportSchema.statics.generateDailyReport = async function(date, filters = {}, format = 'json', userId) {
  // Set time to start of day
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  // Set time to end of day
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  return generateReport(this, 'daily', startDate, endDate, filters, format, userId);
};

/**
 * Static method to generate a weekly attendance report
 * @param {Date} startDate - Start date for the report
 * @param {Date} endDate - End date for the report
 * @param {Object} filters - Filters for the report
 * @param {String} format - Report format
 * @param {ObjectId} userId - User ID generating the report
 * @returns {Promise<Object>} - Generated report
 */
attendanceReportSchema.statics.generateWeeklyReport = async function(startDate, endDate, filters = {}, format = 'json', userId) {
  return generateReport(this, 'weekly', startDate, endDate, filters, format, userId);
};

/**
 * Static method to generate a monthly attendance report
 * @param {Number} year - Year for the report
 * @param {Number} month - Month for the report (0-11)
 * @param {Object} filters - Filters for the report
 * @param {String} format - Report format
 * @param {ObjectId} userId - User ID generating the report
 * @returns {Promise<Object>} - Generated report
 */
attendanceReportSchema.statics.generateMonthlyReport = async function(year, month, filters = {}, format = 'json', userId) {
  // Set time to start of month
  const startDate = new Date(year, month, 1);
  startDate.setHours(0, 0, 0, 0);
  
  // Set time to end of month
  const endDate = new Date(year, month + 1, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return generateReport(this, 'monthly', startDate, endDate, filters, format, userId);
};

/**
 * Static method to generate a custom attendance report
 * @param {Date} startDate - Start date for the report
 * @param {Date} endDate - End date for the report
 * @param {Object} filters - Filters for the report
 * @param {String} format - Report format
 * @param {ObjectId} userId - User ID generating the report
 * @returns {Promise<Object>} - Generated report
 */
attendanceReportSchema.statics.generateCustomReport = async function(startDate, endDate, filters = {}, format = 'json', userId) {
  return generateReport(this, 'custom', startDate, endDate, filters, format, userId);
};

/**
 * Helper function to generate an attendance report
 * @param {Model} model - AttendanceReport model
 * @param {String} reportType - Type of report
 * @param {Date} startDate - Start date for the report
 * @param {Date} endDate - End date for the report
 * @param {Object} filters - Filters for the report
 * @param {String} format - Report format
 * @param {ObjectId} userId - User ID generating the report
 * @returns {Promise<Object>} - Generated report
 */
async function generateReport(model, reportType, startDate, endDate, filters = {}, format = 'json', userId) {
  // Create a new report
  const report = new model({
    reportType,
    period: {
      startDate,
      endDate
    },
    filters,
    reportFormat: format,
    generatedBy: userId,
    generatedAt: new Date()
  });
  
  // Build employee query based on filters
  const employeeQuery = {};
  
  if (filters.departmentIds && filters.departmentIds.length > 0) {
    employeeQuery['employmentInfo.departmentId'] = { $in: filters.departmentIds };
  }
  
  if (filters.branchIds && filters.branchIds.length > 0) {
    employeeQuery['employmentInfo.branchId'] = { $in: filters.branchIds };
  }
  
  if (filters.employeeIds && filters.employeeIds.length > 0) {
    employeeQuery['_id'] = { $in: filters.employeeIds };
  }
  
  // Get employees
  const employees = await mongoose.model('Employee').find(employeeQuery)
    .populate('employmentInfo.departmentId')
    .populate('employmentInfo.branchId')
    .populate('employmentInfo.positionId');
  
  // Set summary total employees
  report.summary.totalEmployees = employees.length;
  
  // Process each employee
  for (const employee of employees) {
    // Build attendance query
    const attendanceQuery = {
      employeeId: employee._id,
      checkInTime: { $gte: startDate, $lte: endDate }
    };
    
    if (filters.statuses && filters.statuses.length > 0) {
      attendanceQuery.status = { $in: filters.statuses };
    }
    
    // Get attendance records for this employee
    const attendanceRecords = await mongoose.model('Attendance').find(attendanceQuery)
      .sort({ checkInTime: 1 });
    
    // Initialize employee detail
    const employeeDetail = {
      employeeId: employee._id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeNumber: employee.employeeNumber,
      department: employee.employmentInfo.departmentId ? employee.employmentInfo.departmentId.name : '',
      departmentId: employee.employmentInfo.departmentId ? employee.employmentInfo.departmentId._id : null,
      branch: employee.employmentInfo.branchId ? employee.employmentInfo.branchId.name : '',
      branchId: employee.employmentInfo.branchId ? employee.employmentInfo.branchId._id : null,
      position: employee.employmentInfo.positionId ? employee.employmentInfo.positionId.name : '',
      attendanceStats: {
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        halfDayDays: 0,
        leaveDays: 0,
        holidayDays: 0,
        totalWorkHours: 0,
        averageWorkHours: 0,
        attendanceRate: 0,
        lateRate: 0,
        leaveRate: 0
      },
      dailyRecords: []
    };
    
    // Process attendance records
    for (const record of attendanceRecords) {
      // Calculate work hours
      let workHours = 0;
      if (record.checkInTime && record.checkOutTime) {
        workHours = (record.checkOutTime - record.checkInTime) / (1000 * 60 * 60);
      }
      
      // Add to daily records
      employeeDetail.dailyRecords.push({
        date: record.checkInTime,
        status: record.status,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        workHours,
        attendanceId: record._id
      });
      
      // Update employee stats
      switch (record.status) {
        case 'present':
          employeeDetail.attendanceStats.presentDays++;
          break;
        case 'absent':
          employeeDetail.attendanceStats.absentDays++;
          break;
        case 'late':
          employeeDetail.attendanceStats.lateDays++;
          break;
        case 'half-day':
          employeeDetail.attendanceStats.halfDayDays++;
          break;
        case 'leave':
          employeeDetail.attendanceStats.leaveDays++;
          break;
        case 'holiday':
          employeeDetail.attendanceStats.holidayDays++;
          break;
      }
      
      employeeDetail.attendanceStats.totalWorkHours += workHours;
    }
    
    // Calculate average work hours
    const workDays = employeeDetail.attendanceStats.presentDays + 
                     employeeDetail.attendanceStats.lateDays + 
                     employeeDetail.attendanceStats.halfDayDays;
    
    if (workDays > 0) {
      employeeDetail.attendanceStats.averageWorkHours = 
        employeeDetail.attendanceStats.totalWorkHours / workDays;
    }
    
    // Calculate attendance rate
    const totalDays = getDaysBetweenDates(startDate, endDate);
    const workingDays = totalDays - (employeeDetail.attendanceStats.holidayDays || 0);
    
    if (workingDays > 0) {
      employeeDetail.attendanceStats.attendanceRate = 
        ((employeeDetail.attendanceStats.presentDays + 
          employeeDetail.attendanceStats.lateDays + 
          employeeDetail.attendanceStats.halfDayDays) / workingDays) * 100;
      
      employeeDetail.attendanceStats.lateRate = 
        (employeeDetail.attendanceStats.lateDays / workingDays) * 100;
      
      employeeDetail.attendanceStats.leaveRate = 
        (employeeDetail.attendanceStats.leaveDays / workingDays) * 100;
    }
    
    // Add employee detail to report
    report.details.push(employeeDetail);
    
    // Update summary
    report.summary.presentCount += employeeDetail.attendanceStats.presentDays;
    report.summary.absentCount += employeeDetail.attendanceStats.absentDays;
    report.summary.lateCount += employeeDetail.attendanceStats.lateDays;
    report.summary.halfDayCount += employeeDetail.attendanceStats.halfDayDays;
    report.summary.leaveCount += employeeDetail.attendanceStats.leaveDays;
    report.summary.holidayCount += employeeDetail.attendanceStats.holidayDays;
    report.summary.totalWorkHours += employeeDetail.attendanceStats.totalWorkHours;
  }
  
  // Calculate summary averages
  if (report.summary.totalEmployees > 0) {
    report.summary.averageWorkHours = 
      report.summary.totalWorkHours / report.summary.totalEmployees;
    
    const totalDays = getDaysBetweenDates(startDate, endDate);
    const totalWorkingDays = totalDays * report.summary.totalEmployees;
    
    if (totalWorkingDays > 0) {
      report.summary.attendanceRate = 
        ((report.summary.presentCount + 
          report.summary.lateCount + 
          report.summary.halfDayCount) / totalWorkingDays) * 100;
      
      report.summary.lateRate = 
        (report.summary.lateCount / totalWorkingDays) * 100;
      
      report.summary.leaveRate = 
        (report.summary.leaveCount / totalWorkingDays) * 100;
    }
  }
  
  // Generate report file URL based on format
  // This would typically involve creating a file and storing it
  // For now, we'll just set a placeholder URL
  report.reportUrl = `/reports/attendance/${report._id}.${format}`;
  
  // Save and return the report
  return report.save();
}

/**
 * Helper function to get the number of days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Number} - Number of days
 */
function getDaysBetweenDates(startDate, endDate) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round(Math.abs((startDate - endDate) / oneDay)) + 1;
}

const AttendanceReport = mongoose.model('AttendanceReport', attendanceReportSchema);

module.exports = AttendanceReport;
