/**
 * Additional test class for QuickBooks integration to improve code coverage
 * Focuses on edge cases and missing branch coverage
 */
@isTest
private class QuickBooksInvoiceControllerExtraTest {
  
    /** 1. SOQL exception when Opportunity ID doesn't exist */
    @isTest
    static void testCreateInvoice_OppNotFound() {
        // no Opp inserted with this Id
        Id fakeOppId = Id.valueOf('006000000000000AAA');
        
        Test.startTest();
        QuickBooksInvoiceController.InvoiceResult res =
            QuickBooksInvoiceController.createInvoice(fakeOppId);
        Test.stopTest();
        
        System.assertEquals(false, res.success);
        System.assert(
            res.message.contains('Error:'),
            'Expected SOQL exception message, got: ' + res.message
        );
    }
    
    /** 2. Controller surface‐level API error (service returns 400) */
    @isTest
    static void testCreateInvoice_ApiError() {
        // Set up valid Opp + Settings
        Account acct = new Account(
            Name='A',
            BillingStreet = '123 Main St',
            BillingCity = 'Test City',
            BillingCountry = 'US'
        ); 
        insert acct;

        Account supplier = new Account(Name = 'Supplier A');
        insert supplier;
        
        Opportunity opp = new Opportunity(
            Name='O', 
            AccountId=acct.Id, 
            StageName='Closed Won',
            CloseDate=Date.today(), 
            Amount=1000,
            Supplier__c=supplier.Id,
            Email_for_invoice__c = 'api-error@example.com'
        );
        insert opp;
        
        insert new QuickBooks_Settings__c(
            Middleware_URL__c='http://test', 
            API_Key__c='k', 
            QB_Realm_ID__c='r'
        );
        
        // Mock HTTP 400 response
        Test.setMock(HttpCalloutMock.class, new QuickBooksMockErrorResponse());
        
        Test.startTest();
        QuickBooksInvoiceController.InvoiceResult res =
            QuickBooksInvoiceController.createInvoice(opp.Id);
        Test.stopTest();
        
        System.assertEquals(false, res.success);
        System.assert(
            res.message.contains('API Error:') || res.message.contains('Error:'),
            'Expected API Error branch, got: ' + res.message
        );
    }
    
    /** 3. Testing with missing settings */
    @isTest
    static void testCreateInvoice_BlankSettingsField() {
        // Opp exists
        Account acct = new Account(
            Name='A',
            BillingStreet = '123 Main St',
            BillingCity = 'Test City',
            BillingCountry = 'US'
        ); 
        insert acct;

        Account supplier = new Account(Name = 'Supplier B');
        insert supplier;
        
        Opportunity opp = new Opportunity(
            Name='O', 
            AccountId=acct.Id, 
            StageName='Closed Won',
            CloseDate=Date.today(), 
            Amount=1000,
            Supplier__c=supplier.Id,
            Email_for_invoice__c = 'blank-settings@example.com'
        );
        insert opp;
        
        // Delete any existing settings
        List<QuickBooks_Settings__c> existingSettings = [SELECT Id FROM QuickBooks_Settings__c];
        if (!existingSettings.isEmpty()) {
            delete existingSettings;
        }
        
        Test.startTest();
        QuickBooksInvoiceController.InvoiceResult res =
            QuickBooksInvoiceController.createInvoice(opp.Id);
        Test.stopTest();
        
        System.assertEquals(false, res.success);
        System.assertEquals(
            'QuickBooks integration is not configured. Please contact your administrator.',
            res.message
        );
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
