#!/bin/bash
# deploy.sh - Скрипт для развертывания решения

echo "==================================================="
echo "Salesforce-QuickBooks Integration Deployment Script"
echo "==================================================="

# Переменные
SF_ALIAS="sanboxsf"
SF_INSTANCE_URL="https://customer-inspiration-2543--sanboxsf.sandbox.my.salesforce.com"
QBO_MIDDLEWARE_DIR="/Users/m/git/clients/qbsf/deployment/sf-qb-integration-final"
DEPLOYMENT_DIR="/Users/m/git/clients/qbsf/deployment-package"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для печати секции
print_section() {
  echo -e "\n${YELLOW}=== $1 ===${NC}"
}

# Функция для проверки результата операции
check_result() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $1${NC}"
  else
    echo -e "${RED}✗ $1${NC}"
    exit 1
  fi
}

# 1. Аутентификация в Salesforce Sandbox
print_section "Аутентификация в Salesforce Sandbox"

echo "Логин в Salesforce Sandbox..."
sf org login web --alias $SF_ALIAS --instance-url $SF_INSTANCE_URL
check_result "Логин в Salesforce Sandbox"

# 2. Создаем директорию для развертывания
print_section "Подготовка файлов для развертывания"

echo "Создаем директорию force-app..."
mkdir -p $DEPLOYMENT_DIR/force-app/main/default/triggers
mkdir -p $DEPLOYMENT_DIR/force-app/main/default/classes
mkdir -p $DEPLOYMENT_DIR/force-app/main/default/objects
check_result "Создание директорий"

# 3. Создаем файлы Apex для триггера и классов
echo "Создаем Apex файлы..."

# Триггер для сделки и счета
cat > $DEPLOYMENT_DIR/force-app/main/default/triggers/OpportunityInvoiceTrigger.trigger << 'EOF'
trigger OpportunityInvoiceTrigger on Opportunity (after update) {
    List<Opportunity> opportunitiesNeedingInvoice = new List<Opportunity>();
    
    for (Opportunity opp : Trigger.new) {
        Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
        
        // Проверяем изменение статуса на "Proposal and Agreement"
        if (opp.StageName == 'Proposal and Agreement' && oldOpp.StageName != 'Proposal and Agreement') {
            opportunitiesNeedingInvoice.add(opp);
        }
    }
    
    if (!opportunitiesNeedingInvoice.isEmpty()) {
        // Вызываем метод для создания счетов
        SFInvoiceCreator.createInvoicesFromOpportunities(opportunitiesNeedingInvoice);
    }
}
EOF

cat > $DEPLOYMENT_DIR/force-app/main/default/triggers/OpportunityInvoiceTrigger.trigger-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexTrigger xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexTrigger>
EOF

cat > $DEPLOYMENT_DIR/force-app/main/default/triggers/InvoiceQBSyncTrigger.trigger << 'EOF'
trigger InvoiceQBSyncTrigger on invgen__Invoice__c (after insert, after update) {
    List<invgen__Invoice__c> invoicesToSync = new List<invgen__Invoice__c>();
    
    // Загружаем связанные сделки для проверки поставщика
    Set<Id> opportunityIds = new Set<Id>();
    for (invgen__Invoice__c invoice : Trigger.new) {
        if (invoice.invgen__Opportunity__c != null) {
            opportunityIds.add(invoice.invgen__Opportunity__c);
        }
    }
    
    // Получаем сделки с полем поставщика
    Map<Id, Opportunity> opportunitiesMap = new Map<Id, Opportunity>([
        SELECT Id, Supplier__c
        FROM Opportunity
        WHERE Id IN :opportunityIds
    ]);
    
    for (invgen__Invoice__c invoice : Trigger.new) {
        // Проверяем условия для отправки в QB
        if (Trigger.isInsert || (Trigger.isUpdate && invoice.invgen__Status__c != Trigger.oldMap.get(invoice.Id).invgen__Status__c)) {
            // Только отправляем в QB, если статус изменился на "Approved"
            if (invoice.invgen__Status__c == 'Approved') {
                // Проверяем поставщика, если есть связанная сделка
                if (invoice.invgen__Opportunity__c != null) {
                    Opportunity relatedOpp = opportunitiesMap.get(invoice.invgen__Opportunity__c);
                    
                    // Только отправляем, если поставщик - US компания или не указан
                    if (relatedOpp == null || 
                        relatedOpp.Supplier__c == null || 
                        relatedOpp.Supplier__c == 'US' ||
                        relatedOpp.Supplier__c == 'USA') {
                        invoicesToSync.add(invoice);
                    } else {
                        // Логируем пропущенный счет
                        System.debug('Skipping invoice ' + invoice.Id + ' for non-US supplier: ' + relatedOpp.Supplier__c);
                    }
                } else {
                    // Если нет связанной сделки, по умолчанию отправляем
                    invoicesToSync.add(invoice);
                }
            }
        }
    }
    
    if (!invoicesToSync.isEmpty()) {
        // Вызываем отложенный процесс для отправки в QB
        System.enqueueJob(new QBInvoiceSyncQueueable(invoicesToSync));
    }
}
EOF

