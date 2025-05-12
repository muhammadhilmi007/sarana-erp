/**
 * Session Model
 * Defines the schema for user sessions with token management
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const sessionSchema = new Schema({
  // User reference
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Session tokens
  refreshToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  
  // Device information
  userAgent: {
    type: String,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  deviceInfo: {
    type: Object,
  },
  
  // Session status
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  
  // Metadata
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Create indexes for frequently queried fields
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ refreshToken: 1 }, { unique: true });
sessionSchema.index({ expiresAt: 1 });

/**
 * Check if session is expired
 * @returns {boolean} - True if session is expired, false otherwise
 */
sessionSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

/**
 * Update last activity time
 */
sessionSchema.methods.updateActivity = function() {
  this.lastActivityAt = new Date();
  return this.save();
};

/**
 * Extend session expiration (sliding expiration)
 * @param {number} durationInSeconds - Duration to extend in seconds
 */
sessionSchema.methods.extend = function(durationInSeconds) {
  const currentExpiry = new Date(this.expiresAt);
  this.expiresAt = new Date(currentExpiry.getTime() + durationInSeconds * 1000);
  this.lastActivityAt = new Date();
  return this.save();
};

/**
 * Deactivate session
 */
sessionSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

/**
 * Static method to clean up expired sessions
 * @returns {Promise<number>} - Number of deleted sessions
 */
sessionSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false }
    ]
  });
};

/**
 * Static method to find active session by refresh token
 * @param {string} refreshToken - Refresh token to find
 * @returns {Promise<Session>} - Session document
 */
sessionSchema.statics.findByRefreshToken = function(refreshToken) {
  return this.findOne({
    refreshToken,
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
};

/**
 * Static method to deactivate all sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of updated sessions
 */
sessionSchema.statics.deactivateAllForUser = function(userId) {
  return this.updateMany(
    { userId, isActive: true },
    { isActive: false }
  );
};

/**
 * Static method to deactivate all sessions for a user except current
 * @param {string} userId - User ID
 * @param {string} currentSessionId - Current session ID to exclude
 * @returns {Promise<number>} - Number of updated sessions
 */
sessionSchema.statics.deactivateOtherSessions = function(userId, currentSessionId) {
  return this.updateMany(
    { 
      userId, 
      isActive: true,
      _id: { $ne: currentSessionId }
    },
    { isActive: false }
  );
};

// Create the model
const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
