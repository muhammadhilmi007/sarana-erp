/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

const { ApiError, ErrorCodes } = require('./errorHandler');
const { verifyToken } = require('../services/tokenService');
const User = require('../models/User');
const Session = require('../models/Session');
const { logger } = require('../utils/logger');

/**
 * Authenticate user middleware
 * Verifies the access token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token required', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Invalid token format', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    // Verify token
    const decoded = await verifyToken(token, 'access');
    if (!decoded) {
      throw new ApiError(401, 'Invalid or expired token', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    // Check if session exists and is valid
    const session = await Session.findOne({
      userId: decoded.userId,
      token: token,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) {
      throw new ApiError(401, 'Session expired or invalid', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new ApiError(401, 'User not found', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated', ErrorCodes.AUTHORIZATION_ERROR);
    }
    
    // Check if user is locked
    if (user.isLocked) {
      throw new ApiError(403, 'Account is locked', ErrorCodes.AUTHORIZATION_ERROR);
    }
    
    // Attach user and session to request
    req.user = user;
    req.session = session;
    
    // Update session last activity
    session.lastActivity = new Date();
    await session.save();
    
    next();
  } catch (error) {
    // Pass error to error handler
    next(error);
  }
};

/**
 * Check user role middleware
 * Verifies that the authenticated user has the required role(s)
 * @param {string|string[]} roles - Required role(s)
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', ErrorCodes.AUTHENTICATION_ERROR);
      }
      
      // Convert roles to array if string
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      
      // Check if user has required role
      if (!requiredRoles.includes(req.user.role)) {
        logger.warn(`Access denied: User ${req.user._id} with role ${req.user.role} attempted to access resource requiring ${requiredRoles.join(', ')}`, {
          userId: req.user._id,
          userRole: req.user.role,
          requiredRoles,
          path: req.path,
          method: req.method,
          requestId: req.requestId,
        });
        
        throw new ApiError(403, 'Insufficient permissions', ErrorCodes.AUTHORIZATION_ERROR);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Refresh token middleware
 * Verifies the refresh token and issues new access and refresh tokens
 */
const refreshToken = async (req, res, next) => {
  try {
    // Get refresh token from request body
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token required', ErrorCodes.BAD_REQUEST_ERROR);
    }
    
    // Verify refresh token
    const decoded = await verifyToken(refreshToken, 'refresh');
    if (!decoded) {
      throw new ApiError(401, 'Invalid or expired refresh token', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    // Check if session exists and is valid
    const session = await Session.findOne({
      userId: decoded.userId,
      refreshToken: refreshToken,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) {
      throw new ApiError(401, 'Session expired or invalid', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new ApiError(401, 'User not found', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated', ErrorCodes.AUTHORIZATION_ERROR);
    }
    
    // Check if user is locked
    if (user.isLocked) {
      throw new ApiError(403, 'Account is locked', ErrorCodes.AUTHORIZATION_ERROR);
    }
    
    // Attach user and session to request for token service
    req.user = user;
    req.session = session;
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  checkRole,
  refreshToken,
};
