/**
 * Test class for QuickBooks integration
 */
@isTest
private class QuickBooksInvoiceControllerTest {
    
    @testSetup
    static void setup() {
        // Create test data
        Account testAccount = new Account(
            Name = 'Test Account',
            BillingStreet = '123 Main St',
            BillingCity = 'Test City',
            BillingCountry = 'US'
        );
        insert testAccount;

        Account supplier = new Account(Name = 'Test Supplier');
        insert supplier;
        
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            Supplier__c = supplier.Id,
            StageName = 'Closed Won',
            CloseDate = Date.today(),
            Amount = 1000,
            Email_for_invoice__c = 'controller@example.com'
        );
        insert testOpp;
    }
    
    @isTest
    static void testCreateInvoiceSuccess() {
        // First, insert custom settings for the test
        QuickBooks_Settings__c settings = new QuickBooks_Settings__c(
            Middleware_URL__c = 'https://3a62-166-1-160-232.ngrok-free.app', // Use ngrok URL
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
            Middleware_URL__c = 'https://3a62-166-1-160-232.ngrok-free.app', // Use ngrok URL
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
