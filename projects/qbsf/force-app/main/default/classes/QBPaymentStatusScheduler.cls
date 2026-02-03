public class QBPaymentStatusScheduler implements Schedulable {
    
    public void execute(SchedulableContext sc) {
        // Check payment status for all unpaid invoices
        checkPaymentStatus();
    }
    
    @future(callout=true)
    public static void checkPaymentStatus() {
        try {
            // Get custom settings for API configuration
            QB_Integration_Settings__c settings = QB_Integration_Settings__c.getOrgDefaults();
            if (settings == null || String.isBlank(settings.Middleware_Endpoint__c)) {
                System.debug('QB Integration Settings not configured');
                return;
            }
            
            String middlewareUrl = settings.Middleware_Endpoint__c;
            String apiKey = settings.API_Key__c;
            String salesforceInstance = URL.getOrgDomainUrl().toExternalForm();
            String quickbooksRealm = settings.QB_Realm_ID__c;
            
            // Prepare request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(middlewareUrl + '/api/check-payment-status');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', apiKey);
            req.setTimeout(120000); // 2 minutes timeout
            
            // Build request body
            Map<String, Object> requestBody = new Map<String, Object>{
                'salesforceInstance' => salesforceInstance,
                'quickbooksRealm' => quickbooksRealm
            };
            
            req.setBody(JSON.serialize(requestBody));
            
            // Send request
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            System.debug('Payment check response status: ' + res.getStatusCode());
            System.debug('Payment check response body: ' + res.getBody());
            
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                Integer invoicesProcessed = (Integer) responseMap.get('invoicesProcessed');
                Integer paidInvoicesFound = (Integer) responseMap.get('paidInvoicesFound');
                Integer invoicesUpdated = (Integer) responseMap.get('invoicesUpdated');
                
                System.debug('Payment check completed - Processed: ' + invoicesProcessed + 
                           ', Paid found: ' + paidInvoicesFound + 
                           ', Updated: ' + invoicesUpdated);
                
                // Log integration event if any payments were found
                if (paidInvoicesFound > 0) {
                    logIntegrationEvent('Payment Sync', 'SUCCESS', 
                                       'Found and updated ' + paidInvoicesFound + ' paid invoices');
                }
            } else {
                System.debug('Payment check failed with status ' + res.getStatusCode() + ': ' + res.getBody());
                logIntegrationEvent('Payment Sync', 'ERROR', 
                                   'Status ' + res.getStatusCode() + ': ' + res.getBody());
            }
            
        } catch (Exception e) {
            System.debug('Error checking payment status: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            logIntegrationEvent('Payment Sync', 'ERROR', e.getMessage());
        }
    }
    
    private static void logIntegrationEvent(String eventType, String status, String message) {
        // For now, just log to debug console
        // Can be enhanced later to write to a custom object if needed
        System.debug('Integration Event: ' + eventType + ' - ' + status + ' - ' + message);
    }
    
    // Manual execution method for testing
    public static void runNow() {
        checkPaymentStatus();
    }
}