/**
 * Circuit Breaker Middleware
 * Implements the circuit breaker pattern for fault tolerance
 */

const CircuitBreaker = require('opossum');
const { ApiError, ErrorCodes } = require('./errorHandler');
const { logger } = require('../utils/logger');

// Circuit breaker options
const DEFAULT_OPTIONS = {
  timeout: 5000, // If function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
  resetTimeout: 30000, // After 30 seconds, try again
  rollingCountTimeout: 10000, // Sets the duration of the statistical rolling window
  rollingCountBuckets: 10, // Sets the number of buckets the rolling window is divided into
};

// Store circuit breakers by service
const circuitBreakers = new Map();

/**
 * Creates a circuit breaker middleware for a specific service path
 * @param {string} path - The path prefix for the service
 * @param {Function} middleware - The proxy middleware to wrap with circuit breaker
 * @param {Object} options - Circuit breaker options
 * @returns {Function} Express middleware
 */
const circuitBreaker = (path, middleware, options = {}) => {
  const circuitOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Create a function that will be called by the circuit breaker
  const requestHandler = (req, res, next) => {
    return new Promise((resolve, reject) => {
      const originalEnd = res.end;
      
      // Override res.end to capture the response
      res.end = function (chunk, encoding) {
        // Restore original end
        res.end = originalEnd;
        
        // Check if response is successful (2xx status code)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else if (res.statusCode >= 500) {
          reject(new Error(`Service error: ${res.statusCode}`));
        } else {
          resolve(); // Don't trip the circuit for 4xx errors
        }
        
        // Call the original end method
        return originalEnd.call(this, chunk, encoding);
      };
      
      // Call the middleware
      middleware(req, res, next);
    });
  };
  
  // Create or get the circuit breaker for this path
  if (!circuitBreakers.has(path)) {
    const breaker = new CircuitBreaker(requestHandler, circuitOptions);
    
    // Log circuit state changes
    breaker.on('open', () => {
      logger.warn(`Circuit breaker for ${path} is now OPEN`);
    });
    
    breaker.on('halfOpen', () => {
      logger.info(`Circuit breaker for ${path} is now HALF-OPEN`);
    });
    
    breaker.on('close', () => {
      logger.info(`Circuit breaker for ${path} is now CLOSED`);
    });
    
    breaker.on('fallback', (result, error) => {
      logger.error(`Circuit breaker fallback for ${path}: ${error.message}`);
    });
    
    circuitBreakers.set(path, breaker);
  }
  
  const breaker = circuitBreakers.get(path);
  
  // Return the middleware function
  return (req, res, next) => {
    // Only apply circuit breaker to paths that match
    if (!req.path.startsWith(`/api/v1${path}`)) {
      return middleware(req, res, next);
    }
    
    // Check if circuit is open
    if (breaker.status.state === 'open') {
      return next(new ApiError(
        503, 
        `Service temporarily unavailable: ${path}`, 
        ErrorCodes.SERVICE_UNAVAILABLE,
        { service: path.substring(1) }
      ));
    }
    
    // Fire the request through the circuit breaker
    breaker.fire(req, res, next)
      .catch(error => {
        // This will only be called if the promise is rejected
        // and there's no fallback function
        logger.error(`Circuit breaker error for ${path}: ${error.message}`);
        next(new ApiError(
          503, 
          `Service error: ${path}`, 
          ErrorCodes.SERVICE_UNAVAILABLE,
          { service: path.substring(1) }
        ));
      });
  };
};

module.exports = {
  circuitBreaker,
};
