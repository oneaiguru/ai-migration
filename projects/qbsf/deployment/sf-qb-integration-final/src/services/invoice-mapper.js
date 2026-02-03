/**
 * Модуль для преобразования данных между Salesforce и QuickBooks
 */
const logger = require('../utils/logger');

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
    // Создаем объект счета с минимальным набором полей
    const invoice = {
      CustomerRef: {
        value: customerId
      },
      DocNumber: opportunity.Name || `INV-${Date.now()}`,
      TxnDate: new Date().toISOString().split('T')[0],
      Line: [{
        Amount: opportunity.Amount || 1.00,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: {
            value: "1", // Используем строку, а не число
            name: "Services"
          },
          Qty: 1,
          UnitPrice: opportunity.Amount || 1.00
        },
        Description: `Service for ${opportunity.Name || 'Opportunity'}`
      }]
    };

    logger.info('Successfully mapped Opportunity to Invoice', {
      opportunityId: opportunity.Id,
      lineItems: invoice.Line.length,
      total: invoice.Line[0].Amount
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
