// scripts/create-test-invoice.js
const oauthManager = require('../src/services/oauth-manager');
const salesforceApi = require('../src/services/salesforce');
const quickbooksApi = require('../src/services/quickbooks');

/**
 * Create a test invoice in QuickBooks based on a Salesforce opportunity
 * @param {string} opportunityId - Salesforce Opportunity ID
 * @param {string} salesforceInstance - Salesforce instance URL
 * @param {string} quickbooksRealmId - QuickBooks realm ID
 * @param {boolean} useDefaultItems - Whether to use default items if no line items are found
 * @returns {Promise<Object>} - Created invoice data
 */
async function createTestInvoice(opportunityId, salesforceInstance, quickbooksRealmId, useDefaultItems = true) {
  try {
    console.log(`Creating test invoice for opportunity ${opportunityId}`);
    console.log(`Salesforce Instance: ${salesforceInstance}`);
    console.log(`QuickBooks Realm ID: ${quickbooksRealmId}`);
    
    // Get opportunity data from Salesforce
    const conn = await salesforceApi.createConnection(salesforceInstance);
    
    // Query the opportunity with account fields
    const oppQuery = `
      SELECT Id, Name, StageName, CloseDate, Amount,
             Account.Id, Account.Name, Account.BillingStreet, Account.BillingCity,
             Account.BillingState, Account.BillingPostalCode, Account.BillingCountry,
             Account.Phone
      FROM Opportunity
      WHERE Id = '${opportunityId}'
    `;
    
    const oppResult = await conn.query(oppQuery);
    
    if (oppResult.records.length === 0) {
      throw new Error(`Opportunity with ID ${opportunityId} not found.`);
    }
    
    const opportunity = oppResult.records[0];
    console.log(`Found opportunity: ${opportunity.Name}`);
    
    // Get line items
    const lineItemsQuery = `
      SELECT Id, Quantity, UnitPrice, TotalPrice, PricebookEntry.Product2.Name,
             PricebookEntry.Product2.ProductCode, Description
      FROM OpportunityLineItem
      WHERE OpportunityId = '${opportunityId}'
    `;
    
    const lineItemsResult = await conn.query(lineItemsQuery);
    const lineItems = lineItemsResult.records;
    console.log(`Found ${lineItems.length} line items for opportunity`);
    
    // Create or find customer in QuickBooks
    const customerData = {
      DisplayName: opportunity.Account.Name,
      PrimaryEmailAddr: {
        Address: opportunity.Account.Email || 'example@example.com'
      },
      PrimaryPhone: {
        FreeFormNumber: opportunity.Account.Phone || ''
      },
      BillAddr: {
        Line1: opportunity.Account.BillingStreet || '',
        City: opportunity.Account.BillingCity || '',
        CountrySubDivisionCode: opportunity.Account.BillingState || '',
        PostalCode: opportunity.Account.BillingPostalCode || '',
        Country: opportunity.Account.BillingCountry || ''
      }
    };
    
    const qbo = await quickbooksApi.getQBClient(quickbooksRealmId);
    const customerId = await quickbooksApi.findOrCreateCustomer(quickbooksRealmId, customerData);
    console.log(`Using QuickBooks customer ID: ${customerId}`);
    
    // Process line items
    let invoiceLineItems = [];
    
    if (lineItems.length > 0) {
      // Use actual line items if they exist
      for (const item of lineItems) {
        // Find or create item in QuickBooks
        const productName = item.PricebookEntry?.Product2?.Name || 'Unknown Product';
        const productCode = item.PricebookEntry?.Product2?.ProductCode || '';
        const unitPrice = item.UnitPrice || 0;
        const quantity = item.Quantity || 1;
        
        const itemId = await quickbooksApi.findOrCreateItem(
          quickbooksRealmId,
          productName,
          productCode,
          unitPrice
        );
        
        invoiceLineItems.push({
          Amount: unitPrice * quantity,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: {
              value: itemId
            },
            Qty: quantity,
            UnitPrice: unitPrice
          },
          Description: productName
        });
      }
    } else if (useDefaultItems) {
      // Use default items if no line items are found
      console.log('No line items found, using default items based on opportunity name and amount');
      
      // Since we observed these opportunities don't have Amount values, we'll use a default price
      // based on the opportunity name patterns
      let amount = 500;  // Default amount
      
      // Try to determine a more specific amount based on the opportunity name
      if (opportunity.Name.includes('Summit')) {
        amount = 1000;
      } else if (opportunity.Name.includes('Network')) {
        amount = 750;
      } else if (opportunity.Name.includes('Cargo')) {
        amount = 1200;
      }
      
      const description = opportunity.Name || 'Service';
      
      // Create a generic item for this opportunity
      const itemId = await quickbooksApi.findOrCreateItem(
        quickbooksRealmId,
        description,
        'SERVICE',
        amount
      );
      
      invoiceLineItems.push({
        Amount: amount,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: {
            value: itemId
          },
          Qty: 1,
          UnitPrice: amount
        },
        Description: description
      });
    } else {
      throw new Error('No line items found and useDefaultItems is false');
    }
    
    // Create invoice data
    const invoiceData = {
      CustomerRef: {
        value: customerId
      },
      Line: invoiceLineItems,
      DocNumber: opportunity.Name.substring(0, 20),
      TxnDate: new Date().toISOString().split('T')[0],
      CustomerMemo: {
        value: `Created from Salesforce Opportunity: ${opportunity.Name} (${opportunity.Id})`
      }
    };
    
    // Create invoice
    console.log('Creating invoice in QuickBooks...');
    const invoice = await quickbooksApi.createInvoice(quickbooksRealmId, invoiceData);
    console.log(`Successfully created invoice with ID: ${invoice.Id}`);
    
    // Update opportunity with invoice ID
    try {
      await conn.sobject('Opportunity').update({
        Id: opportunityId,
        QB_Invoice_ID__c: invoice.Id
      });
      console.log(`Updated Salesforce opportunity ${opportunityId} with QuickBooks invoice ID ${invoice.Id}`);
    } catch (err) {
      console.warn(`Warning: Could not update opportunity with invoice ID: ${err.message}`);
    }
    
    return invoice;
  } catch (error) {
    console.error('Error creating test invoice:', error.message);
    throw error;
  }
}

