#!/bin/bash

echo "=== Fixing Salesforce QuickBooks Integration localhost issue ==="
echo ""

# 1. First, let's find where localhost is hardcoded
echo "1. Searching for hardcoded localhost URLs..."
echo ""

# Search in the deployed code
find force-app -type f \( -name "*.cls" -o -name "*.js" -o -name "*.xml" \) -exec grep -l "localhost:3000\|http://localhost" {} \; 2>/dev/null || echo "No hardcoded localhost found in force-app"

echo ""
echo "2. Updating Remote Site Settings..."

# Update the Remote Site Setting
cat > force-app/main/default/remoteSiteSettings/QuickBooksMiddleware.remoteSite-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<RemoteSiteSetting xmlns="http://soap.sforce.com/2006/04/metadata">
    <disableProtocolSecurity>false</disableProtocolSecurity>
    <isActive>true</isActive>
    <url>https://3a62-166-1-160-232.ngrok-free.app</url>
</RemoteSiteSetting>
EOF

echo "Updated Remote Site Settings to use ngrok URL"

echo ""
echo "3. Creating a fixed version of the API service..."

# Make sure we have the right directory structure
mkdir -p force-app/main/default/classes

# Create a fixed API service that forces ngrok URL
cat > force-app/main/default/classes/QuickBooksAPIServiceFixed.cls << 'EOF'
/**
 * Fixed Service class for QuickBooks API integration
 * This version ensures ngrok URL is always used
 */
public with sharing class QuickBooksAPIServiceFixed {
    
    /**
     * Create an invoice via the middleware API
     */
    public static QuickBooksInvoiceController.InvoiceResult createInvoice(
        Id opportunityId, 
        String salesforceInstance, 
        String quickbooksRealm
    ) {
        QuickBooksInvoiceController.InvoiceResult result = new QuickBooksInvoiceController.InvoiceResult();
        
        try {
            // Get settings
            QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
            
            // FORCE the ngrok URL - override any localhost
            String middlewareUrl = settings.Middleware_URL__c;
            if (middlewareUrl == null || middlewareUrl.contains('localhost')) {
                middlewareUrl = 'https://3a62-166-1-160-232.ngrok-free.app';
                System.debug('Overriding localhost URL with ngrok URL: ' + middlewareUrl);
            }
            
            // Prepare the request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(middlewareUrl + '/api/create-invoice');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', settings.API_Key__c);
            req.setTimeout(60000);
            
            // Prepare request body
            Map<String, Object> requestBody = new Map<String, Object>{
                'opportunityId' => opportunityId,
                'salesforceInstance' => salesforceInstance,
                'quickbooksRealm' => quickbooksRealm
            };
            
            req.setBody(JSON.serialize(requestBody));
            
            // Log the endpoint
            System.debug('Using endpoint: ' + req.getEndpoint());
            
            // Make the callout
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            // Process the response
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                result.success = (Boolean) responseBody.get('success');
                result.message = (String) responseBody.get('message');
                result.invoiceId = (String) responseBody.get('invoiceId');
                result.invoiceNumber = (String) responseBody.get('invoiceNumber');
            } else {
                result.success = false;
                result.message = 'API Error: ' + res.getStatus() + ' - ' + res.getBody();
            }
            
        } catch (Exception e) {
            result.success = false;
            result.message = 'Error calling API: ' + e.getMessage();
            System.debug('API callout error: ' + e.getMessage());
        }
        
        return result;
    }
}
EOF

# Create metadata for the fixed service
cat > force-app/main/default/classes/QuickBooksAPIServiceFixed.cls-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

echo ""
echo "4. Updating the original controller to use the fixed service..."

# Update the controller to use the fixed service
cat > force-app/main/default/classes/QuickBooksInvoiceController.cls << 'EOF'
/**
 * Controller class for QuickBooks invoice creation from Salesforce
 * Updated to use fixed API service
 */
