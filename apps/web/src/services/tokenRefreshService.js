import axios from 'axios';
import CircuitBreaker from 'opossum';
import { secureStorage } from '../lib/utils/secureStorage';
import { API_BASE_URL } from '../config/constants';

/**
 * Token refresh service
 * Handles refreshing the authentication token when it expires
 */

// Circuit breaker configuration
const circuitBreakerOptions = {
  timeout: 10000, // 10 seconds
  errorThresholdPercentage: 50,
  resetTimeout: 30000, // 30 seconds
};

// Create a circuit breaker for token refresh
const refreshCircuitBreaker = new CircuitBreaker(
  async (refreshToken) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh-token`,
      { refreshToken },
      { skipAuthRefresh: true } // Skip the interceptor to avoid infinite loop
    );
    return response.data;
  },
  circuitBreakerOptions
);

// Handle circuit breaker events
refreshCircuitBreaker.on('open', () => {
  console.warn('Token refresh circuit breaker opened');
});

refreshCircuitBreaker.on('close', () => {
  console.info('Token refresh circuit breaker closed');
});

/**
 * Refresh the authentication token
 * @returns {Promise<Object>} New tokens
 */
export const refreshAuthToken = async () => {
  try {
    // Get current tokens
    const tokens = secureStorage.getAuthTokens();
    
    if (!tokens || !tokens.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // Execute token refresh with circuit breaker
    const response = await refreshCircuitBreaker.fire(tokens.refreshToken);
    
    if (!response || !response.data || !response.data.token) {
      throw new Error('Invalid token refresh response');
    }
    
    // Get remember me preference
    const rememberMe = JSON.parse(localStorage.getItem('sp_remember_me') || 'false');
    
    // Store new tokens
    secureStorage.setAuthTokens({
      token: response.data.token,
      refreshToken: response.data.refreshToken || tokens.refreshToken,
    }, rememberMe);
    
    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken || tokens.refreshToken,
    };
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

/**
 * Create an axios instance with token refresh interceptor
 * @returns {Object} Axios instance
 */
export const createRefreshInterceptor = (axiosInstance) => {
  // Queue to store pending requests
  let isRefreshing = false;
  let failedQueue = [];
  
  // Process the queue of failed requests
  const processQueue = (error, token = null) => {
    failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    
    failedQueue = [];
  };
  
  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If the error is not 401 or the request already tried to refresh, reject
      if (!error.response || error.response.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }
      
      // If skipAuthRefresh is true, don't try to refresh the token
      if (originalRequest.skipAuthRefresh) {
        return Promise.reject(error);
      }
      
      // Mark this request as retried
      originalRequest._retry = true;
      
      // If already refreshing, add to queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      // Start refreshing
      isRefreshing = true;
      
      try {
        // Refresh the token
        const newTokens = await refreshAuthToken();
        
        // Update the authorization header
        originalRequest.headers['Authorization'] = `Bearer ${newTokens.token}`;
        
        // Process the queue with the new token
        processQueue(null, newTokens.token);
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Process the queue with the error
        processQueue(refreshError, null);
        
        // If refresh failed, clear auth storage and reject
        secureStorage.clearAuthStorage();
        
        // Redirect to login page if in browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login?session=expired';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
  
  return axiosInstance;
};

export default {
  refreshAuthToken,
  createRefreshInterceptor,
};
