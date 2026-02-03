#!/bin/bash
# Fix test coverage issue

echo "=== Fixing Test Coverage Issue ==="

# Option 1: For development/sandbox, deploy without tests
echo "Option 1: Deploy without running tests (for sandbox environments)"
echo ""
echo "Run this command:"
echo "sf project deploy start --source-dir force-app --target-org myorg --test-level NoTestRun"
echo ""

# Option 2: Improve test coverage
echo "Option 2: Creating improved test class with better coverage..."

cat > force-app/main/default/classes/QuickBooksInvoiceControllerTest.cls << 'EOF'
@isTest
private class QuickBooksInvoiceControllerTest {
    
    @testSetup
    static void setup() {
        // Create test settings
        QuickBooks_Settings__c settings = new QuickBooks_Settings__c();
        settings.Middleware_URL__c = 'https://test.example.com';
        settings.API_Key__c = 'test_api_key';
        settings.QB_Realm_ID__c = 'test_realm';
        insert settings;
        
        // Create test account
        Account testAccount = new Account(
            Name = 'Test Account',
            BillingStreet = '123 Test St',
            BillingCity = 'Test City',
            BillingState = 'TS',
            BillingPostalCode = '12345'
        );
        insert testAccount;
        
        // Create test opportunity
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            StageName = 'Closed Won',
            CloseDate = Date.today().addDays(30),
            Amount = 1000
        );
        insert testOpp;
    }
    
    @isTest
    static void testCreateInvoiceSuccess() {
        // Get test opportunity
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        // Mock successful HTTP response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseSuccess());
        
        Test.startTest();
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
        Test.stopTest();
        
        // Verify results
        System.assertEquals(true, result.success, 'Invoice creation should succeed');
        System.assertNotEquals(null, result.message, 'Should have a message');
    }
    
    @isTest
    static void testCreateInvoiceFailure() {
        // Get test opportunity
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        // Mock failed HTTP response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseFailure());
        
        Test.startTest();
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
        Test.stopTest();
        
        // Verify results
        System.assertEquals(false, result.success, 'Invoice creation should fail');
        System.assertNotEquals(null, result.message, 'Should have error message');
    }
    
    @isTest
    static void testCreateInvoiceNullOpportunity() {
        Test.startTest();
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(null);
        Test.stopTest();
        
        // Verify results
        System.assertEquals(false, result.success, 'Should fail with null opportunity');
        System.assert(result.message.contains('Opportunity ID is required'), 
            'Should have appropriate error message');
    }
    
    @isTest
    static void testCreateInvoiceInvalidOpportunity() {
        // Use invalid ID
        Id invalidId = '006000000000000AAA';
        
        Test.startTest();
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(invalidId);
        Test.stopTest();
        
        // Verify results
        System.assertEquals(false, result.success, 'Should fail with invalid opportunity');
        System.assert(result.message.contains('Opportunity not found'), 
            'Should have appropriate error message');
    }
    
    @isTest
    static void testCreateInvoiceAlreadyExists() {
        // Get test opportunity and add invoice ID
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        opp.QB_Invoice_ID__c = 'TEST123';
        update opp;
        
        Test.startTest();
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
        Test.stopTest();
        
        // Verify results
        System.assertEquals(false, result.success, 'Should fail when invoice exists');
        System.assert(result.message.contains('already has an invoice'), 
            'Should have appropriate error message');
    }
    
    // Mock classes for HTTP callouts
    public class MockHttpResponseSuccess implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"success":true,"invoiceId":"QB123","message":"Invoice created"}');
            res.setStatusCode(200);
            return res;
        }
    }
    
    public class MockHttpResponseFailure implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"success":false,"message":"API Error"}');
            res.setStatusCode(500);
            return res;
        }
    }
}
EOF

# Create test for API Service
cat > force-app/main/default/classes/QuickBooksAPIServiceTest.cls << 'EOF'
@isTest
private class QuickBooksAPIServiceTest {
    
    @testSetup
    static void setup() {
        // Create test settings
        QuickBooks_Settings__c settings = new QuickBooks_Settings__c();
        settings.Middleware_URL__c = 'https://test.example.com';
        settings.API_Key__c = 'test_api_key';
        settings.QB_Realm_ID__c = 'test_realm';
        insert settings;
    }
    
    @isTest
    static void testCallMiddlewareSuccess() {
        // Mock successful response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseSuccess());
        
        Test.startTest();
        Map<String, Object> result = QuickBooksAPIService.callMiddleware(
            'POST', 
            '/api/test', 
            '{"test":"data"}'
        );
        Test.stopTest();
        
        System.assertEquals(true, result.get('success'), 'Call should succeed');
    }
    
    @isTest
    static void testCallMiddlewareFailure() {
        // Mock failed response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseFailure());
        
        Test.startTest();
        try {
            Map<String, Object> result = QuickBooksAPIService.callMiddleware(
                'POST', 
                '/api/test', 
                '{"test":"data"}'
            );
            System.assert(false, 'Should have thrown exception');
        } catch (QuickBooksAPIService.APIException e) {
            System.assert(e.getMessage().contains('Error'), 'Should have error message');
        }
        Test.stopTest();
    }
    
    @isTest
    static void testTestConnection() {
        // Mock successful response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseSuccess());
        
        Test.startTest();
        Boolean result = QuickBooksAPIService.testConnection();
        Test.stopTest();
        
        System.assertEquals(true, result, 'Connection test should succeed');
    }
    
    // Mock classes
    public class MockHttpResponseSuccess implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"success":true}');
            res.setStatusCode(200);
            return res;
        }
    }
    
    public class MockHttpResponseFailure implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"success":false,"error":"Test error"}');
            res.setStatusCode(500);
            return res;
        }
    }
}
EOF

# Create metadata for new test class
cat > force-app/main/default/classes/QuickBooksAPIServiceTest.cls-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

echo ""
echo "=== Fix Complete ==="
echo ""
echo "Choose one of these options:"
echo ""
echo "1. For sandbox/development (quickest):"
echo "   sf project deploy start --source-dir force-app --target-org myorg --test-level NoTestRun"
echo ""
echo "2. With improved test coverage (for production):"
echo "   ./g_deploy_salesforce.sh"
echo ""
echo "3. Run specific tests only:"
echo "   sf project deploy start --source-dir force-app --target-org myorg --test-level RunSpecifiedTests --tests QuickBooksInvoiceControllerTest QuickBooksAPIServiceTest"
echo ""
echo "4. Deploy to production with all tests:"
echo "   sf project deploy start --source-dir force-app --target-org myorg --test-level RunLocalTests"
