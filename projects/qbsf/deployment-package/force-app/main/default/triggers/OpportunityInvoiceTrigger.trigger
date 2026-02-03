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
