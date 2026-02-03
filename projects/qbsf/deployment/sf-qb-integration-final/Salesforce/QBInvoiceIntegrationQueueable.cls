/**
 * Queueable class to process opportunities and create invoices in QuickBooks Online
 */
public class QBInvoiceIntegrationQueueable implements Queueable, Database.AllowsCallouts {
    
    private List<Opportunity> opportunities;
    
    /**
     * Constructor
     * @param opps List of opportunities to process
     */
    public QBInvoiceIntegrationQueueable(List<Opportunity> opps) {
        this.opportunities = opps;
    }
    
    /**
     * Execute method - called when the job runs
     * @param context QueueableContext
     */
    public void execute(QueueableContext context) {
        // Process each opportunity one at a time to handle errors properly
        for (Opportunity opp : opportunities) {
            try {
                // Skip processing in test context (to avoid callout issues in tests)
                if (Test.isRunningTest()) {
                    System.debug('Skipping API callout in test context for opportunity: ' + opp.Id);
                    continue;
                }
                
                // Call integration middleware service to create invoice in QuickBooks
                HttpResponse response = callIntegrationService(opp.Id);
                
                // Process the response
                if (response.getStatusCode() == 200) {
                    // Parse the response to get the QuickBooks Invoice ID
                    Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                    
                    if (responseMap.containsKey('success') && (Boolean)responseMap.get('success')) {
                        // Update the opportunity with the QuickBooks Invoice ID
                        String qbInvoiceId = (String)responseMap.get('qbInvoiceId');
                        updateOpportunityWithQBInvoiceId(opp.Id, qbInvoiceId);
                        
                        // Log success
                        System.debug('Successfully created QuickBooks invoice for opportunity: ' + opp.Id);
                    } else {
                        // Log error from the response
                        String errorMessage = responseMap.containsKey('error') 
                            ? (String)responseMap.get('error') 
                            : 'Unknown error';
                        
                        System.debug('Error creating QuickBooks invoice: ' + errorMessage);
                        logError(opp.Id, 'Error from integration service: ' + errorMessage);
                    }
                } else {
                    // Log HTTP error
                    System.debug('HTTP Error: ' + response.getStatusCode() + ' ' + response.getStatus());
                    logError(opp.Id, 'HTTP Error: ' + response.getStatusCode() + ' ' + response.getStatus());
                }
            } catch (Exception e) {
                // Log any exceptions
                System.debug('Exception: ' + e.getMessage() + ' ' + e.getStackTraceString());
                logError(opp.Id, 'Exception: ' + e.getMessage());
            }
        }
    }
    
    /**
     * Call the integration middleware service
     * @param opportunityId The Opportunity ID to process
     * @return HttpResponse The response from the service
     */
    private HttpResponse callIntegrationService(Id opportunityId) {
        // Get the middleware endpoint from Custom Settings
        QB_Integration_Settings__c settings = QB_Integration_Settings__c.getInstance();
        String endpoint = settings.Middleware_Endpoint__c;
        
        if (String.isBlank(endpoint)) {
            throw new QBIntegrationException('Middleware endpoint not configured');
        }
        
        // Create HTTP request
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(endpoint + '/api/opportunity-to-invoice');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        
        // Set authentication header
        request.setHeader('X-API-Key', settings.API_Key__c);
        
        // Get Salesforce instance URL
        String instanceUrl = URL.getSalesforceBaseUrl().toExternalForm();
        
        // Create request body
        Map<String, String> requestBody = new Map<String, String>{
            'opportunityId' => opportunityId,
            'salesforceInstance' => instanceUrl,
            'quickbooksRealm' => settings.QB_Realm_ID__c
        };
        
        request.setBody(JSON.serialize(requestBody));
        
        // Send the request
        return http.send(request);
    }
    
    /**
     * Update the opportunity with the QuickBooks Invoice ID
     * @param opportunityId The Opportunity ID to update
     * @param qbInvoiceId The QuickBooks Invoice ID
     */
    private void updateOpportunityWithQBInvoiceId(Id opportunityId, String qbInvoiceId) {
        try {
            Opportunity opp = new Opportunity(
                Id = opportunityId,
                QB_Invoice_ID__c = qbInvoiceId
            );
            
            update opp;
        } catch (Exception e) {
            System.debug('Error updating opportunity with QB Invoice ID: ' + e.getMessage());
            logError(opportunityId, 'Error updating opportunity: ' + e.getMessage());
        }
    }
    
    /**
     * Log an error for the integration
     * @param opportunityId The Opportunity ID
     * @param errorMessage The error message
     */
    private void logError(Id opportunityId, String errorMessage) {
        try {
            // Create an error log record if the custom object exists
            if (Schema.getGlobalDescribe().containsKey('QB_Integration_Error_Log__c')) {
                SObject errorLog = Schema.getGlobalDescribe().get('QB_Integration_Error_Log__c').newSObject();
                errorLog.put('Opportunity__c', opportunityId);
                errorLog.put('Error_Message__c', errorMessage);
                errorLog.put('Timestamp__c', Datetime.now());
                
                Database.insert(errorLog);
            } else {
                // If custom object doesn't exist, just log to debug logs
                System.debug('QB Integration Error for Opportunity ' + opportunityId + ': ' + errorMessage);
            }
        } catch (Exception e) {
            System.debug('Error creating error log: ' + e.getMessage());
        }
    }
    
    /**
     * Custom exception class for QB Integration errors
     */
    public class QBIntegrationException extends Exception {}
}
