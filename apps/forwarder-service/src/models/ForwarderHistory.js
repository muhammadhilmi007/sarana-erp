/**
 * ForwarderHistory Model
 * Tracks changes to forwarder partners
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the ForwarderHistory schema
const forwarderHistorySchema = new Schema({
  forwarderId: {
    type: Schema.Types.ObjectId,
    ref: 'Forwarder',
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: [
      'create', 
      'update', 
      'delete', 
      'status_change', 
      'coverage_update', 
      'rate_update', 
      'document_add', 
      'document_update',
      'performance_update',
      'integration_update',
      'contract_update'
    ],
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
  notes: {
    type: String,
    trim: true,
  },
});

/**
 * Record creation of a forwarder
 * @param {ObjectId} forwarderId - Forwarder ID
 * @param {Object} forwarderData - Forwarder data
 * @param {ObjectId} userId - User ID who created the forwarder
 * @returns {Promise<Object>} - Created history record
 */
forwarderHistorySchema.statics.recordCreation = async function(forwarderId, forwarderData, userId) {
  return this.create({
    forwarderId,
    action: 'create',
    newValue: forwarderData,
    performedBy: userId,
  });
};

/**
 * Record update to a forwarder
 * @param {ObjectId} forwarderId - Forwarder ID
 * @param {string} field - Field that was updated
 * @param {*} oldValue - Old value
 * @param {*} newValue - New value
 * @param {ObjectId} userId - User ID who updated the forwarder
 * @returns {Promise<Object>} - Created history record
 */
forwarderHistorySchema.statics.recordUpdate = async function(forwarderId, field, oldValue, newValue, userId) {
  return this.create({
    forwarderId,
    action: 'update',
    field,
    oldValue,
    newValue,
    performedBy: userId,
  });
};

/**
 * Record deletion of a forwarder
 * @param {ObjectId} forwarderId - Forwarder ID
 * @param {Object} forwarderData - Forwarder data at time of deletion
 * @param {ObjectId} userId - User ID who deleted the forwarder
 * @returns {Promise<Object>} - Created history record
 */
forwarderHistorySchema.statics.recordDeletion = async function(forwarderId, forwarderData, userId) {
  return this.create({
    forwarderId,
    action: 'delete',
    oldValue: forwarderData,
    performedBy: userId,
  });
};

/**
 * Record status change
 * @param {ObjectId} forwarderId - Forwarder ID
 * @param {string} oldStatus - Old status
 * @param {string} newStatus - New status
 * @param {string} reason - Reason for status change
 * @param {ObjectId} userId - User ID who changed the status
 * @returns {Promise<Object>} - Created history record
 */
forwarderHistorySchema.statics.recordStatusChange = async function(forwarderId, oldStatus, newStatus, reason, userId) {
  return this.create({
    forwarderId,
    action: 'status_change',
    field: 'status',
    oldValue: oldStatus,
    newValue: newStatus,
    performedBy: userId,
    notes: reason,
  });
};

/**
 * Record coverage area update
 * @param {ObjectId} forwarderId - Forwarder ID
 * @param {string} action - Specific action (add, update, remove)
 * @param {Object} oldValue - Old coverage area data
 * @param {Object} newValue - New coverage area data
 * @param {ObjectId} userId - User ID who updated the coverage area
 * @returns {Promise<Object>} - Created history record
 */
forwarderHistorySchema.statics.recordCoverageUpdate = async function(forwarderId, action, oldValue, newValue, userId) {
  return this.create({
    forwarderId,
    action: 'coverage_update',
    field: action,
    oldValue,
    newValue,
    performedBy: userId,
  });
};

/**
 * Record rate card update
 * @param {ObjectId} forwarderId - Forwarder ID
 * @param {string} action - Specific action (add, update, remove)
 * @param {Object} oldValue - Old rate card data
 * @param {Object} newValue - New rate card data
 * @param {ObjectId} userId - User ID who updated the rate card
 * @returns {Promise<Object>} - Created history record
 */
forwarderHistorySchema.statics.recordRateUpdate = async function(forwarderId, action, oldValue, newValue, userId) {
  return this.create({
    forwarderId,
    action: 'rate_update',
    field: action,
    oldValue,
    newValue,
    performedBy: userId,
  });
};

/**
 * Record document addition
 * @param {ObjectId} forwarderId - Forwarder ID
 * @param {Object} document - Document data
 * @param {ObjectId} userId - User ID who added the document
 * @returns {Promise<Object>} - Created history record
 */
forwarderHistorySchema.statics.recordDocumentAdd = async function(forwarderId, document, userId) {
  return this.create({
    forwarderId,
    action: 'document_add',
    newValue: document,
    performedBy: userId,
  });
};

/**
 * Record document update
 * @param {ObjectId} forwarderId - Forwarder ID
 * @param {ObjectId} documentId - Document ID
 * @param {Object} oldDocument - Old document data
 * @param {Object} newDocument - New document data
 * @param {ObjectId} userId - User ID who updated the document
 * @returns {Promise<Object>} - Created history record
 */
forwarderHistorySchema.statics.recordDocumentUpdate = async function(forwarderId, documentId, oldDocument, newDocument, userId) {
  return this.create({
    forwarderId,
    action: 'document_update',
    field: documentId.toString(),
    oldValue: oldDocument,
    newValue: newDocument,
    performedBy: userId,
  });
};

/**
 * Get forwarder history
 * @param {ObjectId} forwarderId - Forwarder ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - History records
 */
forwarderHistorySchema.statics.getForwarderHistory = async function(forwarderId, options = {}) {
  const { action, startDate, endDate, limit = 20, skip = 0 } = options;
  
  const query = { forwarderId };
  
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
    .populate('performedBy', 'name email');
};

// Create the ForwarderHistory model
const ForwarderHistory = mongoose.model('ForwarderHistory', forwarderHistorySchema);

module.exports = ForwarderHistory;
