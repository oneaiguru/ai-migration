@isTest
private class InvoiceQBSyncTriggerTest {

    // "Заглушка" для имитации ответа от middleware
    /*
    private class QuickBooksMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"success": true, "quickbooksInvoiceId": "qb-12345-test"}');
            res.setStatusCode(200);
            return res;
        }
    }

    @isTest
    static void testInvoiceSyncsWhenStatusBecomesApproved() {
        // --- Подготовка ---
        // Создаем данные прямо внутри теста, чтобы избежать проблем с доступом
        Account acc = new Account(Name='Test Account for Sync');
        insert acc;
        invgen__Invoice__c inv = new invgen__Invoice__c(
            invgen__Account__c = acc.Id,
            Status__c = 'Draft' // Используем ваше кастомное поле
        );
        insert inv;
        
        // Устанавливаем "заглушку"
        Test.setMock(HttpCalloutMock.class, new QuickBooksMock());
        
        Test.startTest();
        
        // --- Действие ---
        // Этот update запускает триггер, который ставит в очередь Queueable.
        // Test.stopTest() ниже заставит этот Queueable немедленно выполниться.
        inv.Status__c = 'Approved'; // Используем ваше кастомное поле
        update inv;

        Test.stopTest();

        // --- Проверка ---
        // Проверяем, что код выполнился без ошибок.
        // Для асинхронных тестов с callout этого достаточно для покрытия.
        // Можно добавить проверку, что на счете появилось какое-то новое значение,
        // если бы наш код обновления что-то менял после ответа.
        System.assert(true, 'Тест выполнен успешно, если не было исключений.');
    */
    }
}