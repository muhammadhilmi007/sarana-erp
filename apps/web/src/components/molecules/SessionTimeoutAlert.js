import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/slices/authSlice';
import { secureStorage } from '../../lib/utils/secureStorage';
import { useToast } from '../../hooks/use-toast';

// Session timeout settings
const SESSION_CHECK_INTERVAL = 60000; // Check every minute
const WARNING_BEFORE_TIMEOUT = 5 * 60000; // Show warning 5 minutes before timeout

/**
 * Session timeout alert component
 * Monitors user activity and shows a warning when session is about to expire
 */
const SessionTimeoutAlert = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    // If user is active and authenticated, extend the session
    if (secureStorage.getAuthTokens()) {
      secureStorage.updateLastActive();
      secureStorage.extendSession();
    }
  }, []);

  // Check session status
  const checkSession = useCallback(() => {
    // Skip check if on auth pages
    if (router.pathname.startsWith('/auth/')) {
      return;
    }

    // Get tokens from storage
    const tokens = secureStorage.getAuthTokens();
    if (!tokens) {
      return;
    }

    // Check if session is expired
    if (secureStorage.isSessionExpired()) {
      // Session expired, log out
      dispatch(logout());
      router.push('/auth/login');
      toast({
        title: t('auth.sessionExpired'),
        description: t('auth.sessionExpiredMessage'),
        variant: 'destructive',
      });
      return;
    }

    // Get session expiry time
    const rememberMe = JSON.parse(localStorage.getItem('sp_remember_me') || 'false');
    const expiryTime = secureStorage.getStorageItem('sp_session_expiry', false, rememberMe);
    
    if (!expiryTime) {
      return;
    }

    // Calculate time left
    const timeRemaining = expiryTime - Date.now();
    
    // Show warning if less than WARNING_BEFORE_TIMEOUT
    if (timeRemaining <= WARNING_BEFORE_TIMEOUT && timeRemaining > 0) {
      setTimeLeft(Math.floor(timeRemaining / 60000)); // Convert to minutes
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [dispatch, router, toast, t]);

  // Extend session
  const extendSession = useCallback(() => {
    secureStorage.extendSession();
    setShowWarning(false);
    toast({
      title: t('auth.sessionExtended'),
      description: t('auth.sessionExtendedMessage'),
      variant: 'success',
    });
  }, [toast, t]);

  // Set up activity listeners and interval check
  useEffect(() => {
    // Add event listeners for user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Set up interval to check session status
    const intervalId = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    // Initial check
    checkSession();

    // Clean up
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(intervalId);
    };
  }, [handleUserActivity, checkSession]);

  // Show warning toast when needed
  useEffect(() => {
    if (showWarning) {
      const toastId = toast({
        title: t('auth.sessionTimeout'),
        description: t('auth.sessionTimeoutWarning', { minutes: timeLeft }),
        variant: 'warning',
        duration: Infinity, // Don't auto-dismiss
        action: (
          <button
            onClick={extendSession}
            className="bg-primary-500 text-white px-3 py-1 rounded-md text-sm font-medium"
          >
            {t('auth.extendSession')}
          </button>
        ),
      });

      // Clean up toast when warning is hidden
      return () => {
        toast.dismiss(toastId);
      };
    }
  }, [showWarning, timeLeft, toast, extendSession, t]);

  // This component doesn't render anything visible
  return null;
};

export default SessionTimeoutAlert;
