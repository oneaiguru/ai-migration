/**
 * Error handling middleware
 */
const logger = require('../utils/logger');
const config = require('../config');

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * API Key authentication middleware
 */
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== config.security.apiKey) {
    const error = new Error('Unauthorized - Invalid API key');
    error.status = 401;
    logger.warn('Unauthorized API request', { 
      path: req.path, 
      ip: req.ip,
      headers: req.headers
    });
    return next(error);
  }
  
  next();
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  
  // Log the error
  if (statusCode === 500) {
    logger.error('Server error', { 
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
  } else {
    logger.warn('Request error', { 
      error: err.message,
      status: statusCode,
      path: req.path,
      method: req.method 
    });
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler,
  apiKeyAuth
};