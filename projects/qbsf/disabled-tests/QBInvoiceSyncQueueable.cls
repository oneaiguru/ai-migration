public class QBInvoiceSyncQueueable implements Queueable, Database.AllowsCallouts {
    
    private List<invgen__Invoice__c> invoices;
    
    public QBInvoiceSyncQueueable(List<invgen__Invoice__c> invoicesToSync) {
        this.invoices = invoicesToSync;
    }
    
    public void execute(QueueableContext context) {
        Set<Id> invoiceIds = new Map<Id, SObject>(this.invoices).keySet();
        
        // --- ОПТИМИЗИРОВАННЫЙ БЛОК ---
        // УПРОЩЕННЫЙ ЗАПРОС: Мы убрали из запроса строки счета (subquery),
        // чтобы избежать ошибок с несуществующими полями.
        // Мы получаем только 'шапку' Счета и данные связанного Контрагента.
        List<invgen__Invoice__c> fullInvoices = [
            SELECT Id, Name, invgen__Account__c, invgen__Opportunity__c, 
                   invgen__Invoice_Date__c, invgen__Due_Date__c,
                   invgen__Account__r.Name, invgen__Account__r.Phone,
                   invgen__Account__r.BillingStreet, invgen__Account__r.BillingCity, 
                   invgen__Account__r.BillingState, invgen__Account__r.BillingPostalCode, 
                   invgen__Account__r.BillingCountry,
                   // ПРОВЕРЬТЕ API NAME: Убедитесь, что это правильное имя поля для ОБЩЕЙ СУММЫ счета
                   invgen__Total_Price__c
            FROM invgen__Invoice__c
            WHERE Id IN :invoiceIds
        ];
        
        for (invgen__Invoice__c invoice : fullInvoices) {
            try {
                syncInvoiceToQuickBooks(invoice);
            } catch (Exception e) {
                System.debug('ERROR syncing invoice ' + invoice.Id + ': ' + e.getMessage());
            }
        }
    }
    
    private void syncInvoiceToQuickBooks(invgen__Invoice__c invoice) {
        QB_Integration_Settings__c qbSettings = QB_Integration_Settings__c.getOrgDefaults();
        if (qbSettings == null) { return; }
        
        Map<String, Object> requestData = new Map<String, Object>();
        requestData.put('salesforceInvoiceId', invoice.Id);
        // Исправленный метод для получения URL, который не вызывает ошибок
        requestData.put('salesforceInstance', System.URL.getOrgDomainUrl().toExternalForm());
        requestData.put('quickbooksRealm', qbSettings.QB_Realm_ID__c);
        
        Map<String, Object> invoiceData = new Map<String, Object>();
        invoiceData.put('id', invoice.Id);
        invoiceData.put('number', invoice.Name);
        invoiceData.put('date', String.valueOf(invoice.invgen__Invoice_Date__c));
        invoiceData.put('dueDate', String.valueOf(invoice.invgen__Due_Date__c));
        // ПРОВЕРЬТЕ API NAME: Убедитесь, что это правильное имя поля для ОБЩЕЙ СУММЫ счета
        invoiceData.put('amount', invoice.invgen__Total_Price__c);
        
        Map<String, Object> customerData = new Map<String, Object>();
        customerData.put('name', invoice.invgen__Account__r.Name);
        Map<String, Object> addressData = new Map<String, Object>();
        addressData.put('street', invoice.invgen__Account__r.BillingStreet);
        addressData.put('city', invoice.invgen__Account__r.BillingCity);
        addressData.put('state', invoice.invgen__Account__r.BillingState);
        addressData.put('postalCode', invoice.invgen__Account__r.BillingPostalCode);
        addressData.put('country', invoice.invgen__Account__r.BillingCountry);
        customerData.put('address', addressData);
        invoiceData.put('customer', customerData);
        
        // --- ОПТИМИЗИРОВАННЫЙ БЛОК ---
        // УДАЛЕНО: Вся логика по обработке строк счета.
        // Отправляем пустой список, middleware создаст стандартную строку "Services" на основе общей суммы.
        invoiceData.put('lineItems', new List<Object>());
        
        requestData.put('invoice', invoiceData);
        
        String requestBody = JSON.serialize(requestData);
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint(qbSettings.Middleware_Endpoint__c + '/api/sf-invoice-to-qb');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('X-API-Key', qbSettings.API_Key__c);
        req.setBody(requestBody);
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            System.debug('Successfully synced invoice ' + invoice.Id);
        } else {
            System.debug('Error syncing invoice ' + invoice.Id + '. Status: ' + res.getStatus() + '. Body: ' + res.getBody());
        }
    }
}