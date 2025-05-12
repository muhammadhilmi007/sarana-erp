/**
 * Authentication Controller
 * Handles user registration, login, and other authentication-related operations
 */

const { ApiError, ErrorCodes } = require('../middleware/errorHandler');
const User = require('../models/User');
const Session = require('../models/Session');
const SecurityLog = require('../models/SecurityLog');
const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
const { logger } = require('../utils/logger');
const security = require('../utils/security');
const config = require('../config');
const redis = require('../utils/redis');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered', ErrorCodes.CONFLICT_ERROR);
    }
    
    // Validate password strength
    const passwordValidation = security.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new ApiError(400, 'Password does not meet security requirements', ErrorCodes.VALIDATION_ERROR, passwordValidation.errors);
    }
    
    // Hash password
    const hashedPassword = await security.hashPassword(password);
    
    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      role: 'user', // Default role
      isEmailVerified: false,
      isActive: true,
      isLocked: false,
      lastLogin: null,
      failedLoginAttempts: 0,
    });
    
    // Save user to database
    await user.save();
    
    // Generate email verification token
    const verificationToken = tokenService.generateEmailVerificationToken();
    await tokenService.storeEmailVerificationToken(verificationToken, user._id.toString());
    
    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken, {
      firstName: user.firstName,
      lastName: user.lastName,
    });
    
    // Log security event
    await SecurityLog.create({
      userId: user._id,
      action: 'REGISTER',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
      },
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    // Log failed registration attempt
    if (req.body.email) {
      await SecurityLog.create({
        action: 'REGISTER',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'FAILED',
        details: {
          email: req.body.email,
          reason: error.message,
        },
      });
    }
    
    next(error);
  }
};

