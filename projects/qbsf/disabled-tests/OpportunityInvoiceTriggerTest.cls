@isTest
private class OpportunityInvoiceTriggerTest {

    // --- СЦЕНАРИЙ 1: Сделка С ПРОДУКТАМИ ---
    @isTest
    static void testInvoiceCreation_WithProducts() {
        // DISABLED: Test for disabled trigger
        /*
        // Подготовка данных
        Account acc = new Account(Name='Test Account With Products');
        insert acc;
        Opportunity opp = new Opportunity(Name='Test Opp With Products', AccountId=acc.Id, StageName='Qualification', CloseDate=Date.today(), Amount=100);
        insert opp;
        // Добавляем продукт к сделке
        Product2 prod = new Product2(Name='Test Product');
        insert prod;
        PricebookEntry pbe = new PricebookEntry(Pricebook2Id=Test.getStandardPricebookId(), Product2Id=prod.Id, UnitPrice=100, IsActive=true);
        insert pbe;
        OpportunityLineItem oli = new OpportunityLineItem(OpportunityId=opp.Id, PricebookEntryId=pbe.Id, Quantity=1, UnitPrice=100);
        insert oli;

        Test.startTest();
        // Действие
        opp.StageName = 'Proposal and Agreement';
        update opp;
        Test.stopTest();

        // Проверка
        List<invgen__Invoice__c> createdInvoices = [SELECT Id FROM invgen__Invoice__c WHERE invgen__Opportunity__c = :opp.Id];
        System.assertEquals(1, createdInvoices.size(), 'Счет должен был создаться для сделки с продуктами.');
    }

    // --- СЦЕНАРИЙ 2: Сделка БЕЗ ПРОДУКТОВ ---
    @isTest
    static void testInvoiceCreation_WithoutProducts() {
        // Подготовка данных
        Account acc = new Account(Name='Test Account No Products');
        insert acc;
        Opportunity opp = new Opportunity(Name='Test Opp No Products', AccountId=acc.Id, StageName='Qualification', CloseDate=Date.today(), Amount=250);
        insert opp;

        Test.startTest();
        // Действие
        opp.StageName = 'Proposal and Agreement';
        update opp;
        Test.stopTest();

        // Проверка
        List<invgen__Invoice__c> createdInvoices = [SELECT Id FROM invgen__Invoice__c WHERE invgen__Opportunity__c = :opp.Id];
        System.assertEquals(1, createdInvoices.size(), 'Счет должен был создаться для сделки без продуктов.');
        */
    }
}