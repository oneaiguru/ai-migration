trigger InvoiceQBSyncTrigger on invgen__Invoice__c (after insert, after update) {
    List<invgen__Invoice__c> invoicesToSync = new List<invgen__Invoice__c>();
    
    // Загружаем связанные сделки для проверки поставщика
    Set<Id> opportunityIds = new Set<Id>();
    for (invgen__Invoice__c invoice : Trigger.new) {
        if (invoice.invgen__Opportunity__c != null) {
            opportunityIds.add(invoice.invgen__Opportunity__c);
        }
    }
    
    // Получаем сделки с поставщиками и их данными
    Map<Id, Opportunity> opportunitiesMap = new Map<Id, Opportunity>([
        SELECT Id, Supplier__c,
               Supplier__r.Type, Supplier__r.Country__c
        FROM Opportunity
        WHERE Id IN :opportunityIds AND Supplier__c != null
    ]);
    
    for (invgen__Invoice__c invoice : Trigger.new) {
        // АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ: убрали проверку статуса "Approved"
        // Теперь синхронизируем при создании счета
        if (Trigger.isInsert) {
            // Проверяем поставщика при создании счета
            if (invoice.invgen__Opportunity__c != null) {
                Opportunity relatedOpp = opportunitiesMap.get(invoice.invgen__Opportunity__c);
                
                if (relatedOpp != null && relatedOpp.Supplier__c != null) {
                    // НОВАЯ ЛОГИКА: Account.Type = 'Поставщик' AND Account.Country__c = 'US'
                    if (relatedOpp.Supplier__r.Type == 'Поставщик' && 
                        relatedOpp.Supplier__r.Country__c == 'US') {
                        invoicesToSync.add(invoice);
                        System.debug('Adding invoice ' + invoice.Id + ' for US supplier sync');
                    } else {
                        System.debug('Skipping invoice ' + invoice.Id + 
                                   ' for non-US supplier: Type=' + relatedOpp.Supplier__r.Type + 
                                   ', Country=' + relatedOpp.Supplier__r.Country__c);
                    }
                } else {
                    // Если нет поставщика, пропускаем QB синхронизацию
                    System.debug('Skipping invoice ' + invoice.Id + ' - no supplier specified');
                }
            }
        }
    }
    
    if (!invoicesToSync.isEmpty()) {
        // Автоматическая синхронизация с QB при создании
        System.enqueueJob(new QBInvoiceSyncQueueable(invoicesToSync));
    }
}
