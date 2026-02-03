// Simple test of invoice creation
try {
    // Get an opportunity to test with
    List<Opportunity> opps = [SELECT Id, Name FROM Opportunity
                         WHERE QB_Invoice_ID__c = null AND Amount > 0
                         LIMIT 1];
    
    if (!opps.isEmpty()) {
        Opportunity opp = opps[0];
        System.debug('Testing with opportunity: ' + opp.Name);
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
            
        System.debug('Invoice creation result: ' + result.success);
        System.debug('Message: ' + result.message);
        
        if (result.invoiceId != null) {
            System.debug('Invoice ID: ' + result.invoiceId);
        }
    } else {
        System.debug('No suitable opportunities found for testing');
    }
} catch(Exception e) {
    System.debug('Error: ' + e.getMessage());
}