/**
 * SFInvoiceCreator - создание SF Invoice объектов из Opportunities
 * Соответствует финальному соглашению клиента
 */
public class SFInvoiceCreator {
    
    /**
     * Создает SF Invoice из Opportunity при смене статуса на "Proposal and Agreement"
     * @param opportunities Список opportunities для обработки
     */
    public static void createInvoicesFromOpportunities(List<Opportunity> opportunities) {
        List<QB_Invoice__c> invoicesToInsert = new List<QB_Invoice__c>();
        Map<Id, List<OpportunityLineItem>> oppLineItemsMap = getOpportunityLineItems(opportunities);
        
        for (Opportunity opp : opportunities) {
            // Создаем SF Invoice
            QB_Invoice__c invoice = new QB_Invoice__c(
                Opportunity__c = opp.Id,
                Account__c = opp.AccountId,
                Amount__c = opp.Amount,
                Status__c = 'Draft',
                Invoice_Date__c = Date.today(),
                Due_Date__c = Date.today().addDays(30),
                Description__c = 'Invoice for ' + opp.Name
            );
            
            invoicesToInsert.add(invoice);
        }
        
        if (!invoicesToInsert.isEmpty()) {
            insert invoicesToInsert;
            
            // Создаем line items для каждого invoice
            createInvoiceLineItems(invoicesToInsert, oppLineItemsMap);
            
            // Проверяем какие invoices нужно синхронизировать с QB (только US поставщики)
            List<QB_Invoice__c> invoicesForQBSync = filterUSSupplierInvoices(invoicesToInsert);
            
            if (!invoicesForQBSync.isEmpty()) {
                // Запускаем sync с QuickBooks для US поставщиков
                System.enqueueJob(new QBInvoiceSyncQueueable(invoicesForQBSync));
            }
        }
    }
    
    /**
     * Получает line items для opportunities
     */
    private static Map<Id, List<OpportunityLineItem>> getOpportunityLineItems(List<Opportunity> opportunities) {
        Set<Id> oppIds = new Set<Id>();
        for (Opportunity opp : opportunities) {
            oppIds.add(opp.Id);
        }
        
        Map<Id, List<OpportunityLineItem>> lineItemsMap = new Map<Id, List<OpportunityLineItem>>();
        
        for (OpportunityLineItem lineItem : [
            SELECT Id, OpportunityId, Quantity, UnitPrice, TotalPrice, 
                   Product2Id, Product2.Name, Description
            FROM OpportunityLineItem
            WHERE OpportunityId IN :oppIds
        ]) {
            if (!lineItemsMap.containsKey(lineItem.OpportunityId)) {
                lineItemsMap.put(lineItem.OpportunityId, new List<OpportunityLineItem>());
            }
            lineItemsMap.get(lineItem.OpportunityId).add(lineItem);
        }
        
        return lineItemsMap;
    }
    
    /**
     * Создает line items для invoices
     */
    private static void createInvoiceLineItems(List<QB_Invoice__c> invoices, 
                                             Map<Id, List<OpportunityLineItem>> oppLineItemsMap) {
        List<QB_Invoice_Line_Item__c> lineItemsToInsert = new List<QB_Invoice_Line_Item__c>();
        
        for (QB_Invoice__c invoice : invoices) {
            List<OpportunityLineItem> oppLineItems = oppLineItemsMap.get(invoice.Opportunity__c);
            
            if (oppLineItems == null || oppLineItems.isEmpty()) {
                // Создаем default line item если нет products
                lineItemsToInsert.add(new QB_Invoice_Line_Item__c(
                    Invoice__c = invoice.Id,
                    Description__c = 'Service',
                    Quantity__c = 1,
                    Unit_Price__c = invoice.Amount__c
                ));
            } else {
                // Создаем line items из opportunity products
                for (OpportunityLineItem oppLineItem : oppLineItems) {
                    lineItemsToInsert.add(new QB_Invoice_Line_Item__c(
                        Invoice__c = invoice.Id,
                        Description__c = oppLineItem.Product2.Name,
                        Quantity__c = oppLineItem.Quantity,
                        Unit_Price__c = oppLineItem.UnitPrice,
                        Product__c = oppLineItem.Product2Id
                    ));
                }
            }
        }
        
        if (!lineItemsToInsert.isEmpty()) {
            insert lineItemsToInsert;
        }
    }
    
    /**
     * Фильтрует invoices только для US поставщиков
     * Согласно финальному соглашению: Account.Account_Type__c = 'Поставщик' AND Account.Country__c = 'US'
     */
    private static List<QB_Invoice__c> filterUSSupplierInvoices(List<QB_Invoice__c> invoices) {
        List<QB_Invoice__c> usSupplierInvoices = new List<QB_Invoice__c>();
        
        // Получаем opportunities с supplier данными
        Set<Id> oppIds = new Set<Id>();
        for (QB_Invoice__c invoice : invoices) {
            oppIds.add(invoice.Opportunity__c);
        }
        
        Map<Id, Opportunity> oppMap = new Map<Id, Opportunity>([
            SELECT Id, Supplier__c, 
                   Supplier__r.Account_Type__c, 
                   Supplier__r.Country__c
            FROM Opportunity
            WHERE Id IN :oppIds
            AND Supplier__c != null
        ]);
        
        for (QB_Invoice__c invoice : invoices) {
            Opportunity opp = oppMap.get(invoice.Opportunity__c);
            
            if (opp != null && 
                opp.Supplier__r.Account_Type__c == 'Поставщик' && 
                opp.Supplier__r.Country__c == 'US') {
                usSupplierInvoices.add(invoice);
                System.debug('Invoice ' + invoice.Id + ' marked for QB sync (US Supplier: ' + opp.Supplier__c + ')');
            } else {
                System.debug('Invoice ' + invoice.Id + ' skipped for QB sync (Non-US supplier or no supplier)');
            }
        }
        
        return usSupplierInvoices;
    }
}
