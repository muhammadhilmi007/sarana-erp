import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { selectIsAuthenticated, selectCurrentUser, logout } from '../../../store/slices/authSlice';
import { toggleTheme, selectTheme, toggleSidebar } from '../../../store/slices/uiSlice';
import Button from '../../atoms/Button';
import Typography from '../../atoms/Typography';
import LanguageSwitcher from '../../molecules/LanguageSwitcher';

/**
 * Header component for the application
 */
const Header = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  
  // Use try-catch blocks to handle potential Redux store initialization issues
  let isAuthenticated = false;
  let user = null;
  let theme = 'light';
  
  try {
    isAuthenticated = useSelector(selectIsAuthenticated);
  } catch (error) {
    console.error('Error accessing authentication state:', error);
  }
  
  try {
    user = useSelector(selectCurrentUser);
  } catch (error) {
    console.error('Error accessing user state:', error);
  }
  
  try {
    theme = useSelector(selectTheme);
  } catch (error) {
    console.error('Error accessing theme state:', error);
  }
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      // Make sure dispatch is available
      if (dispatch) {
        await dispatch(logout()).unwrap();
        router.push('/auth/login');
      } else {
        // Fallback if dispatch is not available
        console.error('Dispatch not available for logout');
        // Still redirect to login
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to login on error
      router.push('/auth/login');
    }
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button 
              onClick={() => {
                try {
                  if (dispatch) {
                    dispatch(toggleSidebar());
                  }
                } catch (error) {
                  console.error('Error toggling sidebar:', error);
                }
              }}
              className="mr-2 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <Link href="/" className="flex items-center">
              <span className="text-primary-500 font-bold text-xl">{t('app.name')}</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium">
                    {t('nav.dashboard')}
                  </Link>
                  <Link href="/shipments" className="text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium">
                    {t('nav.shipments')}
                  </Link>
                  <Link href="/pickups" className="text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium">
                    {t('nav.pickups')}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/about" className="text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium">
                    About
                  </Link>
                  <Link href="/contact" className="text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium">
                    Contact
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center">
            {/* Language switcher */}
            <LanguageSwitcher />
            
            {/* Theme toggle */}
            <button
              onClick={() => {
                try {
                  if (dispatch) {
                    dispatch(toggleTheme());
                  }
                } catch (error) {
                  console.error('Error toggling theme:', error);
                }
              }}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            
            {/* Language selector - placeholder for now */}
            <div className="ml-3 relative">
              <button
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                aria-label="Select language"
              >
                <span className="text-sm">ID</span>
              </button>
            </div>
            
            {/* Authentication */}
            {isAuthenticated ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleMenu}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    id="user-menu"
                    aria-expanded={isMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  </button>
                </div>
                
                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <Typography variant="subtitle2" className="truncate">
                        {user?.name || 'User'}
                      </Typography>
                      <Typography variant="caption" color="light" className="truncate">
                        {user?.email || 'user@example.com'}
                      </Typography>
                    </div>
                    
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                      {t('nav.profile')}
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                      {t('nav.settings')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link href="/auth/register" className="hidden sm:block">
                  <Button variant="primary" size="sm">
                    {t('auth.register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-700">
                {t('nav.dashboard')}
              </Link>
              <Link href="/shipments" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-700">
                {t('nav.shipments')}
              </Link>
              <Link href="/pickups" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-700">
                {t('nav.pickups')}
              </Link>
            </>
          ) : (
            <>
              <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-700">
                About
              </Link>
              <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-700">
                Contact
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
