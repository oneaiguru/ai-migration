// Прямое исправление для invoice-mapper.js
// Сохраните этот файл как /Users/m/git/clients/qbsf/deployment/sf-qb-integration-final/src/services/invoice-mapper.js

/**
 * Модуль для преобразования данных между Salesforce и QuickBooks
 */
const logger = require('../utils/logger');
const config = require('../config');

// Константы для значений по умолчанию
const DEFAULT_ITEM_ID = '1'; // Используем строку, а не число
const DEFAULT_ITEM_NAME = 'Services';
const DEFAULT_TAX_CODE = 'NON';

/**
 * Преобразует Salesforce Opportunity в QuickBooks Invoice
 * @param {Object} opportunity - Данные Salesforce opportunity
 * @param {Object} accountData - Данные Salesforce account
 * @param {Array} lineItems - Строки Opportunity
 * @param {number} customerId - ID клиента в QuickBooks
 * @returns {Object} Объект счета QuickBooks
 */
function mapOpportunityToInvoice(opportunity, accountData, lineItems = [], customerId) {
  logger.info('Mapping Opportunity to Invoice', {
    opportunityId: opportunity.Id,
    customerId,
    lineItemCount: lineItems.length
  });

  try {
    // Создаем объект счета
    const invoice = {
      CustomerRef: {
        value: customerId
      },
      DocNumber: opportunity.Name || `INV-${Date.now()}`,
      TxnDate: new Date().toISOString().split('T')[0],
      BillEmail: {
        Address: accountData.Email || ''
      }
    };

    // Добавляем строки товаров/услуг (минимально необходимые поля)
    invoice.Line = [{
      Amount: opportunity.Amount || 1.00,
      DetailType: "SalesItemLineDetail",
      SalesItemLineDetail: {
        ItemRef: {
          value: DEFAULT_ITEM_ID,
          name: DEFAULT_ITEM_NAME
        },
        Qty: 1,
        UnitPrice: opportunity.Amount || 1.00
      },
      Description: `Service for ${opportunity.Name}`
    }];

    logger.info('Successfully mapped Opportunity to Invoice', {
      opportunityId: opportunity.Id,
      lineItems: invoice.Line.length
    });

    return invoice;
  } catch (error) {
    logger.error('Error mapping opportunity to invoice:', error);
    throw new Error(`Failed to map opportunity to invoice: ${error.message}`);
  }
}

module.exports = {
  mapOpportunityToInvoice
};