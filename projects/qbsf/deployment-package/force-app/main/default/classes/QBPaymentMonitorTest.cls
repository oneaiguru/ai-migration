@isTest
private class QBPaymentMonitorTest {
    
    @testSetup
    static void setupTestData() {
        // Create QB integration settings
        QB_Integration_Settings__c qbSettings = new QB_Integration_Settings__c();
        qbSettings.Middleware_Endpoint__c = 'https://test-middleware.example.com';
        qbSettings.API_Key__c = 'test-api-key-123';
        qbSettings.QB_Realm_ID__c = 'test-realm-456';
        insert qbSettings;
    }
    
    @isTest
    static void testScheduledPaymentCheck() {
        Test.startTest();
        
        // Test scheduling the job
        QBPaymentMonitor.schedulePaymentMonitoring();
        
        // Verify job was scheduled
        List<CronTrigger> jobs = [
            SELECT Id, CronJobDetail.Name 
            FROM CronTrigger 
            WHERE CronJobDetail.Name LIKE 'QB Payment Monitor%'
        ];
        
        System.assertEquals(1, jobs.size(), 'Payment monitor job should be scheduled');
        
        Test.stopTest();
    }
    
    @isTest
    static void testPaymentCheckExecution() {
        // Set up mock HTTP response
        Test.setMock(HttpCalloutMock.class, new MockPaymentCheckSuccess());
        
        Test.startTest();
        
        // Execute the payment check
        QBPaymentMonitor monitor = new QBPaymentMonitor();
        monitor.execute(null);
        
        Test.stopTest();
        
        // Verify log entry was created
        List<QB_Integration_Log__c> logs = [
            SELECT Id, Operation__c, Records_Processed__c, Success_Count__c
            FROM QB_Integration_Log__c
            WHERE Operation__c = 'Payment Status Check'
        ];
        
        System.assertEquals(1, logs.size(), 'Payment check should be logged');
        System.assertEquals(5, logs[0].Records_Processed__c, 'Should process 5 records');
        System.assertEquals(2, logs[0].Success_Count__c, 'Should update 2 records');
    }
    
    @isTest
    static void testPaymentCheckWithError() {
        // Set up mock HTTP error response
        Test.setMock(HttpCalloutMock.class, new MockPaymentCheckError());
        
        Test.startTest();
        
        QBPaymentMonitor.runPaymentCheckNow();
        
        Test.stopTest();
        
        // Verify error was logged
        List<QB_Integration_Log__c> logs = [
            SELECT Id, Operation__c, Error_Count__c, Details__c
            FROM QB_Integration_Log__c
            WHERE Operation__c = 'Payment Status Check'
        ];
        
        System.assertEquals(1, logs.size(), 'Error should be logged');
        System.assertEquals(1, logs[0].Error_Count__c, 'Should have 1 error');
        System.assert(logs[0].Details__c.contains('Error'), 'Should contain error message');
    }
    
    @isTest
    static void testPaymentCheckWithoutSettings() {
        // Delete settings
        delete [SELECT Id FROM QB_Integration_Settings__c];
        
        Test.startTest();
        
        QBPaymentMonitor.runPaymentCheckNow();
        
        Test.stopTest();
        
        // Should handle gracefully without settings
        // No assertion needed as it should not throw an exception
    }
    
    // Mock HTTP callout classes
    private class MockPaymentCheckSuccess implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            response.setStatusCode(200);
            response.setBody('{"success":true,"invoicesProcessed":5,"paidInvoicesFound":2,"invoicesUpdated":2}');
            return response;
        }
    }
    
    private class MockPaymentCheckError implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            response.setStatusCode(500);
            response.setBody('{"success":false,"error":"Internal Server Error"}');
            return response;
        }
    }
}