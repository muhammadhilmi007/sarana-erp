import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import LoginPage from '../../pages/auth/login';
import RegisterPage from '../../pages/auth/register';
import ForgotPasswordPage from '../../pages/auth/forgot-password';
import ResetPasswordPage from '../../pages/auth/reset-password';
import ProfilePage from '../../pages/profile';
import authReducer from '../../store/slices/authSlice';
import * as authService from '../../services/authService';
import { secureStorage } from '../../lib/utils/secureStorage';

// Mock Next.js router
const createMockRouter = (pathname) => ({
  pathname,
  route: pathname,
  query: {},
  asPath: pathname,
  basePath: '',
  back: jest.fn(),
  beforePopState: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  push: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
});

// Mock auth service
jest.mock('../../services/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
}));

// Mock secure storage
jest.mock('../../lib/utils/secureStorage', () => ({
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
jest.mock('../../hooks/use-toast', () => ({
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

describe('Authentication Flow Integration Tests', () => {
  let store;
  
  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
    
    // Reset mocks
    authService.login.mockReset();
    authService.register.mockReset();
    authService.logout.mockReset();
    authService.forgotPassword.mockReset();
    authService.resetPassword.mockReset();
    
    // Mock secure storage methods
    secureStorage.getAuthTokens.mockReturnValue(null);
    secureStorage.getUserData.mockReturnValue(null);
  });

  it('completes the registration to login flow', async () => {
    // Mock register API response
    authService.register.mockResolvedValue({
      user: { id: '1', name: 'New User', email: 'newuser@example.com' },
      token: 'register-token',
      refreshToken: 'register-refresh-token',
    });
    
    // Mock login API response
    authService.login.mockResolvedValue({
      user: { id: '1', name: 'New User', email: 'newuser@example.com' },
      token: 'login-token',
      refreshToken: 'login-refresh-token',
    });

    // 1. Render Register page
    const { unmount } = render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <RouterContext.Provider value={createMockRouter('/auth/register')}>
            <RegisterPage />
          </RouterContext.Provider>
        </I18nextProvider>
      </Provider>
    );

    // Fill in registration form
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'New User' },
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'newuser@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123!' },
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123!' },
    });
    
    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: 'Test Company' },
    });
    
    fireEvent.click(screen.getByLabelText(/agree to terms/i));

    // Submit registration form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Wait for registration to complete
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        companyName: 'Test Company',
        agreeToTerms: true,
      });
      expect(secureStorage.setAuthTokens).toHaveBeenCalledWith(
        {
          token: 'register-token',
          refreshToken: 'register-refresh-token',
        },
        true
      );
    });

    // Clean up
    unmount();

    // 2. Render Login page
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <RouterContext.Provider value={createMockRouter('/auth/login')}>
            <LoginPage />
          </RouterContext.Provider>
        </I18nextProvider>
      </Provider>
    );

    // Fill in login form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'newuser@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    });

    // Submit login form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for login to complete
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'Password123!',
        rememberMe: false,
      });
      expect(secureStorage.setAuthTokens).toHaveBeenCalledWith(
        {
          token: 'login-token',
          refreshToken: 'login-refresh-token',
        },
        false
      );
    });
  });

  it('completes the forgot password to reset password flow', async () => {
    // Mock forgot password API response
    authService.forgotPassword.mockResolvedValue({
      success: true,
      message: 'Password reset email sent',
    });
    
    // Mock reset password API response
    authService.resetPassword.mockResolvedValue({
      success: true,
      message: 'Password reset successful',
    });

    // 1. Render Forgot Password page
    const { unmount } = render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <RouterContext.Provider value={createMockRouter('/auth/forgot-password')}>
            <ForgotPasswordPage />
          </RouterContext.Provider>
        </I18nextProvider>
      </Provider>
    );

    // Fill in forgot password form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });

    // Submit forgot password form
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    // Wait for forgot password request to complete
    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
      });
    });

    // Clean up
    unmount();

    // 2. Render Reset Password page with token
    const mockRouter = createMockRouter('/auth/reset-password');
    mockRouter.query = { token: 'reset-token-123' };
    
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <RouterContext.Provider value={mockRouter}>
            <ResetPasswordPage />
          </RouterContext.Provider>
        </I18nextProvider>
      </Provider>
    );

    // Fill in reset password form
    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: 'NewPassword123!' },
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'NewPassword123!' },
    });

    // Submit reset password form
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    // Wait for reset password request to complete
    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith({
        token: 'reset-token-123',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });
    });
  });

  it('handles protected routes and logout correctly', async () => {
    // Mock user authentication
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockTokens = { token: 'test-token', refreshToken: 'test-refresh-token' };
    
    secureStorage.getAuthTokens.mockReturnValue(mockTokens);
    secureStorage.getUserData.mockReturnValue(mockUser);
    
    // Update store to authenticated state
    store = createMockStore({
      user: mockUser,
      token: mockTokens.token,
      refreshToken: mockTokens.refreshToken,
      isAuthenticated: true,
    });
    
    // Mock logout API response
    authService.logout.mockResolvedValue({ success: true });

    // 1. Render Profile page (protected route)
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <RouterContext.Provider value={createMockRouter('/profile')}>
            <ProfilePage />
          </RouterContext.Provider>
        </I18nextProvider>
      </Provider>
    );

    // Verify user data is displayed
    await waitFor(() => {
      expect(screen.getByText(/profile/i)).toBeInTheDocument();
    });

    // Find and click logout button (this is a simplified test as the actual button might be in a different component)
    // In a real test, you would need to render the component that contains the LogoutButton
    const logoutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(logoutButton);

    // Confirm logout in the dialog
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    // Wait for logout to complete
    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
      expect(secureStorage.clearAuthStorage).toHaveBeenCalled();
    });
  });
});
