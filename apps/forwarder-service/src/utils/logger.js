/**
 * Logger Utility
 * Provides centralized logging functionality for the forwarder service
 */

const winston = require('winston');
const { format, createLogger, transports } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

// Define log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  defaultMeta: { service: 'forwarder-service' },
  transports: [
    // Write logs to console
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    }),
    // Write to all logs with level 'info' and below to combined.log
    new transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'error' and below to error.log
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Do not exit on handled exceptions
  exitOnError: false,
});

// Create a stream object for Morgan
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = {
  logger,
  stream,
};
