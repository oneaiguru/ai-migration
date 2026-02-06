const axios = require('axios');
const logger = require('../utils/logger');
const oauthManager = require('./oauth-manager');
const config = require('../config');

/**
 * Base QuickBooks API client
 */
class QuickBooksAPI {
  /**
   * Constructor
   * @param {String} realmId - QuickBooks company ID
   * @param {Object} oauthConfig - OAuth configuration (optional, defaults to config)
   */
  constructor(realmId, oauthConfig = config.quickbooks) {
    this.realmId = realmId;
    this.oauthConfig = oauthConfig;
    this.apiBase = this.oauthConfig.environment === 'sandbox'
      ? 'https://sandbox-quickbooks.api.intuit.com/v3/company'
      : 'https://quickbooks.api.intuit.com/v3/company';
  }

  /**
   * Gets a valid access token
   * @returns {Promise<String>} - Access token
   */
  async getAccessToken() {
    return await oauthManager.getValidAccessToken('quickbooks', this.realmId, this.oauthConfig);
  }

  /**
   * Makes an API request to QuickBooks
   * @param {String} method - HTTP method
   * @param {String} endpoint - API endpoint
   * @param {Object} data - Request data (for POST/PUT requests)
   * @returns {Promise<Object>} - API response
   */
  async request(method, endpoint, data = null) {
    const startTime = Date.now();
    const requestId = `qb-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    try {
      const accessToken = await this.getAccessToken();
      const requestUrl = `${this.apiBase}/${this.realmId}/${endpoint}`;
      
      const options = {
        method,
        url: requestUrl,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Request-Id': requestId
        }
      };
      
      if (data && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put')) {
        options.data = data;
      }
      
      logger.debug(`QuickBooks API Request: ${method} ${endpoint}`, {
        requestId,
        method,
        endpoint,
        realmId: this.realmId,
        dataSize: data ? JSON.stringify(data).length : 0,
        apiEnvironment: this.oauthConfig.environment
      });
      
      const response = await axios(options);
      
      const duration = Date.now() - startTime;
      logger.debug(`QuickBooks API Response: ${method} ${endpoint}`, {
        requestId,
        status: response.status,
        duration: `${duration}ms`,
        dataSize: JSON.stringify(response.data).length
      });
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const statusCode = error.response?.status;
      const responseData = error.response?.data;
      const isAuthError = statusCode === 401;
      const isValidationError = statusCode === 400;
      const isNotFoundError = statusCode === 404;
      const isRateLimitError = statusCode === 429;
      const isServerError = statusCode >= 500;
      const isNetworkError = !statusCode;
      
      // Extract more detailed error information
      const qbErrorDetail = responseData?.Fault?.Error?.[0];
      const qbErrorCode = qbErrorDetail?.code;
      const qbErrorMessage = qbErrorDetail?.Message;
      const qbErrorDetail2 = qbErrorDetail?.Detail;
      
      // Create a safe version of responseData for logging
      let safeResponseData;
      try {
        safeResponseData = responseData ? JSON.stringify(responseData).substring(0, 1000) : null; // Truncate large responses
      } catch (jsonError) {
        safeResponseData = '[Error converting response data to JSON]';
      }
      
      logger.error('QuickBooks API Error:', {
        requestId,
        method,
        endpoint,
        error: error.message,
        stack: error.stack,
        errorType: error.name,
        statusCode,
        duration: `${duration}ms`,
        qbErrorCode,
        qbErrorMessage,
        qbErrorDetail: qbErrorDetail2,
        isAuthError,
        isValidationError, 
        isNotFoundError,
        isRateLimitError,
        isServerError,
        isNetworkError,
        realmId: this.realmId,
        requestURL: `${this.apiBase}/${this.realmId}/${endpoint}`,
        apiEnvironment: this.oauthConfig.environment,
        responseData: safeResponseData
      });
      
      // Handle authentication errors with retry
      if (isAuthError) {
        logger.info(`QuickBooks token expired for realm ${this.realmId}, attempting refresh`);
        try {
          // Token might be expired, force refresh on next request
          await oauthManager.refreshQuickBooksToken(this.realmId, this.oauthConfig);
          logger.info(`Successfully refreshed QuickBooks token for realm ${this.realmId}`);
          
          // Retry the original request once with the new token
          logger.debug(`Retrying QuickBooks API request after token refresh: ${method} ${endpoint}`);
          return this.request(method, endpoint, data);
        } catch (refreshError) {
          logger.error(`Failed to refresh QuickBooks token for realm ${this.realmId}:`, {
            requestId,
            error: refreshError.message,
            stack: refreshError.stack,
            realmId: this.realmId
          });
          throw new Error(`Authentication failed and token refresh failed for QuickBooks realm ${this.realmId}: ${refreshError.message}`);
        }
      }
      
      // Create contextual error messages based on error type
      if (isValidationError) {
        // Attempt to provide detailed validation error information
        const validationErrorMessage = qbErrorMessage || 'Request validation failed';
        const detailMessage = qbErrorDetail2 ? `: ${qbErrorDetail2}` : '';
        const fieldContext = qbErrorCode ? ` (Field: ${qbErrorCode})` : '';
        
        throw new Error(`QuickBooks API validation error${fieldContext}: ${validationErrorMessage}${detailMessage}`);
      } else if (isNotFoundError) {
        throw new Error(`QuickBooks resource not found: ${endpoint}. Verify the resource ID exists and you have permission to access it.`);
      } else if (isRateLimitError) {
        const retryAfter = error.response?.headers?.['retry-after'] || '60';
        throw new Error(`QuickBooks API rate limit exceeded. Try again after ${retryAfter} seconds. Consider implementing exponential backoff.`);
      } else if (isServerError) {
        throw new Error(`QuickBooks server error (${statusCode}): This is likely a temporary issue with the QuickBooks service. Try again later.`);
      } else if (isNetworkError) {
        throw new Error(`Network error connecting to QuickBooks API: ${error.message}. Check your internet connection and verify the API endpoint.`);
      } else {
        throw new Error(`QuickBooks API error (${statusCode || 'unknown'}): ${qbErrorMessage || error.message}`);
      }
    }
  }

  /**
   * Gets first available service item from QuickBooks
   * @returns {Promise<Object>} - First available item
   */
  async getFirstAvailableItem() {
    try {
      const query = encodeURIComponent("SELECT Id, Name, Type FROM Item WHERE Type = 'Service' AND Active = true");
      const response = await this.request('get', `query?query=${query}`);
      
      if (response.QueryResponse && response.QueryResponse.Item && response.QueryResponse.Item.length > 0) {
        const item = response.QueryResponse.Item[0];
        logger.info('Found available QB service item:', { itemId: item.Id, itemName: item.Name });
        return { id: item.Id, name: item.Name };
      } else {
        // Fallback: try any item type
        const fallbackQuery = encodeURIComponent("SELECT Id, Name, Type FROM Item WHERE Active = true");
        const fallbackResponse = await this.request('get', `query?query=${fallbackQuery}`);
        
        if (fallbackResponse.QueryResponse && fallbackResponse.QueryResponse.Item && fallbackResponse.QueryResponse.Item.length > 0) {
          const item = fallbackResponse.QueryResponse.Item[0];
          logger.info('Found available QB item (fallback):', { itemId: item.Id, itemName: item.Name, itemType: item.Type });
          return { id: item.Id, name: item.Name };
        } else {
          logger.error('No items found in QuickBooks');
          throw new Error('No items available in QuickBooks. Please create at least one service or product item.');
        }
      }
    } catch (error) {
      logger.error('Error getting available QB items:', error);
      throw new Error(`Failed to query QuickBooks items: ${error.message}`);
    }
  }

  /**
   * Creates an invoice in QuickBooks
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>} - Created invoice
  /**
   * Создает счет в QuickBooks
   * @param {Object} invoiceData - Данные счета
   * @returns {Promise<Object>} Созданный счет
   */
  async createInvoice(invoiceData) {
    try {
      logger.info('Creating invoice in QuickBooks');

      // Get first available QB item for dynamic ItemRef resolution
      const availableItem = await this.getFirstAvailableItem();

      // Handle missing or empty Line items
      if (!invoiceData.Line || !Array.isArray(invoiceData.Line) || invoiceData.Line.length === 0) {
        logger.warn('Invoice data missing Line, adding default line item');
        
        invoiceData.Line = [{
          Amount: 1.00,
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: {
              value: availableItem.id,
              name: availableItem.name
            },
            Qty: 1,
            UnitPrice: 1.00
          },
          Description: "Default service item"
        }];
      } else {
        // Replace any "DYNAMIC" ItemRef values with actual QB item
        invoiceData.Line.forEach(line => {
          if (line.SalesItemLineDetail && line.SalesItemLineDetail.ItemRef && line.SalesItemLineDetail.ItemRef.value === "DYNAMIC") {
            line.SalesItemLineDetail.ItemRef.value = availableItem.id;
            line.SalesItemLineDetail.ItemRef.name = availableItem.name;
          }
        });
      }

      // Логгируем данные перед отправкой
      logger.debug('Invoice data to send:', {
        customerRef: invoiceData.CustomerRef,
        lineItems: invoiceData.Line,
        docNumber: invoiceData.DocNumber
      });

      const invoice = await this.request('post', 'invoice', invoiceData);
      return invoice;
    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }
  /**
   * Finds or creates a customer in QuickBooks
   * @param {Object} customerData - Customer data
   * @returns {Promise<String>} - Customer ID
   */
  async findOrCreateCustomer(customerData) {
    const operationId = `customer-${Date.now()}`;
    
    try {
      if (!customerData || !customerData.DisplayName) {
        throw new Error('Invalid customer data: DisplayName is required');
      }
      
      logger.info(`Finding or creating customer in QuickBooks`, {
        operationId,
        customerName: customerData.DisplayName,
        realmId: this.realmId,
        hasEmail: Boolean(customerData.PrimaryEmailAddr),
        hasPhone: Boolean(customerData.PrimaryPhone)
      });
      
      // Escape single quotes in customer name
      const escapedName = customerData.DisplayName.replace(/'/g, "\\'");
      
      // Try multiple search strategies
      // First try to find the customer by name (exact match)
      const query = encodeURIComponent(`SELECT Id, DisplayName FROM Customer WHERE DisplayName = '${escapedName}'`);
      
      try {
        const queryResponse = await this.request('get', `query?query=${query}`);
        
        // If customer exists, return the ID
        if (queryResponse.QueryResponse.Customer && queryResponse.QueryResponse.Customer.length > 0) {
          const customerId = queryResponse.QueryResponse.Customer[0].Id;
          logger.info(`Found existing customer in QuickBooks by exact name match`, {
            operationId,
            customerId,
            customerName: customerData.DisplayName,
            realmId: this.realmId
          });
          return customerId;
        }
      } catch (queryError) {
        // Log the query error but continue with creation
        logger.warn(`Error querying for customer by name in QuickBooks:`, {
          operationId,
          error: queryError.message,
          customerName: customerData.DisplayName,
          realmId: this.realmId,
          willAttemptCreation: true
        });
        
        // If there's a validation error in the query, we'll continue to creation
        if (!queryError.message.includes('validation')) {
          throw queryError; // Re-throw non-validation errors
        }
      }
      
      // If customer was not found, try a broader search if we have an email
      if (customerData.PrimaryEmailAddr && customerData.PrimaryEmailAddr.Address) {
        const email = customerData.PrimaryEmailAddr.Address.replace(/'/g, "\\'");
        const emailQuery = encodeURIComponent(`SELECT Id, DisplayName FROM Customer WHERE PrimaryEmailAddr.Address = '${email}'`);
        
        try {
          const emailQueryResponse = await this.request('get', `query?query=${emailQuery}`);
          
          if (emailQueryResponse.QueryResponse.Customer && emailQueryResponse.QueryResponse.Customer.length > 0) {
            const customerId = emailQueryResponse.QueryResponse.Customer[0].Id;
            logger.info(`Found existing customer in QuickBooks by email match`, {
              operationId,
              customerId,
              customerName: customerData.DisplayName,
              customerEmail: email,
              realmId: this.realmId
            });
            return customerId;
          }
        } catch (emailQueryError) {
          // Just log this error and continue
          logger.warn(`Error querying for customer by email in QuickBooks:`, {
            operationId,
            error: emailQueryError.message,
            customerEmail: email,
            realmId: this.realmId,
            willAttemptCreation: true
          });
        }
      }
      
      // If customer doesn't exist, create a new one
      logger.info(`Creating new customer in QuickBooks`, {
        operationId,
        customerName: customerData.DisplayName,
        realmId: this.realmId,
        dataFields: Object.keys(customerData)
      });
      
      const createResponse = await this.request('post', 'customer', customerData);
      const newCustomerId = createResponse.Customer.Id;
      
      logger.info(`Successfully created new customer in QuickBooks`, {
        operationId,
        customerId: newCustomerId,
        customerName: customerData.DisplayName,
        realmId: this.realmId
      });
      
      return newCustomerId;
    } catch (error) {
      // Extract error details for better context
      const statusCode = error.response?.status;
      const responseData = error.response?.data;
      const qbErrorDetail = responseData?.Fault?.Error?.[0];
      const qbErrorCode = qbErrorDetail?.code;
      const qbErrorMessage = qbErrorDetail?.Message;
      const qbErrorDetail2 = qbErrorDetail?.Detail;
      const isValidationError = statusCode === 400;
      const isDuplicateError = qbErrorMessage?.includes('Duplicate') || qbErrorMessage?.includes('already exists');
      
      logger.error('Error finding/creating customer in QuickBooks:', {
        operationId,
        error: error.message,
        stack: error.stack,
        errorType: error.name,
        statusCode,
        customerName: customerData?.DisplayName || 'MISSING_NAME',
        customerEmail: customerData?.PrimaryEmailAddr?.Address || 'NO_EMAIL',
        operation: error.message.includes('query') ? 'find-customer' : 'create-customer',
        realmId: this.realmId,
        qbErrorCode,
        qbErrorMessage,
        qbErrorDetail: qbErrorDetail2,
        isDuplicateError,
        isValidationError
      });
      
      // Provide specific error messages based on the error type
      if (isDuplicateError) {
        // For duplicate errors, suggest a solution
        throw new Error(`Customer name conflict in QuickBooks: "${customerData.DisplayName}". Try adding a unique identifier or your company name to make the customer name unique.`);
      } else if (isValidationError) {
        // For validation errors, point out which field has issues if known
        const fieldIssue = qbErrorCode ? ` (Field: ${qbErrorCode})` : '';
        throw new Error(`QuickBooks customer validation error${fieldIssue}: ${qbErrorMessage || 'Invalid customer data'}`);
      } else if (error.message.includes('query')) {
        throw new Error(`Failed to search for customer "${customerData.DisplayName}" in QuickBooks: ${error.message}`);
      } else {
        throw new Error(`Failed to create customer "${customerData.DisplayName}" in QuickBooks: ${error.message}`);
      }
    }
  }

  /**
   * Gets an invoice by ID
   * @param {String} invoiceId - QuickBooks Invoice ID
   * @returns {Promise<Object>} - Invoice data
   */
  async getInvoice(invoiceId) {
    return this.request('get', `invoice/${invoiceId}`);
  }

  /**
   * Gets payment details for an invoice
   * @param {String} invoiceId - QuickBooks Invoice ID
   * @returns {Promise<Object>} - Payment details or null if not paid
   */
  async getPaymentForInvoice(invoiceId) {
    try {
      // Query payments linked to this invoice
      const query = encodeURIComponent(`SELECT * FROM Payment WHERE Id IN (SELECT PaymentId FROM PaymentLine WHERE LinkedTxn.TxnId = '${invoiceId}')`);
      const response = await this.request('get', `query?query=${query}`);
      
      // Check if we got any payment results
      if (!response.QueryResponse.Payment || response.QueryResponse.Payment.length === 0) {
        logger.debug(`No payment found for invoice ${invoiceId}`);
        return null;
      }
      
      // Return payment information
      const payment = response.QueryResponse.Payment[0];
      logger.info(`Found payment for invoice ${invoiceId}: ${payment.Id}`);
      
      return {
        paymentId: payment.Id,
        paymentDate: payment.TxnDate,
        paymentMethod: payment.PaymentMethodRef ? payment.PaymentMethodRef.name : 'Unknown',
        amount: payment.TotalAmt,
        paymentRefNum: payment.PaymentRefNum || null
      };
    } catch (error) {
      const statusCode = error.response?.status;
      const responseData = error.response?.data;
      
      logger.error(`Error getting payment details for invoice ${invoiceId}:`, {
        error: error.message,
        stack: error.stack,
        statusCode,
        responseData,
        invoiceId,
        realmId: this.realmId,
        operation: 'getPaymentForInvoice',
        query: `SELECT * FROM Payment WHERE Id IN (SELECT PaymentId FROM PaymentLine WHERE LinkedTxn.TxnId = '${invoiceId}')`
      });
      
      // Log more details but still return null to prevent breaking the main flow
      if (statusCode === 400) {
        logger.warn(`Invalid query when getting payment for invoice ${invoiceId}: ${responseData?.Fault?.Error?.[0]?.Message}`);
      } else if (statusCode === 404) {
        logger.warn(`No payment found for invoice ${invoiceId} or invoice does not exist`);
      }
      
      return null; // Return null instead of throwing to avoid breaking the main flow
    }
  }

  /**
   * Checks if an invoice has been paid
   * @param {String} invoiceId - QuickBooks Invoice ID
   * @returns {Promise<Object>} - Payment status and details if paid
   */
  async checkInvoicePaymentStatus(invoiceId) {
    try {
      // Get invoice to check its balance
      const invoiceResponse = await this.getInvoice(invoiceId);
      const invoice = invoiceResponse.Invoice;
      
      const isPaid = invoice.Balance === 0;
      
      // If paid, get the payment details
      let paymentDetails = null;
      if (isPaid) {
        paymentDetails = await this.getPaymentForInvoice(invoiceId);
      }
      
      return {
        invoiceId,
        isPaid,
        balance: invoice.Balance,
        totalAmount: invoice.TotalAmt,
        paymentDetails
      };
    } catch (error) {
      logger.error(`Error checking payment status for invoice ${invoiceId}:`, {
        error: error.message,
        stack: error.stack,
        statusCode: error.response?.status,
        responseData: error.response?.data,
        invoiceId,
        realmId: this.realmId,
        operation: 'checkInvoicePaymentStatus'
      });
      
      // Enhance error message with more context
      if (error.message.includes('not found') || error.response?.status === 404) {
        throw new Error(`Invoice ${invoiceId} not found in QuickBooks`);
      } else {
        throw new Error(`Failed to check payment status for invoice ${invoiceId}: ${error.message}`);
      }
    }
  }

  /**
   * Batch check payment status for multiple invoices
   * @param {Array<String>} invoiceIds - Array of QuickBooks Invoice IDs
   * @returns {Promise<Array<Object>>} - Array of payment status results
   */
  async batchCheckPaymentStatus(invoiceIds) {
    try {
      // Process in chunks of 5 to avoid rate limiting
      const chunkSize = 5;
      const results = [];
      
      for (let i = 0; i < invoiceIds.length; i += chunkSize) {
        const chunk = invoiceIds.slice(i, i + chunkSize);
        
        // Use Promise.all to process each chunk in parallel
        const chunkResults = await Promise.all(
          chunk.map(invoiceId => 
            this.checkInvoicePaymentStatus(invoiceId)
              .catch(error => ({
                invoiceId,
                error: error.message,
                isPaid: false
              }))
          )
        );
        
        results.push(...chunkResults);
        
        // Add a short delay between chunks to prevent rate limiting
        if (i + chunkSize < invoiceIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Error in batch payment status check:', {
        error: error.message,
        stack: error.stack,
        realmId: this.realmId,
        operation: 'batchCheckPaymentStatus',
        invoiceCount: invoiceIds.length,
        invoiceIds: invoiceIds.slice(0, 5) // Log only first 5 to avoid overly large logs
      });
      
      throw new Error(`Failed to check payment status for multiple invoices: ${error.message}`);
    }
  }
}

module.exports = QuickBooksAPI;
