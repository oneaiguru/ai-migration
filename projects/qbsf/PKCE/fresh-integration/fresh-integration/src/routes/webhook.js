/**
 * Webhook routes to handle incoming events
 */
const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/error-handler');
const logger = require('../utils/logger');

// Protect all routes with API key authentication
router.use(apiKeyAuth);

/**
 * Salesforce Opportunity webhook
 * This can be called by Salesforce Outbound Message or via a custom Apex callout
 */
router.post('/salesforce/opportunity', async (req, res, next) => {
  try {
    const { opportunityId, action, stage } = req.body;
    
    if (!opportunityId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: opportunityId'
      });
    }
    
    logger.info('Salesforce opportunity webhook received', { opportunityId, action, stage });
    
    // In a real implementation, you would call your integration workflow
    // For now, we just return a success response
    
    res.json({
      success: true,
      message: 'Webhook received successfully',
      opportunityId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * QuickBooks webhook
 * This endpoint can receive webhooks from QuickBooks
 */
router.post('/quickbooks', async (req, res, next) => {
  try {
    // QuickBooks sends a notification when something changes
    const { eventNotifications } = req.body;
    
    if (!eventNotifications || !Array.isArray(eventNotifications)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook payload'
      });
    }
    
    logger.info('QuickBooks webhook received', { events: eventNotifications.length });
    
    // Process each notification
    // In a real implementation, you would take appropriate action based on the notification
    
    res.json({
      success: true,
      message: 'Webhook received successfully',
      eventsProcessed: eventNotifications.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;