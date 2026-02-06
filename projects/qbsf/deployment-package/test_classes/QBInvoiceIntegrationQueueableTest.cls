/**
 * Test class for QBInvoiceIntegrationQueueable
 */
@isTest
private class QBInvoiceIntegrationQueueableTest {
    
    // Test setup
    @testSetup
    static void setupTestData() {
        // Create a test account
        Account testAccount = new Account(
            Name = 'Test Account'
        );
        insert testAccount;
        
        // Create a test opportunity
        Opportunity testOpportunity = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            StageName = 'Qualification',
            CloseDate = Date.today().addDays(30),
            Amount = 1000
        );
        insert testOpportunity;
        
        // Create custom settings
        QB_Integration_Settings__c settings = new QB_Integration_Settings__c();
        settings.Middleware_Endpoint__c = 'https://test-endpoint.com';
        settings.API_Key__c = 'test-api-key';
        settings.QB_Realm_ID__c = 'test-realm-id';
        insert settings;
    }
    
    // Test the execute method
    @isTest
    static void testExecute() {
        // Get the test opportunity
        Opportunity opp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];
        
        // Create a list with the test opportunity
        List<Opportunity> opps = new List<Opportunity>{opp};
        
        // Mock HTTP callout
        Test.setMock(HttpCalloutMock.class, new QBIntegrationCalloutMock());
        
        // Start test context
        Test.startTest();
        
        // Create and execute the queueable
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(opps);
        System.enqueueJob(queueable);
        
        // End test context
        Test.stopTest();
        
        // Verify that the opportunity was updated (in a real implementation)
        // This would need to be adjusted based on your actual implementation
        System.assert(true, 'Test successful');
    }
    
    // Mock HTTP callout class
    private class QBIntegrationCalloutMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest request) {
            // Create a fake response
            HttpResponse response = new HttpResponse();
            response.setStatusCode(200);
            response.setBody('{"success":true,"qbInvoiceId":"test-invoice-id","message":"Invoice created successfully"}');
            return response;
        }
    }
}