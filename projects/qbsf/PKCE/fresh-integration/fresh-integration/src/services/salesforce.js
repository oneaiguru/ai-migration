const jsforce = require('jsforce');
const oauthManager = require('./oauth-manager');

// Create a connection to Salesforce using stored access token
const createConnection = async (instanceUrl) => {
  try {
    // Get a valid access token for this instance
    const accessToken = await oauthManager.getSalesforceAccessToken(instanceUrl);
    
    // Create connection
    const conn = new jsforce.Connection({
      instanceUrl: instanceUrl,
      accessToken: accessToken
    });
    
    console.log(`Connected to Salesforce instance: ${instanceUrl}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to Salesforce:', error.message);
    throw error;
  }
};

// Get an opportunity by ID
const getOpportunity = async (opportunityId, instanceUrl) => {
  try {
    const conn = await createConnection(instanceUrl);
    
    const opportunity = await conn.sobject('Opportunity')
      .retrieve(opportunityId);
    
    // Get associated account
    const account = await conn.sobject('Account')
      .retrieve(opportunity.AccountId);
    
    // Get opportunity line items
    const lineItems = await conn.query(
      `SELECT Id, Quantity, UnitPrice, PricebookEntry.Product2.Name,
       PricebookEntry.Product2.ProductCode
       FROM OpportunityLineItem 
       WHERE OpportunityId = '${opportunityId}'`
    );
    
    return {
      opportunity,
      account,
      lineItems: lineItems.records
    };
  } catch (error) {
    console.error('Error getting opportunity:', error.message);
    throw error;
  }
};

// Update opportunity with QuickBooks invoice ID
const updateOpportunityWithInvoiceId = async (opportunityId, invoiceId, instanceUrl) => {
  try {
    const conn = await createConnection(instanceUrl);
    
    // Check if QB_Invoice_ID__c field exists
    // If not, you might need to create a custom field or use a different field
    let updateField = 'QB_Invoice_ID__c';
    
    // Attempt to update with the QuickBooks invoice ID
    const result = await conn.sobject('Opportunity')
      .update({
        Id: opportunityId,
        [updateField]: invoiceId
      });
    
    return result;
  } catch (error) {
    console.error('Error updating opportunity:', error.message);
    throw error;
  }
};

module.exports = {
  createConnection,
  getOpportunity,
  updateOpportunityWithInvoiceId
};