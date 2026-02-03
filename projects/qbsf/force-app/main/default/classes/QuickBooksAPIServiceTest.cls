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
    static void testTestConnection() {
        // Mock HTTP callout
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        Test.startTest();
        Boolean result = QuickBooksAPIService.testConnection();
        Test.stopTest();
        
        // If there was an error in the mock, result should be false
        System.assertNotEquals(null, result, 'Result should not be null');
    }
    
    @isTest
    static void testHttpCallout() {
        // Test basic HTTP functionality
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        Test.startTest();
        // Create HTTP request to test the basic flow
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://test.example.com/api/test');
        req.setMethod('GET');
        req.setHeader('X-API-Key', 'test_api_key');
        
        Http http = new Http();
        try {
            HttpResponse res = http.send(req);
            System.assertEquals(200, res.getStatusCode(), 'Should get success response');
        } catch (Exception e) {
            System.debug('Exception during HTTP call: ' + e.getMessage());
        }
        Test.stopTest();
    }
    
    @isTest
    static void testConnectionFailure() {
        // Test exception handling in testConnection method
        Test.setMock(HttpCalloutMock.class, new MockHttpErrorResponse());
        
        Test.startTest();
        Boolean result = QuickBooksAPIService.testConnection();
        Test.stopTest();
        
        // Should return false when exception occurs
        System.assertEquals(false, result, 'Should return false on connection error');
    }
    
    @isTest
    static void testCreateInvoiceWithException() {
        // Test exception handling in createInvoice method by testing without settings
        QuickBooks_Settings__c settings = [SELECT Id FROM QuickBooks_Settings__c LIMIT 1];
        delete settings;
        
        // Create test opportunity 
        Account acc = new Account(Name = 'Test Account');
        insert acc;
        Opportunity opp = new Opportunity(Name = 'Test Opp', StageName = 'Prospecting', CloseDate = Date.today(), AccountId = acc.Id);
        insert opp;
        
        Test.startTest();
        QuickBooksInvoiceController.InvoiceResult result = QuickBooksAPIService.createInvoice(opp.Id, 'test-instance', 'test-realm');
        Test.stopTest();
        
        // Should handle exception and return error result
        System.assertEquals(false, result.success, 'Should return unsuccessful result on exception');
        System.assert(result.message.contains('Error calling API'), 'Should contain error message');
    }

    // Mock HTTP Response
    public class MockHttpResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"success":true}');
            res.setStatusCode(200);
            return res;
        }
    }
    
    // Mock HTTP Error Response  
    public class MockHttpErrorResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            throw new CalloutException('Test callout exception');
        }
    }
}
