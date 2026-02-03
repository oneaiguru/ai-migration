#!/bin/bash
# Script F: Create Apex Classes

echo "=== Creating Apex Classes ==="

# Create the Apex directory structure
APEX_DIR="force-app/main/default/classes"
mkdir -p "$APEX_DIR"

# Create the main controller class
cat > "$APEX_DIR/QuickBooksInvoiceController.cls" << 'EOF'
/**
 * Controller class for QuickBooks invoice creation from Salesforce
 * This class handles the API callout to the middleware service
 */
public with sharing class QuickBooksInvoiceController {
    
    /**
     * Create an invoice in QuickBooks for a given Opportunity
     * @param opportunityId The Salesforce Opportunity ID
     * @return InvoiceResult Result of the invoice creation attempt
     */
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
            if (settings == null || String.isBlank(settings.Middleware_URL__c) || String.isBlank(settings.API_Key__c)) {
                result.success = false;
                result.message = 'QuickBooks integration is not configured. Please contact your administrator.';
                return result;
            }
            
            // Make the API callout
            result = QuickBooksAPIService.createInvoice(
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
    
    /**
     * Result wrapper class
     */
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

echo "✓ Created QuickBooksInvoiceController.cls"

# Create the API service class
cat > "$APEX_DIR/QuickBooksAPIService.cls" << 'EOF'
/**
 * Service class for QuickBooks API integration
 * Handles the HTTP callouts to the middleware
 */
public with sharing class QuickBooksAPIService {
    
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
            
            // Prepare the request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(settings.Middleware_URL__c + '/api/create-invoice');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', settings.API_Key__c);
            req.setTimeout(60000); // 60 seconds
            
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
            System.debug('API callout error: ' + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Test the connection to the middleware
     */
    public static Boolean testConnection() {
        try {
            QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
            
            HttpRequest req = new HttpRequest();
            req.setEndpoint(settings.Middleware_URL__c + '/health');
            req.setMethod('GET');
            req.setHeader('X-API-Key', settings.API_Key__c);
            req.setTimeout(10000);
            
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            return res.getStatusCode() == 200;
        } catch (Exception e) {
            System.debug('Connection test failed: ' + e.getMessage());
            return false;
        }
    }
}
EOF

echo "✓ Created QuickBooksAPIService.cls"

# Create the test class (with mock class)
cat > "$APEX_DIR/QuickBooksInvoiceControllerTest.cls" << 'EOF'
/**
 * Test class for QuickBooks integration
 */
@isTest
private class QuickBooksInvoiceControllerTest {
    
    @testSetup
    static void setup() {
        // Create test data
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            StageName = 'Closed Won',
            CloseDate = Date.today(),
            Amount = 1000
        );
        insert testOpp;
    }
    
    @isTest
    static void testCreateInvoiceSuccess() {
        // First, insert custom settings for the test
        QuickBooks_Settings__c settings = new QuickBooks_Settings__c(
            Middleware_URL__c = 'http://localhost:3000',
            API_Key__c = 'test_api_key',
            QB_Realm_ID__c = '1234567890'
        );
        insert settings;
        
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new QuickBooksMockHttpResponse());
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
        
        Test.stopTest();
        
        System.assertEquals(true, result.success);
        System.assertNotEquals(null, result.invoiceId);
        System.assertNotEquals(null, result.invoiceNumber);
    }
    
    @isTest
    static void testCreateInvoiceAlreadyExists() {
        // Insert custom settings
        QuickBooks_Settings__c settings = new QuickBooks_Settings__c(
            Middleware_URL__c = 'http://localhost:3000',
            API_Key__c = 'test_api_key',
            QB_Realm_ID__c = '1234567890'
        );
        insert settings;
        
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        opp.QB_Invoice_ID__c = 'INV-123';
        update opp;
        
        Test.startTest();
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
        
        Test.stopTest();
        
        System.assertEquals(false, result.success);
        System.assertEquals('Invoice already exists for this opportunity', result.message);
    }
    
    @isTest
    static void testNoCustomSettings() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
        
        Test.stopTest();
        
        System.assertEquals(false, result.success);
        System.assertEquals('QuickBooks integration is not configured. Please contact your administrator.', result.message);
    }
    
    /**
     * Mock HTTP response for testing
     */
    private class QuickBooksMockHttpResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setStatusCode(200);
            res.setBody('{"success":true,"invoiceId":"INV-456","invoiceNumber":"INV-456","message":"Invoice created successfully"}');
            return res;
        }
    }
}
EOF

echo "✓ Created QuickBooksInvoiceControllerTest.cls"

# Create XML metadata files
cat > "$APEX_DIR/QuickBooksInvoiceController.cls-meta.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

cat > "$APEX_DIR/QuickBooksAPIService.cls-meta.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

cat > "$APEX_DIR/QuickBooksInvoiceControllerTest.cls-meta.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

echo "✓ Created metadata XML files"

echo ""
echo "Apex classes created successfully!"
echo "Location: $APEX_DIR"
echo ""
echo "Next step: Run ./g-deploy-to-salesforce.sh"
