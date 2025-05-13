/**
 * Attendance Model
 * Defines the schema for employee attendance records
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - employeeId
 *         - date
 *         - checkInTime
 *         - status
 *         - createdBy
 *       properties:
 *         employeeId:
 *           type: string
 *           description: Reference to the employee
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the attendance record
 *         checkInTime:
 *           type: string
 *           format: date-time
 *           description: Time when employee checked in
 *         checkOutTime:
 *           type: string
 *           format: date-time
 *           description: Time when employee checked out
 *         checkInLocation:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *             address:
 *               type: string
 *         checkOutLocation:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *             address:
 *               type: string
 *         workHours:
 *           type: number
 *           description: Total work hours for the day
 *         status:
 *           type: string
 *           enum: [present, absent, late, half-day, leave, holiday]
 *           description: Status of the attendance
 *         overtime:
 *           type: number
 *           description: Overtime hours
 *         notes:
 *           type: string
 *           description: Additional notes
 *         createdBy:
 *           type: string
 *           description: User who created the record
 *         updatedBy:
 *           type: string
 *           description: User who last updated the record
 */

const locationSchema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String },
  accuracy: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

const attendanceSchema = new Schema({
  employeeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true,
    index: true
  },
  date: { 
    type: Date, 
    required: true,
    index: true
  },
  checkInTime: { 
    type: Date, 
    required: true 
  },
  checkOutTime: { 
    type: Date 
  },
  checkInLocation: { 
    type: locationSchema,
    required: true
  },
  checkOutLocation: { 
    type: locationSchema 
  },
  workHours: { 
    type: Number,
    default: 0
  },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day', 'leave', 'holiday'],
    required: true,
    default: 'present',
    index: true
  },
  overtime: { 
    type: Number,
    default: 0
  },
  isManualEntry: {
    type: Boolean,
    default: false
  },
  manualEntryReason: {
    type: String
  },
  notes: { 
    type: String 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true 
});

// Create compound index for employee and date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

/**
 * Calculate work hours when checking out
 */
attendanceSchema.pre('save', function(next) {
  // Only calculate if both check-in and check-out times exist
  if (this.checkInTime && this.checkOutTime) {
    // Calculate work hours
    const checkInTime = new Date(this.checkInTime);
    const checkOutTime = new Date(this.checkOutTime);
    
    // Calculate difference in milliseconds
    const diffMs = checkOutTime - checkInTime;
    
    // Convert to hours
    this.workHours = diffMs / (1000 * 60 * 60);
    
    // Round to 2 decimal places
    this.workHours = Math.round(this.workHours * 100) / 100;
  }
  
  next();
});

/**
 * Static method to get attendance records for an employee within a date range
 * @param {ObjectId} employeeId - Employee ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Array of attendance records
 */
attendanceSchema.statics.getEmployeeAttendance = async function(employeeId, startDate, endDate) {
  return this.find({
    employeeId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

/**
 * Static method to get attendance records for a specific date
 * @param {Date} date - Date to get attendance for
 * @returns {Promise<Array>} - Array of attendance records
 */
attendanceSchema.statics.getAttendanceByDate = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    date: { $gte: startOfDay, $lte: endOfDay }
  }).populate('employeeId', 'firstName lastName employeeId');
};

/**
 * Static method to check if an employee has already checked in for the day
 * @param {ObjectId} employeeId - Employee ID
 * @param {Date} date - Date to check
 * @returns {Promise<Boolean>} - True if already checked in, false otherwise
 */
attendanceSchema.statics.hasCheckedIn = async function(employeeId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const attendance = await this.findOne({
    employeeId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });
  
  return !!attendance;
};

/**
 * Static method to get attendance statistics for an employee
 * @param {ObjectId} employeeId - Employee ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} - Attendance statistics
 */
attendanceSchema.statics.getAttendanceStats = async function(employeeId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        employeeId: mongoose.Types.ObjectId(employeeId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: {
            $cond: [{ $eq: ["$status", "present"] }, 1, 0]
          }
        },
        lateDays: {
          $sum: {
            $cond: [{ $eq: ["$status", "late"] }, 1, 0]
          }
        },
        absentDays: {
          $sum: {
            $cond: [{ $eq: ["$status", "absent"] }, 1, 0]
          }
        },
        leaveDays: {
          $sum: {
            $cond: [{ $eq: ["$status", "leave"] }, 1, 0]
          }
        },
        halfDays: {
          $sum: {
            $cond: [{ $eq: ["$status", "half-day"] }, 1, 0]
          }
        },
        holidayDays: {
          $sum: {
            $cond: [{ $eq: ["$status", "holiday"] }, 1, 0]
          }
        },
        totalWorkHours: { $sum: "$workHours" },
        totalOvertimeHours: { $sum: "$overtime" }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    leaveDays: 0,
    halfDays: 0,
    holidayDays: 0,
    totalWorkHours: 0,
    totalOvertimeHours: 0
  };
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
