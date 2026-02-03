/**
 * Wrapper service to ensure ngrok URL is always used
 * This overrides any hardcoded localhost URLs
 */
public with sharing class QuickBooksAPIServiceWrapper {
    
    /**
     * Force the use of ngrok URL for invoice creation
     */
    public static QuickBooksInvoiceController.InvoiceResult createInvoice(
        Id opportunityId, 
        String salesforceInstance, 
        String quickbooksRealm
    ) {
        QuickBooksInvoiceController.InvoiceResult result = new QuickBooksInvoiceController.InvoiceResult();
        
        try {
            // Get settings
            QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
            
            // FORCE the ngrok URL - no localhost allowed
            String middlewareUrl = settings.Middleware_URL__c;
            if (middlewareUrl.contains('localhost')) {
                System.debug('WARNING: Localhost URL detected, forcing ngrok URL');
                middlewareUrl = 'https://3a62-166-1-160-232.ngrok-free.app';
            }
            
            // Log the URL being used
            System.debug('Using middleware URL: ' + middlewareUrl);
            
            // Prepare the request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(middlewareUrl + '/api/create-invoice');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', settings.API_Key__c);
            req.setTimeout(60000);
            
            // Prepare request body
            Map<String, Object> requestBody = new Map<String, Object>{
                'opportunityId' => opportunityId,
                'salesforceInstance' => salesforceInstance,
                'quickbooksRealm' => quickbooksRealm
            };
            
            req.setBody(JSON.serialize(requestBody));
            
            // Log the full request
            System.debug('Request endpoint: ' + req.getEndpoint());
            System.debug('Request body: ' + req.getBody());
            
            // Make the callout
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            // Process the response
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                result.success = (Boolean) responseBody.get('success');
                result.message = (String) responseBody.get('message');
                result.invoiceId = (String) responseBody.get('invoiceId');
                result.invoiceNumber = (String) responseBody.get('invoiceNumber');
            } else {
                result.success = false;
                result.message = 'API Error: ' + res.getStatus() + ' - ' + res.getBody();
            }
            
        } catch (Exception e) {
            result.success = false;
            result.message = 'Error calling API: ' + e.getMessage();
            System.debug('API callout error: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
        }
        
        return result;
    }
}
