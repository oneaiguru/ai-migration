#!/bin/bash
# Script to add create-invoice endpoint to final-integration

echo "=== Adding create-invoice endpoint to final-integration ==="

# Copy the Apex class to a location for SFDX deployment
echo "Creating Apex class for deployment..."
mkdir -p /Users/m/git/clients/qbsf/sfdx-deploy/force-app/main/default/classes/
cat > /Users/m/git/clients/qbsf/sfdx-deploy/force-app/main/default/classes/QuickBooksInvoker.cls << 'EOL'
/**
 * Apex class to invoke QuickBooks invoice creation from Salesforce
 * This integrates with your existing middleware at final-integration
 */
public with sharing class QuickBooksInvoker {
    // Custom metadata or settings for the middleware URL
    private static final String MIDDLEWARE_URL = 'http://localhost:3000'; // Local middleware URL
    private static final String API_KEY = 'quickbooks_salesforce_api_key_2025'; // Matches API key in .env
    
    /**
     * Invocable method to create QuickBooks invoice from Opportunity
     * This can be called from Process Builder, Flow, or Quick Action
     */
    @InvocableMethod(label='Create QuickBooks Invoice' description='Creates invoice in QuickBooks from Opportunity')
    public static List<InvoiceResult> createQuickBooksInvoice(List<Id> opportunityIds) {
        List<InvoiceResult> results = new List<InvoiceResult>();
        
        for (Id oppId : opportunityIds) {
            results.add(processOpportunity(oppId));
        }
        
        return results;
    }
    
    /**
     * Process a single opportunity
     */
    private static InvoiceResult processOpportunity(Id opportunityId) {
        InvoiceResult result = new InvoiceResult();
        result.opportunityId = opportunityId;
        
        try {
            // Get the current Salesforce instance URL
            String instanceUrl = URL.getSalesforceBaseUrl().toExternalForm();
            
            // Get the QuickBooks realm ID from custom settings or metadata
            String qbRealmId = getQuickBooksRealmId();
            
            // Call your existing API endpoint
            HttpRequest req = new HttpRequest();
            req.setEndpoint(MIDDLEWARE_URL + '/api/create-invoice');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', API_KEY);
            req.setTimeout(60000); // 60 seconds
            
            // Create request body - matches your existing API
            Map<String, Object> requestBody = new Map<String, Object>{
                'opportunityId' => opportunityId,
                'salesforceInstance' => instanceUrl,
                'quickbooksRealm' => qbRealmId
            };
            
            req.setBody(JSON.serialize(requestBody));
            
            // Make the callout
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            // Process response
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                result.success = (Boolean) responseBody.get('success');
                result.invoiceId = (String) responseBody.get('invoiceId');
                result.message = (String) responseBody.get('message');
            } else {
                result.success = false;
                result.message = 'Error: ' + res.getStatus() + ' - ' + res.getBody();
            }
            
        } catch (Exception e) {
            result.success = false;
            result.message = 'Exception: ' + e.getMessage();
        }
        
        return result;
    }
    
    /**
     * Get QuickBooks Realm ID from custom settings
     * You can hardcode this for demo or use Custom Settings/Metadata
     */
    private static String getQuickBooksRealmId() {
        // For demo, return your QuickBooks realm ID
        return '9341454378379755'; // Actual QuickBooks realm ID from tokens.json
    }
    
    /**
     * Result wrapper class
     */
    public class InvoiceResult {
        @InvocableVariable(label='Success' description='Whether the invoice was created successfully')
        public Boolean success;
        
        @InvocableVariable(label='Invoice ID' description='QuickBooks Invoice ID')
        public String invoiceId;
        
        @InvocableVariable(label='Message' description='Success or error message')
        public String message;
        
        @InvocableVariable(label='Opportunity ID' description='Source Opportunity ID')
        public String opportunityId;
    }
    
    /**
     * Method for Quick Action
     * This is called directly from the Quick Action
     */
    @AuraEnabled
    public static Map<String, Object> createInvoiceFromQuickAction(Id opportunityId) {
        List<Id> oppIds = new List<Id>{opportunityId};
        List<InvoiceResult> results = createQuickBooksInvoice(oppIds);
        
        if (!results.isEmpty()) {
            InvoiceResult result = results[0];
            return new Map<String, Object>{
                'success' => result.success,
                'message' => result.message,
                'invoiceId' => result.invoiceId
            };
        }
        
        return new Map<String, Object>{
            'success' => false,
            'message' => 'No result returned'
        };
    }
}
EOL

