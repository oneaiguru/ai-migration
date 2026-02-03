/**
 * Test class for QBPaymentStatusScheduler
 */
@isTest
private class QBPaymentStatusSchedulerTest {
    
    /**
     * Test the scheduled job execution
     */
    @isTest
    static void testScheduledJobExecution() {
        // Create test data - account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        
        // Create test data - opportunity with QB Invoice ID
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            CloseDate = Date.today().addDays(30),
            StageName = 'Negotiation/Review', // Not Closed Won yet
            Amount = 1000,
            QB_Invoice_ID__c = 'test-invoice-123' // This would be checked for payment
        );
        insert testOpp;
        
        // Setup custom settings
        QB_Integration_Settings__c settings = new QB_Integration_Settings__c();
        settings.Middleware_Endpoint__c = 'https://test-middleware.example.com';
        settings.API_Key__c = 'test-api-key-123';
        settings.QB_Realm_ID__c = 'test-realm-456';
        insert settings;
        
        // Create a mock HTTP response
        Test.setMock(HttpCalloutMock.class, new QBPaymentStatusMock());
        
        // Schedule the job
        Test.startTest();
        
        // Testing the schedule method
        String jobId = System.schedule(
            'Test Payment Status Check', 
            '0 0 0 15 3 ? 2099', // Schedule for future date
            new QBPaymentStatusScheduler()
        );
        
        // Manually execute the job
        QBPaymentStatusScheduler scheduler = new QBPaymentStatusScheduler();
        scheduler.execute(null);
        
        Test.stopTest();
        
        // Verify the job was scheduled
        CronTrigger cronTrigger = [SELECT Id, CronExpression, TimesTriggered, NextFireTime 
                                  FROM CronTrigger 
                                  WHERE Id = :jobId];
        
        System.assertEquals('0 0 0 15 3 ? 2099', cronTrigger.CronExpression);
        System.assertEquals(0, cronTrigger.TimesTriggered);
        
        // Since we're using a mock, we can only verify the method was called
        // In a real scenario, we would check for updated opportunities
    }
    
    /**
     * Test success handling
     */
    @isTest
    static void testSuccessHandling() {
        // Setup custom settings
        QB_Integration_Settings__c settings = new QB_Integration_Settings__c();
        settings.Middleware_Endpoint__c = 'https://test-middleware.example.com';
        settings.API_Key__c = 'test-api-key-123';
        settings.QB_Realm_ID__c = 'test-realm-456';
        insert settings;
        
        // Create a mock HTTP response with success
        Test.setMock(HttpCalloutMock.class, new QBPaymentStatusMock(true));
        
        Test.startTest();
        
        // Manually execute the job
        QBPaymentStatusScheduler scheduler = new QBPaymentStatusScheduler();
        scheduler.execute(null);
        
        Test.stopTest();
        
        // Check if log entry was created
        if (Schema.getGlobalDescribe().containsKey('QB_Integration_Log__c')) {
            List<SObject> logs = Database.query('SELECT Process_Name__c, Status__c, Message__c FROM QB_Integration_Log__c');
            
            System.assertEquals(1, logs.size(), 'Should create one log entry');
            
            SObject log = logs[0];
            System.assertEquals('Payment Status Check', log.get('Process_Name__c'));
            System.assertEquals('Success', log.get('Status__c'));
        }
    }
    
    /**
     * Test error handling
     */
    @isTest
    static void testErrorHandling() {
        // Setup custom settings
        QB_Integration_Settings__c settings = new QB_Integration_Settings__c();
        settings.Middleware_Endpoint__c = 'https://test-middleware.example.com';
        settings.API_Key__c = 'test-api-key-123';
        settings.QB_Realm_ID__c = 'test-realm-456';
        insert settings;
        
        // Create a mock HTTP response with error
        Test.setMock(HttpCalloutMock.class, new QBPaymentStatusMock(false));
        
        Test.startTest();
        
        // Manually execute the job
        QBPaymentStatusScheduler scheduler = new QBPaymentStatusScheduler();
        scheduler.execute(null);
        
        Test.stopTest();
        
        // Check if error log entry was created
        if (Schema.getGlobalDescribe().containsKey('QB_Integration_Log__c')) {
            List<SObject> logs = Database.query('SELECT Process_Name__c, Status__c, Message__c FROM QB_Integration_Log__c');
            
            System.assertEquals(1, logs.size(), 'Should create one error log entry');
            
            SObject log = logs[0];
            System.assertEquals('Payment Status Check', log.get('Process_Name__c'));
            System.assertEquals('Error', log.get('Status__c'));
            System.assert(((String)log.get('Message__c')).contains('HTTP Error'));
        }
    }
    
    /**
     * Test scheduling method
     */
    @isTest
    static void testScheduleNightly() {
        Test.startTest();
        
        QBPaymentStatusScheduler.scheduleNightly();
        
        Test.stopTest();
        
        // Verify the job was scheduled with the correct cron expression
        List<CronTrigger> cronTriggers = [SELECT Id, CronExpression 
                                         FROM CronTrigger 
                                         WHERE CronJobDetail.Name = 'QuickBooks Payment Status Check'];
        
        System.assertEquals(1, cronTriggers.size(), 'Should schedule one job');
        System.assertEquals('0 0 1 * * ?', cronTriggers[0].CronExpression, 'Should schedule for 1:00 AM');
    }
    
    /**
     * Mock class for HTTP callouts in tests
     */
    private class QBPaymentStatusMock implements HttpCalloutMock {
        
        private Boolean success;
        
        public QBPaymentStatusMock() {
            this.success = true;
        }
        
        public QBPaymentStatusMock(Boolean success) {
            this.success = success;
        }
        
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            
            if (success) {
                response.setStatusCode(200);
                response.setBody('{"success":true,"invoicesProcessed":2,"paidInvoicesFound":1,"invoicesUpdated":1,"message":"Successfully updated 1 Salesforce records"}');
            } else {
                response.setStatusCode(500);
                response.setBody('{"success":false,"error":"Internal Server Error"}');
            }
            
            return response;
        }
    }
}
