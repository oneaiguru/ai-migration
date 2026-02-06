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
            BillingStreet = '123 Test St',
            BillingCity = 'Test City',
            BillingState = 'CA',
            BillingPostalCode = '12345',
            BillingCountry = 'USA',
            Phone = '555-555-5555'
        );
        insert testAccount;

        Id supplierId = insertSupplier('Test Supplier');
        
        // Create test opportunity
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            Supplier__c = supplierId,
            CloseDate = Date.today().addDays(30),
            StageName = 'Prospecting',
            Amount = 1000,
            Email_for_invoice__c = 'integration@example.com'
        );
        insert testOpp;
    }
    
    @isTest
    static void testSuccessfulInvoiceIntegration() {
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];
        
        Test.startTest();
        
        // Execute the queueable job
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        
        Test.stopTest();
        
        // Verify that opportunity was updated with QB Invoice ID (in test context)
        Opportunity updatedOpp = [
            SELECT Id, QB_Invoice_ID__c, QB_Last_Sync_Date__c, QB_Sync_Status__c
            FROM Opportunity 
            WHERE Id = :testOpp.Id
        ];
        
        System.assertNotEquals(null, updatedOpp.QB_Invoice_ID__c, 'QB Invoice ID should be set');
        System.assert(updatedOpp.QB_Invoice_ID__c.startsWith('TEST-QB-INV-'), 'Should have test QB Invoice ID format');
        System.assertNotEquals(null, updatedOpp.QB_Last_Sync_Date__c, 'Last sync date should be set');
        System.assertEquals('Success', updatedOpp.QB_Sync_Status__c, 'Sync status should be Success in test bypass');
    }
    
    @isTest
    static void testMissingSettings() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;
        // Delete QB settings to test error handling
        delete [SELECT Id FROM QB_Integration_Settings__c];
        
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];
        
        Test.startTest();
        
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        
        Test.stopTest();
        
        // Check async job status
        List<AsyncApexJob> jobs = [SELECT Status, NumberOfErrors FROM AsyncApexJob WHERE ApexClass.Name = 'QBInvoiceIntegrationQueueable'];
        if (!jobs.isEmpty()) {
            System.assertEquals('Completed', jobs[0].Status, 'Job should complete even with errors');
        }

        Opportunity updatedOpp = [
            SELECT Id, QB_Sync_Status__c, QB_Error_Code__c
            FROM Opportunity
            WHERE Id = :testOpp.Id
        ];
        System.assertEquals('Error', updatedOpp.QB_Sync_Status__c, 'Missing settings should mark Error');
        System.assertEquals('CONFIG_MISSING', updatedOpp.QB_Error_Code__c, 'Missing settings should set CONFIG_MISSING');
    }
    
    @isTest
    static void testBulkProcessing() {
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test US Supplier' LIMIT 1];
        Id supplierId = getSupplierIdByName('Test Supplier');
        
        List<Opportunity> opportunities = new List<Opportunity>();
        for (Integer i = 0; i < 5; i++) {
            opportunities.add(new Opportunity(
                Name = 'Bulk Test Opportunity ' + i,
                AccountId = testAccount.Id,
                CloseDate = Date.today().addDays(30),
                StageName = 'Prospecting',
                Amount = 1000 + (i * 100),
                Supplier__c = supplierId,
                Email_for_invoice__c = 'bulk' + i + '@example.com'
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
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];
        
        Test.startTest();
        
        // Test the private log methods indirectly through the queueable execution
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        
        Test.stopTest();
        
        // Verify opportunity was updated (success case in test context)
        Opportunity updatedOpp = [
            SELECT Id, QB_Invoice_ID__c 
            FROM Opportunity 
            WHERE Id = :testOpp.Id
        ];
        
        System.assertNotEquals(null, updatedOpp.QB_Invoice_ID__c, 'Should update opportunity with QB Invoice ID');
    }

    @isTest
    static void testHttpError() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new HttpErrorMock());
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];
        
        Test.startTest();
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        Test.stopTest();
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;
        
        // Should handle errors gracefully without throwing exceptions
        System.assertEquals(0, [SELECT COUNT() FROM AsyncApexJob WHERE Status = 'Failed']);
    }

    @isTest
    static void testInvalidJsonResponse() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new InvalidJsonResponseMock());
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];
        
        Test.startTest();
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        Test.stopTest();
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;
    }

    @isTest
    static void testCalloutException() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new CalloutExceptionMock());
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];
        
        Test.startTest();
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        Test.stopTest();
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;
    }

    @isTest
    static void testAuthExpiredCreatesErrorLog() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new AuthExpiredMock());
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];

        Test.startTest();
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        Test.stopTest();
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;

        QB_Integration_Error_Log__c errorLog = [
            SELECT Error_Type__c, Error_Message__c
            FROM QB_Integration_Error_Log__c
            WHERE Opportunity__c = :testOpp.Id
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
        System.assertEquals('API Error', errorLog.Error_Type__c, 'Auth failures should be logged');
        System.assert(errorLog.Error_Message__c.contains('QuickBooks authorization expired'));
    }

    @isTest
    static void testNoTokensCreatesErrorLog() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new NoTokensMock());
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];

        Test.startTest();
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        Test.stopTest();
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;

        QB_Integration_Error_Log__c errorLog = [
            SELECT Error_Type__c, Error_Message__c
            FROM QB_Integration_Error_Log__c
            WHERE Opportunity__c = :testOpp.Id
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
        System.assertEquals('API Error', errorLog.Error_Type__c, 'Auth failures should be logged');
        System.assert(errorLog.Error_Message__c.contains('QuickBooks not connected'));
    }

    @isTest
    static void testAuthRevokedCreatesErrorLog() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new AuthRevokedMock());
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];

        Test.startTest();
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        Test.stopTest();
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;

        QB_Integration_Error_Log__c errorLog = [
            SELECT Error_Type__c, Error_Message__c
            FROM QB_Integration_Error_Log__c
            WHERE Opportunity__c = :testOpp.Id
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
        Opportunity updatedOpp = [
            SELECT Id, QB_Sync_Status__c, QB_Error_Code__c
            FROM Opportunity
            WHERE Id = :testOpp.Id
        ];
        System.assertEquals('API Error', errorLog.Error_Type__c, 'Auth failures should be logged');
        System.assert(errorLog.Error_Message__c.contains('Authorization revoked'));
        System.assertEquals('Error', updatedOpp.QB_Sync_Status__c, 'Auth errors should mark Error');
        System.assertEquals('AUTH_ERROR', updatedOpp.QB_Error_Code__c, 'Non-expired auth errors should use AUTH_ERROR');
    }

    @isTest
    static void testPreservePaymentLinkWhenMissing() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new WarningPaymentLinkMock());
        Opportunity testOpp = [
            SELECT Id, QB_Payment_Link__c
            FROM Opportunity
            WHERE Name = 'Test Opportunity'
            LIMIT 1
        ];
        testOpp.QB_Payment_Link__c = 'https://existing.link';
        update testOpp;

        Test.startTest();
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        Test.stopTest();
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;

        Opportunity updatedOpp = [
            SELECT Id, QB_Payment_Link__c
            FROM Opportunity
            WHERE Id = :testOpp.Id
        ];
        System.assertEquals(
            'https://existing.link',
            updatedOpp.QB_Payment_Link__c,
            'Existing payment link should be preserved when middleware omits it'
        );
    }

    @isTest
    static void testWarningLogStatus() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new WarningPaymentLinkMock());
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];

        Test.startTest();
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        Test.stopTest();
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;

        QB_Integration_Log__c logEntry = [
            SELECT Status__c
            FROM QB_Integration_Log__c
            WHERE Opportunity__c = :testOpp.Id
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
        System.assertEquals('Warning', logEntry.Status__c, 'Log status should match warning outcome');
    }

    @isTest
    static void testWarningPaymentMessageStoredWhenLinkMissing() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new WarningPaymentLinkMock());
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];

        Test.startTest();
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        Test.stopTest();
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;

        Opportunity updatedOpp = [
            SELECT QB_Sync_Status__c, QB_Payment_Link_Status__c, QB_Error_Message__c
            FROM Opportunity
            WHERE Id = :testOpp.Id
        ];
        System.assertEquals('Warning', updatedOpp.QB_Sync_Status__c);
        System.assertEquals('INVOICE_NO_BILLEMAIL', updatedOpp.QB_Payment_Link_Status__c);
        System.assert(updatedOpp.QB_Error_Message__c.contains('No billing email'));
    }

    @isTest 
    static void testSuccessfulHttpResponse() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new SuccessfulHttpMock());
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];
        
        Test.startTest();
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        Test.stopTest();
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;
        
        // Verify opportunity was updated with QB Invoice ID
        Opportunity updatedOpp = [
            SELECT Id, QB_Invoice_ID__c, QB_Payment_Link_Status__c
            FROM Opportunity
            WHERE Id = :testOpp.Id
        ];
        System.assertNotEquals(null, updatedOpp.QB_Invoice_ID__c);
        System.assertEquals('SUCCESS', updatedOpp.QB_Payment_Link_Status__c);
    }

    @isTest
    static void testFailedHttpResponse() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new FailedHttpMock());
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];
        
        Test.startTest();
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        Test.stopTest();
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;
    }

    @isTest
    static void testCurrencyWarningSetsStatus() {
        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new WarningCurrencyMock());
        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];

        Test.startTest();
        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
        System.enqueueJob(queueable);
        Test.stopTest();
        QBInvoiceIntegrationQueueable.allowTestCallouts = false;

        Opportunity updatedOpp = [
            SELECT QB_Sync_Status__c, QB_Error_Code__c, QB_Error_Message__c
            FROM Opportunity
            WHERE Id = :testOpp.Id
        ];
        System.assertEquals('Warning', updatedOpp.QB_Sync_Status__c);
        System.assertEquals('CURRENCY_MISMATCH_CONVERTED', updatedOpp.QB_Error_Code__c);
        System.assert(updatedOpp.QB_Error_Message__c.contains('Converted'));
    }

    // Mock classes for testing HTTP scenarios
    public class HttpErrorMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(500);
            res.setStatus('Internal Server Error');
            res.setBody('{"error": "Server error"}');
            return res;
        }
    }

    public class InvalidJsonResponseMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('{invalid json');
            return res;
        }
    }

    public class CalloutExceptionMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            throw new CalloutException('Callout failed');
        }
    }

    public class AuthExpiredMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(401);
            res.setBody('{"errorCode": "AUTH_EXPIRED", "error": "Token expired"}');
            return res;
        }
    }

    public class NoTokensMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(401);
            res.setBody('{"errorCode": "NO_TOKENS", "error": "QuickBooks not connected", "reauthorizeUrl": "https://sqint.atocomm.eu/auth/quickbooks"}');
            return res;
        }
    }

    public class AuthRevokedMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(401);
            res.setBody('{"errorCode": "AUTH_REVOKED", "error": "Authorization revoked"}');
            return res;
        }
    }

    public class WarningPaymentLinkMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('{"success": true, "qbInvoiceId": "INV-WARN", "paymentLink": null, "paymentLinkStatus": "INVOICE_NO_BILLEMAIL", "paymentLinkMessage": "No billing email"}');
            return res;
        }
    }

    public class WarningCurrencyMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('{"success": true, "qbInvoiceId": "INV-WARN", "paymentLink": "https://example.com/pay", "paymentLinkStatus": "SUCCESS", "paymentLinkMessage": null, "warningCode": "CURRENCY_MISMATCH_CONVERTED", "warningMessage": "Converted EUR to USD"}');
            return res;
        }
    }

    public class SuccessfulHttpMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('{"success": true, "qbInvoiceId": "INV-TEST", "paymentLink": "https://example.com/pay", "paymentLinkStatus": "SUCCESS", "paymentLinkMessage": null}');
            return res;
        }
    }

    public class FailedHttpMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(400);
            res.setBody('{"success": false, "message": "Failed"}');
            return res;
        }
    }

    private static String getSupplierObjectApiName() {
        List<Schema.SObjectType> referenceTargets = Opportunity.Supplier__c.getDescribe().getReferenceTo();
        if (referenceTargets.isEmpty()) {
            return 'Account';
        }
        return referenceTargets[0].getDescribe().getName();
    }

    private static Id insertSupplier(String supplierName) {
        SObject supplier = Schema.getGlobalDescribe().get(getSupplierObjectApiName()).newSObject();
        supplier.put('Name', supplierName);
        insert supplier;
        return (Id) supplier.get('Id');
    }

    private static Id getSupplierIdByName(String supplierName) {
        String objectApiName = getSupplierObjectApiName();
        List<SObject> records = Database.query('SELECT Id FROM ' + objectApiName + ' WHERE Name = :supplierName LIMIT 1');
        if (records.isEmpty()) {
            return null;
        }
        return (Id) records[0].get('Id');
    }
}