public with sharing class QuickBooksInvoiceController {
    
    @AuraEnabled
    public static InvoiceResult createInvoice(Id opportunityId) {
        InvoiceResult result = new InvoiceResult();
        
        try {
            // Validate the opportunity exists and has required fields
            Opportunity opp = [
                SELECT Id, Name, Amount, AccountId, QB_Invoice_ID__c, Account.Name
                FROM Opportunity 
                WHERE Id = :opportunityId
                LIMIT 1
            ];
            
            // Check if invoice already exists
            if (String.isNotBlank(opp.QB_Invoice_ID__c)) {
                result.success = false;
                result.message = 'Invoice already exists for this opportunity';
                return result;
            }
            
            // Get custom settings for middleware configuration
            QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
            if (settings == null || String.isBlank(settings.API_Key__c)) {
                result.success = false;
                result.message = 'QuickBooks integration is not configured. Please contact your administrator.';
                return result;
            }
            
            // Force ngrok URL in settings if needed
            if (settings.Middleware_URL__c == null || settings.Middleware_URL__c.contains('localhost')) {
                settings.Middleware_URL__c = 'https://3a62-166-1-160-232.ngrok-free.app';
                upsert settings;
            }
            
            // Use the fixed API service
            result = QuickBooksAPIServiceFixed.createInvoice(
                opportunityId,
                URL.getOrgDomainUrl().toExternalForm(),
                settings.QB_Realm_ID__c
            );
            
        } catch (Exception e) {
            result.success = false;
            result.message = 'Error: ' + e.getMessage();
            System.debug('Error creating invoice: ' + e.getMessage() + '\n' + e.getStackTraceString());
        }
        
        return result;
    }
    
    public class InvoiceResult {
        @AuraEnabled public Boolean success { get; set; }
        @AuraEnabled public String message { get; set; }
        @AuraEnabled public String invoiceId { get; set; }
        @AuraEnabled public String invoiceNumber { get; set; }
        
        public InvoiceResult() {
            this.success = false;
            this.message = '';
        }
    }
}
EOF

echo ""
echo "5. Deploying the fixes to Salesforce..."

# Deploy to Salesforce
sf project deploy start --source-dir force-app/main/default/classes --source-dir force-app/main/default/remoteSiteSettings --target-org myorg

echo ""
echo "6. Forcing the custom settings update..."
cat > update_settings.apex << 'EOF'
QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
settings.Middleware_URL__c = 'https://3a62-166-1-160-232.ngrok-free.app';
settings.API_Key__c = 'quickbooks_salesforce_api_key_2025';
settings.QB_Realm_ID__c = '4620816365337654250';
upsert settings;
System.debug('Settings updated: ' + settings);

// Also clear any user-level settings that might override
List<QuickBooks_Settings__c> allSettings = [SELECT Id, Middleware_URL__c FROM QuickBooks_Settings__c];
for(QuickBooks_Settings__c s : allSettings) {
    if(s.Middleware_URL__c != null && s.Middleware_URL__c.contains('localhost')) {
        s.Middleware_URL__c = 'https://3a62-166-1-160-232.ngrok-free.app';
    }
}
if(!allSettings.isEmpty()) {
    update allSettings;
}
System.debug('All settings updated');
EOF

sf apex run --file update_settings.apex --target-org myorg
rm update_settings.apex

echo ""
echo "=== MANUAL STEPS REQUIRED ==="
echo ""
echo "1. Clear your browser cache completely (Ctrl+Shift+Delete)"
echo ""
echo "2. In Salesforce:"
echo "   a. Go to Setup → Security → Remote Site Settings"
echo "   b. Find 'QuickBooksMiddleware'"
echo "   c. Verify it shows: https://3a62-166-1-160-232.ngrok-free.app"
echo "   d. If not, edit and update it manually"
echo ""
echo "3. Clear Salesforce cache:"
echo "   Setup → System → System Overview → Clear Cache"
echo ""
echo "4. If the button still uses localhost:"
echo "   a. Go to Setup → Object Manager → Opportunity"
echo "   b. Click on 'Buttons, Links, and Actions'"
echo "   c. Find 'Create QuickBooks Invoice'"
echo "   d. Click the dropdown arrow → Edit"
echo "   e. Check if there's any hardcoded URL in the component"
echo ""
echo "5. Test the button again"
echo ""
echo "If it still doesn't work, run this to check the LWC:"
echo "grep -r 'localhost' force-app/main/default/lwc/"
