// scripts/opportunity-query.js
const jsforce = require('jsforce');
const path = require('path');
const fs = require('fs');
const oauthManager = require('../src/services/oauth-manager');

/**
 * Query Salesforce for opportunities that meet specified criteria
 * @param {Object} options - Query options
 * @param {string} options.instanceUrl - Salesforce instance URL
 * @param {string} options.stage - Opportunity stage to filter by (e.g., 'Closed Won')
 * @param {number} options.days - Number of days to look back for opportunities
 * @param {boolean} options.pendingInvoice - If true, find opportunities without QB invoice
 * @param {number} options.limit - Maximum number of opportunities to return
 * @returns {Promise<Array>} - Array of opportunity records
 */
async function queryOpportunities(options = {}) {
  const {
    instanceUrl = Object.keys(oauthManager.initializeTokenStorage().salesforce)[0],
    stage = 'Closed Won',
    days = 30,
    pendingInvoice = true,
    limit = 10
  } = options;
  
  if (!instanceUrl) {
    throw new Error('No Salesforce instance available. Please authenticate first.');
  }
  
  try {
    // Get access token
    const accessToken = await oauthManager.getSalesforceAccessToken(instanceUrl);
    
    // Create connection
    const conn = new jsforce.Connection({
      instanceUrl: instanceUrl,
      accessToken: accessToken
    });
    
    console.log(`Connected to Salesforce instance: ${instanceUrl}`);
    
    // Build query conditions
    const conditions = [];
    
    // Stage condition
    if (stage) {
      conditions.push(`StageName = '${stage}'`);
    }
    
    // Date condition
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - days);
      const dateStr = date.toISOString().split('T')[0];
      conditions.push(`CloseDate >= ${dateStr}`);
    }
    
    // Pending invoice condition (we use a custom field 'QB_Invoice_ID__c')
    // Note: You might need to adjust this based on your actual Salesforce schema
    if (pendingInvoice) {
      conditions.push(`(QB_Invoice_ID__c = null OR QB_Invoice_ID__c = '')`);
    }
    
    // Build the full query
    let query = `
      SELECT Id, Name, StageName, CloseDate, Amount, AccountId,
             Account.Name, Account.BillingStreet, Account.BillingCity,
             Account.BillingState, Account.BillingPostalCode, Account.BillingCountry,
             Account.Phone, Account.Email__c
      FROM Opportunity
      WHERE ${conditions.join(' AND ')}
      ORDER BY CloseDate DESC
      LIMIT ${limit}
    `;
    
    console.log('Executing query:', query);
    
    // Execute query
    const result = await conn.query(query);
    console.log(`Found ${result.records.length} opportunities.`);
    
    // For each opportunity, get the line items
    const opportunitiesWithLineItems = await Promise.all(
      result.records.map(async (opp) => {
        const lineItemsQuery = `
          SELECT Id, Quantity, UnitPrice, TotalPrice, PricebookEntry.Product2.Name,
                 PricebookEntry.Product2.ProductCode, PricebookEntry.Product2.Description,
                 Description
          FROM OpportunityLineItem
          WHERE OpportunityId = '${opp.Id}'
        `;
        
        const lineItems = await conn.query(lineItemsQuery);
        
        return {
          opportunity: opp,
          lineItems: lineItems.records
        };
      })
    );
    
    return opportunitiesWithLineItems;
  } catch (error) {
    console.error('Error querying opportunities:', error.message);
    throw error;
  }
}

/**
 * Get a single opportunity by ID with all related data
 * @param {string} opportunityId - The Salesforce Opportunity ID
 * @param {string} instanceUrl - The Salesforce instance URL
 * @returns {Promise<Object>} - Opportunity data with related records
 */
async function getOpportunityById(opportunityId, instanceUrl) {
  if (!instanceUrl) {
    instanceUrl = Object.keys(oauthManager.initializeTokenStorage().salesforce)[0];
  }
  
  if (!instanceUrl) {
    throw new Error('No Salesforce instance available. Please authenticate first.');
  }
  
  try {
    // Get access token
    const accessToken = await oauthManager.getSalesforceAccessToken(instanceUrl);
    
    // Create connection
    const conn = new jsforce.Connection({
      instanceUrl: instanceUrl,
      accessToken: accessToken
    });
    
    console.log(`Connected to Salesforce instance: ${instanceUrl}`);
    
    // Query the opportunity with account fields
    const oppQuery = `
      SELECT Id, Name, StageName, CloseDate, Amount,
             Account.Id, Account.Name, Account.BillingStreet, Account.BillingCity,
             Account.BillingState, Account.BillingPostalCode, Account.BillingCountry,
             Account.Phone, Account.Email__c
      FROM Opportunity
      WHERE Id = '${opportunityId}'
    `;
    
    const oppResult = await conn.query(oppQuery);
    
    if (oppResult.records.length === 0) {
      throw new Error(`Opportunity with ID ${opportunityId} not found.`);
    }
    
    const opportunity = oppResult.records[0];
    
    // Get line items
    const lineItemsQuery = `
      SELECT Id, Quantity, UnitPrice, TotalPrice, PricebookEntry.Product2.Name,
             PricebookEntry.Product2.ProductCode, PricebookEntry.Product2.Description,
             Description
      FROM OpportunityLineItem
      WHERE OpportunityId = '${opportunityId}'
    `;
    
    const lineItems = await conn.query(lineItemsQuery);
    
    return {
      opportunity: opportunity,
      lineItems: lineItems.records
    };
  } catch (error) {
    console.error(`Error getting opportunity ${opportunityId}:`, error.message);
    throw error;
  }
}

// Execute if called directly
if (require.main === module) {
  // Default options
  const options = {
    stage: 'Closed Won',
    days: 30,
    pendingInvoice: true,
    limit: 5
  };
  
  queryOpportunities(options)
    .then(opportunities => {
      console.log(JSON.stringify(opportunities, null, 2));
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}

module.exports = {
  queryOpportunities,
  getOpportunityById
};
