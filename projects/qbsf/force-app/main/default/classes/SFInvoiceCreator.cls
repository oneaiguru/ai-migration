public class SFInvoiceCreator {

    // ---> НАЧАЛО ПЕРВОГО МЕТОДА
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
            invoice.invgen__Invoice_Status__c = 'Draft';
            
     
            invoicesToInsert.add(invoice);
        }
        
        if (!invoicesToInsert.isEmpty()) {
            insert invoicesToInsert;
            
            // Создание элементов счета (InvoiceLineItem)
            createInvoiceLineItems(invoicesToInsert, oppLineItemsMap);
        }
    }
    // ---> КОНЕЦ ПЕРВОГО МЕТОДА

    // ---> НАЧАЛО ВТОРОГО МЕТОДА
    private static void createInvoiceLineItems(List<invgen__Invoice__c> invoices, Map<Id, List<OpportunityLineItem>> oppLineItemsMap) {
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
                lineItemsToInsert.add(defaultItem);
            } else {
                // Создаем строки счета из строк сделки
                for (OpportunityLineItem oppLineItem : oppLineItems) {
                    invgen__Invoice_Line_Item__c invoiceLineItem = new invgen__Invoice_Line_Item__c();
                    invoiceLineItem.invgen__Invoice__c = invoice.Id;
                    invoiceLineItem.invgen__Description__c = oppLineItem.Product2.Name;
                    invoiceLineItem.invgen__Quantity__c = oppLineItem.Quantity;
                    lineItemsToInsert.add(invoiceLineItem);
                }
            }
        }
        
        if (!lineItemsToInsert.isEmpty()) {
            insert lineItemsToInsert;
        }
    }
    // ---> КОНЕЦ ВТОРОГО МЕТОДА

} // Конец всего класса