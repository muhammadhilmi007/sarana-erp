import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from './Typography';

/**
 * Full-screen loading component
 * @param {Object} props - Component props
 * @param {string} [props.message] - Optional loading message
 */
const LoadingScreen = ({ message }) => {
  const { t } = useTranslation();
  const loadingMessage = message || t('common.loading');

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50">
      <div className="w-16 h-16 mb-4">
        <div className="w-full h-full rounded-full border-4 border-primary-200 dark:border-primary-900 border-t-primary-500 animate-spin"></div>
      </div>
      <Typography variant="body1" color="medium">
        {loadingMessage}
      </Typography>
    </div>
  );
};

export default LoadingScreen;
