cat > src/routes/api.js << 'EOL'
/**
 * Core API routes for business logic
 */
const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/error-handler');
const logger = require('../utils/logger');
const scheduler = require('../services/scheduler');

// Protect all routes with API key authentication
router.use(apiKeyAuth);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Process eligible opportunities
router.post('/process-eligible-opportunities', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm, stage, days, limit } = req.body;
    
    if (!salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: salesforceInstance or quickbooksRealm'
      });
    }
    
    // Implement process to find and process eligible opportunities
    // This is a placeholder for your actual business logic
    logger.info('Processing eligible opportunities', { salesforceInstance, quickbooksRealm });
    
    // For demo purposes, return success response
    res.json({
      success: true,
      processed: 5,
      successful: 4,
      failed: 1,
      message: 'Processed eligible opportunities'
    });
  } catch (error) {
    logger.error('Error processing eligible opportunities:', error);
    next(error);
  }
});

// Check payment status
router.post('/check-payment-status', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm } = req.body;
    
    if (!salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: salesforceInstance or quickbooksRealm'
      });
    }
    
    // Implement process to check payment status
    // This is a placeholder for your actual business logic
    logger.info('Checking payment status', { salesforceInstance, quickbooksRealm });
    
    // For demo purposes, return success response
    res.json({
      success: true,
      invoicesProcessed: 10,
      paidInvoicesFound: 3,
      invoicesUpdated: 3,
      message: 'Checked payment status'
    });
  } catch (error) {
    logger.error('Error checking payment status:', error);
    next(error);
  }
});

// Test connection to both systems
router.post('/test-connection', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm } = req.body;
    
    if (!salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: salesforceInstance or quickbooksRealm'
      });
    }
    
    // Implement connection test for both systems
    // This is a placeholder for your actual business logic
    logger.info('Testing connection', { salesforceInstance, quickbooksRealm });
    
    // For demo purposes, return success response
    res.json({
      success: true,
      salesforce: {
        connected: true,
        instance: salesforceInstance
      },
      quickbooks: {
        connected: true,
        realm: quickbooksRealm
      }
    });
  } catch (error) {
    logger.error('Error testing connection:', error);
    next(error);
  }
});

// Get logs
router.get('/logs', apiKeyAuth, async (req, res, next) => {
  try {
    const { filter, limit } = req.query;
    
    // This is a placeholder - in reality, you would retrieve logs from your logging system
    // For now, return dummy data
    res.json({
      success: true,
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Scheduler started successfully'
        },
        {
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: 'info',
          message: 'Processed 5 opportunities'
        }
      ]
    });
  } catch (error) {
    logger.error('Error getting logs:', error);
    next(error);
  }
});

module.exports = router;
EOL
