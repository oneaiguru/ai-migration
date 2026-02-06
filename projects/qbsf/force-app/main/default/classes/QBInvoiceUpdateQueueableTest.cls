/**
 * Tests for QBInvoiceUpdateQueueable and OpportunityLineItemTrigger
 */
@isTest
private class QBInvoiceUpdateQueueableTest {

    @testSetup
    static void setupData() {
        insert new QB_Integration_Settings__c(
            Middleware_Endpoint__c = 'https://test-middleware.example.com',
            API_Key__c = 'test-api-key-123',
            QB_Realm_ID__c = 'test-realm-456'
        );

        Id standardPbId = Test.getStandardPricebookId();
        try {
            Pricebook2 standardPb = [SELECT Id, IsActive FROM Pricebook2 WHERE Id = :standardPbId];
            if (!standardPb.IsActive) {
                standardPb.IsActive = true;
                update standardPb;
            }
        } catch (QueryException e) {
            // Standard pricebook not available in test context
        }

        Product2 product = new Product2(Name = 'Test Product', IsActive = true);
        insert product;

        PricebookEntry pbe = new PricebookEntry(
            Pricebook2Id = standardPbId,
            Product2Id = product.Id,
            UnitPrice = 50,
            IsActive = true,
            UseStandardPrice = false
        );
        insert pbe;

        Account acc = new Account(
            Name = 'Test Account',
            BillingStreet = '123 Main St',
            BillingCity = 'Test City',
            BillingState = 'CA',
            BillingPostalCode = '12345',
            BillingCountry = 'US'
        );
        insert acc;

        Account supplier = new Account(Name = 'Test Supplier');
        Account excludedSupplier = new Account(Name = 'ATO COMM');
        insert new List<Account>{ supplier, excludedSupplier };

        Opportunity oppWithInvoice = new Opportunity(
            Name = 'Opp With Invoice',
            AccountId = acc.Id,
            StageName = 'Proposal and Agreement',
            CloseDate = Date.today().addDays(10),
            Amount = 1000,
            Pricebook2Id = standardPbId,
            QB_Invoice_ID__c = 'INV-123',
            Supplier__c = supplier.Id,
            Email_for_invoice__c = 'with-invoice@example.com'
        );
        Opportunity oppWithInvoiceTwo = new Opportunity(
            Name = 'Opp With Invoice Two',
            AccountId = acc.Id,
            StageName = 'Proposal and Agreement',
            CloseDate = Date.today().addDays(15),
            Amount = 1200,
            Pricebook2Id = standardPbId,
            QB_Invoice_ID__c = 'INV-456',
            Supplier__c = supplier.Id,
            Email_for_invoice__c = 'with-invoice-two@example.com'
        );
        Opportunity oppWithoutInvoice = new Opportunity(
            Name = 'Opp Without Invoice',
            AccountId = acc.Id,
            StageName = 'Proposal and Agreement',
            CloseDate = Date.today().addDays(20),
            Amount = 900,
            Pricebook2Id = standardPbId,
            Supplier__c = supplier.Id,
            Email_for_invoice__c = 'without-invoice@example.com'
        );
        insert new List<Opportunity>{ oppWithInvoice, oppWithInvoiceTwo, oppWithoutInvoice };
    }

    @isTest
    static void testTriggerEnqueuesAndLogsSuccess() {
        QBInvoiceUpdateQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new SuccessMock());

        Opportunity opp = [SELECT Id FROM Opportunity WHERE Name = 'Opp With Invoice' LIMIT 1];
        PricebookEntry pbe = [SELECT Id FROM PricebookEntry WHERE Product2.Name = 'Test Product' LIMIT 1];

        Test.startTest();
        insert new OpportunityLineItem(
            OpportunityId = opp.Id,
            PricebookEntryId = pbe.Id,
            Quantity = 1,
            UnitPrice = 50
        );
        Test.stopTest();

        Integer logCount = [SELECT COUNT() FROM QB_Integration_Log__c WHERE Opportunity__c = :opp.Id];
        System.assertEquals(1, logCount, 'Success log should be created for update');

