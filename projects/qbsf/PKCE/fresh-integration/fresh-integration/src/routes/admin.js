/**
 * Admin routes for dashboard and monitoring
 */
const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/error-handler');
const logger = require('../utils/logger');
const oauthManager = require('../services/oauth-manager');

// Protect all routes with API key authentication
router.use(apiKeyAuth);

/**
 * Get recent activity
 */
router.get('/recent-activity', async (req, res, next) => {
  try {
    // In a production app, you'd store activity in a database
    // Here we're just returning mock data for the dashboard
    
    const activities = [
      {
        id: '1',
        type: 'invoice',
        title: 'Invoice Created',
        description: 'Invoice #145 created from opportunity Central Asia Air Cargo Summit',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'payment',
        title: 'Payment Received',
        description: 'Payment of $750 received for invoice #146',
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: '3',
        type: 'invoice',
        title: 'Invoice Created',
        description: 'Invoice #147 created from opportunity Central Asia Aviation Summit',
        timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
      }
    ];
    
    res.json({
      success: true,
      activities
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get system logs
 */
router.get('/logs', async (req, res, next) => {
  try {
    const filter = req.query.filter || 'all';
    const limit = parseInt(req.query.limit || 50, 10);
    
    // Get logs using the logger utility
    const logs = await logger.getRecentLogs({ 
      level: filter,
      limit 
    });
    
    res.json({
      success: true,
      logs: logs.map(log => ({
        level: log.level,
        message: log.message,
        timestamp: log.timestamp
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get system status
 */
router.get('/system-status', async (req, res, next) => {
  try {
    // Get token status
    const tokens = oauthManager.initializeTokenStorage();
    
    const salesforceInstances = Object.keys(tokens.salesforce || {});
    const quickbooksRealms = Object.keys(tokens.quickbooks || {});
    
    const systemStatus = {
      version: '0.1.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      connections: {
        salesforce: salesforceInstances.length > 0,
        quickbooks: quickbooksRealms.length > 0
      },
      nodeVersion: process.version,
      platform: process.platform
    };
    
    res.json({
      success: true,
      status: systemStatus
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;