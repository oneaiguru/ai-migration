/**
 * Comprehensive test class for QuickBooks integration
 * Covers both the controller and API service
 */
@isTest
private class QuickBooksComprehensiveTest {

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
            BillingPostalCode = '12345',
            BillingCountry = 'US'
        );
        insert testAccount;

        Account supplier = new Account(Name = 'Test Supplier');
        insert supplier;

        // Create test opportunity (Supplier__c lookup points to Account)
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            StageName = 'Closed Won',
            CloseDate = Date.today().addDays(30),
            Amount = 1000,
            Supplier__c = supplier.Id,
            Email_for_invoice__c = 'comprehensive@example.com'
        );
        insert testOpp;
    }
    
    // --- QuickBooksInvoiceController Tests ---
    
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
    
    // --- QuickBooksAPIService Tests ---
    
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
        System.assert(result.message.contains('QuickBooks API call failed'), 'Expected API error message, got: ' + result.message);
    }
    
    // --- Mock Classes ---
    
    // Mock successful HTTP response
    private class QuickBooksMockHttpResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"success":true,"message":"Invoice created successfully","invoiceId":"INV-456","invoiceNumber":"INV-456"}');
            return res;
        }
    }
    
    // Mock error HTTP response
    private class QuickBooksMockErrorResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(500);
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"success":false,"message":"QuickBooks API call failed"}');
            return res;
        }
    }
}
