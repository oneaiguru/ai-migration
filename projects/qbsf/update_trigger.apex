// Find and update the "Closed Won" to "Proposal and Agreement" in all triggers
List<ApexTrigger> triggerList = [SELECT Id, Name, Body FROM ApexTrigger WHERE Name = 'OpportunityQuickBooksTrigger'];

if (!triggerList.isEmpty()) {
    for (ApexTrigger triggerObj : triggerList) {
        System.debug('Found trigger: ' + triggerObj.Name);
        
        // Check if the trigger contains "Closed Won"
        if (triggerObj.Body.contains('Closed Won')) {
            System.debug('Trigger contains target text');
            
            // We can't update the trigger directly in Apex, so providing guidance
            System.debug('MANUAL ACTION REQUIRED: Please update trigger OpportunityQuickBooksTrigger');
            System.debug('Find: final String INVOICE_STAGE = \'Closed Won\';');
            System.debug('Replace with: final String INVOICE_STAGE = \'Proposal and Agreement\';');
            System.debug('PATH: Setup > Platform Tools > Custom Code > Apex Triggers');
        } else {
            System.debug('Trigger does not contain "Closed Won", it may have been updated already');
        }
    }
} else {
    System.debug('No trigger found with name OpportunityQuickBooksTrigger');
}