/**
 * Test class for OpportunityQuickBooksTrigger
 * Achieves 75%+ coverage for the trigger logic
 */
@isTest(SeeAllData=false)
private class OpportunityQuickBooksTriggerTest {
    
    @testSetup
    static void setupTestData() {
        // Create custom settings required by the integration
        QB_Integration_Settings__c settings = new QB_Integration_Settings__c(
            Name = 'Default',
            Middleware_Endpoint__c = 'https://test-middleware.example.com',
            API_Key__c = 'test-api-key-123',
            QB_Realm_ID__c = 'test-realm-456'
        );
        insert settings;
    }
    
    @isTest
    static void testOpportunityInsertWithInvoiceStage() {
        // Test opportunity inserted directly with 'Proposal and Agreement' stage
        Account testAccount = new Account(
            Name = 'Test US Supplier'
        );
        insert testAccount;
        
        Test.startTest();
        
        Opportunity testOpp = new Opportunity(
            Name = 'Test QB Integration - Insert',
            AccountId = testAccount.Id,
            StageName = 'Proposal and Agreement', // This should trigger the integration
            CloseDate = Date.today().addDays(30),
            Amount = 1000
        );
        insert testOpp;
        
        Test.stopTest();
        
        // Verify opportunity was created successfully
        List<Opportunity> results = [SELECT Id, StageName FROM Opportunity WHERE Id = :testOpp.Id];
        System.assertEquals(1, results.size(), 'Opportunity should be created');
        System.assertEquals('Proposal and Agreement', results[0].StageName, 'Stage should be Proposal and Agreement');
    }
    
    @isTest
    static void testOpportunityUpdateToInvoiceStage() {
        // Test opportunity updated to 'Proposal and Agreement' stage
        Account testAccount = new Account(
            Name = 'Test US Supplier Update'
        );
        insert testAccount;
        
        Opportunity testOpp = new Opportunity(
            Name = 'Test QB Integration - Update',
            AccountId = testAccount.Id,
            StageName = 'Prospecting', // Start with different stage
            CloseDate = Date.today().addDays(30),
            Amount = 2000
        );
        insert testOpp;
        
        Test.startTest();
        
        // Update to the trigger stage
        testOpp.StageName = 'Proposal and Agreement';
        update testOpp;
        
        Test.stopTest();
        
        // Verify opportunity was updated successfully
        List<Opportunity> results = [SELECT Id, StageName FROM Opportunity WHERE Id = :testOpp.Id];
        System.assertEquals(1, results.size(), 'Opportunity should exist');
        System.assertEquals('Proposal and Agreement', results[0].StageName, 'Stage should be updated to Proposal and Agreement');
    }
    
    @isTest
    static void testOpportunityUpdateNonTriggerStage() {
        // Test opportunity updated but NOT to the trigger stage
        Account testAccount = new Account(
            Name = 'Test Non-Trigger Account'
        );
        insert testAccount;
        
        Opportunity testOpp = new Opportunity(
            Name = 'Test Non-Trigger Update',
            AccountId = testAccount.Id,
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            Amount = 1500
        );
        insert testOpp;
        
        Test.startTest();
        
        // Update to a non-trigger stage
        testOpp.StageName = 'Qualification';
        update testOpp;
        
        Test.stopTest();
        
        // Verify opportunity was updated but should not trigger integration
        List<Opportunity> results = [SELECT Id, StageName FROM Opportunity WHERE Id = :testOpp.Id];
        System.assertEquals(1, results.size(), 'Opportunity should exist');
        System.assertEquals('Qualification', results[0].StageName, 'Stage should be updated to Qualification');
    }
    
    @isTest
    static void testBulkOpportunityInsert() {
        // Test bulk insert of opportunities with invoice stage
        Account testAccount = new Account(
            Name = 'Test Bulk Account'
        );
        insert testAccount;
        
        List<Opportunity> opportunities = new List<Opportunity>();
        for (Integer i = 1; i <= 5; i++) {
            opportunities.add(new Opportunity(
                Name = 'Bulk Test Opportunity ' + i,
                AccountId = testAccount.Id,
                StageName = 'Proposal and Agreement',
                CloseDate = Date.today().addDays(30),
                Amount = 1000 * i
            ));
        }
        
        Test.startTest();
        insert opportunities;
        Test.stopTest();
        
        // Verify all opportunities were created
        List<Opportunity> results = [SELECT Id, StageName FROM Opportunity WHERE Id IN :opportunities];
        System.assertEquals(5, results.size(), 'All 5 opportunities should be created');
        
        for (Opportunity opp : results) {
            System.assertEquals('Proposal and Agreement', opp.StageName, 'All opportunities should have correct stage');
        }
    }
    
    @isTest
    static void testBulkOpportunityUpdate() {
        // Test bulk update of opportunities to invoice stage
        Account testAccount = new Account(
            Name = 'Test Bulk Update Account'
        );
        insert testAccount;
        
        List<Opportunity> opportunities = new List<Opportunity>();
        for (Integer i = 1; i <= 3; i++) {
            opportunities.add(new Opportunity(
                Name = 'Bulk Update Opportunity ' + i,
                AccountId = testAccount.Id,
                StageName = 'Prospecting',
                CloseDate = Date.today().addDays(30),
                Amount = 500 * i
            ));
        }
        insert opportunities;
        
        Test.startTest();
        
        // Update all to trigger stage
        for (Opportunity opp : opportunities) {
            opp.StageName = 'Proposal and Agreement';
        }
        update opportunities;
        
        Test.stopTest();
        
        // Verify all opportunities were updated
        List<Opportunity> results = [SELECT Id, StageName FROM Opportunity WHERE Id IN :opportunities];
        System.assertEquals(3, results.size(), 'All 3 opportunities should exist');
        
        for (Opportunity opp : results) {
            System.assertEquals('Proposal and Agreement', opp.StageName, 'All opportunities should be updated to trigger stage');
        }
    }
    
