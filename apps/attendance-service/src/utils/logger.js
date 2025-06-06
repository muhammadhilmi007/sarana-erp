/**
 * Logger Utility
 * Provides logging functionality for the application
 */

const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define log directory
const logDir = process.env.LOG_DIR || 'logs';

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'attendance-service' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDir, 'attendance-service.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // File transport for error logs
    new winston.transports.File({
      filename: path.join(logDir, 'attendance-service-error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Export logger
module.exports = logger;
