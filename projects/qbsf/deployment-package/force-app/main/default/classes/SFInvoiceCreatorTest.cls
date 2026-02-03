@isTest
private class SFInvoiceCreatorTest {
    @isTest
    static void testCreateInvoiceFromOpportunity() {
        // Создаем тестовые данные
        Account acc = new Account(
            Name = 'Test Account',
            BillingStreet = '123 Test St',
            BillingCity = 'Test City',
            BillingState = 'TS',
            BillingPostalCode = '12345',
            BillingCountry = 'Test Country',
            Phone = '555-555-5555',
            Website = 'https://test.com'
        );
        insert acc;
        
        // Создаем возможность
        Opportunity opp = new Opportunity(
            Name = 'Test Opportunity',
            StageName = 'Qualification',
            CloseDate = Date.today().addDays(30),
            AccountId = acc.Id,
            Amount = 1000
        );
        insert opp;
        
        // Создаем продукт
        Product2 prod = new Product2(
            Name = 'Test Product',
            IsActive = true,
            Description = 'Test Product Description'
        );
        insert prod;
        
        // Создаем прайс-лист
        PricebookEntry pbe = new PricebookEntry(
            Product2Id = prod.Id,
            Pricebook2Id = Test.getStandardPricebookId(),
            UnitPrice = 100,
            IsActive = true
        );
        insert pbe;
        
        // Добавляем продукт к возможности
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp.Id,
            Quantity = 10,
            UnitPrice = 100,
            PricebookEntryId = pbe.Id
        );
        insert oli;
        
        // Запускаем тест
        Test.startTest();
        
        // Изменяем статус возможности, чтобы сработал триггер
        opp.StageName = 'Proposal and Agreement';
        update opp;
        
        Test.stopTest();
        
        // Проверяем результаты
        List<invgen__Invoice__c> invoices = [
            SELECT Id, invgen__Account__c, invgen__Opportunity__c, 
                   invgen__Amount__c, invgen__Status__c
            FROM invgen__Invoice__c
            WHERE invgen__Opportunity__c = :opp.Id
        ];
        
        System.assertEquals(1, invoices.size(), 'Should create 1 invoice');
        System.assertEquals(acc.Id, invoices[0].invgen__Account__c, 'Invoice should be linked to the account');
        System.assertEquals(opp.Id, invoices[0].invgen__Opportunity__c, 'Invoice should be linked to the opportunity');
        System.assertEquals(opp.Amount, invoices[0].invgen__Amount__c, 'Invoice amount should match opportunity amount');
        System.assertEquals('Draft', invoices[0].invgen__Status__c, 'Invoice status should be Draft');
        
        // Проверяем строки счета
        List<invgen__Invoice_Line_Item__c> lineItems = [
            SELECT Id, invgen__Description__c, invgen__Quantity__c, 
                   invgen__Unit_Price__c, invgen__Total__c, invgen__Product__c
            FROM invgen__Invoice_Line_Item__c
            WHERE invgen__Invoice__c = :invoices[0].Id
        ];
        
        System.assertEquals(1, lineItems.size(), 'Should create 1 line item');
        System.assertEquals(oli.Quantity, lineItems[0].invgen__Quantity__c, 'Line item quantity should match opportunity line item');
        System.assertEquals(oli.UnitPrice, lineItems[0].invgen__Unit_Price__c, 'Line item unit price should match opportunity line item');
        System.assertEquals(prod.Id, lineItems[0].invgen__Product__c, 'Line item should be linked to the product');
    }
    
    @isTest
    static void testCreateInvoiceWithoutLineItems() {
        // Создаем тестовые данные
        Account acc = new Account(
            Name = 'Test Account',
            BillingStreet = '123 Test St',
            BillingCity = 'Test City',
            BillingState = 'TS',
            BillingPostalCode = '12345',
            BillingCountry = 'Test Country'
        );
        insert acc;
        
        // Создаем возможность без продуктов
        Opportunity opp = new Opportunity(
            Name = 'Test Opportunity No Products',
            StageName = 'Qualification',
            CloseDate = Date.today().addDays(30),
            AccountId = acc.Id,
            Amount = 500
        );
        insert opp;
        
        // Запускаем тест
        Test.startTest();
        
        // Изменяем статус возможности, чтобы сработал триггер
        opp.StageName = 'Proposal and Agreement';
        update opp;
        
        Test.stopTest();
        
        // Проверяем результаты
        List<invgen__Invoice__c> invoices = [
            SELECT Id, invgen__Account__c, invgen__Opportunity__c, 
                   invgen__Amount__c, invgen__Status__c
            FROM invgen__Invoice__c
            WHERE invgen__Opportunity__c = :opp.Id
        ];
        
        System.assertEquals(1, invoices.size(), 'Should create 1 invoice');
        
        // Проверяем строки счета - должна быть одна строка "Service"
        List<invgen__Invoice_Line_Item__c> lineItems = [
            SELECT Id, invgen__Description__c, invgen__Quantity__c, 
                   invgen__Unit_Price__c, invgen__Total__c
            FROM invgen__Invoice_Line_Item__c
            WHERE invgen__Invoice__c = :invoices[0].Id
        ];
        
        System.assertEquals(1, lineItems.size(), 'Should create 1 default line item');
        System.assertEquals('Service', lineItems[0].invgen__Description__c, 'Default line item should have description "Service"');
        System.assertEquals(1, lineItems[0].invgen__Quantity__c, 'Default line item should have quantity 1');
        System.assertEquals(opp.Amount, lineItems[0].invgen__Unit_Price__c, 'Default line item should have unit price equal to opportunity amount');
        System.assertEquals(opp.Amount, lineItems[0].invgen__Total__c, 'Default line item should have total equal to opportunity amount');
    }
}
