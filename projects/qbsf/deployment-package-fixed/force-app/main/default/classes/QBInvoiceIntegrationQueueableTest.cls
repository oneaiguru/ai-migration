/**
 * Test class for QBInvoiceIntegrationQueueable
 * Provides 75%+ code coverage as required
 */
@isTest
private class QBInvoiceIntegrationQueueableTest {
    
    @testSetup
    static void setupTestData() {
        // Create QB Integration Settings
        QB_Integration_Settings__c qbSettings = new QB_Integration_Settings__c(
            Middleware_Endpoint__c = 'https://test-middleware.example.com',
            API_Key__c = 'test-api-key-123',
            QB_Realm_ID__c = 'test-realm-456'
        );
        insert qbSettings;
        
        // Create test account (US Supplier)
        Account testAccount = new Account(
            Name = 'Test US Supplier',
            Account_Type__c = 'Поставщик',
            Country__c = 'US',
            BillingStreet = '123 Test St',
            BillingCity = 'Test City',
            BillingState = 'CA',
            BillingPostalCode = '12345',
            BillingCountry = 'USA',
            Phone = '555-555-5555',
            Email__c = 'test@example.com'
        );
        insert testAccount;
        
        // Create test opportunity
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            CloseDate = Date.today().addDays(30),
            StageName = 'Proposal and Agreement',
            Amount = 1000
        );
        insert testOpp;
    }
    
    @isTest
    static void testSuccessfulInvoiceIntegration() {
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        
        // Execute the queueable job
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        
        Test.stopTest();
        
        // Verify that opportunity was updated with QB Invoice ID (in test context)
        Opportunity updatedOpp = [
            SELECT Id, QB_Invoice_ID__c, QB_Last_Sync_Date__c
            FROM Opportunity 
            WHERE Id = :testOpp.Id
        ];
        
        System.assertNotEquals(null, updatedOpp.QB_Invoice_ID__c, 'QB Invoice ID should be set');
        System.assert(updatedOpp.QB_Invoice_ID__c.startsWith('TEST-QB-INV-'), 'Should have test QB Invoice ID format');
        System.assertNotEquals(null, updatedOpp.QB_Last_Sync_Date__c, 'Last sync date should be set');
    }
    
    @isTest
    static void testMissingSettings() {
        // Delete QB settings to test error handling
        delete [SELECT Id FROM QB_Integration_Settings__c];
        
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        
        try {
            QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
            System.enqueueJob(queueable);
        } catch (Exception e) {
            System.assert(e.getMessage().contains('Middleware endpoint not configured'), 'Should indicate missing configuration');
        }
        
        Test.stopTest();
        
        // Verify error log was created
        List<QB_Integration_Error_Log__c> errorLogs = [
            SELECT Id, Error_Message__c 
            FROM QB_Integration_Error_Log__c 
            WHERE Opportunity__c = :testOpp.Id
        ];
        
        System.assertEquals(1, errorLogs.size(), 'Should create error log');
        System.assert(errorLogs[0].Error_Message__c.contains('Middleware endpoint not configured'), 'Should log configuration error');
    }
    
    @isTest
    static void testBulkProcessing() {
        Account testAccount = [SELECT Id FROM Account LIMIT 1];
        
        List<Opportunity> opportunities = new List<Opportunity>();
        for (Integer i = 0; i < 5; i++) {
            opportunities.add(new Opportunity(
                Name = 'Bulk Test Opportunity ' + i,
                AccountId = testAccount.Id,
                CloseDate = Date.today().addDays(30),
                StageName = 'Proposal and Agreement',
                Amount = 1000 + (i * 100)
            ));
        }
        insert opportunities;
        
        Test.startTest();
        
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(opportunities);
        System.enqueueJob(queueable);
        
        Test.stopTest();
        
        // Verify all opportunities were processed
        List<Opportunity> processedOpps = [
            SELECT Id, QB_Invoice_ID__c 
            FROM Opportunity 
            WHERE Id IN :opportunities
        ];
        
        for (Opportunity opp : processedOpps) {
            System.assertNotEquals(null, opp.QB_Invoice_ID__c, 'All opportunities should have QB Invoice ID');
        }
    }
    
    @isTest
    static void testLogMethods() {
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        
        // Test the private log methods indirectly through the queueable execution
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        
        Test.stopTest();
        
        // Verify success log was created
        List<QB_Integration_Log__c> successLogs = [
            SELECT Id, Status__c, QB_Invoice_ID__c 
            FROM QB_Integration_Log__c 
            WHERE Opportunity__c = :testOpp.Id
        ];
        
        System.assertEquals(1, successLogs.size(), 'Should create success log');
        System.assertEquals('Success', successLogs[0].Status__c, 'Should log success status');
        System.assertNotEquals(null, successLogs[0].QB_Invoice_ID__c, 'Should log QB Invoice ID');
    }
}