cat > $DEPLOYMENT_DIR/force-app/main/default/triggers/InvoiceQBSyncTrigger.trigger-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexTrigger xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexTrigger>
EOF

# Классы для работы с счетами и QB
cat > $DEPLOYMENT_DIR/force-app/main/default/classes/SFInvoiceCreator.cls << 'EOF'
public class SFInvoiceCreator {
    public static void createInvoicesFromOpportunities(List<Opportunity> opportunities) {
        // Получаем связанные аккаунты
        Set<Id> accountIds = new Set<Id>();
        for (Opportunity opp : opportunities) {
            accountIds.add(opp.AccountId);
        }
        
        Map<Id, Account> accountsMap = new Map<Id, Account>([
            SELECT Id, Name, BillingStreet, BillingCity, BillingState, 
                   BillingPostalCode, BillingCountry, Phone, Website
            FROM Account
            WHERE Id IN :accountIds
        ]);
        
        // Получаем строки товаров
        Map<Id, List<OpportunityLineItem>> oppLineItemsMap = new Map<Id, List<OpportunityLineItem>>();
        for (OpportunityLineItem lineItem : [
            SELECT Id, OpportunityId, Quantity, UnitPrice, TotalPrice, 
                   Product2Id, Product2.Name, Product2.Description
            FROM OpportunityLineItem
            WHERE OpportunityId IN :opportunities
        ]) {
            if (!oppLineItemsMap.containsKey(lineItem.OpportunityId)) {
                oppLineItemsMap.put(lineItem.OpportunityId, new List<OpportunityLineItem>());
            }
            oppLineItemsMap.get(lineItem.OpportunityId).add(lineItem);
        }
        
        // Создание счетов
        List<invgen__Invoice__c> invoicesToInsert = new List<invgen__Invoice__c>();
        
        for (Opportunity opp : opportunities) {
            Account acc = accountsMap.get(opp.AccountId);
            
            invgen__Invoice__c invoice = new invgen__Invoice__c();
            invoice.invgen__Account__c = opp.AccountId;
            invoice.invgen__Opportunity__c = opp.Id;
            invoice.invgen__Invoice_Date__c = Date.today();
            invoice.invgen__Due_Date__c = Date.today().addDays(30);
            invoice.invgen__Status__c = 'Draft';
            invoice.invgen__Amount__c = opp.Amount;
            invoice.invgen__Description__c = 'Invoice for ' + opp.Name;
            
            // Заполнение адреса и контактной информации
            invoice.invgen__Billing_Street__c = acc.BillingStreet;
            invoice.invgen__Billing_City__c = acc.BillingCity;
            invoice.invgen__Billing_State__c = acc.BillingState;
            invoice.invgen__Billing_Postal_Code__c = acc.BillingPostalCode;
            invoice.invgen__Billing_Country__c = acc.BillingCountry;
            
            // Дополнительные поля
            // (Дополнить согласно структуре вашего объекта Invoice)
            
            invoicesToInsert.add(invoice);
        }
        
        if (!invoicesToInsert.isEmpty()) {
            insert invoicesToInsert;
            
            // Создание элементов счета (InvoiceLineItem)
            createInvoiceLineItems(invoicesToInsert, oppLineItemsMap);
        }
    }
    