/**
 * Verify email address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Verify token
    const userId = await tokenService.verifyEmailVerificationToken(token);
    if (!userId) {
      throw new ApiError(400, 'Invalid or expired verification token', ErrorCodes.BAD_REQUEST_ERROR);
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Update user
    user.isEmailVerified = true;
    await user.save();
    
    // Log security event
    await SecurityLog.create({
      userId: user._id,
      action: 'EMAIL_VERIFY',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
      },
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    // Log failed verification attempt
    await SecurityLog.create({
      action: 'EMAIL_VERIFY',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'FAILED',
      details: {
        token: req.params.token,
        reason: error.message,
      },
    });
    
    next(error);
  }
};

/**
 * Resend verification email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Check if email is already verified
    if (user.isEmailVerified) {
      throw new ApiError(400, 'Email is already verified', ErrorCodes.BAD_REQUEST_ERROR);
    }
    
    // Generate new verification token
    const verificationToken = tokenService.generateEmailVerificationToken();
    await tokenService.storeEmailVerificationToken(verificationToken, user._id.toString());
    
    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken, {
      firstName: user.firstName,
      lastName: user.lastName,
    });
    
    // Log security event
    await SecurityLog.create({
      userId: user._id,
      action: 'RESEND_VERIFICATION',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
      },
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully.',
    });
  } catch (error) {
    // Log failed resend attempt
    if (req.body.email) {
      await SecurityLog.create({
        action: 'RESEND_VERIFICATION',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'FAILED',
        details: {
          email: req.body.email,
          reason: error.message,
        },
      });
    }
    
    next(error);
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated', ErrorCodes.AUTHORIZATION_ERROR);
    }
    
    // Check if user is locked
    if (user.isLocked) {
      // Check if lock duration has passed
      const lockDuration = parseInt(process.env.LOCK_DURATION) || 30 * 60 * 1000; // Default: 30 minutes
      const lockTime = new Date(user.lockedAt).getTime();
      const currentTime = new Date().getTime();
      
      if (currentTime - lockTime < lockDuration) {
        throw new ApiError(403, 'Account is locked due to too many failed login attempts', ErrorCodes.AUTHORIZATION_ERROR);
      }
      
      // Unlock account if lock duration has passed
      user.isLocked = false;
      user.lockedAt = null;
      user.failedLoginAttempts = 0;
      await user.save();
    }
    
    // Check if email is verified
    if (!user.isEmailVerified && process.env.REQUIRE_EMAIL_VERIFICATION !== 'false') {
      throw new ApiError(403, 'Email not verified. Please verify your email before logging in.', ErrorCodes.AUTHORIZATION_ERROR);
    }
    
    // Verify password
    const isPasswordValid = await security.comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;
      
      // Lock account if max attempts reached
      const maxLoginAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
      if (user.failedLoginAttempts >= maxLoginAttempts) {
        user.isLocked = true;
        user.lockedAt = new Date();
        
        // Log security event for account lock
        await SecurityLog.create({
          userId: user._id,
          action: 'ACCOUNT_LOCK',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          status: 'SUCCESS',
          details: {
            email: user.email,
            reason: 'Too many failed login attempts',
            failedAttempts: user.failedLoginAttempts,
          },
        });
      }
      
      await user.save();
      
      // Log failed login attempt
      await SecurityLog.create({
        userId: user._id,
        action: 'LOGIN',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'FAILED',
        details: {
          email: user.email,
          reason: 'Invalid password',
          failedAttempts: user.failedLoginAttempts,
        },
      });
      
      throw new ApiError(401, 'Invalid email or password', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();
    
    // Generate tokens
    const accessToken = tokenService.generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });
    
    const refreshToken = tokenService.generateRefreshToken();
    
    // Create session
    const session = new Session({
      userId: user._id,
      token: accessToken,
      refreshToken,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      expiresAt: new Date(Date.now() + (parseInt(process.env.JWT_REFRESH_EXPIRES_IN) || 7 * 24 * 60 * 60) * 1000),
      isActive: true,
      lastActivity: new Date(),
    });
    
    await session.save();
    
    // Log successful login
    await SecurityLog.create({
      userId: user._id,
      action: 'LOGIN',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
        sessionId: session._id,
      },
    });
    
    // Return tokens
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        user: {
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    // User and session are attached by refreshToken middleware
    const { user, session } = req;
    
    // Generate new tokens
    const accessToken = tokenService.generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });
    
    const refreshToken = tokenService.generateRefreshToken();
    
    // Update session
    session.token = accessToken;
    session.refreshToken = refreshToken;
    session.lastActivity = new Date();
    await session.save();
    
    // Log token refresh
    await SecurityLog.create({
      userId: user._id,
      action: 'TOKEN_REFRESH',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
        sessionId: session._id,
      },
    });
    
    // Return new tokens
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const logout = async (req, res, next) => {
  try {
    const { user, session } = req;
    
    // Deactivate session
    session.isActive = false;
    await session.save();
    
    // Blacklist token
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    
    // Calculate token expiry time
    const decoded = tokenService.verifyAccessToken(token);
    const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);
    
    // Blacklist token if it's not expired
    if (expiryTime > 0) {
      await tokenService.blacklistToken(token, expiryTime);
    }
    
    // Log logout
    await SecurityLog.create({
      userId: user._id,
      action: 'LOGOUT',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
        sessionId: session._id,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found for security
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link.',
      });
    }
    
    // Generate password reset token
    const resetToken = tokenService.generatePasswordResetToken();
    await tokenService.storePasswordResetToken(resetToken, user._id.toString());
    
    // Send password reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken, {
      firstName: user.firstName,
      lastName: user.lastName,
    });
    
    // Log password reset request
    await SecurityLog.create({
      userId: user._id,
      action: 'PASSWORD_RESET_REQUEST',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link.',
    });
  } catch (error) {
    // Log error but don't expose it to client
    logger.error(`Password reset request error: ${error.message}`, {
      error,
      email: req.body.email,
      ip: req.ip,
    });
    
    // Return generic success message for security
    res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link.',
    });
  }
};

/**
 * Reset password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    // Verify token
    const userId = await tokenService.verifyPasswordResetToken(token);
    if (!userId) {
      throw new ApiError(400, 'Invalid or expired reset token', ErrorCodes.BAD_REQUEST_ERROR);
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Validate password strength
    const passwordValidation = security.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new ApiError(400, 'Password does not meet security requirements', ErrorCodes.VALIDATION_ERROR, passwordValidation.errors);
    }
    
    // Hash new password
    const hashedPassword = await security.hashPassword(password);
    
    // Update user password
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    
    // Delete reset token
    await tokenService.deletePasswordResetToken(token);
    
    // Invalidate all active sessions
    await Session.updateMany(
      { userId: user._id, isActive: true },
      { isActive: false }
    );
    
    // Log password reset
    await SecurityLog.create({
      userId: user._id,
      action: 'PASSWORD_RESET',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    // Log failed password reset
    await SecurityLog.create({
      action: 'PASSWORD_RESET',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'FAILED',
      details: {
        token: req.body.token,
        reason: error.message,
      },
    });
    
    next(error);
  }
};

/**
 * Change password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { user } = req;
    
    // Verify current password
    const isPasswordValid = await security.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      // Log failed password change
      await SecurityLog.create({
        userId: user._id,
        action: 'PASSWORD_CHANGE',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'FAILED',
        details: {
          email: user.email,
          reason: 'Invalid current password',
        },
      });
      
      throw new ApiError(401, 'Current password is incorrect', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    // Validate new password strength
    const passwordValidation = security.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new ApiError(400, 'Password does not meet security requirements', ErrorCodes.VALIDATION_ERROR, passwordValidation.errors);
    }
    
    // Check if new password is different from current
    if (currentPassword === newPassword) {
      throw new ApiError(400, 'New password must be different from current password', ErrorCodes.VALIDATION_ERROR);
    }
    
    // Hash new password
    const hashedPassword = await security.hashPassword(newPassword);
    
    // Update user password
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    
    // Invalidate all other active sessions
    await Session.updateMany(
      { userId: user._id, isActive: true, _id: { $ne: req.session._id } },
      { isActive: false }
    );
    
    // Log password change
    await SecurityLog.create({
      userId: user._id,
      action: 'PASSWORD_CHANGE',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProfile = async (req, res, next) => {
  try {
    const { user } = req;
    
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;
    const { user } = req;
    
    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active sessions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getActiveSessions = async (req, res, next) => {
  try {
    const { user } = req;
    
    // Get active sessions
    const sessions = await Session.find({ 
      userId: user._id,
      isActive: true,
    }).select('-token -refreshToken').sort({ lastActivity: -1 });
    
    res.status(200).json({
      success: true,
      data: sessions.map(session => ({
        sessionId: session._id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
        current: session._id.toString() === req.session._id.toString(),
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Terminate session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const terminateSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { user } = req;
    
    // Check if trying to terminate current session
    if (sessionId === req.session._id.toString()) {
      throw new ApiError(400, 'Cannot terminate current session. Use logout instead.', ErrorCodes.BAD_REQUEST_ERROR);
    }
    
    // Find session
    const session = await Session.findOne({
      _id: sessionId,
      userId: user._id,
      isActive: true,
    });
    
    if (!session) {
      throw new ApiError(404, 'Session not found or already terminated', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Deactivate session
    session.isActive = false;
    await session.save();
    
    // Log session termination
    await SecurityLog.create({
      userId: user._id,
      action: 'SESSION_TERMINATE',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
        sessionId: session._id,
        terminatedSessionIp: session.ipAddress,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'Session terminated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Terminate all other sessions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const terminateAllSessions = async (req, res, next) => {
  try {
    const { user, session } = req;
    
    // Deactivate all other sessions
    const result = await Session.updateMany(
      { userId: user._id, isActive: true, _id: { $ne: session._id } },
      { isActive: false }
    );
    
    // Log session termination
    await SecurityLog.create({
      userId: user._id,
      action: 'ALL_SESSIONS_TERMINATE',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
        sessionsTerminated: result.modifiedCount,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'All other sessions terminated successfully',
      data: {
        sessionsTerminated: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationEmail,
  login,
  refreshAccessToken,
  logout,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  getActiveSessions,
  terminateSession,
  terminateAllSessions,
};
