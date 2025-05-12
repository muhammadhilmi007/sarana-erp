/**
 * User Model
 * Defines the schema for user data with personal info, authentication, and status fields
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

// Define schema for password history
const passwordHistorySchema = new Schema({
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Define schema for user model
const userSchema = new Schema({
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  profilePicture: {
    type: String,
  },
  
  // Authentication
  password: {
    type: String,
    required: true,
  },
  passwordHistory: [passwordHistorySchema],
  passwordLastChanged: {
    type: Date,
    default: Date.now,
  },
  passwordExpiresAt: {
    type: Date,
  },
  
  // Account Status
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    index: true,
    sparse: true,
  },
  emailVerificationExpires: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
    index: true,
    sparse: true,
  },
  passwordResetExpires: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockReason: {
    type: String,
    enum: ['MANUAL', 'BRUTE_FORCE', 'SUSPICIOUS_ACTIVITY', 'PASSWORD_EXPIRED'],
  },
  lockedUntil: {
    type: Date,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lastFailedLoginAt: {
    type: Date,
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['ADMIN', 'MANAGER', 'STAFF', 'DRIVER', 'CUSTOMER'],
    default: 'CUSTOMER',
  },
  permissions: [{
    type: String,
  }],
  
  // Multi-factor Authentication
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: {
    type: String,
  },
  
  // Metadata
  lastLoginAt: {
    type: Date,
  },
  lastLoginIp: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Create indexes for frequently queried fields
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isLocked: 1 });

/**
 * Pre-save hook to hash password before saving
 */
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(12);
    
    // Hash the password along with the new salt
    const hash = await bcrypt.hash(user.password, salt);
    
    // Override the cleartext password with the hashed one
    user.password = hash;
    
    // Update password change date
    user.passwordLastChanged = Date.now();
    
    // Set password expiration date (90 days from now)
    const expirationDays = 90;
    user.passwordExpiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
    
    // Add to password history (keep last 5)
    user.passwordHistory.push({ password: hash });
    if (user.passwordHistory.length > 5) {
      user.passwordHistory.shift();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare password method for authentication
 * @param {string} candidatePassword - The password to verify
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Check if password exists in history
 * @param {string} candidatePassword - The password to check
 * @returns {Promise<boolean>} - True if password exists in history, false otherwise
 */
userSchema.methods.isPasswordInHistory = async function(candidatePassword) {
  for (const historyItem of this.passwordHistory) {
    const match = await bcrypt.compare(candidatePassword, historyItem.password);
    if (match) return true;
  }
  return false;
};

/**
 * Get full name method
 * @returns {string} - User's full name
 */
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

/**
 * Check if account is locked
 * @returns {boolean} - True if account is locked, false otherwise
 */
userSchema.methods.isAccountLocked = function() {
  if (!this.isLocked) return false;
  
  // Check if lock has expired
  if (this.lockedUntil && this.lockedUntil < new Date()) {
    this.isLocked = false;
    this.lockedUntil = null;
    this.failedLoginAttempts = 0;
    return false;
  }
  
  return true;
};

/**
 * Check if password is expired
 * @returns {boolean} - True if password is expired, false otherwise
 */
userSchema.methods.isPasswordExpired = function() {
  return this.passwordExpiresAt && this.passwordExpiresAt < new Date();
};

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
