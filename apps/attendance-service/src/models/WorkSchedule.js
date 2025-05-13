/**
 * Work Schedule Model
 * Defines the schema for employee work schedules and shifts
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     WorkSchedule:
 *       type: object
 *       required:
 *         - name
 *         - scheduleType
 *         - createdBy
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the work schedule
 *         description:
 *           type: string
 *           description: Description of the work schedule
 *         scheduleType:
 *           type: string
 *           enum: [regular, shift, flexible]
 *           description: Type of work schedule
 *         workDays:
 *           type: array
 *           items:
 *             type: number
 *           description: Days of the week (0-6, Sunday-Saturday)
 *         workHours:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               format: time
 *             end:
 *               type: string
 *               format: time
 *         breakTime:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               format: time
 *             end:
 *               type: string
 *               format: time
 *             duration:
 *               type: number
 *         shifts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               breakDuration:
 *                 type: number
 *         flexibleHours:
 *           type: object
 *           properties:
 *             coreHoursStart:
 *               type: string
 *               format: time
 *             coreHoursEnd:
 *               type: string
 *               format: time
 *             minWorkHours:
 *               type: number
 *         isActive:
 *           type: boolean
 *           description: Whether the schedule is active
 *         createdBy:
 *           type: string
 *           description: User who created the record
 *         updatedBy:
 *           type: string
 *           description: User who last updated the record
 */

const timeSchema = new Schema({
  hours: { type: Number, min: 0, max: 23, required: true },
  minutes: { type: Number, min: 0, max: 59, required: true }
}, { _id: false });

const workHoursSchema = new Schema({
  start: { type: timeSchema, required: true },
  end: { type: timeSchema, required: true }
}, { _id: false });

const breakTimeSchema = new Schema({
  start: { type: timeSchema },
  end: { type: timeSchema },
  duration: { type: Number, min: 0, default: 60 } // Duration in minutes
}, { _id: false });

const shiftSchema = new Schema({
  name: { type: String, required: true },
  startTime: { type: timeSchema, required: true },
  endTime: { type: timeSchema, required: true },
  breakDuration: { type: Number, min: 0, default: 60 } // Duration in minutes
}, { _id: false });

const flexibleHoursSchema = new Schema({
  coreHoursStart: { type: timeSchema },
  coreHoursEnd: { type: timeSchema },
  minWorkHours: { type: Number, min: 0, default: 8 }
}, { _id: false });

const workScheduleSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  scheduleType: { 
    type: String, 
    enum: ['regular', 'shift', 'flexible'],
    required: true
  },
  workDays: { 
    type: [{ type: Number, min: 0, max: 6 }], // 0-6 for Sunday-Saturday
    default: [1, 2, 3, 4, 5] // Monday-Friday by default
  },
  workHours: { 
    type: workHoursSchema,
    required: function() { return this.scheduleType === 'regular'; }
  },
  breakTime: { 
    type: breakTimeSchema,
    default: () => ({
      start: { hours: 12, minutes: 0 },
      end: { hours: 13, minutes: 0 },
      duration: 60
    })
  },
  shifts: { 
    type: [shiftSchema],
    required: function() { return this.scheduleType === 'shift'; },
    validate: {
      validator: function(shifts) {
        return this.scheduleType !== 'shift' || shifts.length > 0;
      },
      message: 'Shifts are required for shift schedule type'
    }
  },
  flexibleHours: { 
    type: flexibleHoursSchema,
    required: function() { return this.scheduleType === 'flexible'; }
  },
  isActive: { 
    type: Boolean, 
    default: true
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

/**
 * @swagger
 * components:
 *   schemas:
 *     EmployeeSchedule:
 *       type: object
 *       required:
 *         - employeeId
 *         - scheduleId
 *         - effectiveDate
 *         - createdBy
 *       properties:
 *         employeeId:
 *           type: string
 *           description: Reference to the employee
 *         scheduleId:
 *           type: string
 *           description: Reference to the work schedule
 *         effectiveDate:
 *           type: string
 *           format: date
 *           description: Date from which the schedule is effective
 *         expiryDate:
 *           type: string
 *           format: date
 *           description: Date until which the schedule is effective
 *         overrides:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               scheduleId:
 *                 type: string
 *               reason:
 *                 type: string
 *         createdBy:
 *           type: string
 *           description: User who created the record
 *         updatedBy:
 *           type: string
 *           description: User who last updated the record
 */

const scheduleOverrideSchema = new Schema({
  date: { type: Date, required: true },
  scheduleId: { type: Schema.Types.ObjectId, ref: 'WorkSchedule' },
  reason: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const employeeScheduleSchema = new Schema({
  employeeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true,
    index: true
  },
  scheduleId: { 
    type: Schema.Types.ObjectId, 
    ref: 'WorkSchedule', 
    required: true
  },
  effectiveDate: { 
    type: Date, 
    required: true,
    index: true
  },
  expiryDate: { 
    type: Date,
    index: true
  },
  overrides: [scheduleOverrideSchema],
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

// Create compound index for employee and effective date
employeeScheduleSchema.index({ employeeId: 1, effectiveDate: 1 });

/**
 * Static method to get active work schedule for an employee on a specific date
 * @param {ObjectId} employeeId - Employee ID
 * @param {Date} date - Date to check
 * @returns {Promise<Object>} - Work schedule
 */
employeeScheduleSchema.statics.getEmployeeScheduleForDate = async function(employeeId, date) {
  // Check if there's an override for this date
  const scheduleWithOverride = await this.findOne({
    employeeId,
    'overrides.date': date
  });
  
  if (scheduleWithOverride) {
    // Find the specific override
    const override = scheduleWithOverride.overrides.find(o => 
      o.date.getTime() === date.getTime()
    );
    
    if (override && override.scheduleId) {
      // Return the override schedule
      return mongoose.model('WorkSchedule').findById(override.scheduleId);
    }
  }
  
  // If no override, find the regular schedule effective on this date
  const employeeSchedule = await this.findOne({
    employeeId,
    effectiveDate: { $lte: date },
    $or: [
      { expiryDate: null },
      { expiryDate: { $gte: date } }
    ]
  }).sort({ effectiveDate: -1 }).limit(1);
  
  if (!employeeSchedule) {
    return null;
  }
  
  return mongoose.model('WorkSchedule').findById(employeeSchedule.scheduleId);
};

/**
 * Static method to add a schedule override for an employee
 * @param {ObjectId} employeeId - Employee ID
 * @param {Date} date - Date for override
 * @param {ObjectId} scheduleId - Schedule ID for override
 * @param {String} reason - Reason for override
 * @param {ObjectId} userId - User ID creating the override
 * @returns {Promise<Object>} - Updated employee schedule
 */
employeeScheduleSchema.statics.addScheduleOverride = async function(employeeId, date, scheduleId, reason, userId) {
  // Find the active schedule for this employee
  const employeeSchedule = await this.findOne({
    employeeId,
    effectiveDate: { $lte: date },
    $or: [
      { expiryDate: null },
      { expiryDate: { $gte: date } }
    ]
  }).sort({ effectiveDate: -1 }).limit(1);
  
  if (!employeeSchedule) {
    throw new Error('No active schedule found for this employee');
  }
  
  // Check if override already exists
  const existingOverrideIndex = employeeSchedule.overrides.findIndex(o => 
    o.date.getTime() === date.getTime()
  );
  
  if (existingOverrideIndex >= 0) {
    // Update existing override
    employeeSchedule.overrides[existingOverrideIndex] = {
      date,
      scheduleId,
      reason,
      createdBy: userId,
      createdAt: new Date()
    };
  } else {
    // Add new override
    employeeSchedule.overrides.push({
      date,
      scheduleId,
      reason,
      createdBy: userId,
      createdAt: new Date()
    });
  }
  
  // Update the updatedBy field
  employeeSchedule.updatedBy = userId;
  
  return employeeSchedule.save();
};

/**
 * Calculate work hours for a given schedule and date
 * @param {Object} schedule - Work schedule
 * @param {Date} date - Date to calculate hours for
 * @returns {Object} - Work hours details
 */
workScheduleSchema.methods.calculateWorkHours = function(date) {
  const dayOfWeek = date.getDay(); // 0-6 for Sunday-Saturday
  
  // Check if this is a work day
  if (!this.workDays.includes(dayOfWeek)) {
    return {
      isWorkDay: false,
      workHours: 0,
      startTime: null,
      endTime: null,
      breakDuration: 0
    };
  }
  
  // Calculate based on schedule type
  if (this.scheduleType === 'regular') {
    const startTime = new Date(date);
    startTime.setHours(this.workHours.start.hours, this.workHours.start.minutes, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(this.workHours.end.hours, this.workHours.end.minutes, 0, 0);
    
    // Calculate total work hours
    let workHours = (endTime - startTime) / (1000 * 60 * 60);
    
    // Subtract break time
    if (this.breakTime) {
      workHours -= this.breakTime.duration / 60;
    }
    
    return {
      isWorkDay: true,
      workHours,
      startTime,
      endTime,
      breakDuration: this.breakTime ? this.breakTime.duration : 0
    };
  } else if (this.scheduleType === 'shift') {
    // For shift schedules, we'd need to know which shift the employee is on
    // This would typically come from a shift assignment, but for simplicity
    // we'll just return the first shift
    if (this.shifts && this.shifts.length > 0) {
      const shift = this.shifts[0];
      
      const startTime = new Date(date);
      startTime.setHours(shift.startTime.hours, shift.startTime.minutes, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(shift.endTime.hours, shift.endTime.minutes, 0, 0);
      
      // Handle overnight shifts
      if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }
      
      // Calculate total work hours
      let workHours = (endTime - startTime) / (1000 * 60 * 60);
      
      // Subtract break time
      workHours -= shift.breakDuration / 60;
      
      return {
        isWorkDay: true,
        workHours,
        startTime,
        endTime,
        breakDuration: shift.breakDuration
      };
    }
  } else if (this.scheduleType === 'flexible') {
    // For flexible schedules, we just return the minimum work hours
    return {
      isWorkDay: true,
      workHours: this.flexibleHours.minWorkHours,
      startTime: null, // Flexible start time
      endTime: null, // Flexible end time
      breakDuration: this.breakTime ? this.breakTime.duration : 0
    };
  }
  
  // Default return if no schedule details available
  return {
    isWorkDay: true,
    workHours: 8, // Default to 8 hours
    startTime: null,
    endTime: null,
    breakDuration: 0
  };
};

const WorkSchedule = mongoose.model('WorkSchedule', workScheduleSchema);
const EmployeeSchedule = mongoose.model('EmployeeSchedule', employeeScheduleSchema);

module.exports = {
  WorkSchedule,
  EmployeeSchedule
};
