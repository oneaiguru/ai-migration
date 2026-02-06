/**
 * Error handling middleware and utilities for the Express application
 * This module provides centralized error handling, custom error classes,
 * and middleware functions for API key authentication and 404 handling
 */
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * API Key Authentication Middleware
 * Validates the API key in the request headers
 */
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey) {
    return next(new AppError('API key required', 401, 'NO_API_KEY'));
  }
  
  if (apiKey !== config.security.apiKey) {
    return next(new AppError('Invalid API key', 401, 'INVALID_API_KEY'));
  }
  
  next();
};

/**
 * 404 Not Found Middleware
 * Handles requests to undefined routes
 */
const notFound = (req, res, next) => {
  const err = new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
  next(err);
};

/**
 * Global Error Handler Middleware
 * Processes all errors and sends appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  // Set default values
  let { statusCode = 500, message = 'Internal Server Error', errorCode } = err;
  
  // Log the error
  logger.error({
    message: err.message,
    status: statusCode,
    errorCode: errorCode,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorCode = 'VALIDATION_ERROR';
  }
  
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    errorCode = 'CAST_ERROR';
  }
  
  if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service temporarily unavailable';
    errorCode = 'CONNECTION_ERROR';
  }
  
  // Determine environment mode for error details
  const isDevelopment = config.server.env === 'development';
  
  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: message,
      code: errorCode || 'INTERNAL_ERROR',
      status: statusCode
    }
  };
  
  // Add stack trace in development mode
  if (isDevelopment && err.stack) {
    errorResponse.error.stack = err.stack;
  }
  
  // Add additional error details in development
  if (isDevelopment && err.isOperational === false) {
    errorResponse.error.details = {
      originalError: err.message,
      type: err.name
    };
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error({
    name: err.name,
    message: err.message,
    stack: err.stack
  });
  process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error({
    name: err.name,
    message: err.message,
    stack: err.stack
  });
  // Give time to log the error before shutting down
  setTimeout(() => {
    process.exit(1);
  }, 100);
});

module.exports = {
  AppError,
  apiKeyAuth,
  notFound,
  errorHandler,
  asyncHandler
};
