/**
 * Test class for QBInvoiceSyncQueueable  
 * Provides 75%+ code coverage as required
 */
@isTest
private class QBInvoiceSyncQueueableTest {
    
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
        
        // Create test opportunity
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            CloseDate = Date.today().addDays(30),
            StageName = 'Proposal and Agreement',
            Amount = 1000,
            Supplier__c = testAccount.Id
        );
        insert testOpp;
        
        // Create test SF Invoice
        QB_Invoice__c testInvoice = new QB_Invoice__c(
            Opportunity__c = testOpp.Id,
            Account__c = testAccount.Id,
            Amount__c = 1000,
            Status__c = 'Draft',
            Invoice_Date__c = Date.today(),
            Due_Date__c = Date.today().addDays(30),
            Description__c = 'Test Invoice'
        );
        insert testInvoice;
        
        // Create test line item
        QB_Invoice_Line_Item__c lineItem = new QB_Invoice_Line_Item__c(
            Invoice__c = testInvoice.Id,
            Description__c = 'Test Service',
            Quantity__c = 1,
            Unit_Price__c = 1000
        );
        insert lineItem;
    }
    
    @isTest
    static void testSyncInvoiceToQuickBooks() {
        QB_Invoice__c testInvoice = [SELECT Id FROM QB_Invoice__c LIMIT 1];
        
        Test.startTest();
        
        QBInvoiceSyncQueueable queueable = new QBInvoiceSyncQueueable(new List<QB_Invoice__c>{testInvoice});
        System.enqueueJob(queueable);
        
        Test.stopTest();
        
        // Verify invoice was updated with QB Invoice ID (in test context)
        QB_Invoice__c updatedInvoice = [
            SELECT Id, QB_Invoice_ID__c, Status__c
            FROM QB_Invoice__c 
            WHERE Id = :testInvoice.Id
        ];
        
        System.assertNotEquals(null, updatedInvoice.QB_Invoice_ID__c, 'QB Invoice ID should be set');
        System.assert(updatedInvoice.QB_Invoice_ID__c.startsWith('TEST-QB-INV-'), 'Should have test QB Invoice ID format');
        System.assertEquals('Sent', updatedInvoice.Status__c, 'Status should be updated to Sent');
    }
    
    @isTest
    static void testMissingSettings() {
        // Delete QB settings
        delete [SELECT Id FROM QB_Integration_Settings__c];
        
        QB_Invoice__c testInvoice = [SELECT Id FROM QB_Invoice__c LIMIT 1];
        
        Test.startTest();
        
        QBInvoiceSyncQueueable queueable = new QBInvoiceSyncQueueable(new List<QB_Invoice__c>{testInvoice});
        System.enqueueJob(queueable);
        
        Test.stopTest();
        
        // Verify error log was created
        List<QB_Integration_Error_Log__c> errorLogs = [
            SELECT Id, Error_Message__c 
            FROM QB_Integration_Error_Log__c
        ];
        
        System.assertEquals(1, errorLogs.size(), 'Should create error log');
        System.assert(errorLogs[0].Error_Message__c.contains('Middleware endpoint not configured'), 'Should log configuration error');
    }
    
    @isTest
    static void testBulkProcessing() {
        Account testAccount = [SELECT Id FROM Account LIMIT 1];
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        
        List<QB_Invoice__c> invoices = new List<QB_Invoice__c>();
        for (Integer i = 0; i < 3; i++) {
            invoices.add(new QB_Invoice__c(
                Opportunity__c = testOpp.Id,
                Account__c = testAccount.Id,
                Amount__c = 1000 + (i * 100),
                Status__c = 'Draft',
                Invoice_Date__c = Date.today(),
                Due_Date__c = Date.today().addDays(30),
                Description__c = 'Bulk Test Invoice ' + i
            ));
        }
        insert invoices;
        
        Test.startTest();
        
        QBInvoiceSyncQueueable queueable = new QBInvoiceSyncQueueable(invoices);
        System.enqueueJob(queueable);
        
        Test.stopTest();
        
        // Verify all invoices were processed
        List<QB_Invoice__c> processedInvoices = [
            SELECT Id, QB_Invoice_ID__c 
            FROM QB_Invoice__c 
            WHERE Id IN :invoices
        ];
        
        for (QB_Invoice__c invoice : processedInvoices) {
            System.assertNotEquals(null, invoice.QB_Invoice_ID__c, 'All invoices should have QB Invoice ID');
        }
    }
}
