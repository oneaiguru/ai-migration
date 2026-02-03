public class QBInvoiceSyncQueueable implements Queueable, Database.AllowsCallouts {
    private List<invgen__Invoice__c> invoices;
    
    public QBInvoiceSyncQueueable(List<invgen__Invoice__c> invoices) {
        this.invoices = invoices;
    }
    
    public void execute(QueueableContext context) {
        // Загружаем данные счета со связанными записями
        loadInvoiceData();
        
        // Отправляем каждый счет в QB
        for (invgen__Invoice__c invoice : invoices) {
            try {
                // Создаем счет в QB и получаем ID
                String qbInvoiceId = syncInvoiceToQuickBooks(invoice);
                
                // Обновляем SF счет со статусом "Created"
                updateInvoiceWithQBData(invoice.Id, qbInvoiceId, 'Created');
                
                System.debug('Successfully synced SF invoice ' + invoice.Id + ' to QB: ' + qbInvoiceId);
            } catch (Exception e) {
                System.debug('Error syncing invoice ' + invoice.Id + ': ' + e.getMessage());
                updateInvoiceWithQBData(invoice.Id, null, 'Failed');
                logError(invoice.Id, e.getMessage());
            }
        }
    }
    
    private void loadInvoiceData() {
        // Получаем ID счетов для запроса
        Set<Id> invoiceIds = new Set<Id>();
        for (invgen__Invoice__c inv : invoices) {
            invoiceIds.add(inv.Id);
        }
        
        // Обновляем коллекцию счетов с полными данными
        invoices = [
            SELECT Id, Name, invgen__Account__c, invgen__Opportunity__c, 
                   invgen__Invoice_Date__c, invgen__Due_Date__c, invgen__Status__c,
                   invgen__Amount__c, invgen__Description__c, 
                   invgen__Billing_Street__c, invgen__Billing_City__c, 
                   invgen__Billing_State__c, invgen__Billing_Postal_Code__c, 
                   invgen__Billing_Country__c, invgen__Payment_Terms__c,
                   invgen__QB_Invoice_ID__c, // Поле для хранения ID в QB
                   invgen__Account__r.Name,
                   invgen__Account__r.Phone,
                   invgen__Account__r.Website,
                   invgen__Account__r.Email__c,
                   (SELECT Id, invgen__Description__c, invgen__Product__c, 
                           invgen__Quantity__c, invgen__Unit_Price__c, invgen__Total__c,
                           invgen__Product__r.Name, invgen__Product__r.QB_Item_ID__c
                    FROM invgen__Invoice_Line_Items__r)
            FROM invgen__Invoice__c
            WHERE Id IN :invoiceIds
        ];
    }
    
    private String syncInvoiceToQuickBooks(invgen__Invoice__c invoice) {
        // Получаем настройки QB из пользовательских настроек
        QB_Integration_Settings__c qbSettings = QB_Integration_Settings__c.getOrgDefaults();
        String middlewareEndpoint = qbSettings.Middleware_Endpoint__c;
        String apiKey = qbSettings.API_Key__c;
        String qbRealmId = qbSettings.QB_Realm_ID__c;
        
        if (String.isBlank(middlewareEndpoint) || String.isBlank(apiKey) || String.isBlank(qbRealmId)) {
            throw new QBIntegrationException('QuickBooks integration settings are missing or incomplete');
        }
        
        // Формируем данные запроса
        Map<String, Object> requestData = new Map<String, Object>();
        requestData.put('salesforceInvoiceId', invoice.Id);
        requestData.put('salesforceInstance', URL.getSalesforceBaseUrl().toExternalForm());
        requestData.put('quickbooksRealm', qbRealmId);
        
        // Добавляем данные счета
        Map<String, Object> invoiceData = new Map<String, Object>();
        invoiceData.put('id', invoice.Id);
        invoiceData.put('number', invoice.Name);
        invoiceData.put('date', String.valueOf(invoice.invgen__Invoice_Date__c));
        invoiceData.put('dueDate', String.valueOf(invoice.invgen__Due_Date__c));
        invoiceData.put('amount', invoice.invgen__Amount__c);
        invoiceData.put('description', invoice.invgen__Description__c);
        invoiceData.put('status', invoice.invgen__Status__c);
        
        // Добавляем данные клиента
        Map<String, Object> customerData = new Map<String, Object>();
        customerData.put('id', invoice.invgen__Account__c);
        customerData.put('name', invoice.invgen__Account__r.Name);
        
        Map<String, Object> addressData = new Map<String, Object>();
        addressData.put('street', invoice.invgen__Billing_Street__c);
        addressData.put('city', invoice.invgen__Billing_City__c);
        addressData.put('state', invoice.invgen__Billing_State__c);
        addressData.put('postalCode', invoice.invgen__Billing_Postal_Code__c);
        addressData.put('country', invoice.invgen__Billing_Country__c);
        
        customerData.put('address', addressData);
        customerData.put('phone', invoice.invgen__Account__r.Phone);
        customerData.put('email', invoice.invgen__Account__r.Email__c);
        customerData.put('website', invoice.invgen__Account__r.Website);
        
        invoiceData.put('customer', customerData);
        
        // Добавляем строки счета
        List<Object> lineItems = new List<Object>();
        for (invgen__Invoice_Line_Item__c lineItem : invoice.invgen__Invoice_Line_Items__r) {
            Map<String, Object> lineItemData = new Map<String, Object>();
            lineItemData.put('description', lineItem.invgen__Description__c);
            lineItemData.put('quantity', lineItem.invgen__Quantity__c);
            lineItemData.put('unitPrice', lineItem.invgen__Unit_Price__c);
            lineItemData.put('amount', lineItem.invgen__Total__c);
            
            // Если есть связанный продукт с ID в QB
            if (lineItem.invgen__Product__c != null && lineItem.invgen__Product__r.QB_Item_ID__c != null) {
                Map<String, Object> productData = new Map<String, Object>();
                productData.put('id', lineItem.invgen__Product__r.QB_Item_ID__c);
                productData.put('name', lineItem.invgen__Product__r.Name);
                lineItemData.put('product', productData);
            }
            
            lineItems.add(lineItemData);
        }
        
        invoiceData.put('lineItems', lineItems);
        requestData.put('invoice', invoiceData);
        
        // Отправляем данные в middleware
        String endpoint = middlewareEndpoint + '/api/sf-invoice-to-qb';
        String requestBody = JSON.serialize(requestData);
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('X-API-Key', apiKey);
        req.setBody(requestBody);
        req.setTimeout(30000);
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        // Обрабатываем ответ
        if (res.getStatusCode() == 200 || res.getStatusCode() == 201) {
            Map<String, Object> responseData = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
            
            if (responseData.containsKey('success') && (Boolean)responseData.get('success')) {
                String qbInvoiceId = (String)responseData.get('quickbooksInvoiceId');
                if (String.isNotBlank(qbInvoiceId)) {
                    return qbInvoiceId;
                } else {
                    throw new QBIntegrationException('QuickBooks Invoice ID not returned in response');
                }
            } else {
                String errorMsg = responseData.containsKey('error') ? 
                    (String)responseData.get('error') : 'Unknown error from middleware';
                throw new QBIntegrationException('Middleware error: ' + errorMsg);
            }
        } else {
            throw new QBIntegrationException('HTTP Error: ' + res.getStatusCode() + ' - ' + res.getBody());
        }
    }
    
    private void updateInvoiceWithQBData(Id invoiceId, String qbInvoiceId, String status) {
        try {
            invgen__Invoice__c invoice = new invgen__Invoice__c();
            invoice.Id = invoiceId;
            if (String.isNotBlank(qbInvoiceId)) {
                invoice.invgen__QB_Invoice_ID__c = qbInvoiceId;
            }
            invoice.invgen__Status__c = status;
            invoice.invgen__Last_Sync_Date__c = Datetime.now();
            
            update invoice;
        } catch (Exception e) {
            System.debug('Error updating invoice: ' + e.getMessage());
        }
    }
    
    private void logError(Id invoiceId, String errorMessage) {
        try {
            // Попытка создать запись об ошибке
            QB_Integration_Error_Log__c errorLog = new QB_Integration_Error_Log__c();
            errorLog.Invoice__c = invoiceId;
            errorLog.Error_Message__c = errorMessage.left(255); // Ограничиваем длину
            errorLog.Timestamp__c = Datetime.now();
            
            insert errorLog;
        } catch (Exception e) {
            System.debug('Error creating error log: ' + e.getMessage());
        }
    }
    
    public class QBIntegrationException extends Exception {}
}
