/**
 * Router for scheduler-related endpoints
 */
const express = require('express');
const router = express.Router();
const scheduler = require('../services/scheduler');
const { apiKeyAuth } = require('../middleware/error-handler');
const logger = require('../utils/logger');

// Protect all routes with API key authentication
router.use(apiKeyAuth);

/**
 * Trigger invoice creation job manually
 */
router.post('/invoice-creation', async (req, res, next) => {
  try {
    logger.info('Manual invoice creation job triggered');
    const result = await scheduler.runInvoiceCreationNow();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Trigger payment check job manually
 */
router.post('/payment-check', async (req, res, next) => {
  try {
    logger.info('Manual payment check job triggered');
    const result = await scheduler.runPaymentCheckNow();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get scheduler status
 */
router.get('/status', (req, res) => {
  const jobs = Object.keys(scheduler.jobs).map(key => ({
    name: key,
    active: Boolean(scheduler.jobs[key]),
    nextRun: scheduler.jobs[key] && scheduler.jobs[key].nextDate ? 
             scheduler.jobs[key].nextDate().toDate().toISOString() : null
  }));
  
  res.json({
    success: true,
    jobs
  });
});

module.exports = router;