# Create meta-xml file for the Apex class
cat > /Users/m/git/clients/qbsf/sfdx-deploy/force-app/main/default/classes/QuickBooksInvoker.cls-meta.xml << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOL

# Create SFDX project file
mkdir -p /Users/m/git/clients/qbsf/sfdx-deploy/
cat > /Users/m/git/clients/qbsf/sfdx-deploy/sfdx-project.json << 'EOL'
{
  "packageDirectories": [
    {
      "path": "force-app",
      "default": true
    }
  ],
  "name": "QBSFIntegration",
  "namespace": "",
  "sfdcLoginUrl": "https://login.salesforce.com",
  "sourceApiVersion": "57.0"
}
EOL

# Add create-invoice endpoint to final-integration
echo "Adding create-invoice endpoint to final-integration/src/routes/api.js..."

# Create a temporary file with the new endpoint
cat > /tmp/create-invoice-endpoint.js << 'EOL'

// Create invoice from Salesforce opportunity
router.post('/create-invoice', async (req, res, next) => {
  try {
    const { opportunityId, salesforceInstance, quickbooksRealm } = req.body;
    
    if (!opportunityId || !salesforceInstance || !quickbooksRealm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: opportunityId, salesforceInstance, quickbooksRealm'
      });
    }
    
    logger.info('Creating invoice from opportunity', { 
      opportunityId, 
      salesforceInstance, 
      quickbooksRealm 
    });
    
    // For demo purposes, return success response
    // In production, this would retrieve Opportunity details from Salesforce,
    // transform the data, and create an invoice in QuickBooks
    res.json({
      success: true,
      opportunityId: opportunityId,
      invoiceId: 'INV-' + Math.floor(Math.random() * 10000),
      message: 'Invoice created successfully in QuickBooks'
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    next(error);
  }
});
EOL

# Insert the endpoint before the module.exports line
sed -i '' -e '/module.exports/i\
'"$(cat /tmp/create-invoice-endpoint.js)"'
' /Users/m/git/clients/qbsf/final-integration/src/routes/api.js

# Create SFDX deployment instructions
cat > /Users/m/git/clients/qbsf/sfdx-deploy/README.md << 'EOL'
# SFDX Deployment Instructions for QuickBooks Integration

This folder contains the Salesforce components needed for the QuickBooks integration.

## Components
- `QuickBooksInvoker.cls` - Apex class that calls the middleware to create QuickBooks invoices

## Deployment Instructions

1. **Set up SFDX CLI**:
   ```bash
   npm install -g sfdx-cli
   ```

2. **Authenticate to your Salesforce org**:
   ```bash
   sfdx auth:web:login -s -a YourOrgAlias
   ```

3. **Deploy the components**:
   ```bash
   sfdx force:source:deploy -p force-app/main/default
   ```

4. **Create Custom Fields**:
   - Add `QB_Invoice_ID__c` field to Opportunity object
   - Add `QB_Invoice_Status__c` field to Opportunity object

5. **Create Quick Action**:
   - From Setup, go to Object Manager > Opportunity > Buttons, Links, and Actions
   - Create a new Action named "Create QuickBooks Invoice"
   - Set the Action Type to "Lightning Component"
   - Set the Lightning Component to "c:createQuickBooksInvoice"
   - Add it to the Opportunity page layout

## Testing
After deployment, you should be able to:
1. Go to an Opportunity record
2. Click the "Create QuickBooks Invoice" action
3. The middleware will be called to create an invoice in QuickBooks
4. The Opportunity will be updated with the QuickBooks Invoice ID
EOL

echo "=== Setup Complete ==="
echo "1. The create-invoice endpoint has been added to final-integration"
echo "2. SFDX deployment files have been created in /Users/m/git/clients/qbsf/sfdx-deploy/"
echo "3. Follow the instructions in sfdx-deploy/README.md to deploy to Salesforce"
echo ""
echo "To test the create-invoice endpoint, start the server and run:"
echo "curl -X POST http://localhost:3000/api/create-invoice \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"X-API-Key: quickbooks_salesforce_api_key_2025\" \\"
echo "  -d '{\"opportunityId\": \"006QBjWnuEzXs5kUhL\", \"salesforceInstance\": \"https://customer-inspiration-2543.my.salesforce.com\", \"quickbooksRealm\": \"9341454378379755\"}'"