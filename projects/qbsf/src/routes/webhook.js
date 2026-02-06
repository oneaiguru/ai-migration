/**
 * Webhook routes for external integrations
 */
const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/error-handler');
const logger = require('../utils/logger');

// Webhook for Salesforce opportunity updates
router.post('/salesforce/opportunity', apiKeyAuth, async (req, res, next) => {
  try {
    const { event, data } = req.body;
    
    if (!event || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: event or data'
      });
    }
    
    logger.info('Received Salesforce webhook:', { event });
    
    // Process the webhook data
    // This is a placeholder for actual webhook processing logic
    
    res.json({
      success: true,
      message: 'Webhook received and processed'
    });
  } catch (error) {
    logger.error('Error processing Salesforce webhook:', error);
    next(error);
  }
});

// Webhook for QuickBooks invoice updates
router.post('/quickbooks/invoice', apiKeyAuth, async (req, res, next) => {
  try {
    const { event, data } = req.body;
    
    if (!event || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: event or data'
      });
    }
    
    logger.info('Received QuickBooks webhook:', { event });
    
    // Process the webhook data
    // This is a placeholder for actual webhook processing logic
    
    res.json({
      success: true,
      message: 'Webhook received and processed'
    });
  } catch (error) {
    logger.error('Error processing QuickBooks webhook:', error);
    next(error);
  }
});

module.exports = router;