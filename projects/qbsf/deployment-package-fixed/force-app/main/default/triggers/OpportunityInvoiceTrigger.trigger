/**
 * OpportunityInvoiceTrigger - создание SF Invoice объектов при смене статуса
 * Соответствует финальному соглашению клиента:
 * Opportunity → SF Invoice → (если US поставщик) → QB Invoice
 */
trigger OpportunityInvoiceTrigger on Opportunity (after insert, after update) {
    List<Id> oppIdsForInvoiceCreation = new List<Id>();
    
    final String INVOICE_STAGE = 'Proposal and Agreement';
    
    for (Opportunity opp : Trigger.new) {
        // Для новых записей - проверяем если уже на invoice stage
        if (Trigger.isInsert) {
            if (opp.StageName == INVOICE_STAGE) {
                oppIdsForInvoiceCreation.add(opp.Id);
                System.debug('New opportunity for invoice creation: ' + opp.Id);
            }
        }
        // Для обновлений - проверяем изменение stage на invoice stage
        else if (Trigger.isUpdate) {
            Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
            if (opp.StageName == INVOICE_STAGE && oldOpp.StageName != INVOICE_STAGE) {
                oppIdsForInvoiceCreation.add(opp.Id);
                System.debug('Updated opportunity for invoice creation: ' + opp.Id);
            }
        }
    }
    
    if (!oppIdsForInvoiceCreation.isEmpty()) {
        // Query for all required fields
        List<Opportunity> oppsForInvoiceCreation = [
            SELECT Id, Name, AccountId, Amount, StageName
            FROM Opportunity 
            WHERE Id IN :oppIdsForInvoiceCreation
        ];
        
        System.debug('Creating SF Invoices for ' + oppsForInvoiceCreation.size() + ' opportunities');
        SFInvoiceCreator.createInvoicesFromOpportunities(oppsForInvoiceCreation);
    }
}