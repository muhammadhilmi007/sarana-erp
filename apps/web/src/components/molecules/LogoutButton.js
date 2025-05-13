import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/slices/authSlice';
import Button from '../atoms/Button';
import { useToast } from '../../hooks/use-toast';
import { ROUTES } from '../../config/constants';

/**
 * Logout button component with confirmation dialog
 * @param {Object} props - Component props
 * @param {string} [props.variant='ghost'] - Button variant
 * @param {string} [props.size='default'] - Button size
 * @param {string} [props.className] - Additional CSS classes
 */
const LogoutButton = ({ variant = 'ghost', size = 'default', className = '' }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Handle logout click
  const handleLogoutClick = () => {
    setShowConfirmation(true);
  };

  // Handle logout confirmation
  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Dispatch logout action
      await dispatch(logout()).unwrap();
      
      // Show success message
      toast({
        title: t('auth.logoutSuccess'),
        description: t('auth.logoutSuccessMessage'),
        variant: 'success',
      });
      
      // Redirect to login page
      router.push(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: t('auth.logoutFailed'),
        description: t('auth.logoutFailedMessage'),
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
      setShowConfirmation(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleLogoutClick}
        className={className}
        aria-label={t('auth.logout')}
      >
        {t('auth.logout')}
      </Button>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">{t('auth.confirmLogout')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('auth.confirmLogoutMessage')}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoggingOut}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmLogout}
                isLoading={isLoggingOut}
              >
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;
