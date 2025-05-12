/**
 * Authentication Service
 * Handles user authentication, registration, and account management
 */

const User = require('../models/User');
const Session = require('../models/Session');
const SecurityLog = require('../models/SecurityLog');
const tokenService = require('./tokenService');
const emailService = require('./emailService');
const config = require('../config');
const { logger } = require('../utils/logger');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Registered user
 */
const registerUser = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    // Create new user
    const user = new User({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phoneNumber,
      role: userData.role || 'CUSTOMER',
    });
    
    // Generate email verification token
    const verificationToken = tokenService.generateEmailVerificationToken();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Save user
    await user.save();
    
    // Store token in Redis for verification
    await tokenService.storeEmailVerificationToken(verificationToken, user._id.toString());
    
    // Send verification email
    await emailService.sendVerificationEmail(user, verificationToken);
    
    // Log security event
    await SecurityLog.logEvent({
      userId: user._id,
      eventType: 'ACCOUNT_CREATED',
      status: 'SUCCESS',
      severity: 'LOW',
      details: {
        email: user.email,
        role: user.role,
      },
    });
    
    // Return user without sensitive information
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.passwordResetToken;
    
    return userResponse;
  } catch (error) {
    logger.error('User registration error:', error);
    throw error;
  }
};

/**
 * Verify email
 * @param {string} token - Verification token
 * @returns {Promise<boolean>} - True if verification successful
 */
const verifyEmail = async (token) => {
  try {
    // Verify token from Redis
    const userId = await tokenService.verifyEmailVerificationToken(token);
    if (!userId) {
      throw new Error('Invalid or expired verification token');
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    // Log security event
    await SecurityLog.logEvent({
      userId: user._id,
      eventType: 'EMAIL_VERIFIED',
      status: 'SUCCESS',
      severity: 'LOW',
      details: {
        email: user.email,
      },
    });
    
    return true;
  } catch (error) {
    logger.error('Email verification error:', error);
    throw error;
  }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {Object} deviceInfo - Device information
 * @returns {Promise<Object>} - Login response with tokens
 */
const loginUser = async (credentials, deviceInfo) => {
  try {
    // Find user
    const user = await User.findOne({ email: credentials.email });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check if account is locked
    if (user.isAccountLocked()) {
      await SecurityLog.logEvent({
        userId: user._id,
        eventType: 'LOGIN_FAILED',
        status: 'FAILURE',
        severity: 'MEDIUM',
        details: {
          reason: 'ACCOUNT_LOCKED',
          ipAddress: deviceInfo.ipAddress,
          userAgent: deviceInfo.userAgent,
        },
      });
      
      throw new Error('Account is locked. Please try again later or contact support');
    }
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new Error('Email not verified. Please verify your email before logging in');
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;
      user.lastFailedLoginAt = new Date();
      
      // Check if account should be locked
      if (user.failedLoginAttempts >= config.security.accountLocking.maxFailedAttempts) {
        user.isLocked = true;
        user.lockReason = 'BRUTE_FORCE';
        user.lockedUntil = new Date(Date.now() + config.security.accountLocking.lockDuration);
        
        // Send account locked email
        await emailService.sendAccountLockedEmail(user, 'BRUTE_FORCE');
        
        // Log security event
        await SecurityLog.logEvent({
          userId: user._id,
          eventType: 'ACCOUNT_LOCKED',
          status: 'WARNING',
          severity: 'MEDIUM',
          details: {
            reason: 'BRUTE_FORCE',
            failedAttempts: user.failedLoginAttempts,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
          },
        });
      }
      
      await user.save();
      
      // Log failed login attempt
      await SecurityLog.logEvent({
        userId: user._id,
        eventType: 'LOGIN_FAILED',
        status: 'FAILURE',
        severity: 'MEDIUM',
        details: {
          reason: 'INVALID_PASSWORD',
          failedAttempts: user.failedLoginAttempts,
          ipAddress: deviceInfo.ipAddress,
          userAgent: deviceInfo.userAgent,
        },
      });
      
      throw new Error('Invalid email or password');
    }
    
    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    user.lastLoginIp = deviceInfo.ipAddress;
    await user.save();
    
    // Generate tokens
    const accessToken = tokenService.generateAccessToken({
      userId: user._id,
      role: user.role,
      permissions: user.permissions,
    });
    
    const refreshToken = tokenService.generateRefreshToken();
    
    // Calculate expiration time for refresh token
    const refreshExpiresIn = credentials.rememberMe
      ? 30 * 24 * 60 * 60 // 30 days
      : 7 * 24 * 60 * 60; // 7 days
    
    const refreshExpiresAt = new Date(Date.now() + refreshExpiresIn * 1000);
    
    // Create session
    const session = new Session({
      userId: user._id,
      refreshToken,
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress,
      deviceInfo: deviceInfo,
      expiresAt: refreshExpiresAt,
    });
    
    await session.save();
    
    // Check if this is a new device
    const existingSessions = await Session.find({
      userId: user._id,
      userAgent: deviceInfo.userAgent,
      isActive: true,
    }).count();
    
    if (existingSessions <= 1) {
      // Send new device login notification
      await emailService.sendNewDeviceLoginEmail(user, deviceInfo);
    }
    
    // Log successful login
    await SecurityLog.logEvent({
      userId: user._id,
      eventType: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      severity: 'LOW',
      details: {
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
      },
    });
    
    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: parseInt(config.jwt.accessExpiresIn) || 900, // 15 minutes in seconds
        refreshExpiresIn,
      },
    };
  } catch (error) {
    logger.error('User login error:', error);
    throw error;
  }
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} - New tokens
 */
