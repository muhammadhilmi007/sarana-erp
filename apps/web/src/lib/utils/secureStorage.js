/**
 * Secure storage utility for managing authentication tokens and session data
 * Uses localStorage with encryption for non-sensitive data and sessionStorage for sensitive data
 */

import { encrypt, decrypt } from './crypto';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sp_access_token',
  REFRESH_TOKEN: 'sp_refresh_token',
  USER_DATA: 'sp_user_data',
  REMEMBER_ME: 'sp_remember_me',
  SESSION_EXPIRY: 'sp_session_expiry',
  LAST_ACTIVE: 'sp_last_active',
  DEVICE_ID: 'sp_device_id',
  LOGIN_HISTORY: 'sp_login_history',
};

// Default session timeout in minutes
const DEFAULT_SESSION_TIMEOUT = 30;

/**
 * Get storage type based on remember me preference
 * @param {boolean} rememberMe - Whether to use persistent storage
 * @returns {Storage} Storage object (localStorage or sessionStorage)
 */
const getStorage = (rememberMe = false) => {
  return rememberMe ? localStorage : sessionStorage;
};

/**
 * Set data in storage with optional encryption
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {boolean} encrypt - Whether to encrypt the value
 * @param {boolean} rememberMe - Whether to use persistent storage
 */
const setStorageItem = (key, value, shouldEncrypt = true, rememberMe = false) => {
  const storage = getStorage(rememberMe);
  const valueToStore = shouldEncrypt ? encrypt(JSON.stringify(value)) : JSON.stringify(value);
  storage.setItem(key, valueToStore);
};

/**
 * Get data from storage with optional decryption
 * @param {string} key - Storage key
 * @param {boolean} decrypt - Whether to decrypt the value
 * @param {boolean} rememberMe - Whether to use persistent storage
 * @returns {any} Stored value
 */
const getStorageItem = (key, shouldDecrypt = true, rememberMe = false) => {
  const storage = getStorage(rememberMe);
  const value = storage.getItem(key);
  
  if (!value) return null;
  
  try {
    return shouldDecrypt ? JSON.parse(decrypt(value)) : JSON.parse(value);
  } catch (error) {
    console.error(`Error parsing storage item: ${key}`, error);
    return null;
  }
};

/**
 * Remove item from storage
 * @param {string} key - Storage key
 * @param {boolean} rememberMe - Whether to use persistent storage
 */
const removeStorageItem = (key, rememberMe = false) => {
  const storage = getStorage(rememberMe);
  storage.removeItem(key);
};

/**
 * Clear all auth-related items from storage
 */
const clearAuthStorage = () => {
  // Clear from both storage types to ensure complete logout
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

/**
 * Set authentication tokens in storage
 * @param {Object} tokens - Authentication tokens
 * @param {string} tokens.token - Access token
 * @param {string} tokens.refreshToken - Refresh token
 * @param {boolean} rememberMe - Whether to remember the session
 */
const setAuthTokens = (tokens, rememberMe = false) => {
  const { token, refreshToken } = tokens;
  
  // Store access token in the appropriate storage
  setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, token, true, rememberMe);
  
  // Store refresh token in the appropriate storage
  setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, true, rememberMe);
  
  // Store remember me preference
  localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(rememberMe));
  
  // Set session expiry
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + DEFAULT_SESSION_TIMEOUT);
  setStorageItem(STORAGE_KEYS.SESSION_EXPIRY, expiryTime.getTime(), false, rememberMe);
  
  // Update last active timestamp
  updateLastActive();
};

/**
 * Get authentication tokens from storage
 * @returns {Object|null} Authentication tokens or null if not found
 */
const getAuthTokens = () => {
  // Check if remember me was enabled
  const rememberMe = JSON.parse(localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) || 'false');
  
  // Get tokens from the appropriate storage
  const token = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN, true, rememberMe);
  const refreshToken = getStorageItem(STORAGE_KEYS.REFRESH_TOKEN, true, rememberMe);
  
  if (!token || !refreshToken) return null;
  
  return { token, refreshToken };
};

/**
 * Set user data in storage
 * @param {Object} userData - User data
 * @param {boolean} rememberMe - Whether to remember the session
 */
const setUserData = (userData, rememberMe = false) => {
  setStorageItem(STORAGE_KEYS.USER_DATA, userData, true, rememberMe);
};

/**
 * Get user data from storage
 * @returns {Object|null} User data or null if not found
 */
const getUserData = () => {
  const rememberMe = JSON.parse(localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) || 'false');
  return getStorageItem(STORAGE_KEYS.USER_DATA, true, rememberMe);
};

/**
 * Update last active timestamp
 */
const updateLastActive = () => {
  const rememberMe = JSON.parse(localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) || 'false');
  setStorageItem(STORAGE_KEYS.LAST_ACTIVE, Date.now(), false, rememberMe);
};

/**
 * Check if session has expired
 * @returns {boolean} Whether the session has expired
 */
const isSessionExpired = () => {
  const rememberMe = JSON.parse(localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) || 'false');
  const expiryTime = getStorageItem(STORAGE_KEYS.SESSION_EXPIRY, false, rememberMe);
  
  if (!expiryTime) return true;
  
  return Date.now() > expiryTime;
};

/**
 * Extend session expiry time
 */
const extendSession = () => {
  const rememberMe = JSON.parse(localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) || 'false');
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + DEFAULT_SESSION_TIMEOUT);
  setStorageItem(STORAGE_KEYS.SESSION_EXPIRY, expiryTime.getTime(), false, rememberMe);
  updateLastActive();
};

/**
 * Add login entry to history
 * @param {Object} loginData - Login data
 */
const addLoginToHistory = (loginData) => {
  const history = getLoginHistory() || [];
  history.unshift({
    ...loginData,
    timestamp: Date.now(),
  });
  
  // Keep only the last 10 entries
  const trimmedHistory = history.slice(0, 10);
  localStorage.setItem(STORAGE_KEYS.LOGIN_HISTORY, JSON.stringify(trimmedHistory));
};

/**
 * Get login history
 * @returns {Array} Login history
 */
const getLoginHistory = () => {
  const history = localStorage.getItem(STORAGE_KEYS.LOGIN_HISTORY);
  return history ? JSON.parse(history) : [];
};

/**
 * Clear login history
 */
const clearLoginHistory = () => {
  localStorage.removeItem(STORAGE_KEYS.LOGIN_HISTORY);
};

/**
 * Generate or retrieve device ID
 * @returns {string} Device ID
 */
const getDeviceId = () => {
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  
  if (!deviceId) {
    deviceId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  
  return deviceId;
};

export const secureStorage = {
  setAuthTokens,
  getAuthTokens,
  setUserData,
  getUserData,
  updateLastActive,
  isSessionExpired,
  extendSession,
  clearAuthStorage,
  addLoginToHistory,
  getLoginHistory,
  clearLoginHistory,
  getDeviceId,
};

export default secureStorage;
