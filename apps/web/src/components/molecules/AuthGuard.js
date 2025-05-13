import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice';
import { secureStorage } from '../../lib/utils/secureStorage';
import LoadingScreen from '../atoms/LoadingScreen';

/**
 * Role-based authentication guard component
 * Redirects to login page if user is not authenticated
 * Redirects to unauthorized page if user doesn't have required role
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string[]} [props.allowedRoles] - Roles allowed to access the route
 */
const AuthGuard = ({ children, allowedRoles = [] }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Function to verify authentication status
    const verifyAuth = async () => {
      // If already authenticated in Redux store, check role
      if (isAuthenticated && currentUser) {
        // If no specific roles are required or user has required role
        if (
          allowedRoles.length === 0 || 
          (currentUser.role && allowedRoles.includes(currentUser.role))
        ) {
          setIsVerifying(false);
          return;
        } else {
          // User doesn't have required role
          router.push('/unauthorized');
          return;
        }
      }

      // Check if tokens exist in storage
      const tokens = secureStorage.getAuthTokens();
      if (!tokens) {
        // No tokens, redirect to login
        router.push({
          pathname: '/auth/login',
          query: { returnUrl: router.asPath },
        });
        return;
      }

      // Tokens exist but not in Redux state, try to restore session
      try {
        // In a real implementation, this would verify the token with the server
        // For now, we'll just check if the session is expired
        if (secureStorage.isSessionExpired()) {
          // Session expired, redirect to login
          secureStorage.clearAuthStorage();
          router.push({
            pathname: '/auth/login',
            query: { returnUrl: router.asPath },
          });
          return;
        }

        // Get user data from storage
        const userData = secureStorage.getUserData();
        if (!userData) {
          // No user data, redirect to login
          router.push({
            pathname: '/auth/login',
            query: { returnUrl: router.asPath },
          });
          return;
        }

        // Check role if required
        if (
          allowedRoles.length > 0 && 
          (!userData.role || !allowedRoles.includes(userData.role))
        ) {
          // User doesn't have required role
          router.push('/unauthorized');
          return;
        }

        // Update last active timestamp and extend session
        secureStorage.updateLastActive();
        secureStorage.extendSession();
        
        setIsVerifying(false);
      } catch (error) {
        console.error('Error verifying authentication:', error);
        // Error verifying, redirect to login
        router.push({
          pathname: '/auth/login',
          query: { returnUrl: router.asPath },
        });
      }
    };

    verifyAuth();
  }, [isAuthenticated, currentUser, router, allowedRoles, dispatch]);

  // Show loading screen while verifying
  if (isVerifying) {
    return <LoadingScreen />;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};

export default AuthGuard;
