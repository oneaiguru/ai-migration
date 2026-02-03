/**
 * Test class for SFInvoiceCreator
 * Provides 75%+ code coverage as required
 */
@isTest(SeeAllData=false)
private class SFInvoiceCreatorTest {
    
    @testSetup
    static void setupTestData() {
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
            Name = 'Test Opportunity Main',
            AccountId = testAccount.Id,
            CloseDate = Date.today().addDays(30),
            StageName = 'Proposal and Agreement',
            Amount = 1000,
            Supplier__c = testAccount.Id
        );
        insert testOpp;
        
        // Create test product
        Product2 testProduct = new Product2(
            Name = 'Test Product',
            IsActive = true
        );
        insert testProduct;
        
        // Create pricebook entry
        PricebookEntry pbe = new PricebookEntry(
            Pricebook2Id = Test.getStandardPricebookId(),
            Product2Id = testProduct.Id,
            UnitPrice = 100,
            IsActive = true
        );
        insert pbe;
        
        // Create opportunity line item
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = testOpp.Id,
            Quantity = 2,
            UnitPrice = 500,
            PricebookEntryId = pbe.Id
        );
        insert oli;
    }
    
    @isTest
    static void testCreateInvoiceFromOpportunity() {
        Opportunity testOpp = [SELECT Id, Name, AccountId, Amount FROM Opportunity LIMIT 1];
        
        Test.startTest();
        
        SFInvoiceCreator.createInvoicesFromOpportunities(new List<Opportunity>{testOpp});
        
        Test.stopTest();
        
        // Verify SF Invoice was created
        List<QB_Invoice__c> invoices = [
            SELECT Id, Opportunity__c, Account__c, Amount__c, Status__c, 
                   Invoice_Date__c, Due_Date__c, Description__c
            FROM QB_Invoice__c
            WHERE Opportunity__c = :testOpp.Id
        ];
        
        System.assertEquals(1, invoices.size(), 'Should create one SF Invoice');
        
        QB_Invoice__c invoice = invoices[0];
        System.assertEquals(testOpp.Id, invoice.Opportunity__c, 'Should link to opportunity');
        System.assertEquals(testOpp.AccountId, invoice.Account__c, 'Should link to account');
        System.assertEquals(testOpp.Amount, invoice.Amount__c, 'Should match opportunity amount');
        System.assertEquals('Draft', invoice.Status__c, 'Should start as Draft');
        System.assertEquals(Date.today(), invoice.Invoice_Date__c, 'Should have today as invoice date');
        
        // Verify line items were created
        List<QB_Invoice_Line_Item__c> lineItems = [
            SELECT Id, Description__c, Quantity__c, Unit_Price__c, Product__c
            FROM QB_Invoice_Line_Item__c
            WHERE Invoice__c = :invoice.Id
        ];
        
        System.assertEquals(1, lineItems.size(), 'Should create line items from opportunity products');
        System.assertEquals(2, lineItems[0].Quantity__c, 'Should match opportunity line item quantity');
        System.assertEquals(500, lineItems[0].Unit_Price__c, 'Should match opportunity line item price');
    }
    
    @isTest
    static void testCreateInvoiceWithoutProducts() {
        // Create opportunity without products
        Account testAccount = [SELECT Id FROM Account LIMIT 1];
        Opportunity oppWithoutProducts = new Opportunity(
            Name = 'Opportunity Without Products',
            AccountId = testAccount.Id,
            CloseDate = Date.today().addDays(30),
            StageName = 'Proposal and Agreement',
            Amount = 500,
            Supplier__c = testAccount.Id
        );
        insert oppWithoutProducts;
        
        Test.startTest();
        
        SFInvoiceCreator.createInvoicesFromOpportunities(new List<Opportunity>{oppWithoutProducts});
        
        Test.stopTest();
        
        // Verify default line item was created
        List<QB_Invoice__c> invoices = [SELECT Id FROM QB_Invoice__c WHERE Opportunity__c = :oppWithoutProducts.Id];
        System.assertEquals(1, invoices.size(), 'Should create exactly one invoice');
        QB_Invoice__c invoice = invoices[0];
        
        List<QB_Invoice_Line_Item__c> lineItems = [
            SELECT Id, Description__c, Quantity__c, Unit_Price__c
            FROM QB_Invoice_Line_Item__c
            WHERE Invoice__c = :invoice.Id
        ];
        
        System.assertEquals(1, lineItems.size(), 'Should create default line item');
        System.assertEquals('Service', lineItems[0].Description__c, 'Should have Service description');
        System.assertEquals(1, lineItems[0].Quantity__c, 'Should have quantity 1');
        System.assertEquals(500, lineItems[0].Unit_Price__c, 'Should match opportunity amount');
    }
}
