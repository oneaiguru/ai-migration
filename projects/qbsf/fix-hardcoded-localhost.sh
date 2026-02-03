#!/bin/bash

echo "=== Direct Fix for localhost URL Issue ==="
echo ""

# 1. First, let's check the actual Quick Action and LWC being used
echo "1. Examining the Quick Action button configuration..."
cat > examine_quick_action.apex << 'EOF'
// Find the Quick Action that's being clicked
List<QuickAction> actions = [
    SELECT Name, Type, TargetSobjectType, StandardLabel, 
           PageOrSobjectType, LightningComponentBundleId
    FROM QuickAction
    WHERE TargetSobjectType = 'Opportunity'
    AND (Name LIKE '%QuickBooks%' OR Name LIKE '%Invoice%')
];

for(QuickAction qa : actions) {
    System.debug('Quick Action: ' + qa.Name);
    System.debug('Type: ' + qa.Type);
    System.debug('LWC Bundle ID: ' + qa.LightningComponentBundleId);
}

// Also check for any Visualforce pages that might be used
List<ApexPage> pages = [
    SELECT Name, ControllerType, ControllerKey
    FROM ApexPage
    WHERE Name LIKE '%QuickBooks%' OR Name LIKE '%Invoice%'
];

for(ApexPage page : pages) {
    System.debug('VF Page: ' + page.Name);
    System.debug('Controller: ' + page.ControllerType);
}
EOF

sf apex run --file examine_quick_action.apex --target-org myorg
rm examine_quick_action.apex

echo ""
echo "2. Creating a wrapper method to ensure ngrok URL is used..."
cat > QuickBooksAPIServiceWrapper.cls << 'EOF'
/**
 * Wrapper service to ensure ngrok URL is always used
 * This overrides any hardcoded localhost URLs
 */
public with sharing class QuickBooksAPIServiceWrapper {
    
    /**
     * Force the use of ngrok URL for invoice creation
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
            
            // FORCE the ngrok URL - no localhost allowed
            String middlewareUrl = settings.Middleware_URL__c;
            if (middlewareUrl.contains('localhost')) {
                System.debug('WARNING: Localhost URL detected, forcing ngrok URL');
                middlewareUrl = 'https://3a62-166-1-160-232.ngrok-free.app';
            }
            
            // Log the URL being used
            System.debug('Using middleware URL: ' + middlewareUrl);
            
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
            
            // Log the full request
            System.debug('Request endpoint: ' + req.getEndpoint());
            System.debug('Request body: ' + req.getBody());
            
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
            System.debug('Stack trace: ' + e.getStackTraceString());
        }
        
        return result;
    }
}
EOF

echo ""
echo "3. Creating updated controller that uses the wrapper..."
cat > QuickBooksInvoiceControllerFixed.cls << 'EOF'
/**
 * Fixed controller that ensures ngrok URL is used
 */
public with sharing class QuickBooksInvoiceControllerFixed {
    
    @AuraEnabled
    public static InvoiceResult createInvoice(Id opportunityId) {
        InvoiceResult result = new InvoiceResult();
        
        try {
            // Validate the opportunity exists
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
            
            // Get custom settings
            QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
            
            // CRITICAL: Force ngrok URL here
            if (settings.Middleware_URL__c == null || settings.Middleware_URL__c.contains('localhost')) {
                settings.Middleware_URL__c = 'https://3a62-166-1-160-232.ngrok-free.app';
                update settings;
            }
            
            // Use the wrapper service
            result = QuickBooksAPIServiceWrapper.createInvoice(
                opportunityId,
                URL.getOrgDomainUrl().toExternalForm(),
                settings.QB_Realm_ID__c
            );
            
        } catch (Exception e) {
            result.success = false;
            result.message = 'Error: ' + e.getMessage();
            System.debug('Error creating invoice: ' + e.getMessage());
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
echo "4. Deploy the new classes..."
sf project deploy start -m ApexClass:QuickBooksAPIServiceWrapper,ApexClass:QuickBooksInvoiceControllerFixed -o myorg

echo ""
echo "5. Update the Quick Action to use the fixed controller..."
cat > update_quick_action.apex << 'EOF'
// This would need to be done manually in the Salesforce UI
System.debug('Quick Action Update Instructions:');
System.debug('1. Go to Setup → Object Manager → Opportunity');
System.debug('2. Find the Quick Action for Creating QuickBooks Invoice');
System.debug('3. Edit the Lightning Component or Apex controller reference');
System.debug('4. Change from QuickBooksInvoiceController to QuickBooksInvoiceControllerFixed');
System.debug('5. Save and test');
EOF

sf apex run --file update_quick_action.apex --target-org myorg
rm update_quick_action.apex

echo ""
echo "6. Clear the cache and test..."
echo "In Salesforce:"
echo "1. Clear your browser cache"
echo "2. Go to Setup → System → System Overview → Clear Cache"
echo "3. Logout and login again"
echo "4. Try the Create Invoice button again"

echo ""
echo "=== Fix Applied ==="
echo "The new wrapper service will force the use of the ngrok URL regardless of what's in the settings."
