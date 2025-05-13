/**
 * Application constants
 */

// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Authentication constants
export const AUTH_STORAGE_PREFIX = 'sp_'; // Samudra Paket storage prefix
export const TOKEN_EXPIRY_TIME = 30; // Token expiry time in minutes
export const REFRESH_TOKEN_EXPIRY_TIME = 7 * 24 * 60; // Refresh token expiry time in minutes (7 days)
export const SESSION_TIMEOUT_WARNING = 5; // Show warning 5 minutes before session timeout

// UI constants
export const TOAST_DURATION = 5000; // Toast notification duration in milliseconds
export const TOAST_DURATION_ERROR = 8000; // Error toast notification duration in milliseconds

// Pagination constants
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Date format constants
export const DATE_FORMAT = 'DD/MM/YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';

// File upload constants
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

// Role constants
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  DRIVER: 'driver',
  CUSTOMER: 'customer',
};

// Route constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SECURITY: '/profile/security',
  BRANCHES: '/branches',
  DIVISIONS: '/divisions',
};

// Feature flags
export const FEATURES = {
  MULTI_FACTOR_AUTH: false,
  DARK_MODE: true,
  GEOLOCATION: true,
  NOTIFICATIONS: true,
};

export default {
  API_BASE_URL,
  AUTH_STORAGE_PREFIX,
  TOKEN_EXPIRY_TIME,
  REFRESH_TOKEN_EXPIRY_TIME,
  SESSION_TIMEOUT_WARNING,
  TOAST_DURATION,
  TOAST_DURATION_ERROR,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  DATE_FORMAT,
  TIME_FORMAT,
  DATETIME_FORMAT,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  USER_ROLES,
  ROUTES,
  FEATURES,
};
