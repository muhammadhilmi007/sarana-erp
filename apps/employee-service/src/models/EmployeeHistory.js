/**
 * Employee History Model
 * Tracks changes to employee records for audit and history purposes
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Employee History schema
const employeeHistorySchema = new Schema({
  // Reference to the employee
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true,
  },
  
  // Action performed
  action: {
    type: String,
    enum: [
      'create',
      'update',
      'delete',
      'status_change',
      'position_change',
      'document_update',
      'contract_update',
      'skill_update',
      'education_update',
      'training_update',
      'performance_update',
      'career_update'
    ],
    required: true,
    index: true,
  },
  
  // Field that was changed
  field: {
    type: String,
    trim: true,
    index: true,
  },
  
  // Previous value
  previousValue: {
    type: Schema.Types.Mixed,
  },
  
  // New value
  newValue: {
    type: Schema.Types.Mixed,
  },
  
  // Metadata
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  performedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  // Additional information
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

/**
 * Record employee creation
 * @param {ObjectId} employeeId - Employee ID
 * @param {Object} employeeData - Employee data
 * @param {ObjectId} userId - User ID who created the employee
 * @returns {Promise<Object>} - Created history record
 */
employeeHistorySchema.statics.recordCreation = async function(employeeId, employeeData, userId) {
  return this.create({
    employeeId,
    action: 'create',
    field: 'all',
    newValue: employeeData,
    performedBy: userId,
  });
};

/**
 * Record employee update
 * @param {ObjectId} employeeId - Employee ID
 * @param {string} field - Field that was updated
 * @param {*} previousValue - Previous value
 * @param {*} newValue - New value
 * @param {ObjectId} userId - User ID who updated the employee
 * @returns {Promise<Object>} - Created history record
 */
employeeHistorySchema.statics.recordUpdate = async function(employeeId, field, previousValue, newValue, userId) {
  return this.create({
    employeeId,
    action: 'update',
    field,
    previousValue,
    newValue,
    performedBy: userId,
  });
};

/**
 * Record employee deletion
 * @param {ObjectId} employeeId - Employee ID
 * @param {Object} employeeData - Employee data
 * @param {ObjectId} userId - User ID who deleted the employee
 * @returns {Promise<Object>} - Created history record
 */
employeeHistorySchema.statics.recordDeletion = async function(employeeId, employeeData, userId) {
  return this.create({
    employeeId,
    action: 'delete',
    field: 'all',
    previousValue: employeeData,
    performedBy: userId,
  });
};

/**
 * Record employee status change
 * @param {ObjectId} employeeId - Employee ID
 * @param {string} previousStatus - Previous status
 * @param {string} newStatus - New status
 * @param {string} reason - Reason for status change
 * @param {ObjectId} userId - User ID who changed the status
 * @returns {Promise<Object>} - Created history record
 */
employeeHistorySchema.statics.recordStatusChange = async function(employeeId, previousStatus, newStatus, reason, userId) {
  return this.create({
    employeeId,
    action: 'status_change',
    field: 'employmentInfo.employmentStatus',
    previousValue: previousStatus,
    newValue: newStatus,
    notes: reason,
    performedBy: userId,
  });
};

/**
 * Record employee position change
 * @param {ObjectId} employeeId - Employee ID
 * @param {Object} previousPosition - Previous position data
 * @param {Object} newPosition - New position data
 * @param {string} reason - Reason for position change
 * @param {ObjectId} userId - User ID who changed the position
 * @returns {Promise<Object>} - Created history record
 */
employeeHistorySchema.statics.recordPositionChange = async function(employeeId, previousPosition, newPosition, reason, userId) {
  return this.create({
    employeeId,
    action: 'position_change',
    field: 'positionAssignment.current',
    previousValue: previousPosition,
    newValue: newPosition,
    notes: reason,
    performedBy: userId,
  });
};

/**
 * Record document update
 * @param {ObjectId} employeeId - Employee ID
 * @param {string} documentType - Document type
 * @param {Object} previousDocument - Previous document data
 * @param {Object} newDocument - New document data
 * @param {ObjectId} userId - User ID who updated the document
 * @returns {Promise<Object>} - Created history record
 */
employeeHistorySchema.statics.recordDocumentUpdate = async function(employeeId, documentType, previousDocument, newDocument, userId) {
  return this.create({
    employeeId,
    action: 'document_update',
    field: `identificationDocuments.${documentType}`,
    previousValue: previousDocument,
    newValue: newDocument,
    performedBy: userId,
  });
};

/**
 * Record contract update
 * @param {ObjectId} employeeId - Employee ID
 * @param {string} contractId - Contract ID
 * @param {Object} previousContract - Previous contract data
 * @param {Object} newContract - New contract data
 * @param {ObjectId} userId - User ID who updated the contract
 * @returns {Promise<Object>} - Created history record
 */
employeeHistorySchema.statics.recordContractUpdate = async function(employeeId, contractId, previousContract, newContract, userId) {
  return this.create({
    employeeId,
    action: 'contract_update',
    field: `contracts.${contractId}`,
    previousValue: previousContract,
    newValue: newContract,
    performedBy: userId,
  });
};

/**
 * Get employee history
 * @param {ObjectId} employeeId - Employee ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - History records
 */
employeeHistorySchema.statics.getEmployeeHistory = async function(employeeId, options = {}) {
  const { action, field, startDate, endDate, limit = 20, skip = 0 } = options;
  
  const query = { employeeId };
  
  if (action) {
    query.action = action;
  }
  
  if (field) {
    query.field = field;
  }
  
  if (startDate || endDate) {
    query.performedAt = {};
    
    if (startDate) {
      query.performedAt.$gte = new Date(startDate);
    }
    
    if (endDate) {
      query.performedAt.$lte = new Date(endDate);
    }
  }
  
  return this.find(query)
    .sort({ performedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('performedBy', 'username email');
};

// Create the EmployeeHistory model
const EmployeeHistory = mongoose.model('EmployeeHistory', employeeHistorySchema);

module.exports = EmployeeHistory;
