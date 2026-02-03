const QuickBooks = require('node-quickbooks');
const oauthManager = require('./oauth-manager');
const config = require('../config');

// Get a QuickBooks client instance for a specific realm
const getQBClient = async (realmId) => {
  try {
    // Get a valid access token for this realm
    const accessToken = await oauthManager.getQuickBooksAccessToken(realmId);
    
    // Create and return the QuickBooks client
    return new QuickBooks(
      config.quickbooks.clientId,
      config.quickbooks.clientSecret,
      accessToken,
      false, // no token secret for OAuth2
      realmId,
      config.quickbooks.environment === 'sandbox',
      false, // debugging
      null, // minor version
      '2.0' // OAuth version
    );
  } catch (error) {
    console.error(`Error getting QuickBooks client for realm ${realmId}:`, error);
    throw error;
  }
};

// Find or create a customer in QuickBooks
const findOrCreateCustomer = async (realmId, customerData) => {
  const qbo = await getQBClient(realmId);
  
  return new Promise((resolve, reject) => {
    // First try to find the customer by display name
    qbo.findCustomers([
      { field: 'DisplayName', value: customerData.DisplayName, operator: '=' }
    ], function(err, customers) {
      if (err) {
        // If there's a query error, try to create the customer
        qbo.createCustomer(customerData, function(err, customer) {
          if (err) {
            reject(err);
            return;
          }
          resolve(customer.Id);
        });
        return;
      }
      
      // If customer exists, return the ID
      if (customers && customers.QueryResponse && customers.QueryResponse.Customer && customers.QueryResponse.Customer.length > 0) {
        resolve(customers.QueryResponse.Customer[0].Id);
      } else {
        // If customer doesn't exist, create a new one
        qbo.createCustomer(customerData, function(err, customer) {
          if (err) {
            reject(err);
            return;
          }
          resolve(customer.Id);
        });
      }
    });
  });
};

// Find or create a product/item in QuickBooks
const findOrCreateItem = async (realmId, productName, productCode, unitPrice) => {
  const qbo = await getQBClient(realmId);
  
  return new Promise((resolve, reject) => {
    // First try to find the item by name
    qbo.findItems([
      { field: 'Name', value: productName, operator: '=' }
    ], function(err, items) {
      if (err) {
        // If there's a query error, create a generic item
        createGenericItem();
        return;
      }
      
      // If item exists, return the ID
      if (items && items.QueryResponse && items.QueryResponse.Item && items.QueryResponse.Item.length > 0) {
        resolve(items.QueryResponse.Item[0].Id);
      } else {
        // If item doesn't exist, create a new one
        createGenericItem();
      }
    });
    
    function createGenericItem() {
      // Get income account first
      qbo.findAccounts([
        { field: 'AccountType', value: 'Income', operator: '=' }
      ], function(err, accounts) {
        if (err) {
          reject(err);
          return;
        }
        
        // Use the first income account or default
        let incomeAccountId = 1; // Default
        if (accounts && accounts.QueryResponse && accounts.QueryResponse.Account && accounts.QueryResponse.Account.length > 0) {
          incomeAccountId = accounts.QueryResponse.Account[0].Id;
        }
        
        // Create a generic service item
        const itemData = {
          Name: productName || `Product ${productCode || 'Unknown'}`,
          IncomeAccountRef: {
            value: incomeAccountId
          },
          Type: 'Service',
          UnitPrice: unitPrice || 0
        };
        
        qbo.createItem(itemData, function(err, item) {
          if (err) {
            reject(err);
            return;
          }
          resolve(item.Id);
        });
      });
    }
  });
};

// Create invoice in QuickBooks
const createInvoice = async (realmId, invoiceData) => {
  const qbo = await getQBClient(realmId);
  
  return new Promise((resolve, reject) => {
    qbo.createInvoice(invoiceData, function(err, invoice) {
      if (err) {
        reject(err);
        return;
      }
      resolve(invoice);
    });
  });
};

// Create QuickBooks invoice from Salesforce opportunity data
const createInvoiceFromOpportunity = async (realmId, opportunityData) => {
  // Create or find customer in QuickBooks
  const customerData = {
    DisplayName: opportunityData.account.Name,
    PrimaryEmailAddr: {
      Address: opportunityData.account.Email || ''
    },
    PrimaryPhone: {
      FreeFormNumber: opportunityData.account.Phone || ''
    },
    BillAddr: {
      Line1: opportunityData.account.BillingStreet || '',
      City: opportunityData.account.BillingCity || '',
      CountrySubDivisionCode: opportunityData.account.BillingState || '',
      PostalCode: opportunityData.account.BillingPostalCode || '',
      Country: opportunityData.account.BillingCountry || ''
    }
  };
  
  const customerId = await findOrCreateCustomer(realmId, customerData);
  
  // Process line items and create or find items in QuickBooks
  const linePromises = await Promise.all(opportunityData.lineItems.map(async (item) => {
    const itemId = await findOrCreateItem(
      realmId,
      item.PricebookEntry.Product2.Name,
      item.PricebookEntry.Product2.ProductCode,
      item.UnitPrice
    );
    
    return {
      Amount: item.UnitPrice * item.Quantity,
      DetailType: 'SalesItemLineDetail',
      SalesItemLineDetail: {
        ItemRef: {
          value: itemId
        },
        Qty: item.Quantity,
        UnitPrice: item.UnitPrice
      },
      Description: item.PricebookEntry.Product2.Name
    };
  }));
  
  // Create invoice data
  const invoiceData = {
    CustomerRef: {
      value: customerId
    },
    Line: linePromises,
    DocNumber: opportunityData.opportunity.Name.substring(0, 20),
    TxnDate: new Date().toISOString().split('T')[0],
    CustomerMemo: {
      value: `Created from Salesforce Opportunity: ${opportunityData.opportunity.Name}`
    }
  };
  
  // Create invoice
  return await createInvoice(realmId, invoiceData);
};

module.exports = {
  getQBClient,
  findOrCreateCustomer,
  findOrCreateItem,
  createInvoice,
  createInvoiceFromOpportunity
};