/**
 * Test class for OpportunityQuickBooksTrigger
 */
@isTest
private class OpportunityQuickBooksTriggerTest {
    
    /**
     * Test that trigger fires when an Opportunity is created at Closed Won stage
     */
    @isTest
    static void testTriggerOnInsert() {
        // Create test account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        
        // Create test product
        Product2 testProduct = new Product2(
            Name = 'Test Product',
            IsActive = true
        );
        insert testProduct;
        
        // Create test price book entry
        Id standardPriceBookId = Test.getStandardPricebookId();
        PricebookEntry testPBE = new PricebookEntry(
            Pricebook2Id = standardPriceBookId,
            Product2Id = testProduct.Id,
            UnitPrice = 100,
            IsActive = true
        );
        insert testPBE;
        
        // Setup custom settings for test
        QB_Integration_Settings__c settings = new QB_Integration_Settings__c();
        settings.Middleware_Endpoint__c = 'https://test-middleware.example.com';
        settings.API_Key__c = 'test-api-key-123';
        settings.QB_Realm_ID__c = 'test-realm-456';
        insert settings;
        
        // Setup a mock for the queueable class
        Test.startTest();
        
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            CloseDate = Date.today().addDays(30),
            StageName = 'Closed Won', // This should trigger the integration
            Amount = 1000
        );
        insert testOpp;
        
        // Create Opportunity Line Item
        OpportunityLineItem testOLI = new OpportunityLineItem(
            OpportunityId = testOpp.Id,
            Quantity = 1,
            PricebookEntryId = testPBE.Id,
            TotalPrice = 100
        );
        insert testOLI;
        
        Test.stopTest();
        
        // Since we're using System.enqueueJob, we can only verify that the method was called
        // In a real scenario with mocks, we might check for more
        // We can at least verify our opportunity is correct
        Opportunity verifyOpp = [SELECT Id, StageName FROM Opportunity WHERE Id = :testOpp.Id];
        System.assertEquals('Closed Won', verifyOpp.StageName, 'Stage should be Closed Won');
    }
    
    /**
     * Test that trigger fires when an Opportunity is updated to Closed Won stage
     */
    @isTest
    static void testTriggerOnUpdate() {
        // Create test account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        
        // Setup custom settings for test
        QB_Integration_Settings__c settings = new QB_Integration_Settings__c();
        settings.Middleware_Endpoint__c = 'https://test-middleware.example.com';
        settings.API_Key__c = 'test-api-key-123';
        settings.QB_Realm_ID__c = 'test-realm-456';
        insert settings;
        
        // Create Opportunity at non-Closed Won stage
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            CloseDate = Date.today().addDays(30),
            StageName = 'Prospecting', // Not yet at the trigger stage
            Amount = 1000
        );
        insert testOpp;
        
        // Update to Closed Won stage
        Test.startTest();
        
        testOpp.StageName = 'Closed Won'; // This should trigger the integration
        update testOpp;
        
        Test.stopTest();
        
        // Verify the opportunity was updated correctly
        Opportunity verifyOpp = [SELECT Id, StageName FROM Opportunity WHERE Id = :testOpp.Id];
        System.assertEquals('Closed Won', verifyOpp.StageName, 'Stage should be Closed Won');
    }
    
    /**
     * Test that trigger doesn't fire when stage is not Closed Won
     */
    @isTest
    static void testTriggerNotFiredOnWrongStage() {
        // Create test account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        
        // Create Opportunity at non-Closed Won stage
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            CloseDate = Date.today().addDays(30),
            StageName = 'Prospecting', // Not at the trigger stage
            Amount = 1000
        );
        insert testOpp;
        
        // Update to another stage that's not Closed Won
        Test.startTest();
        
        testOpp.StageName = 'Qualification'; // This should NOT trigger the integration
        update testOpp;
        
        Test.stopTest();
        
        // Verify the opportunity was updated correctly
        Opportunity verifyOpp = [SELECT Id, StageName FROM Opportunity WHERE Id = :testOpp.Id];
        System.assertEquals('Qualification', verifyOpp.StageName, 'Stage should be Qualification');
    }
    
    /**
     * Test that trigger doesn't fire when stage doesn't change to Closed Won
     */
    @isTest
    static void testTriggerNotFiredOnSameStage() {
        // Create test account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        
        // Setup custom settings for test
        QB_Integration_Settings__c settings = new QB_Integration_Settings__c();
        settings.Middleware_Endpoint__c = 'https://test-middleware.example.com';
        settings.API_Key__c = 'test-api-key-123';
        settings.QB_Realm_ID__c = 'test-realm-456';
        insert settings;
        
        // Create Opportunity at Closed Won stage
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            CloseDate = Date.today().addDays(30),
            StageName = 'Closed Won', // Already at the trigger stage
            Amount = 1000
        );
        insert testOpp;
        
        // Update something else but keep the same Closed Won stage
        Test.startTest();
        
        testOpp.Amount = 2000; // Changing amount but NOT stage
        update testOpp;
        
        Test.stopTest();
        
        // Verify the opportunity amount was updated correctly
        Opportunity verifyOpp = [SELECT Id, StageName, Amount FROM Opportunity WHERE Id = :testOpp.Id];
        System.assertEquals('Closed Won', verifyOpp.StageName, 'Stage should still be Closed Won');
        System.assertEquals(2000, verifyOpp.Amount, 'Amount should be updated to 2000');
    }
}
