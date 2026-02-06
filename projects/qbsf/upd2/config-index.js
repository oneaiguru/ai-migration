/**
 * Configuration settings for the Salesforce-QuickBooks integration
 */
require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.MIDDLEWARE_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  },
  salesforce: {
    clientId: process.env.SF_CLIENT_ID,
    clientSecret: process.env.SF_CLIENT_SECRET,
    redirectUri: process.env.SF_REDIRECT_URI,
    loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
  },
  quickbooks: {
    clientId: process.env.QB_CLIENT_ID,
    clientSecret: process.env.QB_CLIENT_SECRET,
    redirectUri: process.env.QB_REDIRECT_URI,
    environment: process.env.QB_ENVIRONMENT || 'sandbox',
  },
  security: {
    apiKey: process.env.API_KEY,
    tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY,
  },
  scheduler: {
    invoiceCreationCron: process.env.INVOICE_CREATION_CRON || '0 */2 * * *', // Default: Every 2 hours
    paymentCheckCron: process.env.PAYMENT_CHECK_CRON || '0 1 * * *', // Default: 1:00 AM daily
  }
};