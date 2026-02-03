@isTest
public class QuickBooksTestUtility {
    
    @isTest
    static void testSettings() {
        // Test custom settings
        QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
        
        if (settings.Id == null) {
            settings = new QuickBooks_Settings__c();
            settings.Middleware_URL__c = 'https://test.example.com';
            settings.API_Key__c = 'test_key';
            settings.QB_Realm_ID__c = 'test_realm';
            insert settings;
        }
        
        QuickBooks_Settings__c retrieved = QuickBooks_Settings__c.getOrgDefaults();
        System.assertNotEquals(null, retrieved, 'Settings should exist');
        System.assertEquals('https://test.example.com', retrieved.Middleware_URL__c, 'URL should match');
    }
    
    @isTest
    static void testOpportunityFields() {
        // Test opportunity custom fields
        Opportunity opp = new Opportunity(
            Name = 'Test Opp',
            StageName = 'Prospecting',
            CloseDate = Date.today()
        );
        insert opp;
        
        opp.QB_Invoice_ID__c = 'TEST123';
        opp.QB_Invoice_Number__c = 'INV-001';
        opp.QB_Payment_ID__c = 'PAY-001';
        opp.QB_Payment_Date__c = Date.today();
        opp.QB_Payment_Method__c = 'Credit Card';
        opp.QB_Payment_Amount__c = 1000;
        update opp;
        
        Opportunity retrieved = [SELECT Id, QB_Invoice_ID__c, QB_Invoice_Number__c, 
                               QB_Payment_ID__c, QB_Payment_Date__c, QB_Payment_Method__c, 
                               QB_Payment_Amount__c FROM Opportunity WHERE Id = :opp.Id];
        
        System.assertEquals('TEST123', retrieved.QB_Invoice_ID__c, 'Invoice ID should match');
        System.assertEquals('INV-001', retrieved.QB_Invoice_Number__c, 'Invoice Number should match');
        System.assertEquals('PAY-001', retrieved.QB_Payment_ID__c, 'Payment ID should match');
        System.assertEquals(Date.today(), retrieved.QB_Payment_Date__c, 'Payment Date should match');
        System.assertEquals('Credit Card', retrieved.QB_Payment_Method__c, 'Payment Method should match');
        System.assertEquals(1000, retrieved.QB_Payment_Amount__c, 'Payment Amount should match');
    }
}
