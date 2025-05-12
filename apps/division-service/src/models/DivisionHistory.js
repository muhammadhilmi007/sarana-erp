/**
 * Division History Model
 * Tracks changes to divisions for audit purposes
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Division History schema
const divisionHistorySchema = new Schema({
  divisionId: {
    type: Schema.Types.ObjectId,
    ref: 'Division',
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'status_change', 'budget_update', 'kpi_update'],
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
 * Record division creation
 * @param {ObjectId} divisionId - Division ID
 * @param {Object} divisionData - Division data
 * @param {ObjectId} userId - User ID who created the division
 */
divisionHistorySchema.statics.recordCreation = async function(divisionId, divisionData, userId) {
  return this.create({
    divisionId,
    action: 'create',
    newValue: divisionData,
    performedBy: userId,
  });
};

/**
 * Record division update
 * @param {ObjectId} divisionId - Division ID
 * @param {string} field - Updated field
 * @param {*} oldValue - Old value
 * @param {*} newValue - New value
 * @param {ObjectId} userId - User ID who updated the division
 */
divisionHistorySchema.statics.recordUpdate = async function(divisionId, field, oldValue, newValue, userId) {
  return this.create({
    divisionId,
    action: 'update',
    field,
    oldValue,
    newValue,
    performedBy: userId,
  });
};

/**
 * Record division deletion
 * @param {ObjectId} divisionId - Division ID
 * @param {Object} divisionData - Division data
 * @param {ObjectId} userId - User ID who deleted the division
 */
divisionHistorySchema.statics.recordDeletion = async function(divisionId, divisionData, userId) {
  return this.create({
    divisionId,
    action: 'delete',
    oldValue: divisionData,
    performedBy: userId,
  });
};

/**
 * Record division status change
 * @param {ObjectId} divisionId - Division ID
 * @param {string} oldStatus - Old status
 * @param {string} newStatus - New status
 * @param {string} reason - Reason for status change
 * @param {ObjectId} userId - User ID who changed the status
 */
divisionHistorySchema.statics.recordStatusChange = async function(divisionId, oldStatus, newStatus, reason, userId) {
  return this.create({
    divisionId,
    action: 'status_change',
    field: 'status',
    oldValue: oldStatus,
    newValue: newStatus,
    performedBy: userId,
    metadata: { reason },
  });
};

/**
 * Record budget update
 * @param {ObjectId} divisionId - Division ID
 * @param {Object} oldBudget - Old budget
 * @param {Object} newBudget - New budget
 * @param {ObjectId} userId - User ID who updated the budget
 */
divisionHistorySchema.statics.recordBudgetUpdate = async function(divisionId, oldBudget, newBudget, userId) {
  return this.create({
    divisionId,
    action: 'budget_update',
    field: 'budget',
    oldValue: oldBudget,
    newValue: newBudget,
    performedBy: userId,
  });
};

/**
 * Record KPI update
 * @param {ObjectId} divisionId - Division ID
 * @param {Object} oldKPI - Old KPI
 * @param {Object} newKPI - New KPI
 * @param {ObjectId} userId - User ID who updated the KPI
 */
divisionHistorySchema.statics.recordKPIUpdate = async function(divisionId, oldKPI, newKPI, userId) {
  return this.create({
    divisionId,
    action: 'kpi_update',
    field: 'performanceMetrics.kpis',
    oldValue: oldKPI,
    newValue: newKPI,
    performedBy: userId,
  });
};

/**
 * Get division history
 * @param {ObjectId} divisionId - Division ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Division history
 */
divisionHistorySchema.statics.getDivisionHistory = async function(divisionId, options = {}) {
  const { action, startDate, endDate, limit = 20, skip = 0 } = options;
  
  const query = { divisionId };
  
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

// Create the Division History model
const DivisionHistory = mongoose.model('DivisionHistory', divisionHistorySchema);

module.exports = DivisionHistory;
