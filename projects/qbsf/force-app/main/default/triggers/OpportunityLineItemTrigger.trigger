/**
 * Trigger for OpportunityLineItem to update existing QuickBooks invoices
 * Fires when products are inserted, updated, or deleted
 */
trigger OpportunityLineItemTrigger on OpportunityLineItem (after insert, after update, after delete) {
    // Collect parent Opportunity Ids from the affected line items
    Set<Id> opportunityIds = new Set<Id>();
    for (OpportunityLineItem lineItem : Trigger.isDelete ? Trigger.old : Trigger.new) {
        opportunityIds.add(lineItem.OpportunityId);
    }

    if (opportunityIds.isEmpty()) {
        return;
    }

    // Only process Opportunities that already have a QuickBooks invoice (fetch Supplier for filtering)
    List<Opportunity> opportunitiesWithInvoices = [
        SELECT Id, QB_Invoice_ID__c, Supplier__c, Supplier__r.Name
        FROM Opportunity
        WHERE Id IN :opportunityIds
        AND QB_Invoice_ID__c != null
    ];

    if (!opportunitiesWithInvoices.isEmpty()) {
        // Chunk enqueue to avoid exceeding callout limits in the queueable
        Integer chunkSize = 50;
        List<Opportunity> chunk = new List<Opportunity>();
        for (Integer idx = 0; idx < opportunitiesWithInvoices.size(); idx++) {
            Opportunity opp = opportunitiesWithInvoices[idx];
            String supplierName = opp.Supplier__r != null ? opp.Supplier__r.Name : null;
            String normalized = supplierName != null ? supplierName.trim().toLowerCase() : '';

            // Skip suppliers that should not be sent to QuickBooks (per request: ATO COMM)
            if (normalized == 'ato comm') {
                continue;
            }

            chunk.add(opp);

            Boolean atChunkBoundary = chunk.size() == chunkSize;
            Boolean isLast = idx == opportunitiesWithInvoices.size() - 1;
            if ((atChunkBoundary || isLast) && !chunk.isEmpty()) {
                System.enqueueJob(new QBInvoiceUpdateQueueable(chunk));
                chunk = new List<Opportunity>();
            }
        }
    }
}
