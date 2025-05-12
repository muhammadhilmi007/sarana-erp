/**
 * Security Utility
 * Provides functions for password hashing, validation, and other security-related operations
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config');
const {
  logger
} = require('./logger');

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async password => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.error(`Error hashing password: ${error.message}`, {
      error
    });
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches hash
 */
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error(`Error comparing password: ${error.message}`, {
      error
    });
    return false;
  }
};

/**
 * Generate a random token
 * @param {number} [bytes=32] - Number of bytes for token
 * @returns {string} Random token
 */
const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a secure random string
 * @param {number} length - Length of the string
 * @param {string} [chars] - Characters to use
 * @returns {string} Random string
 */
const generateRandomString = (length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.randomFillSync(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
};

/**
 * Generate a verification code
 * @param {number} [length=6] - Length of the code
 * @returns {string} Verification code
 */
const generateVerificationCode = (length = 6) => {
  return generateRandomString(length, '0123456789');
};

/**
 * Hash data with SHA-256
 * @param {string} data - Data to hash
 * @returns {string} Hashed data
 */
const sha256 = data => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
const validatePasswordStrength = password => {
  const result = {
    isValid: true,
    errors: []
  };

  // Get password requirements from environment variables or use defaults
  const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH) || 8;
  const requireUppercase = process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false';
  const requireLowercase = process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false';
  const requireNumbers = process.env.PASSWORD_REQUIRE_NUMBERS !== 'false';
  const requireSpecial = process.env.PASSWORD_REQUIRE_SYMBOLS !== 'false';

  // Check minimum length
  if (password.length < minLength) {
    result.isValid = false;
    result.errors.push(`Password must be at least ${minLength} characters long`);
  }

  // Check for uppercase letters
  if (requireUppercase && !/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (requireLowercase && !/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (requireNumbers && !/[0-9]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one special character');
  }
  return result;
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
const sanitizeInput = input => {
  if (typeof input !== 'string') return input;
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
};

/**
 * Mask sensitive data for logging
 * @param {Object} data - Data to mask
 * @param {Array<string>} fields - Fields to mask
 * @returns {Object} Masked data
 */
const maskSensitiveData = (data, fields = ['password', 'token', 'refreshToken', 'accessToken']) => {
  if (!data || typeof data !== 'object') return data;
  const maskedData = {
    ...data
  };
  fields.forEach(field => {
    if (maskedData[field]) {
      maskedData[field] = '********';
    }
  });
  return maskedData;
};
module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRandomString,
  generateVerificationCode,
  sha256,
  validatePasswordStrength,
  sanitizeInput,
  maskSensitiveData
};