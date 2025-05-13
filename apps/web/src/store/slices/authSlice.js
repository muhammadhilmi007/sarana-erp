import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { secureStorage } from '../../lib/utils/secureStorage';
import { ROUTES } from '../../config/constants';

// Define initial state
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  mfaRequired: false,
  mfaToken: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Check if MFA is required
      if (response.requireMFA) {
        // For MFA flow, we don't store the tokens yet
        // We just return the response with the MFA token
        // Add partial login to history
        secureStorage.addLoginToHistory({
          id: Date.now().toString(),
          device: navigator.userAgent,
          location: 'Unknown', // In a real app, this would be determined by geolocation or IP
          status: 'pending_mfa',
        });
        
        return {
          requireMFA: true,
          mfaToken: response.mfaToken,
          email: credentials.email,
          rememberMe: credentials.rememberMe
        };
      }
      
      // No MFA required, proceed with normal login flow
      // Store tokens and user data in secure storage
      secureStorage.setAuthTokens({
        token: response.token,
        refreshToken: response.refreshToken
      }, credentials.rememberMe);
      
      secureStorage.setUserData(response.user, credentials.rememberMe);
      
      // Add login to history
      secureStorage.addLoginToHistory({
        id: Date.now().toString(),
        device: navigator.userAgent,
        location: 'Unknown', // In a real app, this would be determined by geolocation or IP
        status: 'success',
      });
      
      return response;
    } catch (error) {
      // Add failed login to history
      secureStorage.addLoginToHistory({
        id: Date.now().toString(),
        device: navigator.userAgent,
        location: 'Unknown',
        status: 'failed',
      });
      
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      
      // Store tokens and user data in secure storage
      secureStorage.setAuthTokens({
        token: response.token,
        refreshToken: response.refreshToken
      }, true); // Always remember new registrations
      
      secureStorage.setUserData(response.user, true);
      
      // Add login to history
      secureStorage.addLoginToHistory({
        id: Date.now().toString(),
        device: navigator.userAgent,
        location: 'Unknown', // In a real app, this would be determined by geolocation or IP
        status: 'success',
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Get tokens before clearing storage
      const tokens = secureStorage.getAuthTokens();
      
      // Clear secure storage first
      secureStorage.clearAuthStorage();
      
      // Only call API if we have a token
      if (tokens?.token) {
        try {
          await authService.logout();
        } catch (logoutError) {
          // Even if the server-side logout fails, we still want to clear the client-side state
          console.error('Server logout failed, but client logout succeeded', logoutError);
        }
      }
      
      // Clear any cached API responses
      if (typeof window !== 'undefined') {
        // Clear any application cache
        const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cache-'));
        cacheKeys.forEach(key => localStorage.removeItem(key));
        
        // Clear any service worker caches if needed
        if ('caches' in window) {
          try {
            caches.keys().then(names => {
              names.forEach(name => {
                caches.delete(name);
              });
            });
          } catch (e) {
            console.error('Error clearing caches:', e);
          }
        }
      }
      
      return null;
    } catch (error) {
      // Even if there's an error, we still want to clear the client-side state
      secureStorage.clearAuthStorage();
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const verifyMFA = createAsyncThunk(
  'auth/verifyMFA',
  async ({ mfaToken, code, email, rememberMe, isBackupCode = false }, { rejectWithValue }) => {
    try {
      // Call the API to verify the MFA code
      const response = await authService.verifyMFALogin({
        mfaToken,
        code,
        isBackupCode
      });
      
      // If verification is successful, store tokens and user data
      secureStorage.setAuthTokens({
        token: response.token,
        refreshToken: response.refreshToken
      }, rememberMe);
      
      secureStorage.setUserData(response.user, rememberMe);
      
      // Update login history
      secureStorage.addLoginToHistory({
        id: Date.now().toString(),
        device: navigator.userAgent,
        location: 'Unknown',
        status: 'success_mfa',
      });
      
      return response;
    } catch (error) {
      // Add failed MFA verification to history
      secureStorage.addLoginToHistory({
        id: Date.now().toString(),
        device: navigator.userAgent,
        location: 'Unknown',
        status: 'failed_mfa',
      });
      
      return rejectWithValue(error.response?.data?.message || 'MFA verification failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      // Get refresh token from secure storage
      const tokens = secureStorage.getAuthTokens();
      
      if (!tokens?.refreshToken) {
        return rejectWithValue('No refresh token available');
      }
      
      const response = await authService.refreshToken(tokens.refreshToken);
      
      // Update tokens in secure storage
      secureStorage.setAuthTokens({
        token: response.token,
        refreshToken: response.refreshToken
      });
      
      return response;
    } catch (error) {
      // If refresh fails, clear auth storage
      secureStorage.clearAuthStorage();
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

// Helper function to initialize state from secure storage
const initializeAuthState = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    try {
      const tokens = secureStorage.getAuthTokens();
      const userData = secureStorage.getUserData();
      
      if (tokens && userData) {
        return {
          ...initialState,
          user: userData,
          token: tokens.token,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        };
      }
    } catch (error) {
      console.error('Error initializing auth state from secure storage:', error);
      // If there's an error, clear storage and start fresh
      secureStorage.clearAuthStorage();
    }
  }
  
  return initialState;
};

// Create slice
const authSlice = createSlice({
  name: 'auth',
  initialState: initializeAuthState(),
  reducers: {
    resetAuthState: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.mfaRequired = false;
      state.mfaToken = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.mfaRequired = false;
      state.mfaToken = null;
    },
    cancelMFA: (state) => {
      state.mfaRequired = false;
      state.mfaToken = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.mfaRequired = false;
        state.mfaToken = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Check if MFA is required
        if (action.payload.requireMFA) {
          state.mfaRequired = true;
          state.mfaToken = action.payload.mfaToken;
          state.isAuthenticated = false;
        } else {
          // Normal login flow
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.mfaRequired = false;
          state.mfaToken = null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.mfaRequired = false;
        state.mfaToken = null;
      })
      
      // MFA Verification
      .addCase(verifyMFA.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyMFA.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.mfaRequired = false;
        state.mfaToken = null;
      })
      .addCase(verifyMFA.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Keep MFA required state true so user can retry
        // state.mfaRequired remains true
        // state.mfaToken remains set
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Refresh token
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      });
  },
});

// Export actions
export const { resetAuthState, setCredentials, clearCredentials, cancelMFA } = authSlice.actions;

// Export selectors
export const selectCurrentUser = (state) => {
  // First try to get from state
  if (state.auth.user) {
    return state.auth.user;
  }
  
  // If not in state, try to get from secure storage
  if (typeof window !== 'undefined') {
    return secureStorage.getUserData();
  }
  
  return null;
};

export const selectIsAuthenticated = (state) => {
  // First check state
  if (state.auth.isAuthenticated) {
    return true;
  }
  
  // If not authenticated in state, check secure storage
  if (typeof window !== 'undefined') {
    return !!secureStorage.getAuthTokens();
  }
  
  return false;
};

export const selectAuthToken = (state) => {
  // First try to get from state
  if (state.auth.token) {
    return state.auth.token;
  }
  
  // If not in state, try to get from secure storage
  if (typeof window !== 'undefined') {
    const tokens = secureStorage.getAuthTokens();
    return tokens?.token || null;
  }
  
  return null;
};

export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.isLoading;

// MFA selectors
export const selectMFARequired = (state) => state.auth.mfaRequired;
export const selectMFAToken = (state) => state.auth.mfaToken;

// Export reducer
export default authSlice.reducer;
