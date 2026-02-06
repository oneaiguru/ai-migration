/**
 * Test script for QuickBooks API connection
 */
const QuickBooks = require('node-quickbooks');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load OAuth manager to handle tokens
const oauthManager = require('./src/services/oauth-manager');
const config = require('./src/config');

// QuickBooks config
const QB_REALM = '9341454378379755';

// Use OAuth manager to get the token
(async () => {
  try {
    // Get access token using the OAuth manager
    console.log('Getting access token from OAuth manager...');
    const accessToken = await oauthManager.getQuickBooksAccessToken(QB_REALM);
    console.log('Access token retrieved successfully');
    
    // Initialize QuickBooks client
    const qbo = new QuickBooks(
      config.quickbooks.clientId,
      config.quickbooks.clientSecret,
      accessToken,
      false,
      QB_REALM,
      config.quickbooks.environment === 'sandbox',
      false,
      null,
      '2.0'
    );

    // Test connection
    console.log('Testing QuickBooks API connection...');
    qbo.createInvoice({
      Line: [{
        DetailType: "SalesItemLineDetail",
        Amount: 100,
        Description: "Test Invoice",
        SalesItemLineDetail: {
          ItemRef: {
            value: "1",
            name: "Services"
          }
        }
      }],
      CustomerRef: {
        value: "1" // Using default customer
      },
      DocNumber: `TEST-${Date.now()}`
    }, (err, invoice) => {
      if (err) {
        console.error('Error creating test invoice:', err);
        process.exit(1);
      }
      
      console.log('✅ Successfully created test invoice:', invoice.Id);
      console.log('QuickBooks API connection is working!');
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();