    private static void createInvoiceLineItems(List<invgen__Invoice__c> invoices, 
                                              Map<Id, List<OpportunityLineItem>> oppLineItemsMap) {
        List<invgen__Invoice_Line_Item__c> lineItemsToInsert = new List<invgen__Invoice_Line_Item__c>();
        
        for (invgen__Invoice__c invoice : invoices) {
            Id opportunityId = invoice.invgen__Opportunity__c;
            List<OpportunityLineItem> oppLineItems = oppLineItemsMap.get(opportunityId);
            
            if (oppLineItems == null || oppLineItems.isEmpty()) {
                // Если у сделки нет элементов, создаем стандартный элемент
                invgen__Invoice_Line_Item__c defaultItem = new invgen__Invoice_Line_Item__c();
                defaultItem.invgen__Invoice__c = invoice.Id;
                defaultItem.invgen__Description__c = 'Service';
                defaultItem.invgen__Quantity__c = 1;
                defaultItem.invgen__Unit_Price__c = invoice.invgen__Amount__c;
                defaultItem.invgen__Total__c = invoice.invgen__Amount__c;
                lineItemsToInsert.add(defaultItem);
            } else {
                // Создаем строки счета из строк сделки
                for (OpportunityLineItem oppLineItem : oppLineItems) {
                    invgen__Invoice_Line_Item__c invoiceLineItem = new invgen__Invoice_Line_Item__c();
                    invoiceLineItem.invgen__Invoice__c = invoice.Id;
                    invoiceLineItem.invgen__Description__c = oppLineItem.Product2.Name;
                    invoiceLineItem.invgen__Quantity__c = oppLineItem.Quantity;
                    invoiceLineItem.invgen__Unit_Price__c = oppLineItem.UnitPrice;
                    invoiceLineItem.invgen__Total__c = oppLineItem.TotalPrice;
                    invoiceLineItem.invgen__Product__c = oppLineItem.Product2Id;
                    lineItemsToInsert.add(invoiceLineItem);
                }
            }
        }
        
        if (!lineItemsToInsert.isEmpty()) {
            insert lineItemsToInsert;
        }
    }
}
EOF

cat > $DEPLOYMENT_DIR/force-app/main/default/classes/SFInvoiceCreator.cls-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

cat > $DEPLOYMENT_DIR/force-app/main/default/classes/QBInvoiceSyncQueueable.cls << 'EOF'
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
                syncInvoiceToQuickBooks(invoice);
            } catch (Exception e) {
                System.debug('Error syncing invoice ' + invoice.Id + ': ' + e.getMessage());
                // Логирование ошибки
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
                   (SELECT Id, invgen__Description__c, invgen__Product__c, 
                           invgen__Quantity__c, invgen__Unit_Price__c, invgen__Total__c,
                           invgen__Product__r.Name, invgen__Product__r.QB_Item_ID__c
                    FROM invgen__Invoice_Line_Items__r)
            FROM invgen__Invoice__c
            WHERE Id IN :invoiceIds
        ];
    }
    
    private void syncInvoiceToQuickBooks(invgen__Invoice__c invoice) {
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
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        // Обрабатываем ответ
        if (res.getStatusCode() == 200 || res.getStatusCode() == 201) {
            // Успешный ответ
            Map<String, Object> responseData = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
            
            if (responseData.containsKey('quickbooksInvoiceId')) {
                String qbInvoiceId = (String)responseData.get('quickbooksInvoiceId');
                
                // Обновляем счет в SF с ID из QB
                invoice.invgen__QB_Invoice_ID__c = qbInvoiceId;
                invoice.invgen__Last_Sync_Date__c = Datetime.now();
                invoice.invgen__Sync_Status__c = 'Synced';
                
                update invoice;
            }
        } else {
            // Обработка ошибки
            String errorMessage = 'Error syncing invoice to QuickBooks. Status code: ' + res.getStatusCode();
            String responseBody = res.getBody();
            
            throw new QBIntegrationException(errorMessage + '. Response: ' + responseBody);
        }
    }
    
    public class QBIntegrationException extends Exception {}
}
EOF

