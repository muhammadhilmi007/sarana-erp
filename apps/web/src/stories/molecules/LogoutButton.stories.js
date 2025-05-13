import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import LogoutButton from '../../components/molecules/LogoutButton';

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
  push: () => {},
};

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'auth.logout': 'Logout',
        'auth.confirmLogout': 'Confirm Logout',
        'auth.confirmLogoutMessage': 'Are you sure you want to logout?',
        'auth.logoutSuccess': 'Logout Successful',
        'auth.logoutSuccessMessage': 'You have been successfully logged out.',
        'auth.logoutFailed': 'Logout Failed',
        'auth.logoutFailedMessage': 'Failed to logout. Please try again.',
        'common.cancel': 'Cancel',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock router hook
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock toast hook
jest.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

export default {
  title: 'Molecules/LogoutButton',
  component: LogoutButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Logout button component with confirmation dialog for the Samudra Paket ERP system.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'outline', 'ghost', 'link', 'destructive'],
      description: 'Button variant style',
      defaultValue: 'ghost',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Button size',
      defaultValue: 'default',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  decorators: [
    (Story) => {
      const store = createMockStore();
      return (
        <Provider store={store}>
          <div style={{ padding: '2rem' }}>
            <Story />
          </div>
        </Provider>
      );
    },
  ],
};

// Default variant
export const Default = {
  args: {
    variant: 'ghost',
    size: 'default',
  },
};

// Primary variant
export const Primary = {
  args: {
    variant: 'primary',
    size: 'default',
  },
};

// Destructive variant
export const Destructive = {
  args: {
    variant: 'destructive',
    size: 'default',
  },
};

// Small size
export const Small = {
  args: {
    variant: 'ghost',
    size: 'sm',
  },
};

// Large size
export const Large = {
  args: {
    variant: 'ghost',
    size: 'lg',
  },
};