// Execute if called directly
if (require.main === module) {
  // Check if required arguments are provided
  const opportunityId = process.argv[2];
  
  if (!opportunityId) {
    console.error('Error: Opportunity ID is required');
    console.log('Usage: node create-test-invoice.js <opportunityId>');
    process.exit(1);
  }
  
  // Get instance and realm from tokens
  const tokens = oauthManager.initializeTokenStorage();
  const salesforceInstance = Object.keys(tokens.salesforce)[0];
  const quickbooksRealmId = Object.keys(tokens.quickbooks)[0];
  
  if (!salesforceInstance) {
    console.error('Error: No Salesforce connection found. Please authenticate first.');
    process.exit(1);
  }
  
  if (!quickbooksRealmId) {
    console.error('Error: No QuickBooks connection found. Please authenticate first.');
    process.exit(1);
  }
  
  // Create the test invoice
  createTestInvoice(opportunityId, salesforceInstance, quickbooksRealmId)
    .then(invoice => {
      console.log('\nInvoice created successfully:');
      console.log(JSON.stringify({
        id: invoice.Id,
        docNumber: invoice.DocNumber,
        customer: invoice.CustomerRef.name,
        date: invoice.TxnDate,
        amount: invoice.TotalAmt
      }, null, 2));
    })
    .catch(error => {
      console.error('\nError:', error.message);
      process.exit(1);
    });
}

module.exports = {
  createTestInvoice
};