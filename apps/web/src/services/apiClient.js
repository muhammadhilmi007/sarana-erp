import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { secureStorage } from '../lib/utils/secureStorage';
import { createRefreshInterceptor } from './tokenRefreshService';
import { API_BASE_URL } from '../config/constants';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from secure storage first, then fallback to store
    const tokens = secureStorage.getAuthTokens();
    const token = tokens?.token || store.getState().auth.token;
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Update last active timestamp
    if (token) {
      secureStorage.updateLastActive();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Apply token refresh interceptor
createRefreshInterceptor(apiClient);

// Additional response interceptor for general error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      // Network error or server not responding
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        originalError: error,
      });
    }
    
    // Handle forbidden errors (403)
    if (error.response?.status === 403) {
      console.error('Access Forbidden:', error.response.data);
      return Promise.reject({
        message: 'You do not have permission to access this resource.',
        originalError: error,
      });
    }
    
    // Handle server errors (500)
    if (error.response?.status >= 500) {
      console.error('Server Error:', error.response.data);
      return Promise.reject({
        message: 'Server error. Please try again later.',
        originalError: error,
      });
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// Helper methods for common API operations
export const apiService = {
  get: async (url, config = {}) => {
    const response = await apiClient.get(url, config);
    return response.data;
  },
  
  post: async (url, data = {}, config = {}) => {
    const response = await apiClient.post(url, data, config);
    return response.data;
  },
  
  put: async (url, data = {}, config = {}) => {
    const response = await apiClient.put(url, data, config);
    return response.data;
  },
  
  patch: async (url, data = {}, config = {}) => {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  },
  
  delete: async (url, config = {}) => {
    const response = await apiClient.delete(url, config);
    return response.data;
  },
};

export default apiClient;
