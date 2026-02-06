// salesforce-api.js - Добавляем методы для работы с SF Invoice

const axios = require('axios');
const config = require('../config');
const oauthManager = require('./oauth-manager');
const logger = require('../utils/logger');

class SalesforceAPI {
  /**
   * Получает токен доступа для указанного экземпляра Salesforce
   * @param {string} instanceUrl - URL экземпляра Salesforce
   * @returns {Promise<string>} Токен доступа
   */
  async getAccessToken(instanceUrl = null) {
    let effectiveInstanceUrl = instanceUrl;
    
    // Если не указан, используем инстанс по умолчанию
    if (!effectiveInstanceUrl) {
      const salesforceTokens = await oauthManager.getValidAccessToken('salesforce');
      effectiveInstanceUrl = salesforceTokens.instance_url;
    }
    
    // Получаем токен для указанного или используем токен по умолчанию
    const tokens = await oauthManager.getValidAccessTokenForInstance('salesforce', effectiveInstanceUrl);
    return tokens.access_token;
  }
  
  /**
   * Обеспечивает наличие токена для указанного экземпляра
   * @param {string} instanceUrl - URL экземпляра Salesforce
   */
  async ensureAccessTokenForInstance(instanceUrl) {
    if (!instanceUrl) {
      throw new Error('Instance URL is required');
    }
    
    try {
      await oauthManager.getValidAccessTokenForInstance('salesforce', instanceUrl);
    } catch (error) {
      logger.error('Unable to get token for instance:', {
        instanceUrl,
        error: error.message
      });
      throw new Error(`Unable to get token for instance: ${instanceUrl}`);
    }
  }
  
