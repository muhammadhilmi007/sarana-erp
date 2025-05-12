/**
 * Branch History Model
 * Tracks changes to branches for audit purposes
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const branchHistorySchema = new Schema({
  branchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'status_change', 'resource_update', 'document_add', 'document_update'],
    required: true,
    index: true,
  },
  field: {
    type: String,
    index: true,
  },
  oldValue: {
    type: Schema.Types.Mixed,
  },
  newValue: {
    type: Schema.Types.Mixed,
  },
  reason: {
    type: String,
    trim: true,
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  performedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

/**
 * Create history entry for branch creation
 * @param {ObjectId} branchId - Branch ID
 * @param {Object} branchData - Branch data
 * @param {ObjectId} userId - User ID who created the branch
 * @returns {Promise<Object>} - Created history entry
 */
branchHistorySchema.statics.recordCreation = async function(branchId, branchData, userId) {
  return this.create({
    branchId,
    action: 'create',
    newValue: branchData,
    performedBy: userId,
  });
};

/**
 * Create history entry for branch update
 * @param {ObjectId} branchId - Branch ID
 * @param {string} field - Updated field
 * @param {*} oldValue - Old value
 * @param {*} newValue - New value
 * @param {ObjectId} userId - User ID who updated the branch
 * @param {string} reason - Reason for update
 * @returns {Promise<Object>} - Created history entry
 */
branchHistorySchema.statics.recordUpdate = async function(branchId, field, oldValue, newValue, userId, reason = '') {
  return this.create({
    branchId,
    action: 'update',
    field,
    oldValue,
    newValue,
    reason,
    performedBy: userId,
  });
};

/**
 * Create history entry for branch deletion
 * @param {ObjectId} branchId - Branch ID
 * @param {Object} branchData - Branch data before deletion
 * @param {ObjectId} userId - User ID who deleted the branch
 * @param {string} reason - Reason for deletion
 * @returns {Promise<Object>} - Created history entry
 */
branchHistorySchema.statics.recordDeletion = async function(branchId, branchData, userId, reason = '') {
  return this.create({
    branchId,
    action: 'delete',
    oldValue: branchData,
    reason,
    performedBy: userId,
  });
};

/**
 * Create history entry for branch status change
 * @param {ObjectId} branchId - Branch ID
 * @param {string} oldStatus - Old status
 * @param {string} newStatus - New status
 * @param {ObjectId} userId - User ID who changed the status
 * @param {string} reason - Reason for status change
 * @returns {Promise<Object>} - Created history entry
 */
branchHistorySchema.statics.recordStatusChange = async function(branchId, oldStatus, newStatus, userId, reason = '') {
  return this.create({
    branchId,
    action: 'status_change',
    field: 'status',
    oldValue: oldStatus,
    newValue: newStatus,
    reason,
    performedBy: userId,
  });
};

/**
 * Create history entry for branch resource update
 * @param {ObjectId} branchId - Branch ID
 * @param {Object} oldResources - Old resources
 * @param {Object} newResources - New resources
 * @param {ObjectId} userId - User ID who updated resources
 * @returns {Promise<Object>} - Created history entry
 */
branchHistorySchema.statics.recordResourceUpdate = async function(branchId, oldResources, newResources, userId) {
  return this.create({
    branchId,
    action: 'resource_update',
    field: 'resources',
    oldValue: oldResources,
    newValue: newResources,
    performedBy: userId,
  });
};

/**
 * Create history entry for branch document addition
 * @param {ObjectId} branchId - Branch ID
 * @param {Object} document - Added document
 * @param {ObjectId} userId - User ID who added the document
 * @returns {Promise<Object>} - Created history entry
 */
branchHistorySchema.statics.recordDocumentAdd = async function(branchId, document, userId) {
  return this.create({
    branchId,
    action: 'document_add',
    field: 'documents',
    newValue: document,
    performedBy: userId,
  });
};

/**
 * Create history entry for branch document update
 * @param {ObjectId} branchId - Branch ID
 * @param {Object} oldDocument - Old document
 * @param {Object} newDocument - Updated document
 * @param {ObjectId} userId - User ID who updated the document
 * @returns {Promise<Object>} - Created history entry
 */
branchHistorySchema.statics.recordDocumentUpdate = async function(branchId, oldDocument, newDocument, userId) {
  return this.create({
    branchId,
    action: 'document_update',
    field: 'documents',
    oldValue: oldDocument,
    newValue: newDocument,
    performedBy: userId,
  });
};

/**
 * Get branch history
 * @param {ObjectId} branchId - Branch ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Branch history entries
 */
branchHistorySchema.statics.getBranchHistory = async function(branchId, options = {}) {
  const { action, startDate, endDate, limit = 50, skip = 0 } = options;
  
  const query = { branchId };
  
  if (action) {
    query.action = action;
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
    .populate('performedBy', 'firstName lastName email');
};

// Create the BranchHistory model
const BranchHistory = mongoose.model('BranchHistory', branchHistorySchema);

module.exports = BranchHistory;
