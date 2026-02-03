# Create necessary directories
mkdir -p src/config
mkdir -p src/routes
mkdir -p src/services
mkdir -p src/middleware
mkdir -p src/utils
mkdir -p logs
mkdir -p data
mkdir -p internal_tools/monitoring  # For our monitoring dashboard

# Move and rename main server files
cp server-js.js src/server.js
cp app-js.js src/app.js

# Move configuration
cp config-js.js src/config/index.js

# Move service files
cp scheduler-js.js src/services/scheduler.js

# Move route files
cp scheduler-routes.js src/routes/scheduler.js

# Create error handler and logger
cat > src/middleware/error-handler.js << 'EOL'
/**
 * Error handling middleware
 */
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
  apiKeyAuth
};
EOL

cat > src/utils/logger.js << 'EOL'
/**
 * Logger utility for consistent logging across the application
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log') 
    })
  ]
});

module.exports = logger;
EOL

# Move the dashboard for internal monitoring only
mkdir -p internal_tools/monitoring
cp dashboard.html internal_tools/monitoring/ 2>/dev/null || echo "Dashboard file not found, skipping..."
# Add comment to dashboard about being for internal use only - MacOS compatible version
if [ -f "internal_tools/monitoring/dashboard.html" ]; then
  cat > internal_tools/monitoring/dashboard.html.new << 'EOL'
<!--
  INTERNAL MONITORING TOOL
  This dashboard is for development and monitoring purposes only.
  It is not part of the delivered solution and should not be deployed to production.
-->
EOL
  cat internal_tools/monitoring/dashboard.html >> internal_tools/monitoring/dashboard.html.new
  mv internal_tools/monitoring/dashboard.html.new internal_tools/monitoring/dashboard.html
fi

# Save demo script in documentation folder
mkdir -p docs
cp demo-script.md docs/
cp targeted-plan.md docs/
