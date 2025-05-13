/**
 * Leave Model
 * Defines the schema for employee leave requests
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     Leave:
 *       type: object
 *       required:
 *         - employeeId
 *         - leaveType
 *         - startDate
 *         - endDate
 *         - status
 *         - createdBy
 *       properties:
 *         employeeId:
 *           type: string
 *           description: Reference to the employee
 *         leaveType:
 *           type: string
 *           enum: [annual, sick, maternity, paternity, bereavement, unpaid, other]
 *           description: Type of leave
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date of leave
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date of leave
 *         duration:
 *           type: number
 *           description: Duration of leave in days
 *         reason:
 *           type: string
 *           description: Reason for leave
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fileUrl:
 *                 type: string
 *               fileName:
 *                 type: string
 *               fileType:
 *                 type: string
 *               uploadedAt:
 *                 type: string
 *                 format: date-time
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *           description: Status of leave request
 *         approvalHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               approvedBy:
 *                 type: string
 *               approvedAt:
 *                 type: string
 *                 format: date-time
 *               comments:
 *                 type: string
 *         createdBy:
 *           type: string
 *           description: User who created the record
 *         updatedBy:
 *           type: string
 *           description: User who last updated the record
 */

const attachmentSchema = new Schema({
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

const approvalHistorySchema = new Schema({
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    required: true
  },
  approvedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  approvedAt: { 
    type: Date,
    default: Date.now,
    required: true
  },
  comments: { type: String }
});

const leaveSchema = new Schema({
  employeeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true,
    index: true
  },
  leaveType: { 
    type: String, 
    enum: ['annual', 'sick', 'maternity', 'paternity', 'bereavement', 'unpaid', 'other'],
    required: true,
    index: true
  },
  startDate: { 
    type: Date, 
    required: true,
    index: true
  },
  endDate: { 
    type: Date, 
    required: true,
    index: true
  },
  duration: { 
    type: Number,
    required: true
  },
  halfDay: {
    type: Boolean,
    default: false
  },
  reason: { 
    type: String, 
    required: true 
  },
  attachments: [attachmentSchema],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    required: true,
    index: true
  },
  approvalHistory: [approvalHistorySchema],
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
 * Calculate leave duration before saving
 */
leaveSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('startDate') || this.isModified('endDate')) {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    
    // Set hours to 0 to compare only dates
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Add 1 to include both start and end dates
    this.duration = diffDays + 1;
    
    // If it's a half day, set duration to 0.5
    if (this.halfDay && this.duration === 1) {
      this.duration = 0.5;
    }
  }
  
  next();
});

/**
 * Static method to get leave requests for an employee
 * @param {ObjectId} employeeId - Employee ID
 * @param {Object} filters - Filters for leave requests
 * @returns {Promise<Array>} - Array of leave requests
 */
leaveSchema.statics.getEmployeeLeaves = async function(employeeId, filters = {}) {
  const query = { employeeId };
  
  // Apply status filter if provided
  if (filters.status) {
    query.status = filters.status;
  }
  
  // Apply date range filter if provided
  if (filters.startDate && filters.endDate) {
    query.$or = [
      { startDate: { $gte: filters.startDate, $lte: filters.endDate } },
      { endDate: { $gte: filters.startDate, $lte: filters.endDate } },
      { 
        $and: [
          { startDate: { $lte: filters.startDate } },
          { endDate: { $gte: filters.endDate } }
        ]
      }
    ];
  }
  
  // Apply leave type filter if provided
  if (filters.leaveType) {
    query.leaveType = filters.leaveType;
  }
  
  return this.find(query).sort({ startDate: -1 });
};

/**
 * Static method to check if an employee has overlapping leave requests
 * @param {ObjectId} employeeId - Employee ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {ObjectId} excludeLeaveId - Leave ID to exclude from check
 * @returns {Promise<Boolean>} - True if overlapping leaves exist, false otherwise
 */
leaveSchema.statics.hasOverlappingLeaves = async function(employeeId, startDate, endDate, excludeLeaveId = null) {
  const query = {
    employeeId,
    status: { $in: ['pending', 'approved'] },
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { 
        $and: [
          { startDate: { $lte: startDate } },
          { endDate: { $gte: endDate } }
        ]
      }
    ]
  };
  
  // Exclude the current leave if updating
  if (excludeLeaveId) {
    query._id = { $ne: excludeLeaveId };
  }
  
  const overlappingLeaves = await this.countDocuments(query);
  return overlappingLeaves > 0;
};

/**
 * Static method to get leave statistics for an employee
 * @param {ObjectId} employeeId - Employee ID
 * @param {Number} year - Year for statistics
 * @returns {Promise<Object>} - Leave statistics
 */
leaveSchema.statics.getLeaveStats = async function(employeeId, year) {
  const startDate = new Date(year, 0, 1); // January 1st of the year
  const endDate = new Date(year, 11, 31); // December 31st of the year
  
  const stats = await this.aggregate([
    {
      $match: {
        employeeId: mongoose.Types.ObjectId(employeeId),
        status: 'approved',
        startDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$leaveType',
        count: { $sum: 1 },
        totalDays: { $sum: '$duration' }
      }
    }
  ]);
  
  // Convert array to object with leave types as keys
  const result = {
    annual: { count: 0, totalDays: 0 },
    sick: { count: 0, totalDays: 0 },
    maternity: { count: 0, totalDays: 0 },
    paternity: { count: 0, totalDays: 0 },
    bereavement: { count: 0, totalDays: 0 },
    unpaid: { count: 0, totalDays: 0 },
    other: { count: 0, totalDays: 0 }
  };
  
  stats.forEach(item => {
    result[item._id] = {
      count: item.count,
      totalDays: item.totalDays
    };
  });
  
  return result;
};

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
