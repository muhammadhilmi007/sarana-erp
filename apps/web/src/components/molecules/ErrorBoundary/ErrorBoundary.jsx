import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Typography from '../../atoms/Typography';
import Button from '../../atoms/Button';

/**
 * Error boundary component to catch JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Report to error monitoring service if available
    if (typeof window !== 'undefined' && window.reportError) {
      window.reportError(error, errorInfo);
    }
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Call onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    // If there's no error, render children normally
    if (!hasError) {
      return children;
    }

    // If a custom fallback is provided, use it
    if (fallback) {
      return typeof fallback === 'function' 
        ? fallback(error, errorInfo, this.handleReset)
        : fallback;
    }

    // Otherwise, render the default error UI
    return <ErrorFallback 
      error={error} 
      errorInfo={errorInfo} 
      onReset={this.handleReset} 
      showDetails={showDetails} 
    />;
  }
}

/**
 * Default error fallback component
 */
const ErrorFallback = ({ error, errorInfo, onReset, showDetails }) => {
  const { t } = useTranslation();
  
  return (
    <div className="p-6 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-center">
      <div className="mb-4 flex justify-center">
        <div className="w-16 h-16 rounded-full bg-danger-100 dark:bg-danger-800 flex items-center justify-center text-danger-600 dark:text-danger-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
      
      <Typography variant="h4" className="mb-2 text-danger-700 dark:text-danger-300">
        {t('common.error')}
      </Typography>
      
      <Typography variant="body1" className="mb-6 text-danger-600 dark:text-danger-400">
        {error?.message || t('common.unexpectedError')}
      </Typography>
      
      {showDetails && errorInfo && (
        <div className="mb-6 p-4 bg-danger-100 dark:bg-danger-800/50 rounded-md overflow-auto text-left">
          <Typography variant="caption" className="font-mono whitespace-pre-wrap text-danger-700 dark:text-danger-300">
            {error?.stack}
            {errorInfo.componentStack}
          </Typography>
        </div>
      )}
      
      <div className="flex justify-center space-x-4">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
        >
          {t('common.backToHome')}
        </Button>
        
        <Button 
          variant="primary" 
          onClick={onReset}
        >
          {t('common.tryAgain')}
        </Button>
      </div>
    </div>
  );
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onError: PropTypes.func,
  onReset: PropTypes.func,
  showDetails: PropTypes.bool
};

ErrorFallback.propTypes = {
  error: PropTypes.object,
  errorInfo: PropTypes.object,
  onReset: PropTypes.func.isRequired,
  showDetails: PropTypes.bool
};

export default ErrorBoundary;
