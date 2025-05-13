/**
 * Attendance Correction Model
 * Defines the schema for attendance correction requests
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     AttendanceCorrection:
 *       type: object
 *       required:
 *         - employeeId
 *         - attendanceId
 *         - requestType
 *         - reason
 *         - status
 *         - createdBy
 *       properties:
 *         employeeId:
 *           type: string
 *           description: Reference to the employee
 *         attendanceId:
 *           type: string
 *           description: Reference to the attendance record
 *         requestType:
 *           type: string
 *           enum: [check_in, check_out, both, status]
 *           description: Type of correction request
 *         oldCheckInTime:
 *           type: string
 *           format: date-time
 *           description: Original check-in time
 *         newCheckInTime:
 *           type: string
 *           format: date-time
 *           description: Requested check-in time
 *         oldCheckOutTime:
 *           type: string
 *           format: date-time
 *           description: Original check-out time
 *         newCheckOutTime:
 *           type: string
 *           format: date-time
 *           description: Requested check-out time
 *         oldStatus:
 *           type: string
 *           description: Original attendance status
 *         newStatus:
 *           type: string
 *           description: Requested attendance status
 *         reason:
 *           type: string
 *           description: Reason for correction
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
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Status of correction request
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
    enum: ['pending', 'approved', 'rejected'],
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

const attendanceCorrectionSchema = new Schema({
  employeeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true,
    index: true
  },
  attendanceId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Attendance', 
    required: true,
    index: true
  },
  requestType: { 
    type: String, 
    enum: ['check_in', 'check_out', 'both', 'status'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  oldCheckInTime: { 
    type: Date
  },
  newCheckInTime: { 
    type: Date,
    required: function() { 
      return this.requestType === 'check_in' || this.requestType === 'both'; 
    }
  },
  oldCheckOutTime: { 
    type: Date
  },
  newCheckOutTime: { 
    type: Date,
    required: function() { 
      return this.requestType === 'check_out' || this.requestType === 'both'; 
    }
  },
  oldStatus: { 
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'leave', 'holiday']
  },
  newStatus: { 
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'leave', 'holiday'],
    required: function() { 
      return this.requestType === 'status'; 
    }
  },
  reason: { 
    type: String, 
    required: true 
  },
  attachments: [attachmentSchema],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
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
 * Static method to get correction requests for an employee
 * @param {ObjectId} employeeId - Employee ID
 * @param {Object} filters - Filters for correction requests
 * @returns {Promise<Array>} - Array of correction requests
 */
attendanceCorrectionSchema.statics.getEmployeeCorrections = async function(employeeId, filters = {}) {
  const query = { employeeId };
  
  // Apply status filter if provided
  if (filters.status) {
    query.status = filters.status;
  }
  
  // Apply date range filter if provided
  if (filters.startDate && filters.endDate) {
    query.date = { $gte: filters.startDate, $lte: filters.endDate };
  }
  
  // Apply request type filter if provided
  if (filters.requestType) {
    query.requestType = filters.requestType;
  }
  
  return this.find(query)
    .populate('attendanceId')
    .sort({ createdAt: -1 });
};

/**
 * Static method to process an approved correction request
 * @param {ObjectId} correctionId - Correction request ID
 * @param {ObjectId} approverId - User ID approving the request
 * @param {String} comments - Approval comments
 * @returns {Promise<Object>} - Updated attendance record
 */
attendanceCorrectionSchema.statics.approveCorrection = async function(correctionId, approverId, comments = '') {
  const correction = await this.findById(correctionId);
  
  if (!correction) {
    throw new Error('Correction request not found');
  }
  
  if (correction.status !== 'pending') {
    throw new Error('Correction request has already been processed');
  }
  
  // Update correction status
  correction.status = 'approved';
  
  // Add to approval history
  correction.approvalHistory.push({
    status: 'approved',
    approvedBy: approverId,
    approvedAt: new Date(),
    comments
  });
  
  // Update the updatedBy field
  correction.updatedBy = approverId;
  
  // Save the updated correction
  await correction.save();
  
  // Update the attendance record
  const attendance = await mongoose.model('Attendance').findById(correction.attendanceId);
  
  if (!attendance) {
    throw new Error('Attendance record not found');
  }
  
  // Apply changes based on request type
  if (correction.requestType === 'check_in' || correction.requestType === 'both') {
    attendance.checkInTime = correction.newCheckInTime;
  }
  
  if (correction.requestType === 'check_out' || correction.requestType === 'both') {
    attendance.checkOutTime = correction.newCheckOutTime;
  }
  
  if (correction.requestType === 'status') {
    attendance.status = correction.newStatus;
  }
  
  // Update the updatedBy field
  attendance.updatedBy = approverId;
  
  // Save the updated attendance
  return attendance.save();
};

/**
 * Static method to reject a correction request
 * @param {ObjectId} correctionId - Correction request ID
 * @param {ObjectId} rejecterId - User ID rejecting the request
 * @param {String} comments - Rejection comments
 * @returns {Promise<Object>} - Updated correction request
 */
attendanceCorrectionSchema.statics.rejectCorrection = async function(correctionId, rejecterId, comments = '') {
  const correction = await this.findById(correctionId);
  
  if (!correction) {
    throw new Error('Correction request not found');
  }
  
  if (correction.status !== 'pending') {
    throw new Error('Correction request has already been processed');
  }
  
  // Update correction status
  correction.status = 'rejected';
  
  // Add to approval history
  correction.approvalHistory.push({
    status: 'rejected',
    approvedBy: rejecterId,
    approvedAt: new Date(),
    comments
  });
  
  // Update the updatedBy field
  correction.updatedBy = rejecterId;
  
  // Save the updated correction
  return correction.save();
};

const AttendanceCorrection = mongoose.model('AttendanceCorrection', attendanceCorrectionSchema);

module.exports = AttendanceCorrection;