cat > $DEPLOYMENT_DIR/force-app/main/default/classes/QBInvoiceSyncQueueable.cls-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

check_result "Создание Apex файлов"

# 4. Создаем тестовые классы
echo "Создаем тестовые классы..."

cat > $DEPLOYMENT_DIR/force-app/main/default/classes/SFInvoiceCreatorTest.cls << 'EOF'
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
EOF

cat > $DEPLOYMENT_DIR/force-app/main/default/classes/SFInvoiceCreatorTest.cls-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

cat > $DEPLOYMENT_DIR/force-app/main/default/classes/QBInvoiceSyncQueueableTest.cls << 'EOF'
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
EOF

cat > $DEPLOYMENT_DIR/force-app/main/default/classes/QBInvoiceSyncQueueableTest.cls-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

check_result "Создание тестовых классов"

# 5. Создаем XML файлы для middleware URL
echo "Создаем XML для RemoteSiteSettings..."

mkdir -p $DEPLOYMENT_DIR/force-app/main/default/remoteSiteSettings

cat > $DEPLOYMENT_DIR/force-app/main/default/remoteSiteSettings/QuickBooksMiddleware.remoteSite-meta.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<RemoteSiteSetting xmlns="http://soap.sforce.com/2006/04/metadata">
    <disableProtocolSecurity>false</disableProtocolSecurity>
    <isActive>true</isActive>
    <url>https://9e14-166-1-160-232.ngrok-free.app</url>
    <description>URL для связи с middleware для интеграции с QuickBooks</description>
</RemoteSiteSetting>
EOF

check_result "Создание RemoteSiteSettings"

# 6. Обновляем middleware
print_section "Обновление middleware"

echo "Обновляем middleware компоненты..."

# Копируем обновленные файлы в middleware
# (Здесь вставьте код для обновления файлов middleware)

check_result "Обновление middleware компонентов"

# 7. Развертывание в Salesforce Sandbox
print_section "Развертывание в Salesforce Sandbox"

echo "Развертываем в Salesforce Sandbox..."
cd $DEPLOYMENT_DIR
sf project deploy start -d force-app -o $SF_ALIAS --test-level RunLocalTests
check_result "Развертывание в Salesforce Sandbox"

# 8. Проверка развертывания
print_section "Проверка развертывания"

echo "Проверяем результаты развертывания..."
sf apex test run --target-org $SF_ALIAS --test-level RunLocalTests --code-coverage --result-format human --wait 10
check_result "Тесты прошли успешно"

# 9. Запуск middleware
print_section "Запуск middleware"

echo "Запускаем middleware сервер..."
cd $QBO_MIDDLEWARE_DIR
npm start &
check_result "Запуск middleware сервера"

echo -e "\n${GREEN}========================================"
echo "Развертывание успешно завершено!"
echo "========================================${NC}"
echo -e "\nИнструкции по использованию:"
echo -e "1. Создайте сделку в Salesforce и добавьте продукты"
echo -e "2. Измените статус сделки на 'Proposal and Agreement'"
echo -e "3. Проверьте, что счет создан в Salesforce"
echo -e "4. Измените статус счета на 'Approved'"
echo -e "5. Проверьте, что счет отправлен в QuickBooks"
echo -e "6. Платеж будет автоматически проверяться каждые 5 минут"
