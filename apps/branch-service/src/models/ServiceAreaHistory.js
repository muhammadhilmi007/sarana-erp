/**
 * Service Area History Model
 * Tracks changes to service areas for audit purposes
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const serviceAreaHistorySchema = new Schema({
  serviceAreaId: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceArea',
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'status_change', 'branch_assignment', 'pricing_update'],
    required: true,
    index: true,
  },
  oldValue: {
    type: Schema.Types.Mixed,
  },
  newValue: {
    type: Schema.Types.Mixed,
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  changedFields: [{
    type: String,
  }],
  reason: {
    type: String,
    trim: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Create indexes for efficient querying
serviceAreaHistorySchema.index({ serviceAreaId: 1, createdAt: -1 });
serviceAreaHistorySchema.index({ action: 1, createdAt: -1 });
serviceAreaHistorySchema.index({ changedBy: 1, createdAt: -1 });

const ServiceAreaHistory = mongoose.model('ServiceAreaHistory', serviceAreaHistorySchema);

module.exports = ServiceAreaHistory;
