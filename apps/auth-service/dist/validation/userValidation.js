/**
 * User Validation Schemas
 * Defines validation schemas for user-related operations
 */

const Joi = require('joi');
const {
  password: passwordConfig
} = require('../config').security;

// Password validation pattern based on configuration
const passwordPattern = new RegExp(`^${passwordConfig.requireUppercase ? '(?=.*[A-Z])' : ''}` + `${passwordConfig.requireLowercase ? '(?=.*[a-z])' : ''}` + `${passwordConfig.requireNumbers ? '(?=.*\\d)' : ''}` + `${passwordConfig.requireSymbols ? '(?=.*[!@#$%^&*(),.?":{}|<>])' : ''}` + `.{${passwordConfig.minLength},}`);

// Common validation schemas
const email = Joi.string().email().required().lowercase().trim().messages({
  'string.email': 'Email must be a valid email address',
  'string.empty': 'Email is required',
  'any.required': 'Email is required'
});
const password = Joi.string().min(passwordConfig.minLength).pattern(passwordPattern).required().messages({
  'string.min': `Password must be at least ${passwordConfig.minLength} characters`,
  'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  'string.empty': 'Password is required',
  'any.required': 'Password is required'
});
const firstName = Joi.string().required().trim().min(2).max(50).messages({
  'string.min': 'First name must be at least 2 characters',
  'string.max': 'First name must be at most 50 characters',
  'string.empty': 'First name is required',
  'any.required': 'First name is required'
});
const lastName = Joi.string().required().trim().min(2).max(50).messages({
  'string.min': 'Last name must be at least 2 characters',
  'string.max': 'Last name must be at most 50 characters',
  'string.empty': 'Last name is required',
  'any.required': 'Last name is required'
});
const phoneNumber = Joi.string().pattern(/^[0-9+\-\s()]{8,15}$/).messages({
  'string.pattern.base': 'Phone number must be a valid phone number'
});
const token = Joi.string().required().messages({
  'string.empty': 'Token is required',
  'any.required': 'Token is required'
});

// Registration validation schema
const registerSchema = Joi.object({
  firstName,
  lastName,
  email,
  password,
  phoneNumber: phoneNumber.optional(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'STAFF', 'DRIVER', 'CUSTOMER').default('CUSTOMER')
});

// Login validation schema
const loginSchema = Joi.object({
  email,
  password: Joi.string().required(),
  rememberMe: Joi.boolean().default(false)
});

// Email verification validation schema
const verifyEmailSchema = Joi.object({
  token
});

// Password reset request validation schema
const passwordResetRequestSchema = Joi.object({
  email
});

// Password reset confirmation validation schema
const passwordResetConfirmSchema = Joi.object({
  token,
  password,
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords must match',
    'string.empty': 'Confirm password is required',
    'any.required': 'Confirm password is required'
  })
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: password,
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords must match',
    'string.empty': 'Confirm password is required',
    'any.required': 'Confirm password is required'
  })
});

// Update profile validation schema
const updateProfileSchema = Joi.object({
  firstName,
  lastName,
  phoneNumber: phoneNumber.optional(),
  profilePicture: Joi.string().uri().optional()
}).min(1);

// Refresh token validation schema
const refreshTokenSchema = Joi.object({
  refreshToken: token
});

// Logout validation schema
const logoutSchema = Joi.object({
  refreshToken: token,
  allDevices: Joi.boolean().default(false)
});

// MFA setup validation schema
const setupMfaSchema = Joi.object({
  mfaCode: Joi.string().pattern(/^[0-9]{6}$/).required().messages({
    'string.pattern.base': 'MFA code must be a 6-digit number',
    'string.empty': 'MFA code is required',
    'any.required': 'MFA code is required'
  })
});

// MFA verification validation schema
const verifyMfaSchema = Joi.object({
  mfaCode: Joi.string().pattern(/^[0-9]{6}$/).required().messages({
    'string.pattern.base': 'MFA code must be a 6-digit number',
    'string.empty': 'MFA code is required',
    'any.required': 'MFA code is required'
  })
});

// Admin create user validation schema
const adminCreateUserSchema = Joi.object({
  firstName,
  lastName,
  email,
  password,
  phoneNumber: phoneNumber.optional(),
  role: Joi.string().valid('user', 'admin', 'manager', 'driver', 'warehouse').default('user'),
  isEmailVerified: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true)
});

// Admin update user validation schema
const adminUpdateUserSchema = Joi.object({
  firstName: firstName.optional(),
  lastName: lastName.optional(),
  phoneNumber: phoneNumber.optional(),
  role: Joi.string().valid('user', 'admin', 'manager', 'driver', 'warehouse').optional(),
  isEmailVerified: Joi.boolean().optional(),
  isActive: Joi.boolean().optional()
}).min(1);

// Admin reset password validation schema
const adminResetPasswordSchema = Joi.object({
  newPassword: password,
  sendEmail: Joi.boolean().default(true)
});

// Admin lock account validation schema
const adminLockAccountSchema = Joi.object({
  reason: Joi.string().valid('MANUAL', 'SUSPICIOUS_ACTIVITY', 'PASSWORD_EXPIRED').default('MANUAL'),
  sendEmail: Joi.boolean().default(true)
});
module.exports = {
  // User schemas
  register: registerSchema,
  login: loginSchema,
  email: passwordResetRequestSchema,
  resetPassword: passwordResetConfirmSchema,
  changePassword: changePasswordSchema,
  updateProfile: updateProfileSchema,
  refreshToken: refreshTokenSchema,
  logout: logoutSchema,
  setupMfa: setupMfaSchema,
  verifyMfa: verifyMfaSchema,
  // Admin schemas
  adminCreateUser: adminCreateUserSchema,
  adminUpdateUser: adminUpdateUserSchema,
  adminResetPassword: adminResetPasswordSchema,
  adminLockAccount: adminLockAccountSchema
};