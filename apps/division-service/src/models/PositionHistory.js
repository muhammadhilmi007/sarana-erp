/**
 * Position History Model
 * Tracks changes to positions for audit purposes
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Position History schema
const positionHistorySchema = new Schema({
  positionId: {
    type: Schema.Types.ObjectId,
    ref: 'Position',
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'status_change', 'reporting_change', 'vacancy_change'],
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
  metadata: {
    type: Schema.Types.Mixed,
  },
});

/**
 * Record position creation
 * @param {ObjectId} positionId - Position ID
 * @param {Object} positionData - Position data
 * @param {ObjectId} userId - User ID who created the position
 */
positionHistorySchema.statics.recordCreation = async function(positionId, positionData, userId) {
  return this.create({
    positionId,
    action: 'create',
    newValue: positionData,
    performedBy: userId,
  });
};

/**
 * Record position update
 * @param {ObjectId} positionId - Position ID
 * @param {string} field - Updated field
 * @param {*} oldValue - Old value
 * @param {*} newValue - New value
 * @param {ObjectId} userId - User ID who updated the position
 */
positionHistorySchema.statics.recordUpdate = async function(positionId, field, oldValue, newValue, userId) {
  return this.create({
    positionId,
    action: 'update',
    field,
    oldValue,
    newValue,
    performedBy: userId,
  });
};

/**
 * Record position deletion
 * @param {ObjectId} positionId - Position ID
 * @param {Object} positionData - Position data
 * @param {ObjectId} userId - User ID who deleted the position
 */
positionHistorySchema.statics.recordDeletion = async function(positionId, positionData, userId) {
  return this.create({
    positionId,
    action: 'delete',
    oldValue: positionData,
    performedBy: userId,
  });
};

/**
 * Record position status change
 * @param {ObjectId} positionId - Position ID
 * @param {string} oldStatus - Old status
 * @param {string} newStatus - New status
 * @param {string} reason - Reason for status change
 * @param {ObjectId} userId - User ID who changed the status
 */
positionHistorySchema.statics.recordStatusChange = async function(positionId, oldStatus, newStatus, reason, userId) {
  return this.create({
    positionId,
    action: 'status_change',
    field: 'status',
    oldValue: oldStatus,
    newValue: newStatus,
    performedBy: userId,
    metadata: { reason },
  });
};

/**
 * Record reporting line change
 * @param {ObjectId} positionId - Position ID
 * @param {ObjectId} oldReportingTo - Old reporting position ID
 * @param {ObjectId} newReportingTo - New reporting position ID
 * @param {ObjectId} userId - User ID who changed the reporting line
 */
positionHistorySchema.statics.recordReportingChange = async function(positionId, oldReportingTo, newReportingTo, userId) {
  return this.create({
    positionId,
    action: 'reporting_change',
    field: 'reportingTo',
    oldValue: oldReportingTo,
    newValue: newReportingTo,
    performedBy: userId,
  });
};

/**
 * Record vacancy status change
 * @param {ObjectId} positionId - Position ID
 * @param {Object} oldVacancy - Old vacancy data
 * @param {Object} newVacancy - New vacancy data
 * @param {ObjectId} userId - User ID who changed the vacancy status
 */
positionHistorySchema.statics.recordVacancyChange = async function(positionId, oldVacancy, newVacancy, userId) {
  return this.create({
    positionId,
    action: 'vacancy_change',
    field: 'vacancy',
    oldValue: oldVacancy,
    newValue: newVacancy,
    performedBy: userId,
  });
};

/**
 * Get position history
 * @param {ObjectId} positionId - Position ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Position history
 */
positionHistorySchema.statics.getPositionHistory = async function(positionId, options = {}) {
  const { action, startDate, endDate, limit = 20, skip = 0 } = options;
  
  const query = { positionId };
  
  if (action) {
    query.action = action;
  }
  
  if (startDate || endDate) {
    query.performedAt = {};
    if (startDate) query.performedAt.$gte = new Date(startDate);
    if (endDate) query.performedAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ performedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('performedBy', 'name email');
};

// Create the Position History model
const PositionHistory = mongoose.model('PositionHistory', positionHistorySchema);

module.exports = PositionHistory;
