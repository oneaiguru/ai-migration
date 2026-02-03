const logger = require('../utils/logger');

/**
 * Maps Salesforce Opportunity data to QuickBooks Invoice structure
 * @param {Object} opportunity - The Salesforce Opportunity record
 * @param {Object} account - The related Salesforce Account record
 * @param {Array} products - The related Opportunity Products
 * @param {String} qbCustomerId - The QuickBooks Customer ID for this account
 * @returns {Object} - QuickBooks Invoice object ready for API submission
 */
function mapOpportunityToInvoice(opportunity, account, products, qbCustomerId) {
  logger.info(`Mapping Opportunity ${opportunity.Id} to QuickBooks Invoice`);
  
  try {
    // Create Invoice line items from Opportunity products
    const lineItems = products.map(product => ({
      DetailType: "SalesItemLineDetail",
      Amount: product.TotalPrice,
      SalesItemLineDetail: {
        ItemRef: {
          value: product.Product2 && product.Product2.QB_Item_ID__c ? product.Product2.QB_Item_ID__c : "DYNAMIC", // Will be replaced with first available QB item
          name: product.Product2 ? product.Product2.Name : "Service"
        },
        Qty: product.Quantity,
        UnitPrice: product.UnitPrice
      },
      Description: product.Product2 && product.Product2.Description ? product.Product2.Description : (product.Product2 ? product.Product2.Name : "Product")
    }));

    // Create Invoice object structure according to QuickBooks API
    const invoice = {
      CustomerRef: {
        value: qbCustomerId,
        name: account.Name
      },
      Line: lineItems,
      TxnDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      DueDate: opportunity.CloseDate, // Use Opportunity close date as due date
      DocNumber: opportunity.Opportunity_Number__c || opportunity.Id, // Custom field or default to Id
      PrivateNote: `Created from Salesforce Opportunity: ${opportunity.Name}`,
      CustomerMemo: {
        value: opportunity.Description || ''
      }
    };
    
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
  mapOpportunityToInvoice
};
