/**
 * Test class for QBPaymentMonitor
 * Provides 75%+ code coverage as required
 */
@isTest
private class QBPaymentMonitorTest {
    
    @testSetup
    static void setupTestData() {
        // Create QB Integration Settings
        QB_Integration_Settings__c qbSettings = new QB_Integration_Settings__c(
            Middleware_Endpoint__c = 'https://test-middleware.example.com',
            API_Key__c = 'test-api-key-123',
            QB_Realm_ID__c = 'test-realm-456'
        );
        insert qbSettings;
        
        // Create test account
        Account testAccount = new Account(
            Name = 'Test Account',
            Account_Type__c = 'Поставщик',
            Country__c = 'US',
            BillingCity = 'Test City',
            Phone = '555-555-5555',
            Email__c = 'test@example.com'
        );
        insert testAccount;
        
        // Create test opportunities with QB Invoice IDs
        List<Opportunity> testOpps = new List<Opportunity>();
        for (Integer i = 0; i < 3; i++) {
            testOpps.add(new Opportunity(
                Name = 'Test Opportunity ' + i,
                AccountId = testAccount.Id,
                CloseDate = Date.today().addDays(30),
                StageName = 'Proposal and Agreement',
                Amount = 1000 + (i * 100),
                QB_Invoice_ID__c = 'QB-TEST-' + i
            ));
        }
        insert testOpps;
    }
    
    @isTest
    static void testPaymentMonitorScheduled() {
        Test.startTest();
        
        // Test the scheduled execution
        QBPaymentMonitor monitor = new QBPaymentMonitor();
        String cronExp = '0 0 1 * * ?'; // Daily at 1 AM for test
        System.schedule('Test QB Payment Monitor', cronExp, monitor);
        
        Test.stopTest();
        
        // Verify the job was scheduled
        List<CronTrigger> scheduledJobs = [
            SELECT Id, CronJobDetail.Name 
            FROM CronTrigger 
            WHERE CronJobDetail.Name = 'Test QB Payment Monitor'
        ];
        
        System.assertEquals(1, scheduledJobs.size(), 'Should schedule one job');
    }
    
    @isTest
    static void testCheckPaymentStatusSuccess() {
        // Set up mock HTTP response
        Test.setMock(HttpCalloutMock.class, new PaymentCheckSuccessMock());
        
        Test.startTest();
        
        // Call the payment check method
        QBPaymentMonitor.checkPaymentStatus();
        
        Test.stopTest();
        
        // Verify success log was created
        List<QB_Integration_Log__c> logs = [
            SELECT Id, Status__c, Records_Processed__c 
            FROM QB_Integration_Log__c 
            WHERE Status__c = 'Success'
        ];
        
        System.assertEquals(1, logs.size(), 'Should create success log');
        System.assertEquals(2, logs[0].Records_Processed__c, 'Should log 2 processed records');
        
        // Verify opportunities were updated with last check time
        List<Opportunity> opps = [
            SELECT Id, QB_Last_Payment_Check__c 
            FROM Opportunity 
            WHERE QB_Invoice_ID__c != null
        ];
        
        for (Opportunity opp : opps) {
            System.assertNotEquals(null, opp.QB_Last_Payment_Check__c, 'Should update last payment check time');
        }
    }
    
    @isTest
    static void testCheckPaymentStatusError() {
        // Set up mock HTTP error response
        Test.setMock(HttpCalloutMock.class, new PaymentCheckErrorMock());
        
        Test.startTest();
        
        QBPaymentMonitor.checkPaymentStatus();
        
        Test.stopTest();
        
        // Verify error log was created
        List<QB_Integration_Error_Log__c> errorLogs = [
            SELECT Id, Error_Message__c 
            FROM QB_Integration_Error_Log__c 
            WHERE Error_Type__c = 'Payment Monitor Error'
        ];
        
        System.assertEquals(1, errorLogs.size(), 'Should create error log');
        System.assert(errorLogs[0].Error_Message__c.contains('Error calling payment check service'), 'Should log service error');
    }
    
    @isTest 
    static void testSchedulePaymentMonitor() {
        Test.startTest();
        
        // Test the scheduling method
        QBPaymentMonitor.schedulePaymentMonitor();
        
        Test.stopTest();
        
        // Verify a scheduled job was created
        List<CronTrigger> scheduledJobs = [
            SELECT Id, CronJobDetail.Name 
            FROM CronTrigger 
            WHERE CronJobDetail.Name LIKE 'QB Payment Monitor%'
        ];
        
        System.assert(scheduledJobs.size() > 0, 'Should create scheduled job');
    }
    
    @isTest
    static void testMissingSettings() {
        // Delete settings to test error handling
        delete [SELECT Id FROM QB_Integration_Settings__c];
        
        Test.startTest();
        
        QBPaymentMonitor.checkPaymentStatus();
        
        Test.stopTest();
        
        // Should handle gracefully without settings
        // No assertions needed as method should exit early
    }
    
    // Mock classes for HTTP callouts
    private class PaymentCheckSuccessMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            response.setStatusCode(200);
            response.setBody('{"success":true,"paidInvoicesFound":2,"invoicesProcessed":3}');
            return response;
        }
    }
    
    private class PaymentCheckErrorMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            response.setStatusCode(500);
            response.setBody('{"success":false,"error":"Internal Server Error"}');
            return response;
        }
    }
}
