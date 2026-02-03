/**
 * Admin routes for managing the integration
 * Provides administrative endpoints for configuration and monitoring
 */
const express = require('express');
const router = express.Router();
const { apiKeyAuth, AppError, asyncHandler } = require('../middleware/error-handler');
const logger = require('../utils/logger');
const oauthManager = require('../services/oauth-manager');
const config = require('../config');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');

// Protect all routes with API key authentication
router.use(apiKeyAuth);

/**
 * Get system information
 * GET /admin/system-info
 */
router.get('/system-info', (req, res) => {
  const systemInfo = {
    version: '1.0.0',
    environment: config.server.env,
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
      processUsed: process.memoryUsage()
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0].model,
      loadAverage: os.loadavg()
    }
  };
  
  res.json({
    success: true,
    systemInfo
  });
});

/**
 * Get configuration (sanitized)
 * GET /admin/config
 */
router.get('/config', (req, res) => {
  // Return configuration with sensitive values masked
  const sanitizedConfig = {
    server: {
      port: config.server.port,
      env: config.server.env,
      baseUrl: config.server.baseUrl
    },
    salesforce: {
      clientId: config.salesforce.clientId ? '***' + config.salesforce.clientId.slice(-4) : null,
      redirectUri: config.salesforce.redirectUri,
      loginUrl: config.salesforce.loginUrl
    },
    quickbooks: {
      clientId: config.quickbooks.clientId ? '***' + config.quickbooks.clientId.slice(-4) : null,
      redirectUri: config.quickbooks.redirectUri,
      environment: config.quickbooks.environment
    },
    scheduler: config.scheduler,
    logging: config.logging
  };
  
  res.json({
    success: true,
    config: sanitizedConfig
  });
});

/**
 * Get token storage information
 * GET /admin/tokens
 */
router.get('/tokens', asyncHandler(async (req, res) => {
  try {
    const tokens = await oauthManager.initializeTokenStorage();
    const now = Date.now();
    
    // Get token info without exposing actual tokens
    const tokenInfo = {
      salesforce: {},
      quickbooks: {}
    };
    
    // Salesforce tokens
    Object.keys(tokens.salesforce || {}).forEach(instance => {
      const token = tokens.salesforce[instance];
      tokenInfo.salesforce[instance] = {
        exists: true,
        expiresAt: token.expiresAt,
        expired: now >= token.expiresAt,
        hasRefreshToken: !!token.refreshToken
      };
    });
    
    // QuickBooks tokens
    Object.keys(tokens.quickbooks || {}).forEach(realm => {
      const token = tokens.quickbooks[realm];
      tokenInfo.quickbooks[realm] = {
        exists: true,
        expiresAt: token.expiresAt,
        expired: now >= token.expiresAt,
        hasRefreshToken: !!token.refreshToken
      };
    });
    
    res.json({
      success: true,
      tokens: tokenInfo,
      counts: {
        salesforce: Object.keys(tokenInfo.salesforce).length,
        quickbooks: Object.keys(tokenInfo.quickbooks).length
      }
    });
  } catch (error) {
    logger.error('Error getting token info:', error);
    throw new AppError('Failed to get token information', 500, 'TOKEN_INFO_ERROR');
  }
}));

/**
 * Clear all tokens (dangerous operation)
 * DELETE /admin/tokens
 */
router.delete('/tokens', asyncHandler(async (req, res) => {
  const { confirm } = req.body;
  
  if (confirm !== 'DELETE_ALL_TOKENS') {
    throw new AppError('Confirmation required. Set confirm to "DELETE_ALL_TOKENS"', 400, 'CONFIRMATION_REQUIRED');
  }
  
  logger.warn('Clearing all tokens as requested by admin');
  
  try {
    // Clear token file
    const tokenFile = path.join(__dirname, '../../data/tokens.json');
    await fs.writeFile(tokenFile, JSON.stringify({ salesforce: {}, quickbooks: {} }, null, 2));
    
    logger.info('All tokens cleared successfully');
    
    res.json({
      success: true,
      message: 'All tokens cleared successfully'
    });
  } catch (error) {
    logger.error('Error clearing tokens:', error);
    throw new AppError('Failed to clear tokens', 500, 'CLEAR_TOKENS_ERROR');
  }
}));

