import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import AuthGuard from '../../components/molecules/AuthGuard';
import LoadingScreen from '../../components/atoms/LoadingScreen';

// Create a mock store for the stories
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
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
    t: (key) => {
      const translations = {
        'auth.notAuthenticated': 'Not Authenticated',
        'auth.redirectingToLogin': 'Redirecting to login page...',
        'auth.accessDenied': 'Access Denied',
        'auth.insufficientPermissions': 'You do not have permission to access this page.',
        'auth.contactAdmin': 'Please contact your administrator for assistance.',
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
jest.mock('../../lib/utils/secureStorage', () => ({
  secureStorage: {
    getAuthTokens: jest.fn(),
    getUserData: jest.fn(),
  },
}));

export default {
  title: 'Molecules/AuthGuard',
  component: AuthGuard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Authentication guard component that protects routes based on authentication status and user roles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    requiredRoles: {
      control: 'object',
      description: 'Array of roles required to access the protected route',
    },
    children: {
      control: 'text',
      description: 'Content to display when authenticated',
    },
  },
  decorators: [
    (Story, context) => {
      // Configure mock store based on story parameters
      const { authenticated, roles } = context.args;
      const store = createMockStore({
        isAuthenticated: authenticated,
        user: authenticated ? { id: '1', name: 'Test User', email: 'test@example.com', roles } : null,
      });
      
      // Configure mock secure storage
      const { secureStorage } = require('../../lib/utils/secureStorage');
      secureStorage.getAuthTokens.mockReturnValue(
        authenticated ? { token: 'test-token', refreshToken: 'test-refresh-token' } : null
      );
      secureStorage.getUserData.mockReturnValue(
        authenticated ? { id: '1', name: 'Test User', email: 'test@example.com', roles } : null
      );
      
      return (
        <Provider store={store}>
          <div style={{ height: '100vh', width: '100%' }}>
            <Story />
          </div>
        </Provider>
      );
    },
  ],
};

// Protected content component for stories
const ProtectedContent = () => (
  <div style={{ padding: '2rem', backgroundColor: '#f9fafb', height: '100%' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Protected Content</h1>
    <p>This content is only visible to authenticated users with the required roles.</p>
  </div>
);

// Authenticated user with admin role
export const AuthenticatedAdmin = {
  args: {
    authenticated: true,
    roles: ['admin'],
    requiredRoles: ['admin'],
    children: <ProtectedContent />,
  },
};

// Authenticated user with staff role
export const AuthenticatedStaff = {
  args: {
    authenticated: true,
    roles: ['staff'],
    requiredRoles: ['staff', 'admin'],
    children: <ProtectedContent />,
  },
};

// Authenticated user with insufficient permissions
export const InsufficientPermissions = {
  args: {
    authenticated: true,
    roles: ['customer'],
    requiredRoles: ['admin', 'manager'],
    children: <ProtectedContent />,
  },
};

// Not authenticated
export const NotAuthenticated = {
  args: {
    authenticated: false,
    roles: [],
    requiredRoles: ['admin'],
    children: <ProtectedContent />,
  },
};

// Loading state
export const Loading = {
  args: {
    authenticated: true,
    roles: ['admin'],
    requiredRoles: ['admin'],
    children: <ProtectedContent />,
  },
  decorators: [
    (Story) => {
      // Override the store to show loading state
      const store = createMockStore({
        isAuthenticated: false,
        isLoading: true,
      });
      
      return (
        <Provider store={store}>
          <div style={{ height: '100vh', width: '100%' }}>
            <Story />
          </div>
        </Provider>
      );
    },
  ],
};
