/**
 * Holiday Model
 * Defines the schema for company holidays
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     Holiday:
 *       type: object
 *       required:
 *         - name
 *         - date
 *         - type
 *         - createdBy
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the holiday
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the holiday
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date for multi-day holidays
 *         type:
 *           type: string
 *           enum: [national, religious, company]
 *           description: Type of holiday
 *         description:
 *           type: string
 *           description: Description of the holiday
 *         isRecurring:
 *           type: boolean
 *           description: Whether the holiday recurs annually
 *         recurringPattern:
 *           type: object
 *           properties:
 *             month:
 *               type: number
 *             day:
 *               type: number
 *             nthDay:
 *               type: number
 *             dayOfWeek:
 *               type: number
 *         branchIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Branches where this holiday applies
 *         createdBy:
 *           type: string
 *           description: User who created the record
 *         updatedBy:
 *           type: string
 *           description: User who last updated the record
 */

const recurringPatternSchema = new Schema({
  month: { type: Number, min: 0, max: 11 }, // 0-11 for January-December
  day: { type: Number, min: 1, max: 31 }, // Day of month
  nthDay: { type: Number, min: 1, max: 5 }, // 1st, 2nd, 3rd, 4th, 5th
  dayOfWeek: { type: Number, min: 0, max: 6 } // 0-6 for Sunday-Saturday
}, { _id: false });

const holidaySchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  date: { 
    type: Date, 
    required: true,
    index: true
  },
  endDate: { 
    type: Date,
    validate: {
      validator: function(endDate) {
        return !endDate || endDate >= this.date;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  type: { 
    type: String, 
    enum: ['national', 'religious', 'company'],
    required: true,
    index: true
  },
  description: { 
    type: String,
    trim: true
  },
  isRecurring: { 
    type: Boolean, 
    default: false
  },
  recurringPattern: { 
    type: recurringPatternSchema,
    required: function() { return this.isRecurring; }
  },
  branchIds: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Branch'
  }],
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
 * Static method to get holidays for a specific date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {ObjectId} branchId - Branch ID (optional)
 * @returns {Promise<Array>} - Array of holidays
 */
holidaySchema.statics.getHolidaysInRange = async function(startDate, endDate, branchId = null) {
  const query = {
    $or: [
      // Single day holidays
      {
        date: { $gte: startDate, $lte: endDate },
        endDate: null
      },
      // Multi-day holidays that start within range
      {
        date: { $gte: startDate, $lte: endDate }
      },
      // Multi-day holidays that end within range
      {
        endDate: { $gte: startDate, $lte: endDate }
      },
      // Multi-day holidays that span the entire range
      {
        date: { $lte: startDate },
        endDate: { $gte: endDate }
      }
    ]
  };
  
  // Add branch filter if provided
  if (branchId) {
    query.$or = query.$or.map(condition => ({
      ...condition,
      $or: [
        { branchIds: { $exists: false } }, // Global holidays
        { branchIds: { $size: 0 } }, // Global holidays
        { branchIds: branchId } // Branch-specific holidays
      ]
    }));
  }
  
  return this.find(query).sort({ date: 1 });
};

/**
 * Static method to check if a date is a holiday
 * @param {Date} date - Date to check
 * @param {ObjectId} branchId - Branch ID (optional)
 * @returns {Promise<Boolean>} - True if date is a holiday, false otherwise
 */
holidaySchema.statics.isHoliday = async function(date, branchId = null) {
  // Set time to start of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  // Set time to end of day
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const query = {
    $or: [
      // Single day holiday
      {
        date: { $gte: startOfDay, $lte: endOfDay },
        endDate: null
      },
      // Multi-day holiday that includes this date
      {
        date: { $lte: endOfDay },
        endDate: { $gte: startOfDay }
      }
    ]
  };
  
  // Add branch filter if provided
  if (branchId) {
    query.$or = query.$or.map(condition => ({
      ...condition,
      $or: [
        { branchIds: { $exists: false } }, // Global holidays
        { branchIds: { $size: 0 } }, // Global holidays
        { branchIds: branchId } // Branch-specific holidays
      ]
    }));
  }
  
  const count = await this.countDocuments(query);
  return count > 0;
};

/**
 * Static method to generate recurring holidays for a year
 * @param {Number} year - Year to generate holidays for
 * @param {ObjectId} userId - User ID generating the holidays
 * @returns {Promise<Array>} - Array of generated holidays
 */
holidaySchema.statics.generateRecurringHolidays = async function(year, userId) {
  // Get all recurring holidays
  const recurringHolidays = await this.find({ isRecurring: true });
  
  const generatedHolidays = [];
  
  for (const holiday of recurringHolidays) {
    try {
      // Calculate date for this year based on recurring pattern
      let date;
      
      if (holiday.recurringPattern.day) {
        // Fixed day of month (e.g., January 1st)
        date = new Date(year, holiday.recurringPattern.month, holiday.recurringPattern.day);
      } else if (holiday.recurringPattern.nthDay && holiday.recurringPattern.dayOfWeek !== undefined) {
        // Nth day of week in month (e.g., 3rd Monday in January)
        date = getNthDayOfWeekInMonth(
          year,
          holiday.recurringPattern.month,
          holiday.recurringPattern.dayOfWeek,
          holiday.recurringPattern.nthDay
        );
      }
      
      if (!date) {
        continue;
      }
      
      // Calculate end date if applicable
      let endDate = null;
      if (holiday.endDate) {
        const daysDiff = Math.ceil(
          (holiday.endDate - holiday.date) / (1000 * 60 * 60 * 24)
        );
        
        endDate = new Date(date);
        endDate.setDate(endDate.getDate() + daysDiff);
      }
      
      // Check if holiday already exists for this year
      const existingHoliday = await this.findOne({
        name: holiday.name,
        date: {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31)
        },
        isRecurring: false
      });
      
      if (existingHoliday) {
        generatedHolidays.push({
          _id: existingHoliday._id,
          name: existingHoliday.name,
          date: existingHoliday.date,
          status: 'already_exists'
        });
        continue;
      }
      
      // Create new holiday for this year
      const newHoliday = new this({
        name: holiday.name,
        date,
        endDate,
        type: holiday.type,
        description: holiday.description,
        isRecurring: false, // This is an instance of a recurring holiday
        branchIds: holiday.branchIds,
        createdBy: userId,
        updatedBy: userId
      });
      
      await newHoliday.save();
      
      generatedHolidays.push({
        _id: newHoliday._id,
        name: newHoliday.name,
        date: newHoliday.date,
        status: 'generated'
      });
    } catch (error) {
      generatedHolidays.push({
        name: holiday.name,
        error: error.message,
        status: 'error'
      });
    }
  }
  
  return generatedHolidays;
};

/**
 * Helper function to get the nth day of week in a month
 * @param {Number} year - Year
 * @param {Number} month - Month (0-11)
 * @param {Number} dayOfWeek - Day of week (0-6)
 * @param {Number} n - Nth occurrence (1-5)
 * @returns {Date} - Date object
 */
function getNthDayOfWeekInMonth(year, month, dayOfWeek, n) {
  // Start with the first day of the month
  const date = new Date(year, month, 1);
  
  // Find the first occurrence of the day of week
  while (date.getDay() !== dayOfWeek) {
    date.setDate(date.getDate() + 1);
  }
  
  // Add (n-1) weeks to get to the nth occurrence
  date.setDate(date.getDate() + (n - 1) * 7);
  
  // If we've gone into the next month, return null
  if (date.getMonth() !== month) {
    return null;
  }
  
  return date;
}

const Holiday = mongoose.model('Holiday', holidaySchema);

module.exports = Holiday;
