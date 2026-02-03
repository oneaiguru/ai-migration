// Simple test of connectivity
try {
    Boolean result = QuickBooksAPIService.testConnection();
    System.debug('Connection test result: ' + result);
    
    QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
    System.debug('Current URL: ' + settings.Middleware_URL__c);
} catch(Exception e) {
    System.debug('Error: ' + e.getMessage());
}
