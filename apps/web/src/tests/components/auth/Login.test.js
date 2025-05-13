import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';
import LoginPage from '../../../pages/auth/login';
import authReducer from '../../../store/slices/authSlice';
import * as authActions from '../../../store/slices/authSlice';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/auth/login',
    query: {},
  }),
}));

// Mock secure storage
jest.mock('../../../lib/utils/secureStorage', () => ({
  secureStorage: {
    setAuthTokens: jest.fn(),
    getAuthTokens: jest.fn(),
    setUserData: jest.fn(),
    getUserData: jest.fn(),
    updateLastActive: jest.fn(),
    isSessionExpired: jest.fn(),
    extendSession: jest.fn(),
    clearAuthStorage: jest.fn(),
    addLoginToHistory: jest.fn(),
    getLoginHistory: jest.fn(),
    clearLoginHistory: jest.fn(),
    getDeviceId: jest.fn(),
  },
}));

// Mock toast hook
jest.mock('../../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Create a mock store
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

describe('Login Page', () => {
  let store;
  
  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <LoginPage />
        </I18nextProvider>
      </Provider>
    );

    // Check for form elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <LoginPage />
        </I18nextProvider>
      </Provider>
    );

    // Try to submit with empty fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for validation messages
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    // Mock the login action
    const mockLoginAction = jest.spyOn(authActions, 'login');
    mockLoginAction.mockImplementation(() => {
      return {
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: '1', name: 'Test User', email: 'test@example.com' },
          token: 'fake-token',
          refreshToken: 'fake-refresh-token',
        },
      };
    });

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <LoginPage />
        </I18nextProvider>
      </Provider>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    });

    // Check remember me
    fireEvent.click(screen.getByLabelText(/remember me/i));

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify login action was called with correct data
    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        rememberMe: true,
      });
    });
  });

  it('displays error message when login fails', async () => {
    // Mock the login action to fail
    const mockLoginAction = jest.spyOn(authActions, 'login');
    mockLoginAction.mockImplementation(() => {
      return {
        type: 'auth/login/rejected',
        payload: 'Invalid credentials',
      };
    });

    // Create store with error state
    store = createMockStore({ error: 'Invalid credentials' });

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <LoginPage />
        </I18nextProvider>
      </Provider>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during form submission', async () => {
    // Mock the login action
    const mockLoginAction = jest.spyOn(authActions, 'login');
    mockLoginAction.mockImplementation(() => {
      return {
        type: 'auth/login/pending',
      };
    });

    // Create store with loading state
    store = createMockStore({ isLoading: true });

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <LoginPage />
        </I18nextProvider>
      </Provider>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
  });
});
