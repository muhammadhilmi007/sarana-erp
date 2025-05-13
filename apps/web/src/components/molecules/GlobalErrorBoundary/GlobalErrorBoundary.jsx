import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from '../ErrorBoundary';
import Typography from '../../atoms/Typography';
import Button from '../../atoms/Button';

/**
 * Global error fallback component with more detailed error information
 */
const GlobalErrorFallback = ({ error, errorInfo, onReset }) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg p-8 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center text-danger-600 dark:text-danger-400">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <Typography variant="h3" className="mb-2 text-center text-danger-700 dark:text-danger-300">
          {t('common.applicationError')}
        </Typography>
        
        <Typography variant="body1" className="mb-6 text-center text-gray-600 dark:text-gray-400">
          {error?.message || t('common.unexpectedError')}
        </Typography>
        
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md overflow-auto max-h-60 text-left">
          <Typography variant="caption" className="font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {error?.stack}
            {errorInfo?.componentStack}
          </Typography>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button 
            variant="outline" 
            fullWidth
            onClick={() => window.location.href = '/'}
          >
            {t('common.backToHome')}
          </Button>
          
          <Button 
            variant="primary" 
            fullWidth
            onClick={onReset}
          >
            {t('common.refreshApplication')}
          </Button>
        </div>
        
        <Typography variant="caption" className="mt-6 text-center block text-gray-500 dark:text-gray-500">
          {t('common.errorReference')}: {Date.now().toString(36)}
        </Typography>
      </div>
    </div>
  );
};

/**
 * Global error boundary to catch errors at the application level
 */
const GlobalErrorBoundary = ({ children }) => {
  const handleReset = () => {
    // Reload the page to reset the application state
    window.location.reload();
  };
  
  const handleError = (error, errorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Global error caught:', error, errorInfo);
    }
    
    // In production, you would send this to your error tracking service
    // Example: Sentry.captureException(error);
  };
  
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, onReset) => (
        <GlobalErrorFallback 
          error={error} 
          errorInfo={errorInfo} 
          onReset={handleReset} 
        />
      )}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
};

GlobalErrorFallback.propTypes = {
  error: PropTypes.object,
  errorInfo: PropTypes.object,
  onReset: PropTypes.func.isRequired
};

GlobalErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default GlobalErrorBoundary;
