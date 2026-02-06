/**
 * Service class for QuickBooks API integration
 * Handles the HTTP callouts to the middleware
 */
public with sharing class QuickBooksAPIService {
    
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
            // Get settings
            QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
            
            // Prepare the request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(settings.Middleware_URL__c + '/api/opportunity-to-invoice');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', settings.API_Key__c);
            req.setTimeout(60000); // 60 seconds
            
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
            System.debug('API callout error: ' + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Test the connection to the middleware
     */
    public static Boolean testConnection() {
        try {
            QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
            
            HttpRequest req = new HttpRequest();
            req.setEndpoint(settings.Middleware_URL__c + '/health');
            req.setMethod('GET');
            req.setHeader('X-API-Key', settings.API_Key__c);
            req.setTimeout(10000);
            
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            return res.getStatusCode() == 200;
        } catch (Exception e) {
            System.debug('Connection test failed: ' + e.getMessage());
            return false;
        }
    }
}
