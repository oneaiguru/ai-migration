/**
 * OAuth Manager for handling authentication with Salesforce and QuickBooks
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');

class OAuthManager {
  constructor() {
    this.tokenFile = path.join(__dirname, '../../data/tokens.json');
    this.tokens = this.initializeTokenStorage();
  }

  /**
   * Initialize token storage file
   */
  initializeTokenStorage() {
    try {
      // Ensure the data directory exists
      const dataDir = path.dirname(this.tokenFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Create token file if it doesn't exist
      if (!fs.existsSync(this.tokenFile)) {
        const initialTokens = {
          salesforce: {},
          quickbooks: {}
        };
        fs.writeFileSync(this.tokenFile, JSON.stringify(initialTokens, null, 2));
        return initialTokens;
      }

      // Read existing tokens
      const tokensData = fs.readFileSync(this.tokenFile, 'utf8');
      return JSON.parse(tokensData);
    } catch (error) {
      logger.error('Error initializing token storage:', error);
      return { salesforce: {}, quickbooks: {} };
    }
  }

  /**
   * Save tokens to storage
   */
  saveTokens(tokens) {
    try {
      fs.writeFileSync(this.tokenFile, JSON.stringify(tokens, null, 2));
    } catch (error) {
      logger.error('Error saving tokens:', error);
    }
  }

  /**
   * Check if Salesforce token is valid and refresh if needed
   */
  async getSalesforceAccessToken(instanceUrl) {
    const tokens = this.initializeTokenStorage();
    
    if (!tokens.salesforce[instanceUrl]) {
      throw new Error(`No Salesforce tokens found for instance ${instanceUrl}`);
    }

    const sfTokens = tokens.salesforce[instanceUrl];
    
    // Check if token is expired
    if (Date.now() >= sfTokens.expiresAt) {
      // Token is expired, refresh it
      try {
        logger.info(`Refreshing Salesforce token for instance ${instanceUrl}`);
        
        const response = await axios({
          method: 'post',
          url: `${config.salesforce.loginUrl}/services/oauth2/token`,
          params: {
            grant_type: 'refresh_token',
            client_id: config.salesforce.clientId,
            client_secret: config.salesforce.clientSecret,
            refresh_token: sfTokens.refreshToken
          }
        });

        // Update tokens
        sfTokens.accessToken = response.data.access_token;
        sfTokens.expiresAt = Date.now() + (response.data.expires_in * 1000);
        
        // Save updated tokens
        tokens.salesforce[instanceUrl] = sfTokens;
        this.saveTokens(tokens);
        
        logger.info(`Salesforce token refreshed for instance ${instanceUrl}`);
      } catch (error) {
        logger.error(`Error refreshing Salesforce token for instance ${instanceUrl}:`, error);
        throw new Error(`Failed to refresh Salesforce token: ${error.message}`);
      }
    }

    return sfTokens.accessToken;
  }

  /**
   * Check if QuickBooks token is valid and refresh if needed
   */
  async getQuickBooksAccessToken(realmId) {
    const tokens = this.initializeTokenStorage();
    
    if (!tokens.quickbooks[realmId]) {
      throw new Error(`No QuickBooks tokens found for realm ${realmId}`);
    }

    const qbTokens = tokens.quickbooks[realmId];
    
    // Check if token is expired
    if (Date.now() >= qbTokens.expiresAt) {
      // Token is expired, refresh it
      try {
        logger.info(`Refreshing QuickBooks token for realm ${realmId}`);
        
        const tokenUrl = config.quickbooks.environment === 'sandbox' 
          ? 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
          : 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
        
        const response = await axios({
          method: 'post',
          url: tokenUrl,
          data: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: qbTokens.refreshToken
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${config.quickbooks.clientId}:${config.quickbooks.clientSecret}`).toString('base64')}`
          }
        });

        // Update tokens
        qbTokens.accessToken = response.data.access_token;
        qbTokens.refreshToken = response.data.refresh_token;
        qbTokens.expiresAt = Date.now() + (response.data.expires_in * 1000);
        
        // Save updated tokens
        tokens.quickbooks[realmId] = qbTokens;
        this.saveTokens(tokens);
        
        logger.info(`QuickBooks token refreshed for realm ${realmId}`);
      } catch (error) {
        logger.error(`Error refreshing QuickBooks token for realm ${realmId}:`, error);
        throw new Error(`Failed to refresh QuickBooks token: ${error.message}`);
      }
    }

    return qbTokens.accessToken;
  }

  /**
   * Get Salesforce authorization URL
   */
  getSalesforceAuthUrl() {
    const authUrl = `${config.salesforce.loginUrl}/services/oauth2/authorize`;
    return `${authUrl}?response_type=code&client_id=${config.salesforce.clientId}&redirect_uri=${encodeURIComponent(config.salesforce.redirectUri)}`;
  }

  /**
   * Get QuickBooks authorization URL
   */
  getQuickBooksAuthUrl() {
    const scopes = 'com.intuit.quickbooks.accounting';
    const authUrl = config.quickbooks.environment === 'sandbox'
      ? 'https://appcenter.intuit.com/connect/oauth2'
      : 'https://appcenter.intuit.com/connect/oauth2';
    
    return `${authUrl}?client_id=${config.quickbooks.clientId}&response_type=code&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(config.quickbooks.redirectUri)}&state=csrfToken`;
  }
}

// Create singleton
const oauthManager = new OAuthManager();

module.exports = oauthManager;
