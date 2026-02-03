const logger = require('../utils/logger');

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

  const authCodes = new Set(['AUTH_EXPIRED', 'NO_TOKENS']);
  // Determine status code
  const statusCode = err.statusCode || (authCodes.has(err.code) ? 401 : 500);
  
  // Format error response for client
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'An unexpected error occurred',
      code: err.code || 'INTERNAL_SERVER_ERROR'
    },
    errorCode: err.code || 'INTERNAL_SERVER_ERROR',
    errorMessage: err.message || 'An unexpected error occurred'
  };
  
  if (err.reauthorizeUrl) {
    errorResponse.error.reauthorizeUrl = err.reauthorizeUrl;
  }
  
  // In development, include stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Authentication errors
  if (statusCode === 401 && !err.code) {
    errorResponse.error.code = 'UNAUTHORIZED';
  }
  
  // Validation errors
  if (statusCode === 400 && !err.code) {
    errorResponse.error.code = 'BAD_REQUEST';
    if (err.validationErrors) {
      errorResponse.error.validationErrors = err.validationErrors;
    }
  }

  errorResponse.errorCode = errorResponse.error.code;

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

// OAuth error middleware
const oauthError = (req, res, next) => {
  const error = req.query.error;
  const errorDescription = req.query.error_description;
  
  if (error) {
    const err = new AppError(
      errorDescription || `OAuth error: ${error}`,
      401,
      'OAUTH_ERROR'
    );
    next(err);
  } else {
    next();
  }
};

// API Key authentication middleware
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    const err = new AppError('Invalid API key', 401, 'INVALID_API_KEY');
    return next(err);
  }
  
  next();
};

module.exports = {
  errorHandler,
  AppError,
  notFound,
  oauthError,
  apiKeyAuth
};
