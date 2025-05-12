/**
 * Logger Utility
 * Provides structured logging for the Auth Service
 */

const winston = require('winston');
const path = require('path');
const config = require('../config');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Add colors to winston
winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : config.logging.level || 'info';
};

// Custom format for logs
const format = winston.format.combine(winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss:ms'
}), winston.format.printf(info => {
  const {
    timestamp,
    level,
    message,
    ...meta
  } = info;
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `${timestamp} [${level}]: ${message} ${metaString}`;
}));

// Define transports
const transports = [
// Console transport
new winston.transports.Console({
  format: winston.format.combine(winston.format.colorize({
    all: true
  }), format)
}),
// File transport for errors
new winston.transports.File({
  filename: path.join(process.cwd(), 'logs', 'error.log'),
  level: 'error'
}),
// File transport for all logs
new winston.transports.File({
  filename: path.join(process.cwd(), 'logs', config.logging.file || 'auth-service.log')
})];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false
});

/**
 * Create a request logger middleware
 * @returns {Function} Express middleware
 */
const requestLogger = () => {
  return (req, res, next) => {
    // Generate request ID if not present
    const requestId = req.headers['x-request-id'] || require('crypto').randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    // Log request
    logger.http(`${req.method} ${req.originalUrl}`, {
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Log response
    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 400 ? 'warn' : 'http';
      logger[level](`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration
      });
    });
    next();
  };
};
module.exports = {
  logger,
  requestLogger
};