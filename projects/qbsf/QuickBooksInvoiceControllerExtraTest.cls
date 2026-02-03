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
            res.message.contains('List has no rows'),
            'Expected SOQL exception message, got: ' + res.message
        );
    }
    
    /** 2. Controller surface‐level API error (service returns 400) */
    @isTest
    static void testCreateInvoice_ApiError() {
        // Set up valid Opp + Settings
        Account acct = new Account(Name='A'); 
        insert acct;
        
        Opportunity opp = new Opportunity(
            Name='O', 
            AccountId=acct.Id, 
            StageName='Closed Won',
            CloseDate=Date.today(), 
            Amount=1000
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
            res.message.startsWith('API Error:'),
            'Expected API Error branch, got: ' + res.message
        );
    }
    
    /** 3. Settings record exists but URL or API key blank */
    @isTest
    static void testCreateInvoice_BlankSettingsField() {
        // Opp exists
        Account acct = new Account(Name='A'); 
        insert acct;
        
        Opportunity opp = new Opportunity(
            Name='O', 
            AccountId=acct.Id, 
            StageName='Closed Won',
            CloseDate=Date.today(), 
            Amount=1000
        );
        insert opp;
        
        // Insert settings with missing API key to test validation
        insert new QuickBooks_Settings__c(
            Middleware_URL__c='http://test', 
            QB_Realm_ID__c='r'
        );
        
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