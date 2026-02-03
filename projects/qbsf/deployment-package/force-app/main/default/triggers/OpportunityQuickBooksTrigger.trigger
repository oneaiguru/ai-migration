/**
 * Trigger for Opportunity object to integrate with QuickBooks Online
 * 
 * Fires on Opportunity creation/update to send data to QuickBooks Online
 * when an opportunity reaches a specific stage
 */
trigger OpportunityQuickBooksTrigger on Opportunity (after insert, after update) {
    // List to store opportunities that need to be processed
    List<Opportunity> oppsToProcess = new List<Opportunity>();
    
    // Configuration: What Stage Name should trigger invoice creation
    final String INVOICE_STAGE = 'Proposal and Agreement';
    
    // Process only opportunities that meet our criteria
    for (Opportunity opp : Trigger.new) {
        // For inserts, check if the opportunity is already at the invoice stage
        if (Trigger.isInsert) {
            if (opp.StageName == INVOICE_STAGE) {
                oppsToProcess.add(opp);
            }
        }
        // For updates, check if the stage changed to the invoice stage
        else if (Trigger.isUpdate) {
            Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
            if (opp.StageName == INVOICE_STAGE && oldOpp.StageName != INVOICE_STAGE) {
                oppsToProcess.add(opp);
            }
        }
    }
    
    // If we have opportunities to process, call our integration service
    if (!oppsToProcess.isEmpty()) {
        // Avoid hitting governor limits by processing asynchronously
        System.enqueueJob(new QBInvoiceIntegrationQueueable(oppsToProcess));
    }
}