  /**
   * Выполняет запрос к API Salesforce
   * @param {string} method - Метод HTTP
   * @param {string} endpoint - Эндпоинт API
   * @param {Object} data - Данные запроса
   * @param {string} instanceUrl - URL экземпляра Salesforce
   * @returns {Promise<Object>} Ответ API
   */
  async request(method, endpoint, data = null, instanceUrl = null) {
    try {
      const requestId = `sf-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
      const startTime = Date.now();
      
      let effectiveInstanceUrl = instanceUrl;
      
      // Если не указан, используем инстанс по умолчанию
      if (!effectiveInstanceUrl) {
        const salesforceTokens = await oauthManager.getValidAccessToken('salesforce');
        effectiveInstanceUrl = salesforceTokens.instance_url;
      }
      
      // Получаем токен для указанного инстанса
      const accessToken = await this.getAccessToken(effectiveInstanceUrl);
      const apiVersion = config.salesforce.apiVersion || 'v56.0';
      
      const requestUrl = `${effectiveInstanceUrl}/services/data/${apiVersion}/${endpoint}`;
      
      logger.debug(`Salesforce API Request: ${method} ${endpoint}`, {
        requestId,
        method,
        endpoint,
        instanceUrl: effectiveInstanceUrl,
        apiVersion,
        dataSize: data ? JSON.stringify(data).length : 0
      });
      
      const response = await axios({
        method,
        url: requestUrl,
        data,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const duration = Date.now() - startTime;
      
      logger.debug(`Salesforce API Response: ${method} ${endpoint}`, {
        requestId,
        status: response.status,
        duration: `${duration}ms`,
        dataSize: response.data ? JSON.stringify(response.data).length : 0
      });
      
      return response.data;
    } catch (error) {
      // Обработка ошибок API Salesforce
      const errorResponse = error.response?.data;
      const statusCode = error.response?.status;
      const duration = Date.now() - startTime;
      
      let sfErrorCode = '';
      let sfErrorMessage = '';
      let sfErrorFields = [];
      
      // Анализ ошибки
      if (errorResponse) {
        if (Array.isArray(errorResponse)) {
          sfErrorCode = errorResponse[0]?.errorCode || '';
          sfErrorMessage = errorResponse[0]?.message || '';
          sfErrorFields = errorResponse[0]?.fields || [];
        } else {
          sfErrorCode = errorResponse.error || '';
          sfErrorMessage = errorResponse.error_description || errorResponse.message || '';
        }
      }
      
      // Категоризация ошибок
      const isAuthError = statusCode === 401 || sfErrorCode === 'INVALID_SESSION_ID';
      const isValidationError = statusCode === 400 || sfErrorCode === 'REQUIRED_FIELD_MISSING';
      const isPermissionError = statusCode === 403 || sfErrorCode === 'INSUFFICIENT_ACCESS';
      const isNotFoundError = statusCode === 404 || sfErrorCode === 'NOT_FOUND';
      const isServerError = statusCode >= 500;
      const isNetworkError = !error.response;
      
      logger.error(`Salesforce API Error:`, {
        requestId,
        method,
        endpoint,
        error: error.message,
        stack: error.stack,
        errorType: error.name,
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
        instanceUrl: effectiveInstanceUrl,
        requestURL: requestUrl,
        apiVersion,
        responseData: errorResponse
      });
      
      // Генерация понятного сообщения об ошибке
      let errorMessage = '';
      
      if (isAuthError) {
        errorMessage = `Authentication error with Salesforce API: ${sfErrorMessage || error.message}`;
      } else if (isValidationError) {
        errorMessage = `Validation error in Salesforce API: ${sfErrorMessage || error.message}`;
      } else if (isPermissionError) {
        errorMessage = `Permission error with Salesforce API: ${sfErrorMessage || error.message}`;
      } else if (isNotFoundError) {
        errorMessage = `Resource not found in Salesforce API: ${sfErrorMessage || error.message}`;
      } else if (isServerError) {
        errorMessage = `Salesforce API server error: ${sfErrorMessage || error.message}`;
      } else if (isNetworkError) {
        errorMessage = `Network error connecting to Salesforce API: ${error.message}. Check your internet connection and verify the instance URL: ${effectiveInstanceUrl}`;
      } else {
        errorMessage = `Error with Salesforce API: ${sfErrorMessage || error.message}`;
      }
      
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Получает счет по ID из Salesforce
   * @param {string} invoiceId - ID счета
   * @param {string} instanceUrl - URL экземпляра Salesforce
   * @returns {Promise<Object>} Данные счета
   */
  async getInvoiceById(invoiceId, instanceUrl = null) {
    try {
      logger.info(`Fetching Invoice data from Salesforce: ${invoiceId}`);
      
      // Получаем данные счета
      const invoiceData = await this.request(
        'get',
        `sobjects/invgen__Invoice__c/${invoiceId}`,
        null,
        instanceUrl
      );
      
      if (!invoiceData) {
        logger.error(`Invoice ${invoiceId} not found in Salesforce`);
        return null;
      }
      
      // Получаем данные аккаунта
      const accountData = await this.request(
        'get',
        `sobjects/Account/${invoiceData.invgen__Account__c}`,
        null,
        instanceUrl
      );
      
      // Получаем строки счета
      const lineItemsQuery = [
        `SELECT Id, invgen__Description__c, invgen__Product__c, `,
        `invgen__Quantity__c, invgen__Unit_Price__c, invgen__Total__c, `,
        `invgen__Product__r.Name, invgen__Product__r.QB_Item_ID__c `,
        `FROM invgen__Invoice_Line_Item__c `,
        `WHERE invgen__Invoice__c = '${invoiceId}'`
      ].join('');
      
      const lineItemsResponse = await this.request(
        'get',
        `query/?q=${encodeURIComponent(lineItemsQuery)}`,
        null,
        instanceUrl
      );
      
      // Формируем полный объект счета с вложенными данными
      const fullInvoice = {
        ...invoiceData,
        Account: accountData,
        lineItems: (lineItemsResponse.records || []).map(record => ({
          id: record.Id,
          description: record.invgen__Description__c,
          productId: record.invgen__Product__c,
          quantity: record.invgen__Quantity__c,
          unitPrice: record.invgen__Unit_Price__c,
          amount: record.invgen__Total__c,
          product: record.invgen__Product__c ? {
            id: record.invgen__Product__r?.QB_Item_ID__c,
            name: record.invgen__Product__r?.Name
          } : null
        })),
        billingAddress: {
          street: invoiceData.invgen__Billing_Street__c,
          city: invoiceData.invgen__Billing_City__c,
          state: invoiceData.invgen__Billing_State__c,
          postalCode: invoiceData.invgen__Billing_Postal_Code__c,
          country: invoiceData.invgen__Billing_Country__c
        }
      };
      
      return fullInvoice;
    } catch (error) {
      logger.error(`Error fetching invoice ${invoiceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Обновляет счет в Salesforce со статусом оплаты
   * @param {string} invoiceId - ID счета
   * @param {string} status - Статус оплаты
   * @param {string} paymentDate - Дата оплаты
   * @param {string} instanceUrl - URL экземпляра Salesforce
   */
  async updateInvoiceAsPaid(invoiceId, status = 'Paid', paymentDate = null, instanceUrl = null) {
    try {
      const updateData = {
        invgen__Status__c: status,
        invgen__Payment_Date__c: paymentDate || new Date().toISOString().split('T')[0]
      };
      
      await this.request(
        'patch',
        `sobjects/invgen__Invoice__c/${invoiceId}`,
        updateData,
        instanceUrl
      );
      
      logger.info(`Updated invoice ${invoiceId} as ${status}`);
      return true;
    } catch (error) {
      logger.error(`Error updating invoice ${invoiceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Обновляет счет в Salesforce с ID из QuickBooks
   * @param {string} invoiceId - ID счета в Salesforce
   * @param {string} qbInvoiceId - ID счета в QuickBooks
   * @param {string} instanceUrl - URL экземпляра Salesforce
   */
  async updateSalesforceInvoiceWithQBId(invoiceId, qbInvoiceId, instanceUrl = null) {
    try {
      const updateData = {
        invgen__QB_Invoice_ID__c: qbInvoiceId,
        invgen__Last_Sync_Date__c: new Date().toISOString(),
        invgen__Sync_Status__c: 'Synced'
      };
      
      await this.request(
        'patch',
        `sobjects/invgen__Invoice__c/${invoiceId}`,
        updateData,
        instanceUrl
      );
      
      logger.info(`Updated Salesforce invoice ${invoiceId} with QuickBooks ID ${qbInvoiceId}`);
      return true;
    } catch (error) {
      logger.error(`Error updating invoice ${invoiceId} with QB ID:`, error);
      throw error;
    }
  }
  
  /**
   * Закрывает сделку как выигранную
   * @param {string} opportunityId - ID сделки
   * @param {string} description - Описание
   * @param {string} instanceUrl - URL экземпляра Salesforce
   */
  async closeOpportunityAsWon(opportunityId, description = '', instanceUrl = null) {
    try {
      const updateData = {
        StageName: 'Closed Won',
        Description: description
      };
      
      await this.request(
        'patch',
        `sobjects/Opportunity/${opportunityId}`,
        updateData,
        instanceUrl
      );
      
      logger.info(`Closed opportunity ${opportunityId} as won`);
      return true;
    } catch (error) {
      logger.error(`Error closing opportunity ${opportunityId}:`, error);
      throw error;
    }
  }
  
  /**
   * Получает неоплаченные счета из Salesforce
   * @param {string} instanceUrl - URL экземпляра Salesforce
   * @returns {Promise<Array>} Список неоплаченных счетов
   */
  async getUnpaidInvoices(instanceUrl = null) {
    try {
      logger.info('Fetching unpaid invoices from Salesforce');
      
      const query = [
        `SELECT Id, Name, invgen__QB_Invoice_ID__c, invgen__Status__c, `,
        `invgen__Amount__c, invgen__Due_Date__c, invgen__Opportunity__c `,
        `FROM invgen__Invoice__c `,
        `WHERE invgen__Status__c != 'Paid' `,
        `AND invgen__QB_Invoice_ID__c != null`
      ].join('');
      
      const response = await this.request(
        'get',
        `query/?q=${encodeURIComponent(query)}`,
        null,
        instanceUrl
      );
      
      if (!response || !response.records) {
        logger.warn('No unpaid invoices found');
        return [];
      }
      
      return response.records;
    } catch (error) {
      logger.error('Error getting unpaid invoices from Salesforce:', error);
      
      // Преобразуем детали ошибки в понятный формат
      const errorDetails = {
        error: error.message,
        stack: error.stack,
        instanceUrl: instanceUrl || 'Default instance',
        operation: 'getUnpaidInvoices',
        query: 'SELECT Id, Name, invgen__QB_Invoice_ID__c FROM invgen__Invoice__c WHERE invgen__Status__c != \'Paid\' AND invgen__QB_Invoice_ID__c != null'
      };
      
      throw new Error(`Failed to retrieve unpaid invoices from Salesforce: ${error.message}`);
    }
  }
}

module.exports = new SalesforceAPI();