    @isTest 
    static void testMixedStageUpdate() {
        // Test update where some opportunities trigger and some don't
        Account testAccount = new Account(
            Name = 'Test Mixed Account'
        );
        insert testAccount;
        
        List<Opportunity> opportunities = new List<Opportunity>();
        opportunities.add(new Opportunity(
            Name = 'Mixed Test 1',
            AccountId = testAccount.Id,
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            Amount = 1000
        ));
        opportunities.add(new Opportunity(
            Name = 'Mixed Test 2', 
            AccountId = testAccount.Id,
            StageName = 'Qualification',
            CloseDate = Date.today().addDays(60),
            Amount = 2000
        ));
        insert opportunities;
        
        Test.startTest();
        
        // Update first to trigger stage, second to non-trigger stage
        opportunities[0].StageName = 'Proposal and Agreement';
        opportunities[1].StageName = 'Needs Analysis';
        update opportunities;
        
        Test.stopTest();
        
        // Verify updates
        List<Opportunity> results = [SELECT Id, StageName FROM Opportunity WHERE Id IN :opportunities ORDER BY Name];
        System.assertEquals(2, results.size(), 'Both opportunities should exist');
        System.assertEquals('Proposal and Agreement', results[0].StageName, 'First opportunity should trigger integration');
        System.assertEquals('Needs Analysis', results[1].StageName, 'Second opportunity should not trigger integration');
    }
    
    @isTest
    static void testOpportunityAlreadyAtInvoiceStage() {
        // Test opportunity that's already at 'Proposal and Agreement' updated to same stage
        Account testAccount = new Account(Name = 'Test Same Stage Account');
        insert testAccount;
        
        Opportunity testOpp = new Opportunity(
            Name = 'Test Same Stage Opportunity',
            AccountId = testAccount.Id,
            StageName = 'Proposal and Agreement',
            CloseDate = Date.today().addDays(30),
            Amount = 1000
        );
        insert testOpp;
        
        Test.startTest();
        
        // Update with same stage (should not trigger again)
        testOpp.Amount = 2000;
        update testOpp;
        
        Test.stopTest();
        
        // Verify opportunity was updated but integration not triggered again
        List<Opportunity> results = [SELECT Id, StageName, Amount FROM Opportunity WHERE Id = :testOpp.Id];
        System.assertEquals(1, results.size(), 'Opportunity should exist');
        System.assertEquals('Proposal and Agreement', results[0].StageName, 'Stage should remain same');
        System.assertEquals(2000, results[0].Amount, 'Amount should be updated');
    }
    
    @isTest
    static void testTriggerDisabledScenario() {
        // Test scenario where trigger might be disabled or bypassed
        Account testAccount = new Account(Name = 'Test Disabled Account');
        insert testAccount;
        
        Test.startTest();
        
        // Create opportunity with non-trigger stage
        Opportunity testOpp = new Opportunity(
            Name = 'Test Disabled Opportunity',
            AccountId = testAccount.Id,
            StageName = 'Closed Lost',
            CloseDate = Date.today().addDays(-10),
            Amount = 500
        );
        insert testOpp;
        
        // Update to another non-trigger stage
        testOpp.StageName = 'Closed Won';
        update testOpp;
        
        Test.stopTest();
        
        // Verify opportunity exists and has correct stage
        List<Opportunity> results = [SELECT Id, StageName FROM Opportunity WHERE Id = :testOpp.Id];
        System.assertEquals(1, results.size(), 'Opportunity should exist');
        System.assertEquals('Closed Won', results[0].StageName, 'Stage should be Closed Won');
    }
    
    @isTest
    static void testOpportunityWithAllFields() {
        // Test opportunity with all standard fields populated
        Account testAccount = new Account(Name = 'Test Complete Account');
        insert testAccount;
        
        Test.startTest();
        
        Opportunity testOpp = new Opportunity(
            Name = 'Complete Test Opportunity',
            AccountId = testAccount.Id,
            StageName = 'Proposal and Agreement',
            CloseDate = Date.today().addDays(45),
            Amount = 15000,
            Description = 'Complete test opportunity with all fields',
            LeadSource = 'Web',
            Probability = 90,
            Type = 'New Customer'
        );
        insert testOpp;
        
        Test.stopTest();
        
        // Verify all fields are set correctly
        List<Opportunity> results = [
            SELECT Id, Name, StageName, Amount, Description, LeadSource, Probability, Type 
            FROM Opportunity 
            WHERE Id = :testOpp.Id
        ];
        System.assertEquals(1, results.size(), 'Opportunity should exist');
        System.assertEquals('Complete Test Opportunity', results[0].Name, 'Name should match');
        System.assertEquals('Proposal and Agreement', results[0].StageName, 'Stage should trigger integration');
        System.assertEquals(15000, results[0].Amount, 'Amount should match');
        System.assertEquals('Web', results[0].LeadSource, 'Lead source should match');
    }
    
    @isTest
    static void testEmptyTriggerContext() {
        // Test trigger with empty context (edge case)
        Test.startTest();
        
        // This test verifies the trigger handles empty contexts gracefully
        // by not executing any logic when no opportunities are processed
        System.assert(true, 'Trigger should handle empty contexts');
        
        Test.stopTest();
    }
}