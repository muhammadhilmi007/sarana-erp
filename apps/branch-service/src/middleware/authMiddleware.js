/**
 * Authentication Middleware
 * Handles JWT verification and user authentication
 */

const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

/**
 * Authenticate user using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token is required',
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
    
    // Set user in request
    req.user = {
      _id: decoded.sub,
      email: decoded.email,
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token expired',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authentication token',
      });
    }
    
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed',
    });
  }
};

/**
 * Check if user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }
    
    const isAdmin = req.user.roles.some(role => 
      role.name === 'ADMIN' || role.name === 'admin'
    );
    
    if (!isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required',
      });
    }
    
    next();
  } catch (error) {
    logger.error('Admin check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Check if user has specified role
 * @param {string|string[]} roles - Required role(s)
 * @returns {Function} - Express middleware function
 */
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }
      
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      
      const hasRole = req.user.roles.some(role => 
        requiredRoles.includes(role.name)
      );
      
      if (!hasRole) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. Required role not found.',
        });
      }
      
      next();
    } catch (error) {
      logger.error('Role check error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  roleMiddleware,
};
