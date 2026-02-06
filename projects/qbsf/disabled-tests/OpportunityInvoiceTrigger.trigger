trigger OpportunityInvoiceTrigger on Opportunity (after update) {
    // DISABLED: Conflicts with OpportunityQuickBooksTrigger (working solution)
    return;
    
    System.debug('--- OpportunityInvoiceTrigger: ТРИГГЕР ЗАПУЩЕН ---'); // <-- ЖУЧОК #1
    
    List<Opportunity> opportunitiesNeedingInvoice = new List<Opportunity>();
    
    for (Opportunity opp : Trigger.new) {
        Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
        
        // Отлаживаем условие
        System.debug('Проверяем сделку ' + opp.Id + '. Новая стадия: ' + opp.StageName + '. Старая стадия: ' + oldOpp.StageName);
        
        if (opp.StageName == 'Proposal and Agreement' && oldOpp.StageName != 'Proposal and Agreement') {
            System.debug('--- OpportunityInvoiceTrigger: УСЛОВИЕ ВЫПОЛНЕНО! Добавляем сделку в список. ---'); // <-- ЖУЧОК #2
            opportunitiesNeedingInvoice.add(opp);
        }
    }
    
    if (!opportunitiesNeedingInvoice.isEmpty()) {
        System.debug('--- OpportunityInvoiceTrigger: Вызываем SFInvoiceCreator. ---');
        SFInvoiceCreator.createInvoicesFromOpportunities(opportunitiesNeedingInvoice);
    }
}