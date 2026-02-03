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

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'sf-qb-integration' },
  transports: [
    // Write to all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Add method to get recent logs for dashboard
logger.getRecentLogs = async (options = {}) => {
  const { level = 'info', limit = 50 } = options;
  
  // This is a simple implementation. In a production system,
  // you might want to use a database or better log querying.
  try {
    const filename = level === 'error' 
      ? path.join(logsDir, 'error.log')
      : path.join(logsDir, 'combined.log');
      
    if (!fs.existsSync(filename)) {
      return [];
    }
    
    const content = fs.readFileSync(filename, 'utf8');
    const logs = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { level: 'unknown', message: line, timestamp: new Date().toISOString() };
        }
      })
      .filter(log => level === 'all' || log.level === level)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
      
    return logs;
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
};

module.exports = logger;