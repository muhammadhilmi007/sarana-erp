/**
 * Authentication middleware
 * Verifies JWT tokens and adds user information to request
 */

const jwt = require('jsonwebtoken');
const { ApiError, ErrorCodes } = require('./errorHandler');
const config = require('../config');

/**
 * List of paths that don't require authentication
 */
const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/refresh-token',
];

/**
 * Authentication middleware
 * Verifies JWT tokens and adds user information to request
 */
const authMiddleware = (req, res, next) => {
  // Skip authentication for public paths
  const path = req.path.replace('/api/v1', '');
  if (publicPaths.some(p => path.startsWith(p))) {
    return next();
  }
  
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required', ErrorCodes.AUTHENTICATION_ERROR));
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || config.jwt.secret);
    
    // Add user info to request
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };
    
    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return next(new ApiError(401, 'Token expired', ErrorCodes.AUTHENTICATION_ERROR));
    }
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token', ErrorCodes.AUTHENTICATION_ERROR));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired', ErrorCodes.AUTHENTICATION_ERROR));
    }
    next(new ApiError(401, 'Authentication failed', ErrorCodes.AUTHENTICATION_ERROR));
  }
};

module.exports = {
  authMiddleware,
};
