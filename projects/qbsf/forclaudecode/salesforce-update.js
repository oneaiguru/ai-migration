// scripts/salesforce-update.js
const jsforce = require('jsforce');
const oauthManager = require('../src/services/oauth-manager');

/**
 * Create a connection to Salesforce using stored access token
 * @param {string} instanceUrl - Salesforce instance URL
 * @returns {Promise<Object>} - jsforce Connection object
 */
const createConnection = async (instanceUrl) => {
  try {
    // If instance URL is not provided, use the first available one
    if (!instanceUrl) {
      const tokens = oauthManager.initializeTokenStorage();
      const availableInstances = Object.keys(tokens.salesforce || {});
      
      if (availableInstances.length === 0) {
        throw new Error('No Salesforce instances available. Please authenticate first.');
      }
      
      instanceUrl = availableInstances[0];
      console.log(`Using default Salesforce instance URL: ${instanceUrl}`);
    }
    
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

/**
 * Update Salesforce Opportunity with QuickBooks Invoice ID
 * @param {string} opportunityId - Salesforce Opportunity ID
 * @param {string} invoiceId - QuickBooks Invoice ID
 * @param {string} invoiceNumber - QuickBooks Invoice Number
 * @param {string} instanceUrl - Salesforce instance URL
 * @returns {Promise<Object>} - Update result
 */
const updateOpportunityWithInvoiceId = async (opportunityId, invoiceId, invoiceNumber, instanceUrl) => {
  try {
    const conn = await createConnection(instanceUrl);
    
    // Prepare the update with custom fields
    // Note: These fields must exist in your Salesforce org
    const updateData = {
      Id: opportunityId,
      // Custom fields for QuickBooks integration
      QB_Invoice_ID__c: String(invoiceId),
      QB_Invoice_Number__c: invoiceNumber,
      QB_Invoice_Created_Date__c: new Date().toISOString()
    };
    
    // Check for custom field existence before updating
    // This helps prevent errors when custom fields don't exist
    try {
      // Try to describe the Opportunity object
      const meta = await conn.describe('Opportunity');
      const fieldNames = meta.fields.map(f => f.name);
      
      // Remove fields that don't exist
      Object.keys(updateData).forEach(field => {
        if (field !== 'Id' && !fieldNames.includes(field)) {
          console.warn(`Field ${field} doesn't exist in Salesforce Opportunity object. Removing from update.`);
          delete updateData[field];
        }
      });
      
      // If we don't have any QuickBooks fields, create a workaround
      if (Object.keys(updateData).length <= 1) {
        // Fallback: Use Description field to store QuickBooks info
        const opportunity = await conn.sobject('Opportunity').retrieve(opportunityId);
        const existingDesc = opportunity.Description || '';
        updateData.Description = existingDesc + 
          `\n\nQuickBooks Invoice Created: ${new Date().toISOString()}\n` +
          `Invoice ID: ${invoiceId}\n` +
          `Invoice Number: ${invoiceNumber}`;
        
        console.log('Using Description field as fallback for QuickBooks information');
      }
    } catch (metaError) {
      console.warn('Could not check field existence, proceeding with update anyway:', metaError.message);
    }
    
    console.log('Updating Opportunity with data:', updateData);
    
    // Update the Opportunity
    const result = await conn.sobject('Opportunity').update(updateData);
    
    if (result.success) {
      console.log(`Successfully updated Opportunity ${opportunityId} with QuickBooks Invoice ID ${invoiceId}`);
    } else {
      console.error('Error updating Opportunity:', result.errors);
      throw new Error(`Update failed: ${result.errors.join(', ')}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error updating Opportunity with Invoice ID:', error.message);
    throw error;
  }
};

/**
 * Create a note on the Opportunity with QuickBooks invoice details
 * This is an alternative to using custom fields
 * @param {string} opportunityId - Salesforce Opportunity ID
 * @param {Object} invoiceData - QuickBooks Invoice data
 * @param {string} instanceUrl - Salesforce instance URL
 * @returns {Promise<Object>} - Created note result
 */
const createInvoiceNote = async (opportunityId, invoiceData, instanceUrl) => {
  try {
    const conn = await createConnection(instanceUrl);
    
    // Format the invoice data into a readable note
    const noteTitle = `QuickBooks Invoice #${invoiceData.DocNumber || invoiceData.Id}`;
    let noteBody = `QuickBooks Invoice created on ${new Date().toLocaleString()}\n\n`;
    noteBody += `Invoice ID: ${invoiceData.Id}\n`;
    noteBody += `Invoice Number: ${invoiceData.DocNumber || 'N/A'}\n`;
    noteBody += `Amount: ${invoiceData.TotalAmt || 'N/A'}\n`;
    noteBody += `Customer: ${invoiceData.CustomerRef?.name || invoiceData.CustomerRef?.value || 'N/A'}\n`;
    
    // Add line items if available
    if (invoiceData.Line && Array.isArray(invoiceData.Line)) {
      noteBody += '\nLine Items:\n';
      invoiceData.Line.forEach((line, index) => {
        noteBody += `${index + 1}. ${line.Description || 'Product'}: `;
        noteBody += `${line.SalesItemLineDetail?.Qty || 1} x `;
        noteBody += `$${line.SalesItemLineDetail?.UnitPrice || 0} = `;
        noteBody += `$${line.Amount || 0}\n`;
      });
    }
    
    // Create ContentNote (enhanced notes)
    try {
      // First, create the ContentNote
      const contentNote = {
        Title: noteTitle,
        Content: Buffer.from(noteBody).toString('base64'),
        ContentType: 'text/plain'
      };
      
      const noteResult = await conn.sobject('ContentNote').create(contentNote);
      
      if (!noteResult.success) {
        throw new Error('Failed to create ContentNote');
      }
      
      // Then, create the ContentDocumentLink to link the note to the Opportunity
      const contentLink = {
        ContentDocumentId: noteResult.id,
        LinkedEntityId: opportunityId,
        ShareType: 'V' // V for Viewer permission
      };
      
      await conn.sobject('ContentDocumentLink').create(contentLink);
      console.log(`Created note with ID ${noteResult.id} for Opportunity ${opportunityId}`);
      
      return noteResult;
    } catch (enhancedNoteError) {
      console.warn('Could not create enhanced note, falling back to old Note object:', enhancedNoteError.message);
      
      // Fallback to old Note object
      const note = {
        ParentId: opportunityId,
        Title: noteTitle,
        Body: noteBody
      };
      
      const noteResult = await conn.sobject('Note').create(note);
      console.log(`Created old-style note with ID ${noteResult.id} for Opportunity ${opportunityId}`);
      
      return noteResult;
    }
  } catch (error) {
    console.error('Error creating note for Opportunity:', error.message);
    throw error;
  }
};

module.exports = {
  createConnection,
  updateOpportunityWithInvoiceId,
  createInvoiceNote
};

// Execute if called directly
if (require.main === module) {
  console.log('Run this module with opportunity ID and invoice data to update Salesforce');
}
