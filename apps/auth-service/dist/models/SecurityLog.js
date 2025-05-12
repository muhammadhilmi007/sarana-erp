/**
 * SecurityLog Model
 * Defines the schema for security event audit logging
 */

const mongoose = require('mongoose');
const {
  Schema
} = mongoose;
const securityLogSchema = new Schema({
  // User reference (optional, as some events may not be associated with a user)
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  // Event type
  eventType: {
    type: String,
    required: true,
    enum: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'EMAIL_CHANGED', 'EMAIL_VERIFICATION_REQUESTED', 'EMAIL_VERIFIED', 'ACCOUNT_CREATED', 'ACCOUNT_UPDATED', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'ACCOUNT_DELETED', 'ROLE_CHANGED', 'PERMISSIONS_CHANGED', 'MFA_ENABLED', 'MFA_DISABLED', 'SESSION_CREATED', 'SESSION_EXPIRED', 'SESSION_TERMINATED', 'TOKEN_REFRESH', 'SUSPICIOUS_ACTIVITY'],
    index: true
  },
  // Event details
  details: {
    type: Object
  },
  // IP address
  ipAddress: {
    type: String
  },
  // User agent
  userAgent: {
    type: String
  },
  // Success/failure status
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'WARNING', 'INFO'],
    default: 'INFO'
  },
  // Severity level
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false
  } // Only track creation time
});

// Create indexes for frequently queried fields
securityLogSchema.index({
  eventType: 1,
  createdAt: -1
});
securityLogSchema.index({
  userId: 1,
  eventType: 1,
  createdAt: -1
});
securityLogSchema.index({
  status: 1,
  severity: 1,
  createdAt: -1
});
securityLogSchema.index({
  createdAt: -1
});

/**
 * Static method to log a security event
 * @param {Object} logData - Log data object
 * @returns {Promise<SecurityLog>} - Created security log
 */
securityLogSchema.statics.logEvent = function (logData) {
  return this.create(logData);
};

/**
 * Static method to find logs for a specific user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of security logs
 */
securityLogSchema.statics.findByUser = function (userId, options = {}) {
  const {
    limit = 100,
    skip = 0,
    eventType,
    startDate,
    endDate
  } = options;
  const query = {
    userId
  };
  if (eventType) {
    query.eventType = eventType;
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }
  return this.find(query).sort({
    createdAt: -1
  }).skip(skip).limit(limit);
};

/**
 * Static method to find logs by event type
 * @param {string} eventType - Event type
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of security logs
 */
securityLogSchema.statics.findByEventType = function (eventType, options = {}) {
  const {
    limit = 100,
    skip = 0,
    startDate,
    endDate
  } = options;
  const query = {
    eventType
  };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }
  return this.find(query).sort({
    createdAt: -1
  }).skip(skip).limit(limit);
};

/**
 * Static method to find security events by severity
 * @param {string} severity - Severity level
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of security logs
 */
securityLogSchema.statics.findBySeverity = function (severity, options = {}) {
  const {
    limit = 100,
    skip = 0,
    startDate,
    endDate
  } = options;
  const query = {
    severity
  };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }
  return this.find(query).sort({
    createdAt: -1
  }).skip(skip).limit(limit);
};

// Create the model
const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);
module.exports = SecurityLog;