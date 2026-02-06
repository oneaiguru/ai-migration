/**
 * Router for scheduler-related endpoints
 * Provides minimal API access for testing and diagnostics only
 */
const express = require('express');
const router = express.Router();
const scheduler = require('../services/scheduler');
const { apiKeyAuth } = require('../middleware/error-handler');
const logger = require('../utils/logger');

// Protect all routes with API key authentication
router.use(apiKeyAuth);

/**
 * Get scheduler status - for diagnostics only
 */
router.get('/status', (req, res) => {
  const status = scheduler.getStatus();
  const jobs = Object.keys(status.jobs).map(key => ({
    name: key,
    active: status.jobs[key].active,
    nextRun: status.jobs[key].nextRun
  }));
  
  res.json({
    success: true,
    jobs
  });
});

/**
 * Trigger invoice creation job manually - for testing only
 */
router.post('/invoice-creation', async (req, res, next) => {
  try {
    logger.info('Manual invoice creation job triggered via API');
    const result = await scheduler.runInvoiceCreationNow();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Trigger payment check job manually - for testing only
 */
router.post('/payment-check', async (req, res, next) => {
  try {
    logger.info('Manual payment check job triggered via API');
    const result = await scheduler.runPaymentCheckNow();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
