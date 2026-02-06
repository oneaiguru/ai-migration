const axios = require('axios');
const logger = require('../utils/logger');
const oauthManager = require('./oauth-manager');
const config = require('../config');

class AuthError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.isAuthError = true;
  }
}

class ItemCurrencyError extends Error {
  constructor(currency) {
    super(`No active QuickBooks items available for currency ${currency}. Create a ${currency} item or set Product2.QB_Item_ID__c for this currency.`);
    this.code = 'QB_ITEM_CURRENCY_UNAVAILABLE';
    this.statusCode = 422;
  }
}

const normalizeCurrencyCode = (currency) => {
  if (typeof currency !== 'string') {
    return null;
  }
  const trimmed = currency.trim();
  return trimmed ? trimmed.toUpperCase() : null;
};

const extractItemCurrency = (item) => {
  if (!item) {
    return null;
  }
  return normalizeCurrencyCode(item.CurrencyRef?.value || item.CurrencyRef);
};

function isReauthorizationRequired(error) {
  if (!error || !error.message) {
    return false;
  }

  if (error.code === 'AUTH_EXPIRED') {
    return true;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('invalid_grant') ||
    message.includes('invalid or expired') ||
    message.includes('manual reauthorization')
  );
}

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
    this.companyCurrency = null;
    this.companyCurrencyLoaded = false;
  }

  /**
   * Gets a valid access token
   * @returns {Promise<String>} - Access token
   */
  async getAccessToken() {
    const tokens = await oauthManager.getQuickBooksTokens(this.realmId);
    if (!tokens) {
      throw new AuthError('NO_TOKENS', 'QuickBooks not connected - authorization required');
    }

    if (tokens.expiresAt <= Date.now()) {
      try {
        const newTokens = await oauthManager.refreshQuickBooksToken(this.realmId, this.oauthConfig);
        return newTokens.accessToken;
      } catch (error) {
        if (error.code === 'NO_TOKENS') {
          throw new AuthError('NO_TOKENS', error.message);
        }
        if (error.code === 'AUTH_EXPIRED') {
          throw new AuthError('AUTH_EXPIRED', error.message);
        }
        if (isReauthorizationRequired(error)) {
          throw new AuthError(
            'AUTH_EXPIRED',
            'QuickBooks refresh token expired - reauthorization required. Visit: https://sqint.atocomm.eu/auth/quickbooks'
          );
        }
        throw error;
      }
    }

    return tokens.accessToken;
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

      if (error.isAuthError) {
        logger.warn('QuickBooks auth error:', {
          error: error.message,
          authCode: error.code,
          realmId: this.realmId
        });
        throw error;
      }
      
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
          if (refreshError.code === 'NO_TOKENS') {
            throw new AuthError('NO_TOKENS', refreshError.message);
          }
          if (refreshError.code === 'AUTH_EXPIRED') {
            throw new AuthError('AUTH_EXPIRED', refreshError.message);
          }
          if (isReauthorizationRequired(refreshError)) {
            throw new AuthError(
              'AUTH_EXPIRED',
              `QuickBooks refresh token expired - reauthorization required. Visit: https://sqint.atocomm.eu/auth/quickbooks`
            );
          }
          throw refreshError;
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
   * Gets company base currency from QuickBooks
   * @returns {Promise<String|null>} - Company currency code or null if unavailable
   */
  async getCompanyCurrency() {
    if (this.companyCurrencyLoaded) {
      return this.companyCurrency;
    }
    try {
      const response = await this.request('get', `companyinfo/${this.realmId}`);
      const companyInfo = response?.CompanyInfo || {};
      const currencyRef =
        companyInfo.CompanyCurrency?.value ||
        companyInfo.CompanyCurrencyRef?.value ||
        companyInfo.CurrencyRef?.value ||
        companyInfo.CompanyCurrency ||
        null;
      this.companyCurrency = normalizeCurrencyCode(currencyRef);
      this.companyCurrencyLoaded = true;
      return this.companyCurrency;
    } catch (error) {
      logger.warn('Failed to resolve QuickBooks company currency', {
        realmId: this.realmId,
        error: error.message
      });
      this.companyCurrencyLoaded = true;
      this.companyCurrency = null;
      return null;
    }
  }

  /**
   * Gets first available service item from QuickBooks
   * @param {String|null} currencyCode - ISO currency code to match Item CurrencyRef
   * @returns {Promise<Object>} - First available item
   */
  async getFirstAvailableItem(currencyCode = null) {
    const normalizedCurrency = normalizeCurrencyCode(currencyCode);
    let baseCurrency = normalizedCurrency ? null : await this.getCompanyCurrency();

    const selectItem = (items, includeBaseCurrency = false) => {
      if (!Array.isArray(items) || items.length === 0) {
        return null;
      }
      if (normalizedCurrency) {
        const directMatch = items.find(item => extractItemCurrency(item) === normalizedCurrency);
        if (directMatch) {
          return directMatch;
        }
        const baseItem = items.find(item => !extractItemCurrency(item));
        if (baseItem) {
          return baseItem;
        }
        if (includeBaseCurrency && baseCurrency) {
          const baseMatch = items.find(item => extractItemCurrency(item) === baseCurrency);
          if (baseMatch) {
            return baseMatch;
          }
        }
        return null;
      }
      const baseItem = items.find(item => !extractItemCurrency(item));
      if (baseItem) {
        return baseItem;
      }
      if (baseCurrency) {
        const baseMatch = items.find(item => extractItemCurrency(item) === baseCurrency);
        if (baseMatch) {
          return baseMatch;
        }
      }
      return null;
    };

    try {
      const query = encodeURIComponent("SELECT Id, Name, Type FROM Item WHERE Type = 'Service' AND Active = true");
      const response = await this.request('get', `query?query=${query}`);

      const serviceItems = response.QueryResponse?.Item || [];
      let matchedItem = selectItem(serviceItems);

      if (!matchedItem && normalizedCurrency) {
        baseCurrency = await this.getCompanyCurrency();
        matchedItem = selectItem(serviceItems, true);
      }

      if (matchedItem) {
        logger.info('Found available QB service item:', {
          itemId: matchedItem.Id,
          itemName: matchedItem.Name,
          itemCurrency: extractItemCurrency(matchedItem) || 'BASE'
        });
        return { id: matchedItem.Id, name: matchedItem.Name };
      }

      // Fallback: try any item type
      const fallbackQuery = encodeURIComponent("SELECT Id, Name, Type FROM Item WHERE Active = true");
      const fallbackResponse = await this.request('get', `query?query=${fallbackQuery}`);

      const fallbackItems = fallbackResponse.QueryResponse?.Item || [];
      let fallbackMatch = selectItem(fallbackItems, Boolean(baseCurrency));

      if (!fallbackMatch && normalizedCurrency && !baseCurrency) {
        baseCurrency = await this.getCompanyCurrency();
        fallbackMatch = selectItem(fallbackItems, true);
      }

      if (fallbackMatch) {
        logger.info('Found available QB item (fallback):', {
          itemId: fallbackMatch.Id,
          itemName: fallbackMatch.Name,
          itemType: fallbackMatch.Type,
          itemCurrency: extractItemCurrency(fallbackMatch) || 'BASE'
        });
        return { id: fallbackMatch.Id, name: fallbackMatch.Name };
      }

      if (normalizedCurrency) {
        logger.error('No items found in QuickBooks for currency', {
          currency: normalizedCurrency
        });
        throw new ItemCurrencyError(normalizedCurrency);
      }

      const baseCurrencyLabel = baseCurrency || 'BASE';
      logger.error('No base currency items found in QuickBooks', {
        currency: baseCurrencyLabel
      });
      throw new ItemCurrencyError(baseCurrencyLabel);
    } catch (error) {
      if (error.isAuthError || error.code) {
        throw error;
      }
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

      const lineItems = Array.isArray(invoiceData?.Line) ? invoiceData.Line : [];
      const hasDynamicItem = lineItems.some(
        line => line?.SalesItemLineDetail?.ItemRef?.value === "DYNAMIC"
      );
      const needsDefaultLine = lineItems.length === 0;
      let availableItem = null;

      if (hasDynamicItem || needsDefaultLine) {
        const invoiceCurrency = normalizeCurrencyCode(invoiceData?.CurrencyRef?.value);
        availableItem = await this.getFirstAvailableItem(invoiceCurrency);
      }

      // Handle missing or empty Line items
      if (needsDefaultLine) {
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
      } else if (hasDynamicItem) {
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
   * Updates an existing customer in QuickBooks with a sparse payload.
   * @param {String} customerId - QuickBooks Customer ID
   * @param {Object} data - Update payload fields (must include SyncToken for updates)
   * @returns {Promise<Object>} - Updated customer response
   */
  async updateCustomer(customerId, data) {
    const payload = {
      Id: customerId,
      sparse: true,
      ...data
    };

    return this.request('post', 'customer', payload);
  }

  /**
   * Finds or creates a customer in QuickBooks
   * @param {Object} customerData - Customer data
   * @returns {Promise<{id: String, currency: (String|null), isExisting: Boolean}>}
   */
  async findOrCreateCustomer(customerData) {
    const operationId = `customer-${Date.now()}`;
    let trimmedDisplayName = null;

    const normalizeNameForMatch = (name) => String(name || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();

    const resolveCustomerCurrency = (customer) => customer?.CurrencyRef?.value || null;

    const updateCustomerEmailIfNeeded = async (existingCustomer) => {
      const newEmail = customerData.PrimaryEmailAddr?.Address?.trim();
      const oldEmail = existingCustomer.PrimaryEmailAddr?.Address?.trim();

      if (newEmail && newEmail !== oldEmail) {
        logger.info(`Updating customer email: ${oldEmail || '(none)'} -> ${newEmail}`);
        await this.updateCustomer(existingCustomer.Id, {
          PrimaryEmailAddr: { Address: newEmail },
          SyncToken: existingCustomer.SyncToken
        });
      }
    };

    const buildNameVariants = (name) => {
      const baseName = String(name || '').trim();
      if (!baseName) {
        return [];
      }
      return Array.from(
        new Set([
          baseName,
          baseName.toLowerCase(),
          baseName.toUpperCase(),
          baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase()
        ])
      ).filter(Boolean);
    };

    const resolveExistingCustomerByName = async (displayName, companyName) => {
      const nameCandidates = [displayName, companyName]
        .map((name) => String(name || '').trim())
        .filter(Boolean);
      if (nameCandidates.length === 0) {
        return null;
      }

      const variants = Array.from(
        new Set(nameCandidates.flatMap((name) => buildNameVariants(name)))
      );

      const candidatesById = new Map();
      const targetNormalized = new Set(
        nameCandidates.map((name) => normalizeNameForMatch(name))
      );

      const queryByVariant = async (variant, field, includeInactive = false) => {
        const escapedVariant = variant.replace(/'/g, "\\'");
        const activeClause = includeInactive ? ' AND Active = false' : '';
        const query = encodeURIComponent(
          `SELECT Id, DisplayName, CompanyName, FullyQualifiedName, PrimaryEmailAddr, SyncToken, Active FROM Customer ` +
          `WHERE ${field} LIKE '%${escapedVariant}%'${activeClause} MAXRESULTS 10`
        );
        const response = await this.request('get', `query?query=${query}`);
        return response.QueryResponse?.Customer || [];
      };

      const findExactMatch = () => Array.from(candidatesById.values()).find(
        (customer) => targetNormalized.has(normalizeNameForMatch(customer.DisplayName)) ||
          targetNormalized.has(normalizeNameForMatch(customer.CompanyName))
      );

      for (const variant of variants) {
        try {
          const fields = ['DisplayName', 'CompanyName', 'FullyQualifiedName'];
          const collectMatches = async (includeInactive) => {
            for (const field of fields) {
              const customers = await queryByVariant(variant, field, includeInactive);
              for (const customer of customers) {
                if (customer?.Id && !candidatesById.has(customer.Id)) {
                  candidatesById.set(customer.Id, customer);
                }
              }
            }
          };

          await collectMatches(false);
          let exactMatch = findExactMatch();
          if (!exactMatch) {
            await collectMatches(true);
            exactMatch = findExactMatch();
          }

          if (exactMatch) {
            return exactMatch;
          }
        } catch (lookupError) {
          logger.warn('Failed to look up customer after duplicate-name error', {
            operationId,
            customerName: variant,
            variant,
            error: lookupError.message,
            realmId: this.realmId
          });
        }
      }

      const candidates = Array.from(candidatesById.values());
      if (candidates.length === 1) {
        return candidates[0];
      }

      return null;
    };

    const resolveNameConflictInOtherEntities = async (displayName, companyName) => {
      const nameCandidates = [displayName, companyName]
        .map((name) => String(name || '').trim())
        .filter(Boolean);
      if (nameCandidates.length === 0) {
        return null;
      }

      const uniqueNames = Array.from(new Set(nameCandidates));
      const entityDefinitions = [
        { entity: 'Vendor', fields: ['DisplayName', 'CompanyName'] },
        { entity: 'Employee', fields: ['DisplayName'] },
        { entity: 'OtherName', fields: ['DisplayName'] }
      ];

      const queryExactMatch = async (entity, field, name) => {
        const escapedName = name.replace(/'/g, "\\'");
        const selectFields = ['Id', 'DisplayName'];
        if (entity === 'Vendor') {
          selectFields.push('CompanyName', 'Active');
        }
        const query = encodeURIComponent(
          `SELECT ${selectFields.join(', ')} FROM ${entity} WHERE ${field} = '${escapedName}' MAXRESULTS 1`
        );
        const response = await this.request('get', `query?query=${query}`);
        return response.QueryResponse?.[entity]?.[0] || null;
      };

      for (const { entity, fields } of entityDefinitions) {
        for (const field of fields) {
          for (const name of uniqueNames) {
            try {
              const record = await queryExactMatch(entity, field, name);
              if (record) {
                return { entity, record, name };
              }
            } catch (lookupError) {
              logger.warn('Failed to look up name conflict entity', {
                operationId,
                entity,
                field,
                name,
                error: lookupError.message,
                realmId: this.realmId
              });
            }
          }
        }
      }

      return null;
    };

    const buildNameConflictError = (entity, record, displayName) => {
      const entityLabel = entity || 'entity';
      const recordName = record?.DisplayName || record?.CompanyName || displayName || 'unknown name';
      const activeLabel = record?.Active === false ? 'inactive' : record?.Active === true ? 'active' : null;
      const activeDescriptor = activeLabel ? ` ${activeLabel}` : '';
      const error = new Error(
        `QuickBooks name conflict: "${recordName}" matches an existing${activeDescriptor} ${entityLabel}. ` +
          `Rename the ${entityLabel} or change the Salesforce Account name before creating a Customer.`
      );
      error.code = 'QB_NAME_CONFLICT';
      error.statusCode = 422;
      return error;
    };

    const isDuplicateNameError = (err) => {
      const message = String(err?.message || '');
      const normalizedMessage = message.toLowerCase();
      const qbErrors = err?.response?.data?.Fault?.Error;
      const duplicateFromResponse = Array.isArray(qbErrors) && qbErrors.some((qbError) => {
        const code = String(qbError?.code || '');
        const detail = `${qbError?.Message || ''} ${qbError?.Detail || ''}`.toLowerCase();
        return code === '6240' ||
          detail.includes('duplicate') ||
          detail.includes('already exists') ||
          detail.includes('name is already in use');
      });

      return duplicateFromResponse ||
        normalizedMessage.includes('duplicate') ||
        normalizedMessage.includes('already exists') ||
        normalizedMessage.includes('name is already in use');
    };
    
    try {
      if (!customerData || !customerData.DisplayName) {
        throw new Error('Invalid customer data: DisplayName is required');
      }

      trimmedDisplayName = customerData.DisplayName.trim();
      if (!trimmedDisplayName) {
        throw new Error('Invalid customer data: DisplayName is required');
      }
      if (trimmedDisplayName !== customerData.DisplayName) {
        customerData = { ...customerData, DisplayName: trimmedDisplayName };
      }
      if (typeof customerData.CompanyName === 'string') {
        const trimmedCompanyName = customerData.CompanyName.trim();
        if (trimmedCompanyName && trimmedCompanyName !== customerData.CompanyName) {
          customerData = { ...customerData, CompanyName: trimmedCompanyName };
        }
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
      const query = encodeURIComponent(
        `SELECT Id, DisplayName, CompanyName, FullyQualifiedName, PrimaryEmailAddr, SyncToken, Active ` +
        `FROM Customer WHERE DisplayName = '${escapedName}'`
      );
      
      try {
        const queryResponse = await this.request('get', `query?query=${query}`);
        
        // If customer exists, return the ID
        if (queryResponse.QueryResponse.Customer && queryResponse.QueryResponse.Customer.length > 0) {
          const existingCustomer = queryResponse.QueryResponse.Customer[0];
          const customerId = existingCustomer.Id;
          const customerCurrency = resolveCustomerCurrency(existingCustomer);
          logger.info(`Found existing customer in QuickBooks by exact name match`, {
            operationId,
            customerId,
            customerName: customerData.DisplayName,
            realmId: this.realmId
          });
          await updateCustomerEmailIfNeeded(existingCustomer);

          return { id: customerId, currency: customerCurrency, isExisting: true };
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
        const emailQuery = encodeURIComponent(
          `SELECT Id, DisplayName, CompanyName, FullyQualifiedName, PrimaryEmailAddr, SyncToken, Active ` +
          `FROM Customer WHERE PrimaryEmailAddr.Address = '${email}'`
        );
        
        try {
          const emailQueryResponse = await this.request('get', `query?query=${emailQuery}`);
          
          if (emailQueryResponse.QueryResponse.Customer && emailQueryResponse.QueryResponse.Customer.length > 0) {
            const existingCustomer = emailQueryResponse.QueryResponse.Customer[0];
            const customerId = existingCustomer.Id;
            const customerCurrency = resolveCustomerCurrency(existingCustomer);
            logger.info(`Found existing customer in QuickBooks by email match`, {
              operationId,
              customerId,
              customerName: customerData.DisplayName,
              customerEmail: email,
              realmId: this.realmId
            });
            await updateCustomerEmailIfNeeded(existingCustomer);

            return { id: customerId, currency: customerCurrency, isExisting: true };
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
      const createdCustomer = createResponse.Customer || {};
      const newCustomerId = createdCustomer.Id;
      const newCustomerCurrency = createdCustomer.CurrencyRef?.value || customerData.CurrencyRef?.value || null;
      
      logger.info(`Successfully created new customer in QuickBooks`, {
        operationId,
        customerId: newCustomerId,
        customerName: customerData.DisplayName,
        realmId: this.realmId
      });
      
      return { id: newCustomerId, currency: newCustomerCurrency, isExisting: false };
    } catch (error) {
      const qbErrors = error?.response?.data?.Fault?.Error;
      const isDuplicateError = isDuplicateNameError(error);
      
      logger.error('Error finding/creating customer in QuickBooks:', {
        operationId,
        error: error.message,
        stack: error.stack,
        errorType: error.name,
        customerName: customerData?.DisplayName || 'MISSING_NAME',
        customerEmail: customerData?.PrimaryEmailAddr?.Address || 'NO_EMAIL',
        operation: error.message.includes('query') ? 'find-customer' : 'create-customer',
        realmId: this.realmId,
        qbErrors,
        isDuplicateError
      });
      
      // Provide specific error messages based on the error type
      if (isDuplicateError) {
        const resolvedCustomer = await resolveExistingCustomerByName(
          trimmedDisplayName || customerData?.DisplayName,
          customerData?.CompanyName
        );
        if (resolvedCustomer) {
          await updateCustomerEmailIfNeeded(resolvedCustomer);
          return {
            id: resolvedCustomer.Id,
            currency: resolveCustomerCurrency(resolvedCustomer),
            isExisting: true
          };
        }

        const nameConflict = await resolveNameConflictInOtherEntities(
          trimmedDisplayName || customerData?.DisplayName,
          customerData?.CompanyName
        );
        if (nameConflict) {
          const autoSuffixEnabled = Boolean(this.oauthConfig?.duplicateNameAutoSuffix);
          if (!autoSuffixEnabled) {
            throw buildNameConflictError(
              nameConflict.entity,
              nameConflict.record,
              trimmedDisplayName || customerData?.DisplayName
            );
          }

          const configuredSuffix = typeof this.oauthConfig?.duplicateNameSuffix === 'string' &&
            this.oauthConfig.duplicateNameSuffix.length > 0
            ? this.oauthConfig.duplicateNameSuffix
            : ' (SF)';
          const baseDisplayName = trimmedDisplayName || customerData?.DisplayName?.trim() || '';
          const suffixedDisplayName = baseDisplayName.endsWith(configuredSuffix)
            ? baseDisplayName
            : `${baseDisplayName}${configuredSuffix}`;

          if (!baseDisplayName || suffixedDisplayName === baseDisplayName) {
            throw buildNameConflictError(
              nameConflict.entity,
              nameConflict.record,
              baseDisplayName || customerData?.DisplayName
            );
          }

          const suffixedCustomerData = {
            ...customerData,
            DisplayName: suffixedDisplayName,
            CompanyName: baseDisplayName
          };

          logger.info('Creating QuickBooks customer with suffix after name conflict', {
            operationId,
            customerName: baseDisplayName,
            suffixedName: suffixedDisplayName,
            conflictEntity: nameConflict.entity,
            realmId: this.realmId
          });

          try {
            const createResponse = await this.request('post', 'customer', suffixedCustomerData);
            const createdCustomer = createResponse.Customer || {};
            const newCustomerId = createdCustomer.Id;
            const newCustomerCurrency = createdCustomer.CurrencyRef?.value ||
              suffixedCustomerData.CurrencyRef?.value ||
              null;

            logger.info('Successfully created suffixed customer in QuickBooks', {
              operationId,
              customerId: newCustomerId,
              customerName: suffixedDisplayName,
              realmId: this.realmId
            });

            return { id: newCustomerId, currency: newCustomerCurrency, isExisting: false };
          } catch (suffixError) {
            if (isDuplicateNameError(suffixError)) {
              throw buildNameConflictError(
                nameConflict.entity,
                nameConflict.record,
                suffixedDisplayName
              );
            }
            throw suffixError;
          }
        }

        throw new Error(
          `QuickBooks customer "${customerData.DisplayName}" already exists, but could not be resolved via API query. ` +
            `Check that the customer is active in QuickBooks and that Salesforce has the same customer email/name.`
        );
      } else if (error.message.includes('query')) {
        throw new Error(`Failed to search for customer "${customerData.DisplayName}" in QuickBooks: ${error.message}`);
      } else {
        throw new Error(`Failed to create customer "${customerData.DisplayName}" in QuickBooks: ${error.message}`);
      }
    }
  }

  /**
   * Gets a customer by ID
   * @param {String} customerId - QuickBooks Customer ID
   * @returns {Promise<Object>} - Customer data
   */
  async getCustomer(customerId) {
    return this.request('get', `customer/${customerId}`);
  }

  /**
   * Gets FX rate from QBO ExchangeRate endpoint
   * @param {String} sourceCurrency - ISO currency code
   * @param {String} targetCurrency - ISO currency code
   * @param {String} asOfDate - YYYY-MM-DD
   * @returns {Promise<Number|null>} - FX rate or null if missing
   */
  async getExchangeRate(sourceCurrency, targetCurrency, asOfDate) {
    const normalizedSource = normalizeCurrencyCode(sourceCurrency);
    const normalizedTarget = normalizeCurrencyCode(targetCurrency);

    if (!normalizedSource || !normalizedTarget) {
      return null;
    }

    if (normalizedSource === normalizedTarget) {
      return 1;
    }

    const effectiveDate = asOfDate || new Date().toISOString().split('T')[0];
    const previousDate = (dateString) => {
      const date = new Date(dateString);
      date.setDate(date.getDate() - 1);
      return date.toISOString().split('T')[0];
    };

    const parseExchangeRateResponse = (response) => {
      const payload =
        response?.ExchangeRate ||
        response?.exchangeRate ||
        response?.QueryResponse?.ExchangeRate ||
        null;
      const record = Array.isArray(payload) ? payload[0] : payload;
      if (!record) {
        return null;
      }
      const rateValue = record.Rate ?? record.rate ?? null;
      const numericRate = Number(rateValue);
      if (!Number.isFinite(numericRate) || numericRate <= 0) {
        return null;
      }
      return {
        sourceCurrency: normalizeCurrencyCode(record.SourceCurrencyCode || record.sourceCurrencyCode),
        targetCurrency: normalizeCurrencyCode(record.TargetCurrencyCode || record.targetCurrencyCode),
        asOfDate: record.AsOfDate || record.asOfDate || null,
        rate: numericRate
      };
    };

    let inferredHomeCurrency = normalizeCurrencyCode(await this.getCompanyCurrency());

    const fetchRateToHome = async (currencyCode, dateOverride = null) => {
      if (inferredHomeCurrency && currencyCode === inferredHomeCurrency) {
        return { currency: currencyCode, home: inferredHomeCurrency, rateToHome: 1 };
      }

      const endpointDate = dateOverride || effectiveDate;
      const endpoint = `exchangerate?sourcecurrencycode=${currencyCode}&asofdate=${endpointDate}`;
      const response = await this.request('get', endpoint);
      const parsed = parseExchangeRateResponse(response);
      if (!parsed) {
        return null;
      }

      if (!parsed.targetCurrency) {
        return null;
      }

      if (inferredHomeCurrency && parsed.targetCurrency !== inferredHomeCurrency) {
        logger.warn('ExchangeRate response target currency differs from company currency', {
          expectedHome: inferredHomeCurrency,
          responseTarget: parsed.targetCurrency,
          sourceCurrency: currencyCode
        });
      }

      inferredHomeCurrency = inferredHomeCurrency || parsed.targetCurrency;

      return {
        currency: currencyCode,
        home: inferredHomeCurrency,
        rateToHome: parsed.rate
      };
    };

    // QuickBooks ExchangeRate is expressed as: 1 unit of source currency = rateToHome units of home currency.
    // Convert between any two currencies by pivoting through home currency.
    const sourceIsHome = inferredHomeCurrency && normalizedSource === inferredHomeCurrency;
    const targetIsHome = inferredHomeCurrency && normalizedTarget === inferredHomeCurrency;

    let sourceRate = null;
    let targetRate = null;

    if (!sourceIsHome) {
      sourceRate = await fetchRateToHome(normalizedSource);
    }
    if (!targetIsHome) {
      targetRate = await fetchRateToHome(normalizedTarget);
    }

    // If either rate is missing, retry once with the prior day (asOfDate-aware; retains today→yesterday when asOfDate not provided).
    if (!sourceRate || !targetRate) {
      const fallbackDate = previousDate(effectiveDate);
      if (!sourceRate && !sourceIsHome) {
        sourceRate = await fetchRateToHome(normalizedSource, fallbackDate);
      }
      if (!targetRate && !targetIsHome) {
        targetRate = await fetchRateToHome(normalizedTarget, fallbackDate);
      }
    }

    if (!inferredHomeCurrency) {
      // If home currency could not be determined, infer it from whichever lookup succeeded.
      inferredHomeCurrency = sourceRate?.home || targetRate?.home || null;
    }

    const effectiveSourceIsHome = normalizedSource === inferredHomeCurrency;
    const effectiveTargetIsHome = normalizedTarget === inferredHomeCurrency;

    if (effectiveSourceIsHome) {
      if (!targetRate) {
        targetRate = await fetchRateToHome(normalizedTarget);
      }
      return targetRate ? 1 / targetRate.rateToHome : null;
    }

    if (effectiveTargetIsHome) {
      if (!sourceRate) {
        sourceRate = await fetchRateToHome(normalizedSource);
      }
      return sourceRate ? sourceRate.rateToHome : null;
    }

    if (!sourceRate) {
      sourceRate = await fetchRateToHome(normalizedSource);
    }
    if (!targetRate) {
      targetRate = await fetchRateToHome(normalizedTarget);
    }

    if (!sourceRate || !targetRate) {
      return null;
    }

    if (sourceRate.home !== targetRate.home) {
      logger.warn('ExchangeRate responses disagree on home currency', {
        sourceCurrency: normalizedSource,
        sourceHome: sourceRate.home,
        targetCurrency: normalizedTarget,
        targetHome: targetRate.home
      });
    }

    return sourceRate.rateToHome / targetRate.rateToHome;
  }

  /**
   * Gets an invoice by ID
   * @param {String} invoiceId - QuickBooks Invoice ID
   * @returns {Promise<Object>} - Invoice data
   */
  async getInvoice(invoiceId) {
    return this.request('get', `invoice/${invoiceId}`);
  }

  async findInvoiceByOpportunityId(opportunityId) {
    const query = `SELECT * FROM Invoice WHERE PrivateNote LIKE '%SF_OPP:${opportunityId}%' MAXRESULTS 1`;
    try {
      const response = await this.request('get', `query?query=${encodeURIComponent(query)}`);
      return response.QueryResponse?.Invoice?.[0] || null;
    } catch (error) {
      if (error.isAuthError) {
        throw error;
      }
      logger.warn(`Could not search for existing invoice: ${error.message}`);
      return null;
    }
  }

  /**
   * Gets payment link for a QB invoice
   * @param {String} invoiceId - QuickBooks invoice ID
   * @returns {Promise<String|null>} Payment link URL or null
   */
  async getInvoicePaymentLinkDetails(invoiceId) {
    try {
      const response = await this.request(
        'get',
        `invoice/${invoiceId}?minorversion=65&include=invoiceLink`
      );

      const invoice = response.Invoice;
      const invoiceLink = invoice?.InvoiceLink;
      const billEmail = invoice?.BillEmail?.Address || null;

      if (invoiceLink) {
        return { link: invoiceLink, reason: 'SUCCESS', billEmail };
      }

      if (!billEmail) {
        return {
          link: null,
          reason: 'INVOICE_NO_BILLEMAIL',
          billEmail: null,
          message: 'Invoice has no BillEmail - QB cannot generate payment link'
        };
      }

      return {
        link: null,
        reason: 'QB_PAYMENTS_DISABLED',
        billEmail,
        message: 'Invoice has BillEmail but no InvoiceLink - check QB Payments settings'
      };
    } catch (error) {
      if (error.isAuthError) {
        return { link: null, reason: error.code, message: error.message };
      }

      if (error.response?.status === 401) {
        return {
          link: null,
          reason: 'AUTH_EXPIRED',
          message: 'QuickBooks authentication expired - reauthorization required'
        };
      }

      return { link: null, reason: 'API_ERROR', message: error.message };
    }
  }

  async getInvoicePaymentLink(invoiceId) {
    const result = await this.getInvoicePaymentLinkDetails(invoiceId);
    return result.link || null;
  }

  /**
   * Gets payment details for an invoice
   * @param {String} invoiceId - QuickBooks Invoice ID
   * @returns {Promise<Object>} - Payment details or null if not paid
   */
  async getPaymentForInvoice(invoiceId) {
    try {
      // Simplified approach: check if invoice balance is 0 (indicating it's paid)
      const invoiceQuery = encodeURIComponent(`SELECT * FROM Invoice WHERE Id = '${invoiceId}'`);
      const invoiceResponse = await this.request('get', `query?query=${invoiceQuery}`);
      
      // Check if we got invoice data
      if (!invoiceResponse.QueryResponse.Invoice || invoiceResponse.QueryResponse.Invoice.length === 0) {
        logger.debug(`No invoice found with ID ${invoiceId}`);
        return null;
      }
      
      const invoice = invoiceResponse.QueryResponse.Invoice[0];
      const balance = parseFloat(invoice.Balance || 0);
      
      // If balance is 0, invoice is paid
      if (balance === 0) {
        logger.info(`Invoice ${invoiceId} is paid (balance: ${balance})`);
        return {
          paymentId: `payment-${invoiceId}`,
          paymentDate: new Date().toISOString().split('T')[0], // Today's date
          paymentMethod: 'QuickBooks Payment',
          amount: parseFloat(invoice.TotalAmt || 0),
          paymentRefNum: `Invoice ${invoiceId} - Paid in Full`
        };
      }
      
      // Invoice not paid
      logger.debug(`Invoice ${invoiceId} has balance ${balance} - not fully paid`);
      return null;
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

  /**
   * Updates an existing invoice in QuickBooks
   * @param {String} invoiceId - QuickBooks Invoice ID
   * @param {Object} updateData - Fields to update (Line items, TxnDate, DueDate, etc.)
   * @returns {Promise<Object>} - Updated invoice response
   */
  async updateInvoice(invoiceId, updateData) {
    try {
      logger.info(`Updating invoice in QuickBooks: ${invoiceId}`);

      // First, fetch the current invoice to get the SyncToken (required for updates)
      const currentInvoice = await this.getInvoice(invoiceId);

      if (!currentInvoice.Invoice && !currentInvoice.QueryResponse?.Invoice?.[0]) {
        throw new Error(`Invoice ${invoiceId} not found in QuickBooks`);
      }

      // Extract invoice from response structure
      const invoiceData = currentInvoice.Invoice || currentInvoice.QueryResponse.Invoice[0];

      // SyncToken is required for updates
      if (!invoiceData.SyncToken) {
        throw new Error(`Cannot update invoice: missing SyncToken. Invoice may be locked or deleted.`);
      }

      // Handle DYNAMIC ItemRef values in Line items (same as createInvoice does)
      if (updateData.Line && Array.isArray(updateData.Line)) {
        logger.debug(`Processing Line items for DYNAMIC ItemRef replacement`);

        const hasDynamicItem = updateData.Line.some(
          line => line?.SalesItemLineDetail?.ItemRef?.value === "DYNAMIC"
        );

        if (hasDynamicItem) {
          // Get first available QB item for dynamic ItemRef resolution
          const invoiceCurrency = normalizeCurrencyCode(invoiceData?.CurrencyRef?.value);
          const availableItem = await this.getFirstAvailableItem(invoiceCurrency);

          // Replace any "DYNAMIC" ItemRef values with actual QB item
          updateData.Line.forEach(line => {
            if (line.SalesItemLineDetail && line.SalesItemLineDetail.ItemRef && line.SalesItemLineDetail.ItemRef.value === "DYNAMIC") {
              logger.debug(`Replacing DYNAMIC ItemRef with QB item: ${availableItem.id}`);
              line.SalesItemLineDetail.ItemRef.value = availableItem.id;
              line.SalesItemLineDetail.ItemRef.name = availableItem.name;
            }
          });
        }
      }

      // Build the update request with SyncToken and ID
      const updatePayload = {
        ...invoiceData,
        ...updateData,
        SyncToken: invoiceData.SyncToken,
        Id: invoiceId
      };

      logger.debug(`Invoice update payload prepared`, {
        invoiceId,
        syncToken: invoiceData.SyncToken,
        fieldsToUpdate: Object.keys(updateData)
      });

      // Send the update request (QuickBooks requires ?operation=update)
      const updatedInvoice = await this.request('post', `invoice?operation=update`, updatePayload);

      logger.info(`Successfully updated invoice in QuickBooks: ${invoiceId}`, {
        invoiceId,
        updatedFields: Object.keys(updateData)
      });

      return updatedInvoice;
    } catch (error) {
      logger.error(`Error updating invoice ${invoiceId}:`, error);

      if (error.code) {
        throw error;
      }

      // Provide helpful error messages
      if (error.message.includes('SyncToken')) {
        throw new Error(`Cannot update invoice: ${error.message}. The invoice may have been modified. Try fetching the latest version first.`);
      } else if (error.message.includes('not found')) {
        throw new Error(`Invoice ${invoiceId} does not exist in QuickBooks`);
      } else if (error.message.includes('ItemRef')) {
        throw new Error(`Failed to update invoice: ${error.message}`);
      } else {
        throw new Error(`Failed to update invoice ${invoiceId}: ${error.message}`);
      }
    }
  }
}

module.exports = QuickBooksAPI;
