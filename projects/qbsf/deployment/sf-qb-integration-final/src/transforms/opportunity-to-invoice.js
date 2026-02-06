const logger = require('../utils/logger');

const roundToCurrency = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const normalizeQuantity = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};
const normalizeAmount = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? roundToCurrency(numericValue) : null;
};

const resolveUnitPrice = (product, quantity) => {
  const directUnitPrice = normalizeAmount(product.UnitPrice);
  if (directUnitPrice !== null) {
    return { value: directUnitPrice, source: 'unitPrice' };
  }
  const totalPrice = normalizeAmount(product.TotalPrice);
  if (totalPrice !== null && quantity) {
    return { value: roundToCurrency(totalPrice / quantity), source: 'totalPrice' };
  }
  return { value: 0, source: 'default' };
};

const resolveLineAmount = (totalPrice, unitPrice, quantity, unitPriceSource) => {
  if (totalPrice === null) {
    return roundToCurrency(unitPrice * quantity);
  }
  if (!quantity) {
    return totalPrice;
  }
  if (unitPriceSource === 'totalPrice') {
    return roundToCurrency(unitPrice * quantity);
  }
  return totalPrice;
};

const convertProductsForCurrency = (products, fxRate) =>
  products.map((product) => {
    const qty = normalizeQuantity(product.Quantity);
    const totalPrice = normalizeAmount(product.TotalPrice);
    const { value: unitPrice } = resolveUnitPrice(product, qty);

    // Derive UnitPrice first, then recompute TotalPrice to ensure Amount === UnitPrice * Qty after rounding.
    const sourceTotal = totalPrice !== null ? totalPrice : unitPrice * qty;
    const convertedUnitPrice = qty
      ? roundToCurrency((sourceTotal * fxRate) / qty)
      : roundToCurrency(unitPrice * fxRate);
    const convertedTotal = qty
      ? roundToCurrency(convertedUnitPrice * qty)
      : roundToCurrency(sourceTotal * fxRate);
    return {
      ...product,
      UnitPrice: convertedUnitPrice,
      TotalPrice: convertedTotal
    };
  });

/**
 * Maps Salesforce Opportunity data to QuickBooks Invoice structure
 * @param {Object} opportunity - The Salesforce Opportunity record
 * @param {Object} account - The related Salesforce Account record
 * @param {Array} products - The related Opportunity Products
 * @param {String} qbCustomerId - The QuickBooks Customer ID for this account
 * @param {String} billingEmail - Email address for BillEmail (required for payment links)
 * @param {String} currency - Currency code (ISO 4217, e.g., 'EUR', 'USD')
 * @returns {Object} - QuickBooks Invoice object ready for API submission
 */
function mapOpportunityToInvoice(opportunity, account, products, qbCustomerId, billingEmail = '', currency = 'USD') {
  logger.info(`Mapping Opportunity ${opportunity.Id} to QuickBooks Invoice`);
  
  try {
    // Create Invoice line items from Opportunity products
    const lineItems = products.map(product => {
      const qty = normalizeQuantity(product.Quantity);
      const totalPrice = normalizeAmount(product.TotalPrice);
      const { value: unitPrice, source: unitPriceSource } = resolveUnitPrice(product, qty);
      const lineAmount = resolveLineAmount(totalPrice, unitPrice, qty, unitPriceSource);

      return {
        DetailType: "SalesItemLineDetail",
        Amount: lineAmount,
        SalesItemLineDetail: {
          ItemRef: {
            value: product.Product2 && product.Product2.QB_Item_ID__c ? product.Product2.QB_Item_ID__c : "DYNAMIC", // Will be replaced with first available QB item
            name: product.Product2 ? product.Product2.Name : "Service"
          },
          Qty: qty,
          UnitPrice: unitPrice
        },
        Description: product.Product2 && product.Product2.Description ? product.Product2.Description : (product.Product2 ? product.Product2.Name : "Product")
      };
    });

    // Create Invoice object structure according to QuickBooks API
    const invoice = {
      CustomerRef: {
        value: qbCustomerId,
        name: account.Name
      },
      CurrencyRef: {
        value: currency
      },
      Line: lineItems,
      TxnDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      DueDate: opportunity.CloseDate, // Use Opportunity close date as due date
      DocNumber: opportunity.Opportunity_Number__c || opportunity.Id, // Custom field or default to Id
      PrivateNote: `SF_OPP:${opportunity.Id} | Created: ${new Date().toISOString()}`,
      CustomerMemo: {
        value: opportunity.Description || ''
      },
      // Enable online payment to generate payment link
      AllowOnlineCreditCardPayment: true,
      AllowOnlineACHPayment: true,
      // BillEmail is REQUIRED for QuickBooks to generate payment links
      ...(billingEmail && {
        BillEmail: {
          Address: billingEmail
        }
      })
    };

    // Log currency for debugging
    logger.info(`Invoice will be created in ${currency} for Opportunity ${opportunity.Id}`);

    // Log whether BillEmail was set (critical for payment link generation)
    if (billingEmail) {
      logger.info(`Invoice will have BillEmail: ${billingEmail} (payment link should be generated)`);
    } else {
      logger.warn(`Invoice will NOT have BillEmail - payment link will NOT be generated!`);
    }
    
    // Add custom fields if needed
    if (opportunity.PO_Number__c) {
      invoice.CustomField = [{
        DefinitionId: "1", // This ID should match your QB custom field definition
        Name: "PO Number",
        Type: "StringType",
        StringValue: opportunity.PO_Number__c
      }];
    }
    
    logger.info('Successfully mapped Opportunity to Invoice', { 
      opportunityId: opportunity.Id,
      lineItems: lineItems.length
    });
    
    return invoice;
  } catch (error) {
    logger.error('Error mapping Opportunity to Invoice:', error);
    throw new Error(`Failed to map Opportunity to Invoice: ${error.message}`);
  }
}

module.exports = {
  mapOpportunityToInvoice,
  convertProductsForCurrency
};
