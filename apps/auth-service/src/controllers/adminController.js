/**
 * Admin Controller
 * Handles administrative operations for user management
 */

const { ApiError, ErrorCodes } = require('../middleware/errorHandler');
const User = require('../models/User');
const Session = require('../models/Session');
const SecurityLog = require('../models/SecurityLog');
const { logger } = require('../utils/logger');
const security = require('../utils/security');
const emailService = require('../services/emailService');

/**
 * Get all users with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, isActive, isEmailVerified, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Add role filter
    if (role) {
      query.role = role;
    }
    
    // Add isActive filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Add isEmailVerified filter
    if (isEmailVerified !== undefined) {
      query.isEmailVerified = isEmailVerified === 'true';
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const totalUsers = await User.countDocuments(query);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total: totalUsers,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, role, isEmailVerified, isActive } = req.body;
    
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
      role: role || 'user',
      isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : false,
      isActive: isActive !== undefined ? isActive : true,
      isLocked: false,
      lastLogin: null,
      failedLoginAttempts: 0,
    });
    
    // Save user to database
    await user.save();
    
    // Log security event
    await SecurityLog.create({
      userId: user._id,
      action: 'USER_CREATE',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
        role: user.role,
        adminId: req.user._id,
      },
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phoneNumber, role, isEmailVerified, isActive } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Update user fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (role !== undefined) user.role = role;
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;
    if (isActive !== undefined) user.isActive = isActive;
    
    // Save user
    await user.save();
    
    // Log security event
    await SecurityLog.create({
      userId: user._id,
      action: 'USER_UPDATE',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
        updatedFields: Object.keys(req.body),
        adminId: req.user._id,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const resetUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { newPassword, sendEmail } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Validate password strength
    const passwordValidation = security.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new ApiError(400, 'Password does not meet security requirements', ErrorCodes.VALIDATION_ERROR, passwordValidation.errors);
    }
    
    // Hash new password
    const hashedPassword = await security.hashPassword(newPassword);
    
    // Update user password
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    
    // Invalidate all active sessions
    await Session.updateMany(
      { userId: user._id, isActive: true },
      { isActive: false }
    );
    
    // Log security event
    await SecurityLog.create({
      userId: user._id,
      action: 'ADMIN_PASSWORD_RESET',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
        adminId: req.user._id,
      },
    });
    
    // Send email notification if requested
    if (sendEmail) {
      try {
        await emailService.sendPasswordChangedEmail(user);
      } catch (emailError) {
        logger.error(`Failed to send password reset email: ${emailError.message}`, { error: emailError });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'User password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lock user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const lockUserAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason, sendEmail } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Update user
    user.isLocked = true;
    user.lockedAt = new Date();
    user.lockedReason = reason || 'MANUAL';
    await user.save();
    
    // Invalidate all active sessions
    await Session.updateMany(
      { userId: user._id, isActive: true },
      { isActive: false }
    );
    
    // Log security event
    await SecurityLog.create({
      userId: user._id,
      action: 'ADMIN_ACCOUNT_LOCK',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
        reason: reason || 'MANUAL',
        adminId: req.user._id,
      },
    });
    
    // Send email notification if requested
    if (sendEmail) {
      try {
        await emailService.sendAccountLockedEmail(user, reason || 'MANUAL');
      } catch (emailError) {
        logger.error(`Failed to send account locked email: ${emailError.message}`, { error: emailError });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'User account locked successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unlock user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const unlockUserAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Update user
    user.isLocked = false;
    user.lockedAt = null;
    user.lockedReason = null;
    user.failedLoginAttempts = 0;
    await user.save();
    
    // Log security event
    await SecurityLog.create({
      userId: user._id,
      action: 'ADMIN_ACCOUNT_UNLOCK',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
        adminId: req.user._id,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'User account unlocked successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Store user email for logging
    const userEmail = user.email;
    
    // Delete user
    await user.deleteOne();
    
    // Delete all sessions
    await Session.deleteMany({ userId });
    
    // Log security event
    await SecurityLog.create({
      action: 'USER_DELETE',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: userEmail,
        adminId: req.user._id,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user sessions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserSessions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Get sessions
    const sessions = await Session.find({ userId })
      .select('-token -refreshToken')
      .sort({ lastActivity: -1 });
    
    res.status(200).json({
      success: true,
      data: sessions.map(session => ({
        sessionId: session._id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        isActive: session.isActive,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Terminate user session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const terminateUserSession = async (req, res, next) => {
  try {
    const { userId, sessionId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Find session
    const session = await Session.findOne({
      _id: sessionId,
      userId,
    });
    
    if (!session) {
      throw new ApiError(404, 'Session not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Deactivate session
    session.isActive = false;
    await session.save();
    
    // Log security event
    await SecurityLog.create({
      userId,
      action: 'ADMIN_SESSION_TERMINATE',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
        sessionId,
        adminId: req.user._id,
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
 * Terminate all user sessions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const terminateAllUserSessions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Deactivate all sessions
    const result = await Session.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );
    
    // Log security event
    await SecurityLog.create({
      userId,
      action: 'ADMIN_ALL_SESSIONS_TERMINATE',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        email: user.email,
        sessionsTerminated: result.modifiedCount,
        adminId: req.user._id,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'All sessions terminated successfully',
      data: {
        sessionsTerminated: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get security logs for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserSecurityLogs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, action, status, startDate, endDate } = req.query;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCodes.NOT_FOUND_ERROR);
    }
    
    // Build query
    const query = { userId };
    
    // Add action filter
    if (action) {
      query.action = action;
    }
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    // Add date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get logs with pagination
    const logs = await SecurityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const totalLogs = await SecurityLog.countDocuments(query);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalLogs / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total: totalLogs,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetUserPassword,
  lockUserAccount,
  unlockUserAccount,
  deleteUser,
  getUserSessions,
  terminateUserSession,
  terminateAllUserSessions,
  getUserSecurityLogs,
};
