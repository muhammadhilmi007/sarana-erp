import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import SessionTimeoutAlert from '../../components/molecules/SessionTimeoutAlert';

// Create a mock store for the stories
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

// Mock router for Next.js
const mockRouter = {
  push: jest.fn(),
  pathname: '/dashboard',
};

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      const translations = {
        'auth.sessionTimeout': 'Session Timeout',
        'auth.sessionTimeoutWarning': `Your session will expire in ${options?.minutes || 5} minutes.`,
        'auth.extendSession': 'Extend Session',
        'auth.sessionExpired': 'Session Expired',
        'auth.sessionExpiredMessage': 'Your session has expired. Please log in again.',
        'auth.sessionExtended': 'Session Extended',
        'auth.sessionExtendedMessage': 'Your session has been extended.',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock router hook
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock secure storage
jest.mock('../../lib/utils/secureStorage', () => {
  let expiryTime = null;
  let lastActive = Date.now();
  
  return {
    secureStorage: {
      getAuthTokens: jest.fn().mockReturnValue({ token: 'test-token', refreshToken: 'test-refresh-token' }),
      updateLastActive: jest.fn().mockImplementation(() => {
        lastActive = Date.now();
      }),
      extendSession: jest.fn().mockImplementation(() => {
        expiryTime = Date.now() + 30 * 60 * 1000; // 30 minutes
      }),
      isSessionExpired: jest.fn().mockImplementation(() => {
        return expiryTime !== null && Date.now() > expiryTime;
      }),
      getStorageItem: jest.fn().mockImplementation((key) => {
        if (key === 'sp_session_expiry') {
          return expiryTime || (Date.now() + 5 * 60 * 1000); // 5 minutes by default
        }
        return null;
      }),
      _setExpiryTime: (time) => {
        expiryTime = time;
      },
    },
  };
});

// Mock toast hook
jest.mock('../../hooks/use-toast', () => {
  const toastFn = jest.fn();
  toastFn.dismiss = jest.fn();
  
  return {
    useToast: () => ({
      toast: toastFn,
    }),
  };
});

export default {
  title: 'Molecules/SessionTimeoutAlert',
  component: SessionTimeoutAlert,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Session timeout alert component that monitors user activity and shows a warning when the session is about to expire.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      // Configure mock store
      const store = createMockStore();
      
      // Configure mock secure storage
      const { secureStorage } = require('../../lib/utils/secureStorage');
      
      // Set expiry time based on story parameters
      const { minutesUntilExpiry } = context.args;
      if (minutesUntilExpiry !== undefined) {
        secureStorage._setExpiryTime(Date.now() + minutesUntilExpiry * 60 * 1000);
      }
      
      return (
        <Provider store={store}>
          <div style={{ 
            height: '100vh', 
            width: '100%', 
            padding: '2rem',
            backgroundColor: '#f9fafb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Session Timeout Demo</h1>
            <p style={{ marginBottom: '2rem' }}>This demo shows how the session timeout alert works.</p>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#fff', 
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              width: '100%',
              maxWidth: '500px',
            }}>
              <Story />
            </div>
            <div style={{ marginTop: '2rem' }}>
              <p><strong>Note:</strong> The SessionTimeoutAlert component doesn't render anything visible by itself.</p>
              <p>It monitors user activity and shows a toast notification when the session is about to expire.</p>
            </div>
          </div>
        </Provider>
      );
    },
  ],
};

// Session about to expire in 5 minutes
export const AboutToExpire = {
  args: {
    minutesUntilExpiry: 5,
  },
};

// Session about to expire in 2 minutes
export const UrgentExpiry = {
  args: {
    minutesUntilExpiry: 2,
  },
};

// Session already expired
export const Expired = {
  args: {
    minutesUntilExpiry: -1, // Already expired
  },
};

// Session with plenty of time
export const ActiveSession = {
  args: {
    minutesUntilExpiry: 25, // 25 minutes until expiry
  },
};
