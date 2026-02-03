#!/bin/bash

echo "=== Debugging the localhost issue flow ==="
echo ""

# 1. Check what's in the QuickBooksAPIServiceFixed
echo "1. Content of QuickBooksAPIServiceFixed.cls:"
cat force-app/main/default/classes/QuickBooksAPIServiceFixed.cls

echo ""
echo "2. Let's create a fixed version that forces the ngrok URL:"

# Create a truly fixed version that bypasses settings completely
cat > force-app/main/default/classes/QuickBooksAPIServiceFixed.cls << 'EOF'
/**
 * Fixed Service class for QuickBooks API integration
 * This version ALWAYS uses the ngrok URL, bypassing settings
 */
public with sharing class QuickBooksAPIServiceFixed {
    
    // HARDCODED NGROK URL TO BYPASS ALL SETTINGS ISSUES
    private static final String NGROK_URL = 'https://3a62-166-1-160-232.ngrok-free.app';
    
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
            // Get settings for API key only
            QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
            
            // ALWAYS USE NGROK URL
            String middlewareUrl = NGROK_URL;
            System.debug('FIXED SERVICE: Using hardcoded ngrok URL: ' + middlewareUrl);
            
            // Prepare the request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(middlewareUrl + '/api/create-invoice');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', settings.API_Key__c);
            req.setTimeout(60000);
            
            // Log the actual endpoint being used
            System.debug('FIXED SERVICE: Final endpoint: ' + req.getEndpoint());
            
            // Prepare request body
            Map<String, Object> requestBody = new Map<String, Object>{
                'opportunityId' => opportunityId,
                'salesforceInstance' => salesforceInstance,
                'quickbooksRealm' => quickbooksRealm
            };
            
            req.setBody(JSON.serialize(requestBody));
            
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
            System.debug('FIXED SERVICE ERROR: ' + e.getMessage());
            System.debug('FIXED SERVICE STACK: ' + e.getStackTraceString());
        }
        
        return result;
    }
}
EOF

echo ""
echo "3. Let's also update the controller to debug better:"

cat > force-app/main/default/classes/QuickBooksInvoiceController.cls << 'EOF'
/**
 * Controller class for QuickBooks invoice creation from Salesforce
 * Updated with better debugging
 */
public with sharing class QuickBooksInvoiceController {
    
    @AuraEnabled
    public static InvoiceResult createInvoice(Id opportunityId) {
        InvoiceResult result = new InvoiceResult();
        
        try {
            System.debug('CONTROLLER: Starting invoice creation for opportunity: ' + opportunityId);
            
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
            
            System.debug('CONTROLLER: Current settings URL: ' + settings.Middleware_URL__c);
            
            // Force ngrok URL in settings if needed
            if (settings.Middleware_URL__c == null || settings.Middleware_URL__c.contains('localhost')) {
                System.debug('CONTROLLER: Updating settings from localhost to ngrok');
                settings.Middleware_URL__c = 'https://3a62-166-1-160-232.ngrok-free.app';
                upsert settings;
                System.debug('CONTROLLER: Settings updated to: ' + settings.Middleware_URL__c);
            }
            
            System.debug('CONTROLLER: Calling QuickBooksAPIServiceFixed.createInvoice()');
            
            // Use the fixed API service
            result = QuickBooksAPIServiceFixed.createInvoice(
                opportunityId,
                URL.getOrgDomainUrl().toExternalForm(),
                settings.QB_Realm_ID__c
            );
            
            System.debug('CONTROLLER: Result from API service: ' + result);
            
        } catch (Exception e) {
            result.success = false;
            result.message = 'Error: ' + e.getMessage();
            System.debug('CONTROLLER ERROR: ' + e.getMessage());
            System.debug('CONTROLLER STACK: ' + e.getStackTraceString());
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
echo "4. Deploy the updated classes:"
sf project deploy start --source-dir force-app/main/default/classes --target-org myorg

echo ""
echo "5. Now let's set up debug logging to see what's happening:"
cat > setup_debug_log.apex << 'EOF'
// Create a debug log for the current user
User currentUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
delete [SELECT Id FROM DebugLevel WHERE DeveloperName = 'DEBUG_QBINVOICE'];
delete [SELECT Id FROM TraceFlag WHERE TracedEntityId = :currentUser.Id];

DebugLevel dl = new DebugLevel();
dl.DeveloperName = 'DEBUG_QBINVOICE';
dl.MasterLabel = 'QB Invoice Debug';
dl.Workflow = 'FINEST';
dl.Validation = 'FINEST';
dl.Callout = 'FINEST';
dl.ApexCode = 'FINEST';
dl.ApexProfiling = 'FINEST';
dl.Visualforce = 'FINEST';
dl.System = 'FINEST';
dl.Database = 'FINEST';
insert dl;

TraceFlag tf = new TraceFlag();
tf.TracedEntityId = currentUser.Id;
tf.DebugLevelId = dl.Id;
tf.StartDate = DateTime.now();
tf.ExpirationDate = DateTime.now().addHours(1);
insert tf;

System.debug('Debug log enabled for user: ' + UserInfo.getName());
EOF

sf apex run --file setup_debug_log.apex --target-org myorg
rm setup_debug_log.apex

echo ""
echo "=== Solution Applied ==="
echo ""
echo "The fixed service now uses a hardcoded ngrok URL to bypass all settings issues."
echo "Debug logging has been enabled."
echo ""
echo "Now:"
echo "1. Go to Salesforce and click the 'Create QuickBooks Invoice' button"
echo "2. After the error (or success), go to Setup → Debug Logs"
echo "3. Download the latest log and search for:"
echo "   - CONTROLLER:"
echo "   - FIXED SERVICE:"
echo ""
echo "This will show exactly what's happening and which URL is being used."
