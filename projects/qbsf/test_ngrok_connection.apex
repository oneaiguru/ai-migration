try {
    // First test if the QuickBooksAPIService direct testConnection works
    System.debug('=== Testing Original API Service ===');
    Boolean originalResult = QuickBooksAPIService.testConnection();
    System.debug('Original connection test result: ' + originalResult);
    
    // Then test if we can create an invoice via the controller
    System.debug('=== Testing Controller ===');
    QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
    System.debug('Current Middleware URL: ' + settings.Middleware_URL__c);
    
    // Get an opportunity ID to test with
    Opportunity opp = null;
    try {
        opp = [SELECT Id, Name FROM Opportunity 
               WHERE QB_Invoice_ID__c = null AND Amount > 0 
               LIMIT 1];
        System.debug('Found test opportunity: ' + opp.Name);
    } catch (Exception e) {
        System.debug('No suitable opportunity found for testing');
    }
    
    if (opp \!= null) {
        System.debug('Calling createInvoice for opportunity: ' + opp.Id);
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
        System.debug('Invoice creation result: success=' + result.success);
        System.debug('Invoice creation message: ' + result.message);
        if (result.invoiceId \!= null) {
            System.debug('Invoice ID: ' + result.invoiceId);
        }
    }
    
} catch(Exception e) {
    System.debug('Error: ' + e.getMessage());
    System.debug('Stack trace: ' + e.getStackTraceString());
}
