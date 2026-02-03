// scripts/integration-workflow.js
const { inspectTokens } = require('./token-inspector');
const { queryOpportunities, getOpportunityById } = require('./opportunity-query');
const { createInvoiceFromOpportunity } = require('./quickbooks-invoice');
const { updateOpportunityWithInvoiceId, createInvoiceNote } = require('./salesforce-update');

/**
 * Complete workflow to process a single Salesforce opportunity:
 * 1. Get the opportunity from Salesforce
 * 2. Create an invoice in QuickBooks
 * 3. Update the Salesforce opportunity with QuickBooks invoice ID
 * 
 * @param {string} opportunityId - Salesforce Opportunity ID
 * @param {string} salesforceInstanceUrl - Salesforce instance URL
 * @param {string} quickbooksRealmId - QuickBooks company ID (realm ID)
 * @returns {Promise<Object>} - Result of the workflow
 */
async function processOpportunity(opportunityId, salesforceInstanceUrl, quickbooksRealmId) {
  console.log(`=== PROCESSING OPPORTUNITY ${opportunityId} ===`);
  
  try {
    // Step 1: Get the opportunity details from Salesforce
    console.log('1. Fetching opportunity details from Salesforce...');
    const opportunityData = await getOpportunityById(opportunityId, salesforceInstanceUrl);
    
    console.log(`Retrieved opportunity: ${opportunityData.opportunity.Name}`);
    console.log(`Account: ${opportunityData.opportunity.Account.Name}`);
    console.log(`Line items: ${opportunityData.lineItems.length}`);
    
    // Step 2: Create an invoice in QuickBooks
    console.log('\n2. Creating invoice in QuickBooks...');
    const invoice = await createInvoiceFromOpportunity(opportunityData, quickbooksRealmId);
    
    console.log(`Invoice created successfully!`);
    console.log(`Invoice ID: ${invoice.Id}`);
    console.log(`Invoice Number: ${invoice.DocNumber}`);
    console.log(`Total Amount: ${invoice.TotalAmt}`);
    
    // Step 3: Update the Salesforce opportunity with QuickBooks invoice ID
    console.log('\n3. Updating Salesforce opportunity with QuickBooks invoice ID...');
    await updateOpportunityWithInvoiceId(
      opportunityId, 
      invoice.Id, 
      invoice.DocNumber, 
      salesforceInstanceUrl
    );
    
    // Step 4: Create a note on the opportunity with invoice details
    console.log('\n4. Creating note on Salesforce opportunity with invoice details...');
    await createInvoiceNote(opportunityId, invoice, salesforceInstanceUrl);
    
    console.log('\n=== OPPORTUNITY PROCESSING COMPLETED SUCCESSFULLY ===');
    
    return {
      success: true,
      opportunity: {
        id: opportunityId,
        name: opportunityData.opportunity.Name
      },
      invoice: {
        id: invoice.Id,
        number: invoice.DocNumber,
        totalAmount: invoice.TotalAmt
      }
    };
  } catch (error) {
    console.error(`Error processing opportunity ${opportunityId}:`, error.message);
    
    return {
      success: false,
      opportunityId,
      error: error.message
    };
  }
}

/**
 * Batch process multiple Salesforce opportunities that match criteria
 * @param {Object} options - Query options for opportunities
 * @param {string} options.salesforceInstanceUrl - Salesforce instance URL
 * @param {string} options.quickbooksRealmId - QuickBooks company ID (realm ID)
 * @param {string} options.stage - Opportunity stage to filter by
 * @param {number} options.days - Number of days to look back for opportunities
 * @param {boolean} options.pendingInvoice - If true, find opportunities without QuickBooks invoice
 * @param {number} options.limit - Maximum number of opportunities to process
 * @returns {Promise<Object>} - Result of the batch process
 */
