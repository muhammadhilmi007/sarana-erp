import { apiService } from './apiClient';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  ME: '/auth/me',
  MFA_GENERATE: '/auth/mfa/generate',
  MFA_VERIFY: '/auth/mfa/verify',
  MFA_ENABLE: '/auth/mfa/enable',
  MFA_DISABLE: '/auth/mfa/disable',
  MFA_STATUS: '/auth/mfa/status',
  MFA_BACKUP_CODES: '/auth/mfa/backup-codes',
  MFA_LOGIN_VERIFY: '/auth/mfa/login-verify',
};

const authService = {
  /**
   * Login user with email and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User data with tokens
   */
  login: async (credentials) => {
    return apiService.post(AUTH_ENDPOINTS.LOGIN, credentials);
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data with tokens
   */
  register: async (userData) => {
    return apiService.post(AUTH_ENDPOINTS.REGISTER, userData);
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    return apiService.post(AUTH_ENDPOINTS.LOGOUT);
  },

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  refreshToken: async (refreshToken) => {
    return apiService.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
  },

  /**
   * Request password reset email
   * @param {string} email - User email
   * @returns {Promise<Object>} Success message
   */
  forgotPassword: async (email) => {
    return apiService.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
  },

  /**
   * Reset password with token
   * @param {Object} resetData - Reset password data
   * @param {string} resetData.token - Reset token
   * @param {string} resetData.password - New password
   * @returns {Promise<Object>} Success message
   */
  resetPassword: async (resetData) => {
    return apiService.post(AUTH_ENDPOINTS.RESET_PASSWORD, resetData);
  },

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Success message
   */
  verifyEmail: async (token) => {
    return apiService.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  getCurrentUser: async () => {
    return apiService.get(AUTH_ENDPOINTS.ME);
  },

  /**
   * Generate MFA secret and QR code URL
   * @returns {Promise<Object>} MFA setup data including secret and QR code URL
   */
  generateMFASecret: async () => {
    // For development, we'll mock this response
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({
        secret: 'JBSWY3DPEHPK3PXP',
        qrCodeUrl: 'otpauth://totp/SamudraPaketERP:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=SamudraPaketERP',
      });
    }
    return apiService.post(AUTH_ENDPOINTS.MFA_GENERATE);
  },

  /**
   * Verify MFA code during setup
   * @param {Object} data - Verification data
   * @param {string} data.secret - MFA secret
   * @param {string} data.code - Verification code
   * @returns {Promise<Object>} Verification result
   */
  verifyMFACode: async (data) => {
    // For development, we'll mock this response
    if (process.env.NODE_ENV === 'development') {
      // Accept any 6-digit code for development
      const isValid = /^\d{6}$/.test(data.code);
      return Promise.resolve({ success: isValid });
    }
    return apiService.post(AUTH_ENDPOINTS.MFA_VERIFY, data);
  },

  /**
   * Enable MFA for the user
   * @returns {Promise<Object>} Success message
   */
  enableMFA: async () => {
    // For development, we'll mock this response
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({ success: true, message: 'MFA enabled successfully' });
    }
    return apiService.post(AUTH_ENDPOINTS.MFA_ENABLE);
  },

  /**
   * Disable MFA for the user
   * @returns {Promise<Object>} Success message
   */
  disableMFA: async () => {
    // For development, we'll mock this response
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({ success: true, message: 'MFA disabled successfully' });
    }
    return apiService.post(AUTH_ENDPOINTS.MFA_DISABLE);
  },

  /**
   * Get MFA status for the user
   * @returns {Promise<Object>} MFA status
   */
  getMFAStatus: async () => {
    // For development, we'll mock this response
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({
        enabled: false,
        lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      });
    }
    return apiService.get(AUTH_ENDPOINTS.MFA_STATUS);
  },

  /**
   * Generate backup codes for MFA
   * @returns {Promise<Object>} Backup codes
   */
  generateBackupCodes: async () => {
    // For development, we'll mock this response
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({
        codes: [
          'ABCD-EFGH-IJKL-MNOP',
          'QRST-UVWX-YZ12-3456',
          '7890-ABCD-EFGH-IJKL',
          'MNOP-QRST-UVWX-YZ12',
          '3456-7890-ABCD-EFGH',
          'IJKL-MNOP-QRST-UVWX',
          'YZ12-3456-7890-ABCD',
          'EFGH-IJKL-MNOP-QRST',
        ],
      });
    }
    return apiService.post(AUTH_ENDPOINTS.MFA_BACKUP_CODES);
  },

  /**
   * Regenerate backup codes for MFA
   * @returns {Promise<Object>} New backup codes
   */
  regenerateBackupCodes: async () => {
    // For development, we'll mock this response
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({
        codes: [
          'WXYZ-1234-5678-9ABC',
          'DEFG-HIJK-LMNO-PQRS',
          'TUVW-XYZ1-2345-6789',
          'ABCD-EFGH-IJKL-MNOP',
          'QRST-UVWX-YZ12-3456',
          '7890-ABCD-EFGH-IJKL',
          'MNOP-QRST-UVWX-YZ12',
          '3456-7890-ABCD-EFGH',
        ],
      });
    }
    return apiService.post(AUTH_ENDPOINTS.MFA_BACKUP_CODES, { regenerate: true });
  },

  /**
   * Verify MFA code during login
   * @param {Object} data - Verification data
   * @param {string} data.email - User email
   * @param {string} data.code - Verification code or backup code
   * @param {string} data.method - Verification method ('app' or 'backup')
   * @returns {Promise<Object>} Verification result with token
   */
  verifyMFALogin: async (data) => {
    // For development, we'll mock this response
    if (process.env.NODE_ENV === 'development') {
      // Accept any 6-digit code for app method or any code for backup method
      const isValid = data.method === 'app' ? /^\d{6}$/.test(data.code) : data.code.length > 0;
      return Promise.resolve({
        success: isValid,
        token: isValid ? 'mfa-verified-token-example' : null,
      });
    }
    return apiService.post(AUTH_ENDPOINTS.MFA_LOGIN_VERIFY, data);
  },
};

export default authService;
