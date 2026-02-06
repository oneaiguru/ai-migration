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
        
        // Create custom settings
        QuickBooks_Settings__c settings = new QuickBooks_Settings__c(
            Middleware_URL__c = 'http://localhost:3000',
            API_Key__c = 'test_api_key',
            QB_Realm_ID__c = '1234567890'
        );
        insert settings;
    }
    
    @isTest
    static void testCreateInvoiceSuccess() {
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
    static void testCreateInvoiceMissingSettings() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        // Delete the settings to simulate missing configuration
        delete [SELECT Id FROM QuickBooks_Settings__c];
        
        Test.startTest();
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
        
        Test.stopTest();
        
        System.assertEquals(false, result.success);
        System.assertEquals('QuickBooks integration is not configured. Please contact your administrator.', result.message);
    }
    
    @isTest
    static void testAPIServiceCreateInvoiceSuccess() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new QuickBooksMockHttpResponse());
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksAPIService.createInvoice(
                opp.Id, 
                'https://test.salesforce.com', 
                '1234567890'
            );
        
        Test.stopTest();
        
        System.assertEquals(true, result.success);
        System.assertEquals('Invoice created successfully', result.message);
        System.assertEquals('INV-456', result.invoiceId);
        System.assertEquals('INV-456', result.invoiceNumber);
    }
    
    @isTest
    static void testAPIServiceCreateInvoiceError() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new QuickBooksMockErrorResponse());
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksAPIService.createInvoice(
                opp.Id, 
                'https://test.salesforce.com', 
                '1234567890'
            );
        
        Test.stopTest();
        
        System.assertEquals(false, result.success);
        System.assert(result.message.startsWith('API Error:'));
    }
    
    @isTest
    static void testAPIServiceCreateInvoiceException() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        // Delete the settings to cause an exception
        delete [SELECT Id FROM QuickBooks_Settings__c];
        
        Test.startTest();
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksAPIService.createInvoice(
                opp.Id, 
                'https://test.salesforce.com', 
                '1234567890'
            );
        
        Test.stopTest();
        
        System.assertEquals(false, result.success);
        System.assert(result.message.startsWith('Error calling API:'));
    }
    
    @isTest
    static void testAPIServiceTestConnectionSuccess() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new QuickBooksMockHttpResponse());
        
        Boolean result = QuickBooksAPIService.testConnection();
        
        Test.stopTest();
        
        System.assertEquals(true, result);
    }
    
    @isTest
    static void testAPIServiceTestConnectionFailure() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new QuickBooksMockErrorResponse());
        
        Boolean result = QuickBooksAPIService.testConnection();
        
        Test.stopTest();
        
        System.assertEquals(false, result);
    }
    
    @isTest
    static void testAPIServiceTestConnectionException() {
        // Delete the settings to cause an exception
        delete [SELECT Id FROM QuickBooks_Settings__c];
        
        Test.startTest();
        
        Boolean result = QuickBooksAPIService.testConnection();
        
        Test.stopTest();
        
        System.assertEquals(false, result);
    }
    
    /**
     * Mock HTTP success response for testing
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
    
    /**
     * Mock HTTP error response for testing
     */
    private class QuickBooksMockErrorResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setStatusCode(400);
            res.setBody('{"success":false,"message":"Invalid request"}');
            return res;
        }
    }
}
