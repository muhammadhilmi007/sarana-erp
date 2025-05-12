/**
 * Authentication Middleware
 * Middleware for handling authentication in the Role & Authorization Service
 */

const jwt = require('jsonwebtoken');
const { ApiError, ErrorCodes } = require('./errorHandler');
const { logger } = require('../utils/logger');

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided', ErrorCodes.AUTHENTICATION_ERROR);
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || 'sarana-auth-service',
      audience: process.env.JWT_AUDIENCE || 'sarana-app',
    });
    
    // Add user to request
    req.user = {
      _id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token', ErrorCodes.AUTHENTICATION_ERROR));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired', ErrorCodes.AUTHENTICATION_ERROR));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to check if user has a specific role
 * @param {string|Array} roles - Role or array of roles to check
 * @returns {Function} - Express middleware function
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      // Check if authenticated
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', ErrorCodes.AUTHENTICATION_ERROR);
      }
      
      // Convert single role to array
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Check if user has any of the required roles
      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(403, 'Insufficient role permissions', ErrorCodes.AUTHORIZATION_ERROR);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to make authentication optional
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, continue without authentication
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || 'sarana-auth-service',
      audience: process.env.JWT_AUDIENCE || 'sarana-app',
    });
    
    // Add user to request
    req.user = {
      _id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    // Token verification failed, continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  requireRole,
  optionalAuth,
};
