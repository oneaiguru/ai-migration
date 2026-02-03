const axios = require('axios');
const logger = require('../utils/logger');
const oauthManager = require('./oauth-manager');
const config = require('../config');

/**
 * Base Salesforce API client
 */
class SalesforceAPI {
  /**
   * Constructor
   * @param {String} instanceUrl - Salesforce instance URL
   * @param {Object} oauthConfig - OAuth configuration (optional, defaults to config)
   */
  constructor(instanceUrl, oauthConfig = config.salesforce) {
    this.instanceUrl = instanceUrl;
    this.oauthConfig = oauthConfig;
    this.apiVersion = 'v56.0'; // Update as needed
  }

  /**
   * Gets a valid access token
   * @returns {Promise<String>} - Access token
   */
  async getAccessToken() {
    return await oauthManager.getValidAccessToken('salesforce', this.instanceUrl, this.oauthConfig);
  }

  /**
   * Makes an API request to Salesforce
   * @param {String} method - HTTP method
   * @param {String} endpoint - API endpoint
   * @param {Object} data - Request data (for POST/PUT/PATCH requests)
   * @returns {Promise<Object>} - API response
   */
  async request(method, endpoint, data = null) {
    const startTime = Date.now();
    const requestId = `sf-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    try {
      const accessToken = await this.getAccessToken();
      const requestUrl = `${this.instanceUrl}/services/data/${this.apiVersion}/${endpoint}`;
      
      const options = {
        method,
        url: requestUrl,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Sforce-Call-Options': `client=SalesforceQBIntegration`,
          'X-Request-Id': requestId
        }
      };
      
      if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
        options.data = data;
      }
      
      logger.debug(`Salesforce API Request: ${method} ${endpoint}`, {
        requestId,
        method,
        endpoint,
        instanceUrl: this.instanceUrl,
        apiVersion: this.apiVersion,
        dataSize: data ? JSON.stringify(data).length : 0
      });
      
      const response = await axios(options);
      
      const duration = Date.now() - startTime;
      logger.debug(`Salesforce API Response: ${method} ${endpoint}`, {
        requestId,
        status: response.status,
        duration: `${duration}ms`,
        dataSize: Array.isArray(response.data) ? response.data.length : JSON.stringify(response.data).length
      });
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const statusCode = error.response?.status;
      const responseData = error.response?.data;
      const isAuthError = statusCode === 401;
      const isValidationError = statusCode === 400;
      const isPermissionError = statusCode === 403;
      const isNotFoundError = statusCode === 404;
      const isServerError = statusCode >= 500;
      const isNetworkError = !statusCode;
      
      // Extract more detailed error information for Salesforce
      let sfErrorFields = [];
      let sfErrorCode = '';
      let sfErrorMessage = '';
      
      if (Array.isArray(responseData)) {
        sfErrorMessage = responseData[0]?.message || '';
        sfErrorCode = responseData[0]?.errorCode || '';
        sfErrorFields = responseData[0]?.fields || [];
      } else {
        sfErrorMessage = responseData?.message || '';
        sfErrorCode = responseData?.errorCode || '';
        sfErrorFields = responseData?.fields || [];
      }
      
      // Create a safe version of responseData for logging
      let safeResponseData;
      try {
        safeResponseData = responseData ? JSON.stringify(responseData).substring(0, 1000) : null; // Truncate large responses
      } catch (jsonError) {
        safeResponseData = '[Error converting response data to JSON]';
      }
      
      logger.error('Salesforce API Error:', {
        requestId,
        method,
        endpoint,
        error: error.message,
        stack: error.stack,
        errorType: error.name,
        statusCode,
        duration: `${duration}ms`,
        sfErrorCode,
        sfErrorMessage,
        sfErrorFields,
        isAuthError,
        isValidationError,
        isPermissionError,
        isNotFoundError,
        isServerError,
        isNetworkError,
        instanceUrl: this.instanceUrl,
        requestURL: `${this.instanceUrl}/services/data/${this.apiVersion}/${endpoint}`,
        apiVersion: this.apiVersion,
        responseData: safeResponseData
      });
      
      // Handle authentication errors with retry
      if (isAuthError) {
        logger.info(`Salesforce token expired for instance ${this.instanceUrl}, attempting refresh`);
        try {
          // Token might be expired, force refresh on next request
          await oauthManager.refreshSalesforceToken(this.instanceUrl, this.oauthConfig);
          logger.info(`Successfully refreshed Salesforce token for instance ${this.instanceUrl}`);
          
          // Retry the original request once with the new token
          logger.debug(`Retrying Salesforce API request after token refresh: ${method} ${endpoint}`);
          return this.request(method, endpoint, data);
        } catch (refreshError) {
          logger.error(`Failed to refresh Salesforce token for instance ${this.instanceUrl}:`, {
            requestId,
            error: refreshError.message,
            stack: refreshError.stack,
            instanceUrl: this.instanceUrl
          });
          throw new Error(`Authentication failed and token refresh failed for Salesforce instance ${this.instanceUrl}: ${refreshError.message}`);
        }
      }
      
      // Create contextual error messages based on error type
      if (isValidationError) {
        const fieldInfo = sfErrorFields.length > 0 ? ` (Fields: ${sfErrorFields.join(', ')})` : '';
        const codeInfo = sfErrorCode ? ` [${sfErrorCode}]` : '';
        throw new Error(`Salesforce API validation error${codeInfo}${fieldInfo}: ${sfErrorMessage || error.message}`);
      } else if (isPermissionError) {
        throw new Error(`Insufficient permissions for Salesforce resource: ${endpoint}. The connected user lacks the required permissions for this operation.`);
      } else if (isNotFoundError) {
        throw new Error(`Salesforce resource not found: ${endpoint}. Verify the resource ID exists and API version (${this.apiVersion}) is correct.`);
      } else if (isServerError) {
        throw new Error(`Salesforce server error (${statusCode}): This is likely a temporary issue with the Salesforce service. Try again later.`);
      } else if (isNetworkError) {
        throw new Error(`Network error connecting to Salesforce API: ${error.message}. Check your internet connection and verify the instance URL: ${this.instanceUrl}`);
      } else {
        throw new Error(`Salesforce API error (${statusCode || 'unknown'})${sfErrorCode ? ` [${sfErrorCode}]` : ''}: ${sfErrorMessage || error.message}`);
      }
    }
  }

  /**
   * Gets a record by ID
   * @param {String} sobject - SObject type (e.g., 'Opportunity', 'Account')
   * @param {String} id - Record ID
   * @param {Array<String>} fields - Fields to retrieve (optional)
   * @returns {Promise<Object>} - Record data
   */
  async getRecord(sobject, id, fields = []) {
    let endpoint = `sobjects/${sobject}/${id}`;
    
    if (fields.length > 0) {
      endpoint += `?fields=${fields.join(',')}`;
    }
    
    return this.request('get', endpoint);
  }

  /**
   * Queries Salesforce records
   * @param {String} soql - SOQL query
   * @returns {Promise<Object>} - Query results
   */
  async query(soql) {
    const endpoint = `query/?q=${encodeURIComponent(soql)}`;
    return this.request('get', endpoint);
  }

  /**
   * Updates a record
   * @param {String} sobject - SObject type (e.g., 'Opportunity', 'Account')
   * @param {String} id - Record ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Update result
   */
  async updateRecord(sobject, id, data) {
    return this.request('patch', `sobjects/${sobject}/${id}`, data);
  }

  /**
   * Creates a record
   * @param {String} sobject - SObject type (e.g., 'Opportunity', 'Account')
   * @param {Object} data - Record data
   * @returns {Promise<Object>} - Create result with ID
   */
  async createRecord(sobject, data) {
    return this.request('post', `sobjects/${sobject}`, data);
  }

  /**
   * Gets an Opportunity by ID with related data
   * @param {String} opportunityId - Opportunity ID
   * @returns {Promise<Object>} - Opportunity with related data
   */
  async getOpportunityWithRelatedData(opportunityId) {
    try {
      // Get Opportunity data without an explicit field list so missing custom fields (e.g., Email_for_invoice__c)
      // don't break environments that haven't provisioned them yet.
      const opportunity = await this.getRecord('Opportunity', opportunityId);
      
      // Get Account data
      const account = await this.getRecord('Account', opportunity.AccountId);
      
      // Get OpportunityLineItems (Products)
      const lineItemsQuery = `
        SELECT Id, Product2Id, Quantity, UnitPrice, TotalPrice,
               Product2.Id, Product2.Name, Product2.Description, Product2.QB_Item_ID__c,
               CurrencyIsoCode
        FROM OpportunityLineItem
        WHERE OpportunityId = '${opportunityId}'
      `;
      
      const lineItemsResult = await this.query(lineItemsQuery);
      
      let billingEmail = null;
      let emailSource = null;
      let contactEmail = null; // backward compatibility: keep the selected Contact email when relevant

      if (typeof opportunity.Email_for_invoice__c === 'string' && opportunity.Email_for_invoice__c.trim()) {
        billingEmail = opportunity.Email_for_invoice__c.trim();
        emailSource = 'OPPORTUNITY_FIELD';
      }

      if (!billingEmail) {
        try {
          const ocrQuery = `
            SELECT Contact.Email
            FROM OpportunityContactRole
            WHERE OpportunityId = '${opportunityId}'
            AND IsPrimary = true
            AND Contact.Email != null
            LIMIT 1
          `;
          const ocrResult = await this.query(ocrQuery);
          const ocrEmail = ocrResult.records?.[0]?.Contact?.Email;
          if (typeof ocrEmail === 'string' && ocrEmail.trim()) {
            billingEmail = ocrEmail.trim();
            contactEmail = billingEmail;
            emailSource = 'PRIMARY_CONTACT_ROLE';
            logger.info(`Found primary OCR email for billing: ${billingEmail}`);
          }
        } catch (ocrError) {
          logger.warn(`Could not query OpportunityContactRole: ${ocrError.message}`);
        }
      }

      if (!billingEmail && typeof account.Email__c === 'string' && account.Email__c.trim()) {
        billingEmail = account.Email__c.trim();
        emailSource = 'ACCOUNT_FIELD';
      }

      if (!billingEmail) {
        try {
          const contactQuery = `
            SELECT Id, Email FROM Contact
            WHERE AccountId = '${opportunity.AccountId}'
            AND Email != null
            ORDER BY LastModifiedDate DESC
            LIMIT 1
          `;
          const contactResult = await this.query(contactQuery);
          const fallbackEmail = contactResult.records?.[0]?.Email;
          if (typeof fallbackEmail === 'string' && fallbackEmail.trim()) {
            billingEmail = fallbackEmail.trim();
            contactEmail = billingEmail;
            emailSource = 'CONTACT_FALLBACK';
            logger.info(`Found contact email for billing: ${billingEmail}`);
          }
        } catch (contactError) {
          logger.warn(`Could not get contact email: ${contactError.message}`);
        }
      }

      if (!billingEmail) {
        emailSource = 'NONE';
      }

      return {
        opportunity,
        account,
        products: lineItemsResult.records,
        contactEmail,
        billingEmail,
        emailSource
      };
    } catch (error) {
      logger.error(`Error getting Opportunity data for ${opportunityId}:`, {
        error: error.message,
        stack: error.stack,
        opportunityId,
        statusCode: error.response?.status,
        responseData: error.response?.data,
        instanceUrl: this.instanceUrl,
        operation: 'getOpportunityWithRelatedData'
      });
      
      // Enhance error with context
      if (error.message.includes('Account') || error.message.includes('AccountId')) {
        throw new Error(`Failed to retrieve Account related to Opportunity ${opportunityId}: ${error.message}`);
      } else if (error.message.includes('OpportunityLineItem')) {
        throw new Error(`Failed to retrieve Products related to Opportunity ${opportunityId}: ${error.message}`);
      } else if (error.response?.status === 404) {
        throw new Error(`Opportunity ${opportunityId} not found in Salesforce`);
      } else {
        throw new Error(`Failed to retrieve Opportunity data for ${opportunityId}: ${error.message}`);
      }
    }
  }

  /**
   * Updates Salesforce Opportunity with QuickBooks Invoice ID and optional Payment Link
   * @param {String} opportunityId - Salesforce Opportunity ID
   * @param {String} qbInvoiceId - QuickBooks Invoice ID
   * @param {String} paymentLink - QuickBooks Payment Link (optional)
   * @returns {Promise<Object>} - Update result
   */
  async updateOpportunityWithQBInvoiceId(opportunityId, qbInvoiceId, paymentLink = null) {
    const updateData = {
      QB_Invoice_ID__c: qbInvoiceId
    };

    // Only include payment link if provided
    if (paymentLink) {
      updateData.QB_Payment_Link__c = paymentLink;
      logger.info(`Updating Opportunity ${opportunityId} with QuickBooks Invoice ID ${qbInvoiceId} and Payment Link`);
    } else {
      logger.info(`Updating Opportunity ${opportunityId} with QuickBooks Invoice ID ${qbInvoiceId}`);
    }

    return this.updateRecord('Opportunity', opportunityId, updateData);
  }

  /**
   * Updates Salesforce Opportunity with payment information
   * @param {String} opportunityId - Salesforce Opportunity ID
   * @param {Object} paymentDetails - Payment details from QuickBooks
   * @returns {Promise<Object>} - Update result
   */
  async updateOpportunityWithPaymentInfo(opportunityId, paymentDetails) {
    logger.info(`Updating Opportunity ${opportunityId} with payment information`);
    
    return this.updateRecord('Opportunity', opportunityId, {
      StageName: 'Closed Won',
      QB_Payment_Date__c: paymentDetails.paymentDate,
      QB_Payment_Reference__c: paymentDetails.paymentRefNum,
      QB_Payment_Method__c: paymentDetails.paymentMethod,
      QB_Payment_Amount__c: paymentDetails.amount
    });
  }

  /**
   * Gets unpaid invoices from Salesforce for checking payment status
   * @returns {Promise<Array<Object>>} - Array of unpaid invoice records
   */
  async getUnpaidInvoices() {
    try {
      // Query Opportunities with QuickBooks Invoice IDs that aren't closed won
      const query = `
        SELECT Id, Name, QB_Invoice_ID__c
        FROM Opportunity
        WHERE StageName != 'Closed Won'
        AND QB_Invoice_ID__c != null
      `;
      
      const result = await this.query(query);
      
      return result.records.map(record => ({
        sfOpportunityId: record.Id,
        qbInvoiceId: record.QB_Invoice_ID__c
      }));
    } catch (error) {
      logger.error('Error getting unpaid invoices from Salesforce:', {
        error: error.message,
        stack: error.stack,
        statusCode: error.response?.status,
        responseData: error.response?.data,
        instanceUrl: this.instanceUrl,
        operation: 'getUnpaidInvoices',
        query: 'SELECT Id, Name, QB_Invoice_ID__c FROM Opportunity WHERE StageName != \'Closed Won\' AND QB_Invoice_ID__c != null'
      });
      
      // Enhance error with likely causes
      if (error.message.includes('QB_Invoice_ID__c') || error.response?.status === 400) {
        throw new Error(`Field access error: Make sure the QB_Invoice_ID__c field exists on Opportunity object: ${error.message}`);
      } else {
        throw new Error(`Failed to retrieve unpaid invoices from Salesforce: ${error.message}`);
      }
    }
  }
}

module.exports = SalesforceAPI;
