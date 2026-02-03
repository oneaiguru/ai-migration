/**
 * Administrative routes for monitoring and control
 */
const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/error-handler');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Protect all admin routes with API key authentication
router.use(apiKeyAuth);

// Get status of integration
router.get('/status', async (req, res, next) => {
  try {
    // Return status information about the integration
    res.json({
      success: true,
      status: {
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        },
        scheduler: {
          running: true,  // Placeholder
          nextRun: new Date(Date.now() + 3600000).toISOString()  // Placeholder
        }
      }
    });
  } catch (error) {
    logger.error('Error getting admin status:', error);
    next(error);
  }
});

// Get logs
router.get('/logs', async (req, res, next) => {
  try {
    const { level, limit } = req.query;
    const logLimit = parseInt(limit) || 100;
    
    // Read from the log file
    const logPath = path.join(__dirname, '../../logs/combined.log');
    
    if (!fs.existsSync(logPath)) {
      return res.json({
        success: true,
        logs: []
      });
    }
    
    // Read the last N lines of the log file
    // This is a simple implementation - you might want to use a more robust solution
    // for a production environment
    const logs = fs.readFileSync(logPath, 'utf8')
      .split('\n')
      .filter(line => line.trim() !== '')
      .slice(-logLimit)
      .map(line => {
        try {
          // Try to parse JSON logs
          const parts = line.split(' [');
          if (parts.length >= 2) {
            const timestamp = parts[0];
            const levelEnd = parts[1].indexOf(']');
            const logLevel = parts[1].substring(0, levelEnd);
            const message = parts[1].substring(levelEnd + 2);
            
            // Filter by level if specified
            if (level && logLevel.toLowerCase() !== level.toLowerCase()) {
              return null;
            }
            
            return {
              timestamp,
              level: logLevel,
              message
            };
          }
          return { raw: line };
        } catch (e) {
          return { raw: line };
        }
      })
      .filter(Boolean);
    
    res.json({
      success: true,
      logs
    });
  } catch (error) {
    logger.error('Error retrieving logs:', error);
    next(error);
  }
});

// Clear logs
router.post('/logs/clear', async (req, res, next) => {
  try {
    const logPath = path.join(__dirname, '../../logs/combined.log');
    const errorLogPath = path.join(__dirname, '../../logs/error.log');
    
    // Clear the log files
    if (fs.existsSync(logPath)) {
      fs.writeFileSync(logPath, '');
    }
    
    if (fs.existsSync(errorLogPath)) {
      fs.writeFileSync(errorLogPath, '');
    }
    
    logger.info('Logs cleared by admin');
    
    res.json({
      success: true,
      message: 'Logs cleared successfully'
    });
  } catch (error) {
    logger.error('Error clearing logs:', error);
    next(error);
  }
});

module.exports = router;