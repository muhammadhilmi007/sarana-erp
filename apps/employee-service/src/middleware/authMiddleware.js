/**
 * Authentication Middleware
 * Handles JWT authentication for API requests
 */

const jwt = require('jsonwebtoken');
const { unauthorizedError } = require('./errorMiddleware');

/**
 * Middleware for JWT authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(unauthorizedError('No token provided'));
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(unauthorizedError('No token provided'));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(unauthorizedError('Token expired'));
    }
    
    if (error.name === 'JsonWebTokenError') {
      return next(unauthorizedError('Invalid token'));
    }
    
    next(error);
  }
};

module.exports = {
  authMiddleware
};
