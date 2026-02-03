/**
 * Fixed Service class for QuickBooks API integration
 * This version ALWAYS uses the ngrok URL, bypassing settings
 */
public with sharing class QuickBooksAPIServiceFixed {
    
    // HARDCODED NGROK URL TO BYPASS ALL SETTINGS ISSUES
    private static final String NGROK_URL = 'https://3a62-166-1-160-232.ngrok-free.app';
    
    /**
     * Create an invoice via the middleware API
     */
    public static QuickBooksInvoiceController.InvoiceResult createInvoice(
        Id opportunityId, 
        String salesforceInstance, 
        String quickbooksRealm
    ) {
        QuickBooksInvoiceController.InvoiceResult result = new QuickBooksInvoiceController.InvoiceResult();
        
        try {
            // Get settings for API key only
            QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
            
            // ALWAYS USE NGROK URL
            String middlewareUrl = NGROK_URL;
            System.debug('FIXED SERVICE: Using hardcoded ngrok URL: ' + middlewareUrl);
            
            // Prepare the request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(middlewareUrl + '/api/create-invoice');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', settings.API_Key__c);
            req.setTimeout(60000);
            
            // Log the actual endpoint being used
            System.debug('FIXED SERVICE: Final endpoint: ' + req.getEndpoint());
            
            // Prepare request body
            Map<String, Object> requestBody = new Map<String, Object>{
                'opportunityId' => opportunityId,
                'salesforceInstance' => salesforceInstance,
                'quickbooksRealm' => quickbooksRealm
            };
            
            req.setBody(JSON.serialize(requestBody));
            
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
            System.debug('FIXED SERVICE ERROR: ' + e.getMessage());
            System.debug('FIXED SERVICE STACK: ' + e.getStackTraceString());
        }
        
        return result;
    }
}
