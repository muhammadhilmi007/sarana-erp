/**
 * Leave Balance Model
 * Defines the schema for employee leave balances and accruals
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     LeaveBalance:
 *       type: object
 *       required:
 *         - employeeId
 *         - year
 *         - createdBy
 *       properties:
 *         employeeId:
 *           type: string
 *           description: Reference to the employee
 *         year:
 *           type: number
 *           description: Year for the leave balance
 *         annual:
 *           type: object
 *           properties:
 *             entitled:
 *               type: number
 *             used:
 *               type: number
 *             pending:
 *               type: number
 *             remaining:
 *               type: number
 *             carryOver:
 *               type: number
 *         sick:
 *           type: object
 *           properties:
 *             entitled:
 *               type: number
 *             used:
 *               type: number
 *             pending:
 *               type: number
 *             remaining:
 *               type: number
 *         transactions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               leaveType:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *               reason:
 *                 type: string
 *               leaveRequestId:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *         createdBy:
 *           type: string
 *           description: User who created the record
 *         updatedBy:
 *           type: string
 *           description: User who last updated the record
 */

const leaveTypeBalanceSchema = new Schema({
  entitled: { type: Number, default: 0 },
  used: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  carryOver: { type: Number, default: 0 }
});

const transactionSchema = new Schema({
  date: { type: Date, default: Date.now, required: true },
  leaveType: { 
    type: String, 
    enum: ['annual', 'sick', 'maternity', 'paternity', 'bereavement', 'unpaid', 'other'],
    required: true
  },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['accrual', 'used', 'adjustment', 'carryOver', 'expiry'],
    required: true
  },
  reason: { type: String },
  leaveRequestId: { type: Schema.Types.ObjectId, ref: 'Leave' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const leaveBalanceSchema = new Schema({
  employeeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true,
    index: true
  },
  year: { 
    type: Number, 
    required: true,
    index: true
  },
  annual: { 
    type: leaveTypeBalanceSchema,
    default: () => ({})
  },
  sick: { 
    type: leaveTypeBalanceSchema,
    default: () => ({})
  },
  maternity: { 
    type: leaveTypeBalanceSchema,
    default: () => ({})
  },
  paternity: { 
    type: leaveTypeBalanceSchema,
    default: () => ({})
  },
  bereavement: { 
    type: leaveTypeBalanceSchema,
    default: () => ({})
  },
  unpaid: { 
    type: leaveTypeBalanceSchema,
    default: () => ({})
  },
  other: { 
    type: leaveTypeBalanceSchema,
    default: () => ({})
  },
  transactions: [transactionSchema],
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

// Create compound index for employee and year
leaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

/**
 * Static method to get or create leave balance for an employee
 * @param {ObjectId} employeeId - Employee ID
 * @param {Number} year - Year for leave balance
 * @param {ObjectId} userId - User ID creating the record
 * @returns {Promise<Object>} - Leave balance record
 */
leaveBalanceSchema.statics.getOrCreate = async function(employeeId, year, userId) {
  let leaveBalance = await this.findOne({ employeeId, year });
  
  if (!leaveBalance) {
    // Create new leave balance record
    leaveBalance = new this({
      employeeId,
      year,
      annual: {
        entitled: 12, // Default annual leave entitlement
        used: 0,
        pending: 0,
        remaining: 12,
        carryOver: 0
      },
      sick: {
        entitled: 14, // Default sick leave entitlement
        used: 0,
        pending: 0,
        remaining: 14
      },
      createdBy: userId,
      updatedBy: userId
    });
    
    await leaveBalance.save();
  }
  
  return leaveBalance;
};

/**
 * Static method to add a leave transaction
 * @param {ObjectId} employeeId - Employee ID
 * @param {Number} year - Year for leave balance
 * @param {Object} transaction - Transaction details
 * @returns {Promise<Object>} - Updated leave balance
 */
leaveBalanceSchema.statics.addTransaction = async function(employeeId, year, transaction) {
  const leaveBalance = await this.findOne({ employeeId, year });
  
  if (!leaveBalance) {
    throw new Error('Leave balance not found');
  }
  
  // Add transaction to history
  leaveBalance.transactions.push(transaction);
  
  // Update balance based on transaction type
  const leaveType = transaction.leaveType;
  
  if (transaction.type === 'accrual' || transaction.type === 'adjustment' || transaction.type === 'carryOver') {
    // Add to entitlement for accruals and positive adjustments
    if (transaction.amount > 0) {
      leaveBalance[leaveType].entitled += transaction.amount;
      leaveBalance[leaveType].remaining += transaction.amount;
    } else {
      // For negative adjustments, reduce from remaining
      leaveBalance[leaveType].entitled += transaction.amount;
      leaveBalance[leaveType].remaining += transaction.amount;
    }
    
    // For carry over specifically
    if (transaction.type === 'carryOver') {
      leaveBalance[leaveType].carryOver += transaction.amount;
    }
  } else if (transaction.type === 'used') {
    // For used leave, update pending or used based on leave status
    const leave = await mongoose.model('Leave').findById(transaction.leaveRequestId);
    
    if (leave && leave.status === 'pending') {
      leaveBalance[leaveType].pending += transaction.amount;
    } else if (leave && leave.status === 'approved') {
      leaveBalance[leaveType].used += transaction.amount;
      leaveBalance[leaveType].remaining -= transaction.amount;
    }
  } else if (transaction.type === 'expiry') {
    // For expired leave, reduce from remaining
    leaveBalance[leaveType].remaining += transaction.amount; // amount will be negative
  }
  
  // Update the updatedBy field
  leaveBalance.updatedBy = transaction.updatedBy;
  
  return leaveBalance.save();
};

/**
 * Static method to update leave balance when leave status changes
 * @param {ObjectId} leaveId - Leave ID
 * @param {String} newStatus - New leave status
 * @param {ObjectId} userId - User ID updating the record
 * @returns {Promise<Object>} - Updated leave balance
 */
leaveBalanceSchema.statics.updateForLeaveStatusChange = async function(leaveId, newStatus, userId) {
  const leave = await mongoose.model('Leave').findById(leaveId).populate('employeeId');
  
  if (!leave) {
    throw new Error('Leave request not found');
  }
  
  const year = leave.startDate.getFullYear();
  const leaveBalance = await this.findOne({ employeeId: leave.employeeId._id, year });
  
  if (!leaveBalance) {
    throw new Error('Leave balance not found');
  }
  
  const leaveType = leave.leaveType;
  const duration = leave.duration;
  
  // Update balance based on status change
  if (newStatus === 'approved' && leave.status === 'pending') {
    // Move from pending to used
    leaveBalance[leaveType].pending -= duration;
    leaveBalance[leaveType].used += duration;
    leaveBalance[leaveType].remaining -= duration;
    
    // Add transaction
    leaveBalance.transactions.push({
      date: new Date(),
      leaveType,
      amount: duration,
      type: 'used',
      reason: 'Leave approved',
      leaveRequestId: leave._id,
      updatedBy: userId
    });
  } else if (newStatus === 'rejected' && leave.status === 'pending') {
    // Remove from pending
    leaveBalance[leaveType].pending -= duration;
    
    // Add transaction
    leaveBalance.transactions.push({
      date: new Date(),
      leaveType,
      amount: -duration,
      type: 'adjustment',
      reason: 'Leave rejected',
      leaveRequestId: leave._id,
      updatedBy: userId
    });
  } else if (newStatus === 'cancelled') {
    if (leave.status === 'pending') {
      // Remove from pending
      leaveBalance[leaveType].pending -= duration;
    } else if (leave.status === 'approved') {
      // Remove from used and add back to remaining
      leaveBalance[leaveType].used -= duration;
      leaveBalance[leaveType].remaining += duration;
    }
    
    // Add transaction
    leaveBalance.transactions.push({
      date: new Date(),
      leaveType,
      amount: -duration,
      type: 'adjustment',
      reason: 'Leave cancelled',
      leaveRequestId: leave._id,
      updatedBy: userId
    });
  }
  
  // Update the updatedBy field
  leaveBalance.updatedBy = userId;
  
  return leaveBalance.save();
};

/**
 * Static method to process monthly accruals for all employees
 * @param {Number} year - Year for accrual
 * @param {Number} month - Month for accrual (0-11)
 * @param {ObjectId} userId - User ID processing the accrual
 * @returns {Promise<Array>} - Array of updated leave balances
 */
leaveBalanceSchema.statics.processMonthlyAccruals = async function(year, month, userId) {
  // Get all employees
  const employees = await mongoose.model('Employee').find({
    'employmentInfo.employmentStatus': 'active'
  });
  
  const results = [];
  
  // Process accrual for each employee
  for (const employee of employees) {
    try {
      // Get or create leave balance
      const leaveBalance = await this.getOrCreate(employee._id, year, userId);
      
      // Calculate accrual amount based on employment type and tenure
      let annualAccrual = 1; // Default monthly accrual
      
      // Check employment type
      if (employee.employmentInfo.employmentType === 'part-time') {
        annualAccrual = 0.5; // Half accrual for part-time
      }
      
      // Add transaction for annual leave accrual
      leaveBalance.transactions.push({
        date: new Date(year, month),
        leaveType: 'annual',
        amount: annualAccrual,
        type: 'accrual',
        reason: `Monthly accrual for ${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`,
        updatedBy: userId
      });
      
      // Update annual leave balance
      leaveBalance.annual.entitled += annualAccrual;
      leaveBalance.annual.remaining += annualAccrual;
      
      // Update the updatedBy field
      leaveBalance.updatedBy = userId;
      
      // Save the updated balance
      await leaveBalance.save();
      
      results.push({
        employeeId: employee._id,
        success: true,
        message: 'Accrual processed successfully'
      });
    } catch (error) {
      results.push({
        employeeId: employee._id,
        success: false,
        message: error.message
      });
    }
  }
  
  return results;
};

/**
 * Static method to process year-end carry over
 * @param {Number} fromYear - Year to carry over from
 * @param {Number} toYear - Year to carry over to
 * @param {Number} maxCarryOver - Maximum days to carry over
 * @param {ObjectId} userId - User ID processing the carry over
 * @returns {Promise<Array>} - Array of updated leave balances
 */
leaveBalanceSchema.statics.processYearEndCarryOver = async function(fromYear, toYear, maxCarryOver, userId) {
  // Get all leave balances for the from year
  const leaveBalances = await this.find({ year: fromYear });
  
  const results = [];
  
  // Process carry over for each employee
  for (const balance of leaveBalances) {
    try {
      // Calculate carry over amount (up to max)
      const carryOverAmount = Math.min(balance.annual.remaining, maxCarryOver);
      
      if (carryOverAmount <= 0) {
        results.push({
          employeeId: balance.employeeId,
          success: true,
          message: 'No leave to carry over'
        });
        continue;
      }
      
      // Get or create leave balance for the to year
      const toYearBalance = await this.getOrCreate(balance.employeeId, toYear, userId);
      
      // Add transaction for carry over
      toYearBalance.transactions.push({
        date: new Date(toYear, 0, 1), // January 1st of to year
        leaveType: 'annual',
        amount: carryOverAmount,
        type: 'carryOver',
        reason: `Carry over from ${fromYear}`,
        updatedBy: userId
      });
      
      // Update annual leave balance
      toYearBalance.annual.entitled += carryOverAmount;
      toYearBalance.annual.remaining += carryOverAmount;
      toYearBalance.annual.carryOver += carryOverAmount;
      
      // Update the updatedBy field
      toYearBalance.updatedBy = userId;
      
      // Save the updated balance
      await toYearBalance.save();
      
      // Add transaction for expiry in from year balance
      balance.transactions.push({
        date: new Date(fromYear, 11, 31), // December 31st of from year
        leaveType: 'annual',
        amount: -carryOverAmount,
        type: 'expiry',
        reason: `Carried over to ${toYear}`,
        updatedBy: userId
      });
      
      // Update the from year balance
      balance.annual.remaining -= carryOverAmount;
      balance.updatedBy = userId;
      
      await balance.save();
      
      results.push({
        employeeId: balance.employeeId,
        success: true,
        message: `Carried over ${carryOverAmount} days`
      });
    } catch (error) {
      results.push({
        employeeId: balance.employeeId,
        success: false,
        message: error.message
      });
    }
  }
  
  return results;
};

const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);

module.exports = LeaveBalance;
