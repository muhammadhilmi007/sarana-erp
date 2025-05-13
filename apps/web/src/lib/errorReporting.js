/**
 * Error reporting and logging utility
 * This can be extended to integrate with services like Sentry, LogRocket, etc.
 */

/**
 * Log an error to the console and optionally to an error tracking service
 * @param {Error} error - The error object
 * @param {Object} errorInfo - Additional information about the error
 * @param {Object} context - Additional context about where the error occurred
 */
export const logError = (error, errorInfo, context = {}) => {
  // Always log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error caught:', error);
    if (errorInfo) {
      console.error('Error info:', errorInfo);
    }
    if (Object.keys(context).length > 0) {
      console.error('Error context:', context);
    }
  }

  // In production, you would send this to your error tracking service
  // Example: Sentry.captureException(error, { extra: { ...errorInfo, ...context } });
};

/**
 * Report an error to an error tracking service
 * @param {Error} error - The error object
 * @param {Object} errorInfo - Additional information about the error
 * @param {Object} context - Additional context about where the error occurred
 */
export const reportError = (error, errorInfo, context = {}) => {
  // Log the error
  logError(error, errorInfo, context);

  // Generate a unique error ID for reference
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

  // In a real implementation, you would send this to your error tracking service
  // Example: Sentry.captureException(error, { 
  //   extra: { ...errorInfo, ...context },
  //   tags: { errorId }
  // });

  return errorId;
};

/**
 * Initialize error reporting
 * This should be called once at application startup
 */
export const initErrorReporting = () => {
  // Set up global error handlers
  if (typeof window !== 'undefined') {
    // Handle uncaught errors
    window.onerror = (message, source, lineno, colno, error) => {
      reportError(error || new Error(message), { source, lineno, colno }, { type: 'uncaught' });
      return false; // Let the browser handle the error as well
    };

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      reportError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {},
        { type: 'unhandledrejection' }
      );
    });

    // Expose the reportError function globally for use in ErrorBoundary
    window.reportError = reportError;
  }
};

export default {
  logError,
  reportError,
  initErrorReporting,
};