async function batchProcessOpportunities(options = {}) {
  console.log('=== BATCH PROCESSING OPPORTUNITIES ===');
  console.log('Options:', options);
  
  // First, verify connections
  const tokens = inspectTokens();
  
  // Set default instance URL and realm ID if not provided
  const salesforceInstanceUrl = options.salesforceInstanceUrl || 
                               Object.keys(tokens.salesforce || {})[0];
  
  const quickbooksRealmId = options.quickbooksRealmId || 
                           Object.keys(tokens.quickbooks || {})[0];
  
  if (!salesforceInstanceUrl) {
    throw new Error('No Salesforce instance available. Please authenticate first.');
  }
  
  if (!quickbooksRealmId) {
    throw new Error('No QuickBooks company available. Please authenticate first.');
  }
  
  try {
    // Query for eligible opportunities
    console.log('\n1. Querying for eligible opportunities...');
    const opportunities = await queryOpportunities({
      instanceUrl: salesforceInstanceUrl,
      stage: options.stage || 'Closed Won',
      days: options.days || 30,
      pendingInvoice: options.pendingInvoice !== false,
      limit: options.limit || 5
    });
    
    console.log(`Found ${opportunities.length} opportunities to process.`);
    
    if (opportunities.length === 0) {
      return {
        success: true,
        message: 'No opportunities found matching the criteria',
        processed: 0,
        successful: 0,
        failed: 0,
        results: []
      };
    }
    
    // Process each opportunity
    console.log('\n2. Processing opportunities...');
    const results = [];
    let successful = 0;
    let failed = 0;
    
    for (let i = 0; i < opportunities.length; i++) {
      const opportunityData = opportunities[i];
      const opportunityId = opportunityData.opportunity.Id;
      const opportunityName = opportunityData.opportunity.Name;
      
      console.log(`\nProcessing opportunity ${i + 1}/${opportunities.length}: ${opportunityName} (${opportunityId})`);
      
      try {
        // Use the already fetched opportunity data
        // We need to pass the ID to the process function which will fetch the data again
        // Could be optimized in the future to avoid duplicate data fetching
        const result = await processOpportunity(
          opportunityId,
          salesforceInstanceUrl,
          quickbooksRealmId
        );
        
        results.push(result);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Error processing opportunity ${opportunityId}:`, error.message);
        results.push({
          success: false,
          opportunityId,
          opportunityName,
          error: error.message
        });
        failed++;
      }
    }
    
    console.log('\n=== BATCH PROCESSING COMPLETED ===');
    console.log(`Processed: ${opportunities.length}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    
    return {
      success: true,
      processed: opportunities.length,
      successful,
      failed,
      results
    };
  } catch (error) {
    console.error('Error in batch processing:', error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  processOpportunity,
  batchProcessOpportunities
};

// Execute if called directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'process' && args[1]) {
    // Process a single opportunity
    const opportunityId = args[1];
    const salesforceInstanceUrl = args[2];
    const quickbooksRealmId = args[3];
    
    processOpportunity(opportunityId, salesforceInstanceUrl, quickbooksRealmId)
      .then(result => {
        console.log('\nResult:', JSON.stringify(result, null, 2));
      })
      .catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
      });
  } else if (command === 'batch') {
    // Process opportunities in batch
    const options = {};
    
    // Parse options from command line
    for (let i = 1; i < args.length; i += 2) {
      const key = args[i].replace('--', '');
      const value = args[i + 1];
      
      if (key === 'limit' || key === 'days') {
        options[key] = parseInt(value, 10);
      } else if (key === 'pendingInvoice') {
        options[key] = value.toLowerCase() === 'true';
      } else {
        options[key] = value;
      }
    }
    
    batchProcessOpportunities(options)
      .then(result => {
        console.log('\nResult:', JSON.stringify(result, null, 2));
      })
      .catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  node integration-workflow.js process <opportunityId> [salesforceInstanceUrl] [quickbooksRealmId]');
    console.log('  node integration-workflow.js batch [--option value] [--option value] ...');
    console.log('\nBatch options:');
    console.log('  --salesforceInstanceUrl <url>    Salesforce instance URL');
    console.log('  --quickbooksRealmId <id>         QuickBooks company ID (realm ID)');
    console.log('  --stage <stage>                  Opportunity stage to filter by (default: "Closed Won")');
    console.log('  --days <number>                  Number of days to look back (default: 30)');
    console.log('  --pendingInvoice <true|false>    Only include opportunities without invoice (default: true)');
    console.log('  --limit <number>                 Maximum number of opportunities to process (default: 5)');
  }
}
