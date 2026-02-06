trigger InvoiceQBSyncTrigger on invgen__Invoice__c (after insert, after update) {
    // DISABLED: Focus on working Opportunity-based integration
    return;
    
    System.debug('--- InvoiceQBSyncTrigger: ТРИГГЕР ЗАПУЩЕН ---'); // <-- ЖУЧОК #1

    List<invgen__Invoice__c> invoicesToSync = new List<invgen__Invoice__c>();
    
    for (invgen__Invoice__c invoice : Trigger.new) {
        
        System.debug('Проверяем счет ' + invoice.Id + '. Его статус: ' + invoice.Status__c);
        
        if (invoice.Status__c == 'Approved') {
             if (Trigger.isInsert || invoice.Status__c != Trigger.oldMap.get(invoice.Id).Status__c) {
                System.debug('--- InvoiceQBSyncTrigger: УСЛОВИЕ ВЫПОЛНЕНО! Добавляем счет в список. ---'); // <-- ЖУЧОК #2
                invoicesToSync.add(invoice);
             }
        }
    }
    
    if (!invoicesToSync.isEmpty()) {
        System.debug('--- InvoiceQBSyncTrigger: Вызываем QBInvoiceSyncQueueable. ---');
        System.enqueueJob(new QBInvoiceSyncQueueable(invoicesToSync));
    }
}