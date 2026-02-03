/**
 * Apex class to invoke QuickBooks invoice creation from Salesforce
 * This integrates with your existing middleware at final-integration
 */
public with sharing class QuickBooksInvoker {
    // Custom metadata or settings for the middleware URL
    private static final String MIDDLEWARE_URL = 'http://localhost:3000'; // Local middleware URL
    private static final String API_KEY = 'quickbooks_salesforce_api_key_2025'; // Matches API key in .env
    
    /**
     * Invocable method to create QuickBooks invoice from Opportunity
     * This can be called from Process Builder, Flow, or Quick Action
     */
    @InvocableMethod(label='Create QuickBooks Invoice' description='Creates invoice in QuickBooks from Opportunity')
    public static List<InvoiceResult> createQuickBooksInvoice(List<Id> opportunityIds) {
        List<InvoiceResult> results = new List<InvoiceResult>();
        
        for (Id oppId : opportunityIds) {
            results.add(processOpportunity(oppId));
        }
        
        return results;
    }
    
    /**
     * Process a single opportunity
     */
    private static InvoiceResult processOpportunity(Id opportunityId) {
        InvoiceResult result = new InvoiceResult();
        result.opportunityId = opportunityId;
        
        try {
            // Get the current Salesforce instance URL
            String instanceUrl = URL.getOrgDomainUrl().toExternalForm();
            
            // Get the QuickBooks realm ID from custom settings or metadata
            String qbRealmId = getQuickBooksRealmId();
            
            // Call your existing API endpoint
            HttpRequest req = new HttpRequest();
            req.setEndpoint(MIDDLEWARE_URL + '/api/create-invoice');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', API_KEY);
            req.setTimeout(60000); // 60 seconds
            
            // Create request body - matches your existing API
            Map<String, Object> requestBody = new Map<String, Object>{
                'opportunityId' => opportunityId,
                'salesforceInstance' => instanceUrl,
                'quickbooksRealm' => qbRealmId
            };
            
            req.setBody(JSON.serialize(requestBody));
            
            // Make the callout
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            // Process response
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                result.success = (Boolean) responseBody.get('success');
                result.invoiceId = (String) responseBody.get('invoiceId');
                result.message = (String) responseBody.get('message');
            } else {
                result.success = false;
                result.message = 'Error: ' + res.getStatus() + ' - ' + res.getBody();
            }
            
        } catch (Exception e) {
            result.success = false;
            result.message = 'Exception: ' + e.getMessage();
        }
        
        return result;
    }
    
    /**
     * Get QuickBooks Realm ID from custom settings
     * You can hardcode this for demo or use Custom Settings/Metadata
     */
    private static String getQuickBooksRealmId() {
        // For demo, return your QuickBooks realm ID
        return '9341454378379755'; // Actual QuickBooks realm ID from tokens.json
    }
    
    /**
     * Result wrapper class
     */
    public class InvoiceResult {
        @InvocableVariable(label='Success' description='Whether the invoice was created successfully')
        public Boolean success;
        
        @InvocableVariable(label='Invoice ID' description='QuickBooks Invoice ID')
        public String invoiceId;
        
        @InvocableVariable(label='Message' description='Success or error message')
        public String message;
        
        @InvocableVariable(label='Opportunity ID' description='Source Opportunity ID')
        public String opportunityId;
    }
    
    /**
     * Method for Quick Action
     * This is called directly from the Quick Action
     */
    @AuraEnabled
    public static Map<String, Object> createInvoiceFromQuickAction(Id opportunityId) {
        List<Id> oppIds = new List<Id>{opportunityId};
        List<InvoiceResult> results = createQuickBooksInvoice(oppIds);
        
        if (!results.isEmpty()) {
            InvoiceResult result = results[0];
            return new Map<String, Object>{
                'success' => result.success,
                'message' => result.message,
                'invoiceId' => result.invoiceId
            };
        }
        
        return new Map<String, Object>{
            'success' => false,
            'message' => 'No result returned'
        };
    }
}
