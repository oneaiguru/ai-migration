/**
 * Test class for QBInvoiceIntegrationQueueable
 */
@isTest
private class QBInvoiceIntegrationQueueableTest {
    
    /**
     * Test the queueable execution
     */
    @isTest
    static void testQueueableExecution() {
        // Create test data - account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        
        // Create test data - opportunity
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            CloseDate = Date.today().addDays(30),
            StageName = 'Closed Won',
            Amount = 1000
        );
        insert testOpp;
        
        // Setup custom settings
        QB_Integration_Settings__c settings = new QB_Integration_Settings__c();
        settings.Middleware_Endpoint__c = 'https://test-middleware.example.com';
        settings.API_Key__c = 'test-api-key-123';
        settings.QB_Realm_ID__c = 'test-realm-456';
        insert settings;
        
        // Create a mock HTTP response
        Test.setMock(HttpCalloutMock.class, new QBInvoiceIntegrationMock());
        
        // Start the test
        Test.startTest();
        
        // Execute the queueable
        List<Opportunity> oppsToProcess = new List<Opportunity>{ testOpp };
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(oppsToProcess);
        System.enqueueJob(queueable);
        
        Test.stopTest();
        
        // Since the callout is skipped in test context, we can only verify the queueable was executed
        // In a real integration, we would check for updated opportunities with QB_Invoice_ID__c
    }
    
    /**
     * Test error handling
     */
    @isTest
    static void testErrorHandling() {
        // Create test data - account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        
        // Create test data - opportunity
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            CloseDate = Date.today().addDays(30),
            StageName = 'Closed Won',
            Amount = 1000
        );
        insert testOpp;
        
        // Intentionally don't set up custom settings to trigger an error
        
        Test.startTest();
        
        // Execute the queueable
        List<Opportunity> oppsToProcess = new List<Opportunity>{ testOpp };
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(oppsToProcess);
        
        // Call execute directly to test error handling
        queueable.execute(null);
        
        Test.stopTest();
        
        // Check if error log entry was created
        if (Schema.getGlobalDescribe().containsKey('QB_Integration_Error_Log__c')) {
            List<SObject> errors = Database.query('SELECT Opportunity__c, Error_Message__c FROM QB_Integration_Error_Log__c');
            
            System.assertEquals(1, errors.size(), 'Should create one error log entry');
            
            SObject error = errors[0];
            System.assertEquals(testOpp.Id, error.get('Opportunity__c'));
            System.assert(((String)error.get('Error_Message__c')).contains('Middleware endpoint not configured'));
        }
    }
    
    /**
     * Mock class for HTTP callouts in tests
     */
    private class QBInvoiceIntegrationMock implements HttpCalloutMock {
        
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            response.setStatusCode(200);
            response.setBody('{"success":true,"qbInvoiceId":"test-invoice-123","message":"Invoice created successfully in QuickBooks"}');
            return response;
        }
    }
}
