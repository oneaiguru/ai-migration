const express = require('express');
const router = express.Router();
const jsforce = require('jsforce');
const QuickBooks = require('node-quickbooks');
const { apiKeyAuth } = require('../middleware/auth');
const { getDemoData } = require('../services/demo-data');

// Apply API key authentication to all routes
router.use(apiKeyAuth);

// Create invoice from Salesforce opportunity
router.post('/create-invoice', async (req, res, next) => {
  try {
    const { opportunityId, salesforceInstance, quickbooksRealm } = req.body;

    if (!opportunityId || !salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        error: 'Missing required parameters: opportunityId, salesforceInstance, quickbooksRealm'
      });
    }

    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      const demoData = getDemoData();
      return res.json({
        success: true,
        invoiceId: demoData.invoiceId,
        opportunityId,
        message: 'Invoice created successfully (demo mode)'
      });
    }

    // Real implementation would follow this pattern:
    // 1. Get Salesforce access token
    // 2. Fetch opportunity data from Salesforce
    // 3. Get QuickBooks access token
    // 4. Create customer in QuickBooks if not exists
    // 5. Create invoice in QuickBooks
    // 6. Update opportunity in Salesforce with invoice ID

    res.json({
      success: true,
      message: 'Invoice creation endpoint - implement with actual OAuth and API calls'
    });
  } catch (error) {
    next(error);
  }
});

// Check payment status
router.post('/check-payment-status', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm } = req.body;

    if (!salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        error: 'Missing required parameters: salesforceInstance, quickbooksRealm'
      });
    }

    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      return res.json({
        success: true,
        invoicesProcessed: 3,
        paidInvoicesFound: 2,
        opportunitiesUpdated: 2,
        message: 'Payment status check completed (demo mode)'
      });
    }

    // Real implementation would:
    // 1. Get all opportunities with QB Invoice IDs from Salesforce
    // 2. Check payment status of each invoice in QuickBooks
    // 3. Update opportunities in Salesforce that have been paid

    res.json({
      success: true,
      message: 'Payment status check endpoint - implement with actual OAuth and API calls'
    });
  } catch (error) {
    next(error);
  }
});

// Test connections
router.post('/test-connection', async (req, res, next) => {
  try {
    const { salesforceInstance, quickbooksRealm } = req.body;

    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      return res.json({
        success: true,
        salesforce: {
          connected: true,
          instance: salesforceInstance || 'demo-instance'
        },
        quickbooks: {
          connected: true,
          realm: quickbooksRealm || 'demo-realm'
        }
      });
    }

    // Real implementation would test actual connections

    res.json({
      success: true,
      message: 'Connection test endpoint - implement with actual OAuth and API calls'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;