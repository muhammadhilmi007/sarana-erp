/**
 * Token Utility
 * Provides JWT token verification and management
 */

const jwt = require('jsonwebtoken');
const { logger } = require('./logger');

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
    
    return decoded;
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
};

/**
 * Extract token from request
 * @param {Object} req - Express request object
 * @returns {string|null} - JWT token or null if not found
 */
const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.substring(7);
  }
  
  return null;
};

/**
 * Get user ID from token
 * @param {Object} token - Decoded token payload
 * @returns {string|null} - User ID or null if not found
 */
const getUserIdFromToken = (token) => {
  if (token && token.sub) {
    return token.sub;
  }
  
  return null;
};

/**
 * Get user roles from token
 * @param {Object} token - Decoded token payload
 * @returns {Array|null} - User roles or null if not found
 */
const getUserRolesFromToken = (token) => {
  if (token && token.roles) {
    return token.roles;
  }
  
  return null;
};

module.exports = {
  verifyToken,
  extractToken,
  getUserIdFromToken,
  getUserRolesFromToken,
};
