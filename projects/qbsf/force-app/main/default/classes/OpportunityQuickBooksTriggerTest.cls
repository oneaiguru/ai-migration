/**
 * Test class for OpportunityQuickBooksTrigger
 * Provides coverage for the trigger logic
 */
@isTest
private class OpportunityQuickBooksTriggerTest {
    
    @testSetup
    static void setupTestData() {
        // Create QB Integration Settings
        QB_Integration_Settings__c qbSettings = new QB_Integration_Settings__c(
            Middleware_Endpoint__c = 'https://test-middleware.example.com',
            API_Key__c = 'test-api-key-123',
            QB_Realm_ID__c = 'test-realm-456'
        );
        insert qbSettings;
        
        // Create test account (for Opportunity.AccountId)
        Account testAccount = new Account(
            Name = 'Test Account',
            BillingStreet = '123 Test St',
            BillingCity = 'Test City',
            BillingState = 'CA',
            BillingPostalCode = '12345',
            BillingCountry = 'US',
            Email__c = 'account@example.com'
        );
        setIfFieldExists(testAccount, 'VAT_ID__c', 'VAT-TEST');
        insert testAccount;

        // Create suppliers (lookup target)
        insertSupplier('Test US Supplier');
        insertSupplier('ATO COMM');
    }

    @isTest
    static void testTriggerOnUpdate() {
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account' LIMIT 1];
        Id supplierId = getSupplierIdByName('Test US Supplier');
        
        // Create opportunity with initial stage
        Opportunity opp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            Supplier__c = supplierId,
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            Amount = 1000,
            Email_for_invoice__c = 'test-update@example.com'
        );
        insert opp;
        
        Test.startTest();
        
        // Update opportunity to trigger stage (this should trigger line 26)
        opp.Email_for_invoice__c = 'test-update@example.com';
        opp.StageName = 'Proposal and Agreement';
        update opp;
        
        Test.stopTest();
        
        // Verify the opportunity was updated after the queueable runs
        Opportunity updatedOpp = [SELECT Id, StageName, QB_Sync_Status__c FROM Opportunity WHERE Id = :opp.Id];
        System.assertEquals('Proposal and Agreement', updatedOpp.StageName);
        System.assertEquals('Success', updatedOpp.QB_Sync_Status__c, 'Should mark Success after queueable completes');
    }

    @isTest
    static void testSkipWhenSupplierIsAtoComm() {
        Account account = [SELECT Id FROM Account WHERE Name = 'Test Account' LIMIT 1];
        Id excludedId = getSupplierIdByName('ATO COMM');
        Id allowedId = getSupplierIdByName('Test US Supplier');

        // Create opportunities, one excluded and one allowed
        Opportunity oppExcluded = new Opportunity(
            Name = 'Excluded Opp',
            AccountId = account.Id,
            Supplier__c = excludedId,
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(10),
            Amount = 500,
            Email_for_invoice__c = 'excluded@example.com'
        );
        Opportunity oppAllowed = new Opportunity(
            Name = 'Allowed Opp',
            AccountId = account.Id,
            Supplier__c = allowedId,
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(10),
            Amount = 600,
            Email_for_invoice__c = 'allowed@example.com'
        );
        insert new List<Opportunity>{ oppExcluded, oppAllowed };

        Id queueableClassId = [SELECT Id FROM ApexClass WHERE Name = 'QBInvoiceIntegrationQueueable' LIMIT 1].Id;
        Integer jobsBefore = [SELECT COUNT() FROM AsyncApexJob WHERE ApexClassId = :queueableClassId];

        Test.startTest();
        oppExcluded.StageName = 'Proposal and Agreement';
        oppAllowed.StageName = 'Proposal and Agreement';
        update new List<Opportunity>{ oppExcluded, oppAllowed };
        Test.stopTest();

        Integer jobsAfter = [SELECT COUNT() FROM AsyncApexJob WHERE ApexClassId = :queueableClassId];

        // Only the allowed opportunity should enqueue a job
        System.assertEquals(1, jobsAfter - jobsBefore, 'Only non-ATO COMM supplier should enqueue invoice creation');

        List<Opportunity> updatedOpps = [
            SELECT Id, Name, QB_Sync_Status__c, QB_Skip_Reason__c
            FROM Opportunity
            WHERE Id IN :new List<Id>{oppExcluded.Id, oppAllowed.Id}
        ];
        Map<Id, Opportunity> oppsById = new Map<Id, Opportunity>(updatedOpps);
        System.assertEquals('Skipped', oppsById.get(oppExcluded.Id).QB_Sync_Status__c);
        System.assert(oppsById.get(oppExcluded.Id).QB_Skip_Reason__c.contains('SUPPLIER_EXCLUDED'));
        System.assertEquals('Success', oppsById.get(oppAllowed.Id).QB_Sync_Status__c);
    }

    @isTest
    static void testSkipWhenSupplierMissing() {
        Account account = [SELECT Id FROM Account WHERE Name = 'Test Account' LIMIT 1];

        Opportunity opp = new Opportunity(
            Name = 'Missing Supplier Opp',
            AccountId = account.Id,
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(10),
            Amount = 400,
            Email_for_invoice__c = 'missing-supplier@example.com'
        );
        insert opp;

        Test.startTest();
        opp.StageName = 'Proposal and Agreement';
        update opp;
        Test.stopTest();

        Opportunity updatedOpp = [
            SELECT Id, QB_Sync_Status__c, QB_Skip_Reason__c
            FROM Opportunity
            WHERE Id = :opp.Id
        ];
        System.assertEquals('Skipped', updatedOpp.QB_Sync_Status__c);
        System.assert(updatedOpp.QB_Skip_Reason__c.contains('SUPPLIER_MISSING'));
    }

    private static String getSupplierObjectApiName() {
        List<Schema.SObjectType> referenceTargets = Opportunity.Supplier__c.getDescribe().getReferenceTo();
        if (referenceTargets.isEmpty()) {
            return 'Account';
        }
        return referenceTargets[0].getDescribe().getName();
    }

    private static void insertSupplier(String supplierName) {
        SObject supplier = Schema.getGlobalDescribe().get(getSupplierObjectApiName()).newSObject();
        supplier.put('Name', supplierName);
        insert supplier;
    }

    private static Id getSupplierIdByName(String supplierName) {
        String objectApiName = getSupplierObjectApiName();
        List<SObject> records = Database.query('SELECT Id FROM ' + objectApiName + ' WHERE Name = :supplierName LIMIT 1');
        if (records.isEmpty()) {
            return null;
        }
        return (Id) records[0].get('Id');
    }

    private static void setIfFieldExists(SObject record, String fieldApiName, Object value) {
        if (record.getSObjectType().getDescribe().fields.getMap().containsKey(fieldApiName)) {
            record.put(fieldApiName, value);
        }
    }
}
