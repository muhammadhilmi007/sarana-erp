/**
 * Logger Utility
 * Provides structured logging for the Role & Authorization Service
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'role-service' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDir, 'role-service.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    // File transport for error logs
    new winston.transports.File({
      filename: path.join(logDir, 'role-service-error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Request logger middleware
 * @returns {Function} - Express middleware function
 */
const requestLogger = () => {
  return (req, res, next) => {
    // Start timer
    const start = Date.now();
    
    // Log request
    logger.info(`${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: req.user?._id,
    });
    
    // Log response
    res.on('finish', () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 400 ? 'warn' : 'info';
      
      logger[level](`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`, {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userId: req.user?._id,
      });
    });
    
    next();
  };
};

module.exports = {
  logger,
  requestLogger,
};
