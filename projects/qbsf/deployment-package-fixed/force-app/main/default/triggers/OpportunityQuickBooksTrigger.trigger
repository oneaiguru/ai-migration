/**
 * ИСПРАВЛЕННЫЙ ТРИГГЕР: Opportunity QuickBooks Integration Phase 2
 * 
 * Автоматическая интеграция с QuickBooks Online для US поставщиков
 * Новые требования клиента:
 * 1. Полная автоматизация - без ручного статуса "Approved"  
 * 2. Фильтрация только US поставщиков (Account.Account_Type__c = 'Поставщик' AND Account.Country__c = 'US')
 * 3. Автоматическое создание Invoice в QB при смене статуса на "Proposal and Agreement"
 */
trigger OpportunityQuickBooksTrigger on Opportunity (after insert, after update) {
    List<Opportunity> oppsToProcess = new List<Opportunity>();
    
    // Configuration: Stage Name для создания invoice
    final String INVOICE_STAGE = 'Proposal and Agreement';
    
    // Собираем Account IDs для проверки supplier типа
    Set<Id> accountIds = new Set<Id>();
    for (Opportunity opp : Trigger.new) {
        if (opp.AccountId != null) {
            accountIds.add(opp.AccountId);
        }
    }
    
    // Получаем Account данные с Type и Country для фильтрации поставщиков
    Map<Id, Account> accountsMap = new Map<Id, Account>([
        SELECT Id, Name, Account_Type__c, Country__c, Email__c,
               BillingStreet, BillingCity, BillingState, 
               BillingPostalCode, BillingCountry, Phone
        FROM Account
        WHERE Id IN :accountIds
    ]);
    
    // Обрабатываем только opportunities которые соответствуют критериям
    for (Opportunity opp : Trigger.new) {
        Account relatedAccount = accountsMap.get(opp.AccountId);
        
        // Проверяем что Account существует и является US поставщиком
        if (relatedAccount != null && 
            relatedAccount.Account_Type__c == 'Поставщик' && 
            relatedAccount.Country__c == 'US') {
            
            // Для новых записей - проверяем если уже на invoice stage
            if (Trigger.isInsert) {
                if (opp.StageName == INVOICE_STAGE) {
                    oppsToProcess.add(opp);
                    System.debug('Adding new opportunity for QB sync: ' + opp.Id + ' (US Supplier: ' + relatedAccount.Name + ')');
                }
            }
            // Для обновлений - проверяем изменение stage на invoice stage
            else if (Trigger.isUpdate) {
                Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
                if (opp.StageName == INVOICE_STAGE && oldOpp.StageName != INVOICE_STAGE) {
                    oppsToProcess.add(opp);
                    System.debug('Adding updated opportunity for QB sync: ' + opp.Id + ' (US Supplier: ' + relatedAccount.Name + ')');
                }
            }
        } else if (relatedAccount != null) {
            // Логируем пропуск не-US поставщиков
            System.debug('Skipping opportunity ' + opp.Id + 
                        ' - Account Type: ' + relatedAccount.Account_Type__c + 
                        ', Country: ' + relatedAccount.Country__c + 
                        ' (только US поставщики синхронизируются с QB)');
        }
    }
    
    // Если есть opportunities для обработки - запускаем асинхронную интеграцию
    if (!oppsToProcess.isEmpty()) {
        System.debug('Enqueuing ' + oppsToProcess.size() + ' opportunities for QuickBooks integration');
        System.enqueueJob(new QBInvoiceIntegrationQueueable(oppsToProcess));
    }
}