        QBInvoiceUpdateQueueable.allowTestCallouts = false;
    }

    @isTest
    static void testTriggerSkipsWhenNoInvoice() {
        QBInvoiceUpdateQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new SuccessMock());

        Opportunity opp = [SELECT Id, QB_Invoice_ID__c FROM Opportunity WHERE Name = 'Opp Without Invoice' LIMIT 1];
        PricebookEntry pbe = [SELECT Id FROM PricebookEntry WHERE Product2.Name = 'Test Product' LIMIT 1];

        // Make sure this test record truly has no invoice ID and no prior logs
        opp.QB_Invoice_ID__c = null;
        update opp;
        delete [SELECT Id FROM QB_Integration_Log__c WHERE Opportunity__c = :opp.Id];
        delete [SELECT Id FROM QB_Integration_Error_Log__c WHERE Opportunity__c = :opp.Id];

        Test.startTest();
        insert new OpportunityLineItem(
            OpportunityId = opp.Id,
            PricebookEntryId = pbe.Id,
            Quantity = 2,
            UnitPrice = 75
        );
        Test.stopTest();

        Integer successLogs = [SELECT COUNT() FROM QB_Integration_Log__c WHERE Opportunity__c = :opp.Id];
        Integer errorLogs = [SELECT COUNT() FROM QB_Integration_Error_Log__c WHERE Opportunity__c = :opp.Id];
        System.assertEquals(0, successLogs, 'No logs expected when no invoice ID present');
        System.assertEquals(0, errorLogs, 'No errors expected when trigger skips');

        QBInvoiceUpdateQueueable.allowTestCallouts = false;
    }

    @isTest
    static void testMissingSettingsLogsError() {
        delete [SELECT Id FROM QB_Integration_Settings__c LIMIT 1];
        QBInvoiceUpdateQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new SuccessMock());

        Opportunity opp = [SELECT Id FROM Opportunity WHERE Name = 'Opp With Invoice' LIMIT 1];
        PricebookEntry pbe = [SELECT Id FROM PricebookEntry WHERE Product2.Name = 'Test Product' LIMIT 1];

        Test.startTest();
        insert new OpportunityLineItem(
            OpportunityId = opp.Id,
            PricebookEntryId = pbe.Id,
            Quantity = 1,
            UnitPrice = 50
        );
        Test.stopTest();

        Integer errorLogs = [SELECT COUNT() FROM QB_Integration_Error_Log__c WHERE Opportunity__c = :opp.Id];
        System.assertEquals(1, errorLogs, 'Error log should be created when settings are missing');

        QBInvoiceUpdateQueueable.allowTestCallouts = false;
    }

    @isTest
    static void testHttpErrorLogged() {
        QBInvoiceUpdateQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new HttpErrorMock());

        Opportunity opp = [SELECT Id FROM Opportunity WHERE Name = 'Opp With Invoice' LIMIT 1];
        PricebookEntry pbe = [SELECT Id FROM PricebookEntry WHERE Product2.Name = 'Test Product' LIMIT 1];

        Test.startTest();
        insert new OpportunityLineItem(
            OpportunityId = opp.Id,
            PricebookEntryId = pbe.Id,
            Quantity = 1,
            UnitPrice = 50
        );
        Test.stopTest();

        Integer errorLogs = [SELECT COUNT() FROM QB_Integration_Error_Log__c WHERE Opportunity__c = :opp.Id];
        System.assertEquals(1, errorLogs, 'HTTP error should be logged');

        QBInvoiceUpdateQueueable.allowTestCallouts = false;
    }

    @isTest
    static void testBulkMultipleOpportunities() {
        QBInvoiceUpdateQueueable.allowTestCallouts = true;
        Test.setMock(HttpCalloutMock.class, new SuccessMock());

        List<Opportunity> opps = [
            SELECT Id, Name FROM Opportunity WHERE Name IN ('Opp With Invoice', 'Opp With Invoice Two')
        ];
        PricebookEntry pbe = [SELECT Id FROM PricebookEntry WHERE Product2.Name = 'Test Product' LIMIT 1];

        Test.startTest();
        List<OpportunityLineItem> olis = new List<OpportunityLineItem>();
        for (Opportunity opp : opps) {
            olis.add(new OpportunityLineItem(
                OpportunityId = opp.Id,
                PricebookEntryId = pbe.Id,
                Quantity = 1,
                UnitPrice = 60
            ));
        }
        insert olis;
        Test.stopTest();

        Integer logCount = [SELECT COUNT() FROM QB_Integration_Log__c WHERE Opportunity__c IN :opps];
        System.assertEquals(2, logCount, 'Each opportunity with an invoice should log an update');

        QBInvoiceUpdateQueueable.allowTestCallouts = false;
    }

    @isTest
    static void testSkipWhenSupplierIsAtoComm() {
        Id standardPbId = Test.getStandardPricebookId();
        PricebookEntry pbe = [SELECT Id FROM PricebookEntry WHERE Product2.Name = 'Test Product' LIMIT 1];

        Account acc = [SELECT Id FROM Account WHERE Name = 'Test Account' LIMIT 1];
        Account excluded = [SELECT Id FROM Account WHERE Name = 'ATO COMM' LIMIT 1];

        Opportunity oppExcluded = new Opportunity(
            Name = 'Opp Excluded',
            AccountId = acc.Id,
            Supplier__c = excluded.Id,
            StageName = 'Proposal and Agreement',
            CloseDate = Date.today().addDays(5),
            Amount = 200,
            Pricebook2Id = standardPbId,
            QB_Invoice_ID__c = 'INV-ATO',
            Email_for_invoice__c = 'excluded@example.com'
        );
        insert oppExcluded;

        Id queueableClassId = [SELECT Id FROM ApexClass WHERE Name = 'QBInvoiceUpdateQueueable' LIMIT 1].Id;
        Integer jobsBefore = [SELECT COUNT() FROM AsyncApexJob WHERE ApexClassId = :queueableClassId];

        Test.startTest();
        insert new OpportunityLineItem(
            OpportunityId = oppExcluded.Id,
            PricebookEntryId = pbe.Id,
            Quantity = 1,
            UnitPrice = 10
        );
        Test.stopTest();

        Integer jobsAfter = [SELECT COUNT() FROM AsyncApexJob WHERE ApexClassId = :queueableClassId];
        System.assertEquals(0, jobsAfter - jobsBefore, 'ATO COMM supplier should not enqueue update jobs');
    }

    private class SuccessMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('{"success": true, "qbInvoiceId": "INV-UPDATED"}');
            return res;
        }
    }

    private class HttpErrorMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(500);
            res.setBody('{"error": "Server error"}');
            return res;
        }
    }
}
