/**
 * Error handling middleware
 */
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Application error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Format error response for client
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'An unexpected error occurred',
      code: err.code || 'INTERNAL_SERVER_ERROR'
    }
  };
  
  // In development, include stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  return res.status(statusCode).json(errorResponse);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code, validationErrors = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.validationErrors = validationErrors;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 Not Found middleware
const notFound = (req, res, next) => {
  const err = new AppError(`Route not found: ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(err);
};

// API Key authentication middleware
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // For testing purposes - accept the test key
  const configuredApiKey = config.security.apiKey || 'test_api_key_123';
  
  if (!apiKey || apiKey !== configuredApiKey) {
    logger.warn('API Key authentication failed', {
      providedKey: apiKey ? `${apiKey.substring(0, 3)}...` : 'none',
      configuredKey: configuredApiKey ? `${configuredApiKey.substring(0, 3)}...` : 'none',
      path: req.path
    });
    
    const err = new AppError('Invalid API key', 401, 'INVALID_API_KEY');
    return next(err);
  }
  
  next();
};

module.exports = {
  errorHandler,
  AppError,
  notFound,
  apiKeyAuth
};