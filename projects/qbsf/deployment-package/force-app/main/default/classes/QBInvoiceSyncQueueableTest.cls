@isTest
private class QBInvoiceSyncQueueableTest {
    @isTest
    static void testSyncInvoiceToQuickBooks() {
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
            StageName = 'Proposal and Agreement',
            CloseDate = Date.today().addDays(30),
            AccountId = acc.Id,
            Amount = 1000
        );
        insert opp;
        
        // Создаем счет
        invgen__Invoice__c invoice = new invgen__Invoice__c(
            invgen__Account__c = acc.Id,
            invgen__Opportunity__c = opp.Id,
            invgen__Invoice_Date__c = Date.today(),
            invgen__Due_Date__c = Date.today().addDays(30),
            invgen__Status__c = 'Draft',
            invgen__Amount__c = 1000,
            invgen__Description__c = 'Test Invoice'
        );
        insert invoice;
        
        // Создаем строку счета
        invgen__Invoice_Line_Item__c lineItem = new invgen__Invoice_Line_Item__c(
            invgen__Invoice__c = invoice.Id,
            invgen__Description__c = 'Test Line Item',
            invgen__Quantity__c = 10,
            invgen__Unit_Price__c = 100,
            invgen__Total__c = 1000
        );
        insert lineItem;
        
        // Создаем настройки QuickBooks
        QB_Integration_Settings__c qbSettings = new QB_Integration_Settings__c(
            Middleware_Endpoint__c = 'https://example.com',
            API_Key__c = 'test-api-key',
            QB_Realm_ID__c = '123456789'
        );
        insert qbSettings;
        
        // Создаем мок HTTP для симуляции вызова API
        Test.setMock(HttpCalloutMock.class, new QBCalloutMock());
        
        // Запускаем тест
        Test.startTest();
        
        // Изменяем статус счета, чтобы сработал триггер
        invoice.invgen__Status__c = 'Approved';
        update invoice;
        
        // Запускаем очередь вручную для тестирования
        QBInvoiceSyncQueueable queueable = new QBInvoiceSyncQueueable(new List<invgen__Invoice__c>{invoice});
        System.enqueueJob(queueable);
        
        Test.stopTest();
        
        // Проверяем результаты
        invgen__Invoice__c updatedInvoice = [
            SELECT Id, invgen__QB_Invoice_ID__c, invgen__Sync_Status__c
            FROM invgen__Invoice__c
            WHERE Id = :invoice.Id
        ];
        
        // Проверка корректной обработки ответа от API
        System.assertEquals('QB-123', updatedInvoice.invgen__QB_Invoice_ID__c, 'QB Invoice ID should be updated');
        System.assertEquals('Synced', updatedInvoice.invgen__Sync_Status__c, 'Sync status should be updated');
    }
    
    // Мок для HTTP вызовов
    private class QBCalloutMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            // Проверяем, что запрос корректно сформирован
            System.assertEquals('POST', req.getMethod());
            System.assert(req.getEndpoint().endsWith('/api/sf-invoice-to-qb'));
            System.assertEquals('application/json', req.getHeader('Content-Type'));
            System.assertEquals('test-api-key', req.getHeader('X-API-Key'));
            
            // Создаем успешный ответ
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('{"success":true,"quickbooksInvoiceId":"QB-123","quickbooksInvoiceNumber":"INV-123"}');
            return res;
        }
    }
}