const refreshToken = async (refreshToken) => {
  try {
    // Find session by refresh token
    const session = await Session.findByRefreshToken(refreshToken);
    if (!session) {
      throw new Error('Invalid refresh token');
    }
    
    // Find user
    const user = await User.findById(session.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new Error('User account is inactive');
    }
    
    // Generate new tokens with rotation
    const newAccessToken = tokenService.generateAccessToken({
      userId: user._id,
      role: user.role,
      permissions: user.permissions,
    });
    
    const newRefreshToken = tokenService.generateRefreshToken();
    
    // Update session with new refresh token
    session.refreshToken = newRefreshToken;
    session.lastActivityAt = new Date();
    await session.save();
    
    // Log token refresh
    await SecurityLog.logEvent({
      userId: user._id,
      eventType: 'TOKEN_REFRESH',
      status: 'SUCCESS',
      severity: 'LOW',
      details: {
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      },
    });
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: parseInt(config.jwt.accessExpiresIn) || 900, // 15 minutes in seconds
    };
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Logout user
 * @param {string} refreshToken - Refresh token
 * @param {boolean} allDevices - Whether to logout from all devices
 * @returns {Promise<boolean>} - True if logout successful
 */
const logoutUser = async (refreshToken, allDevices = false) => {
  try {
    // Find session by refresh token
    const session = await Session.findByRefreshToken(refreshToken);
    if (!session) {
      throw new Error('Invalid refresh token');
    }
    
    if (allDevices) {
      // Logout from all devices
      await Session.deactivateAllForUser(session.userId);
    } else {
      // Logout from current device only
      session.isActive = false;
      await session.save();
    }
    
    // Log logout event
    await SecurityLog.logEvent({
      userId: session.userId,
      eventType: 'LOGOUT',
      status: 'SUCCESS',
      severity: 'LOW',
      details: {
        allDevices,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      },
    });
    
    return true;
  } catch (error) {
    logger.error('Logout error:', error);
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<boolean>} - True if request successful
 */
const requestPasswordReset = async (email) => {
  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that email doesn't exist
      return true;
    }
    
    // Generate password reset token
    const resetToken = tokenService.generatePasswordResetToken();
    
    // Update user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    
    // Store token in Redis
    await tokenService.storePasswordResetToken(resetToken, user._id.toString());
    
    // Send password reset email
    await emailService.sendPasswordResetEmail(user, resetToken);
    
    // Log password reset request
    await SecurityLog.logEvent({
      userId: user._id,
      eventType: 'PASSWORD_RESET_REQUESTED',
      status: 'SUCCESS',
      severity: 'MEDIUM',
      details: {
        email: user.email,
      },
    });
    
    return true;
  } catch (error) {
    logger.error('Password reset request error:', error);
    throw error;
  }
};

/**
 * Reset password
 * @param {string} token - Password reset token
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - True if reset successful
 */
const resetPassword = async (token, newPassword) => {
  try {
    // Verify token from Redis
    const userId = await tokenService.verifyPasswordResetToken(token);
    if (!userId) {
      throw new Error('Invalid or expired reset token');
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if token matches and is not expired
    if (user.passwordResetToken !== token || user.passwordResetExpires < new Date()) {
      throw new Error('Invalid or expired reset token');
    }
    
    // Check if new password is in history
    const isInHistory = await user.isPasswordInHistory(newPassword);
    if (isInHistory) {
      throw new Error('Password has been used recently. Please choose a different password');
    }
    
    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // Delete token from Redis
    await tokenService.deletePasswordResetToken(token);
    
    // Invalidate all sessions
    await Session.deactivateAllForUser(user._id);
    
    // Send password changed email
    await emailService.sendPasswordChangedEmail(user);
    
    // Log password reset
    await SecurityLog.logEvent({
      userId: user._id,
      eventType: 'PASSWORD_RESET_COMPLETED',
      status: 'SUCCESS',
      severity: 'MEDIUM',
      details: {
        email: user.email,
      },
    });
    
    return true;
  } catch (error) {
    logger.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Change password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - True if change successful
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      // Log failed password change
      await SecurityLog.logEvent({
        userId: user._id,
        eventType: 'PASSWORD_CHANGED',
        status: 'FAILURE',
        severity: 'MEDIUM',
        details: {
          reason: 'INVALID_CURRENT_PASSWORD',
        },
      });
      
      throw new Error('Current password is incorrect');
    }
    
    // Check if new password is same as current
    if (currentPassword === newPassword) {
      throw new Error('New password must be different from current password');
    }
    
    // Check if new password is in history
    const isInHistory = await user.isPasswordInHistory(newPassword);
    if (isInHistory) {
      throw new Error('Password has been used recently. Please choose a different password');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Send password changed email
    await emailService.sendPasswordChangedEmail(user);
    
    // Log password change
    await SecurityLog.logEvent({
      userId: user._id,
      eventType: 'PASSWORD_CHANGED',
      status: 'SUCCESS',
      severity: 'MEDIUM',
      details: {
        email: user.email,
      },
    });
    
    return true;
  } catch (error) {
    logger.error('Password change error:', error);
    throw error;
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  refreshToken,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
};