/**
 * Get recent errors from logs
 * GET /admin/errors
 */
router.get('/errors', asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  const maxLimit = Math.min(parseInt(limit), 200);
  
  try {
    const errorLogPath = path.join(__dirname, '../../logs/error.log');
    
    // Check if error log exists
    try {
      await fs.access(errorLogPath);
    } catch (error) {
      return res.json({
        success: true,
        errors: [],
        message: 'No error log file found'
      });
    }
    
    // Read error log file
    const errorLogContent = await fs.readFile(errorLogPath, 'utf8');
    const lines = errorLogContent.split('\n').filter(line => line.trim());
    
    // Parse the last N lines as JSON
    const errors = [];
    for (let i = Math.max(lines.length - maxLimit, 0); i < lines.length; i++) {
      try {
        const error = JSON.parse(lines[i]);
        errors.push({
          timestamp: error.timestamp,
          level: error.level,
          message: error.message,
          stack: error.stack
        });
      } catch (parseError) {
        // Skip lines that aren't valid JSON
      }
    }
    
    res.json({
      success: true,
      errors: errors.reverse(), // Most recent first
      count: errors.length,
      totalLines: lines.length
    });
  } catch (error) {
    logger.error('Error reading error logs:', error);
    throw new AppError('Failed to read error logs', 500, 'ERROR_LOG_READ_ERROR');
  }
}));

/**
 * Test webhook endpoints
 * POST /admin/test-webhook
 */
router.post('/test-webhook', asyncHandler(async (req, res) => {
  const { type, data } = req.body;
  
  if (!type || !data) {
    throw new AppError('Type and data are required', 400, 'MISSING_PARAMS');
  }
  
  if (!['salesforce', 'quickbooks'].includes(type)) {
    throw new AppError('Type must be either "salesforce" or "quickbooks"', 400, 'INVALID_TYPE');
  }
  
  logger.info(`Testing ${type} webhook with data:`, data);
  
  // Simulate webhook call
  const webhookUrl = `${config.server.baseUrl}/webhook/${type}/${type === 'salesforce' ? 'opportunity' : 'payment'}`;
  
  try {
    const axios = require('axios');
    const response = await axios.post(webhookUrl, data, {
      headers: {
        'X-API-Key': config.security.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    res.json({
      success: true,
      message: `Successfully tested ${type} webhook`,
      webhookUrl,
      response: response.data
    });
  } catch (error) {
    logger.error(`Error testing ${type} webhook:`, error);
    throw new AppError(`Failed to test ${type} webhook: ${error.message}`, 500, 'WEBHOOK_TEST_ERROR');
  }
}));

/**
 * Get application stats
 * GET /admin/stats
 */
router.get('/stats', asyncHandler(async (req, res) => {
  try {
    const tokens = await oauthManager.initializeTokenStorage();
    
    // Calculate basic stats
    const stats = {
      connections: {
        salesforce: Object.keys(tokens.salesforce || {}).length,
        quickbooks: Object.keys(tokens.quickbooks || {}).length
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    
    // Add logs stats if available
    try {
      const logsDir = path.join(__dirname, '../../logs');
      const logFiles = await fs.readdir(logsDir);
      
      stats.logs = {};
      for (const file of logFiles) {
        if (file.endsWith('.log')) {
          const filePath = path.join(logsDir, file);
          const stat = await fs.stat(filePath);
          stats.logs[file] = {
            size: stat.size,
            modified: stat.mtime
          };
        }
      }
    } catch (error) {
      logger.debug('Could not read log files:', error);
    }
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Error getting stats:', error);
    throw new AppError('Failed to get application stats', 500, 'STATS_ERROR');
  }
}));

module.exports = router;
