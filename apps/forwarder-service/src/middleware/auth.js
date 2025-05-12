/**
 * Authentication Middleware
 * Handles JWT authentication and role-based authorization
 */

const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

/**
 * Authenticate user using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        errorCode: 'NO_TOKEN',
        message: 'Authentication token is required',
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        errorCode: 'NO_TOKEN',
        message: 'Authentication token is required',
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user in request object
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        errorCode: 'TOKEN_EXPIRED',
        message: 'Token has expired',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        errorCode: 'INVALID_TOKEN',
        message: 'Invalid token',
      });
    }
    
    logger.error('Authentication error:', error);
    
    return res.status(401).json({
      status: 'error',
      errorCode: 'AUTH_ERROR',
      message: 'Authentication failed',
    });
  }
};

/**
 * Authorize user based on roles
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        errorCode: 'NOT_AUTHENTICATED',
        message: 'User not authenticated',
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        errorCode: 'UNAUTHORIZED',
        message: 'You do not have permission to perform this action',
      });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
