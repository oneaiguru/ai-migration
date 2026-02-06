/**
 * Schedulable class to check for payment status updates from QuickBooks Online
 */
public class QBPaymentStatusScheduler implements Schedulable, Database.AllowsCallouts {
    
    /**
     * Execute method - called when the scheduled job runs
     * @param context SchedulableContext
     */
    public void execute(SchedulableContext context) {
        // Call the batch process to check payment status
        checkPaymentStatus();
    }
    
    /**
     * Method to check payment status for unpaid invoices
     */
    private void checkPaymentStatus() {
        try {
            // Skip in test context
            if (Test.isRunningTest()) {
                // In test context, log this and return without making callouts
                System.debug('Skipping callout in test context');
                createLogEntry('Payment Status Check', 'Success', 'Test run - callout skipped');
                return;
            }
            
            // Get the middleware endpoint from Custom Settings
            QB_Integration_Settings__c settings = QB_Integration_Settings__c.getInstance();
            
            if (settings == null || String.isBlank(settings.Middleware_Endpoint__c)) {
                createLogEntry('Payment Status Check', 'Error', 'Middleware endpoint not configured');
                return;
            }
            
            String endpoint = settings.Middleware_Endpoint__c;
            
            // Create HTTP request
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(endpoint + '/api/check-payment-status');
            request.setMethod('POST');
            request.setHeader('Content-Type', 'application/json');
            
            // Set authentication header
            request.setHeader('X-API-Key', settings.API_Key__c);
            
            // Get Salesforce instance URL
            String instanceUrl = URL.getSalesforceBaseUrl().toExternalForm();
            
            // Create request body
            Map<String, String> requestBody = new Map<String, String>{
                'salesforceInstance' => instanceUrl,
                'quickbooksRealm' => settings.QB_Realm_ID__c
            };
            
            request.setBody(JSON.serialize(requestBody));
            
            // Set timeout to 120 seconds (max allowed)
            request.setTimeout(120000);
            
            // Send the request
            HttpResponse response = http.send(request);
            
            // Process the response
            if (response.getStatusCode() == 200) {
                // Parse the response
                Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                
                if (responseMap.containsKey('success') && (Boolean)responseMap.get('success')) {
                    // Log success
                    Integer processed = (Integer)responseMap.get('invoicesProcessed');
                    Integer updated = (Integer)responseMap.get('invoicesUpdated');
                    
                    System.debug('Payment status check completed: ' + processed + ' invoices processed, ' + updated + ' invoices updated');
                    
                    // Create success log entry
                    createLogEntry('Payment Status Check', 'Success', 
                        'Processed: ' + processed + ', Updated: ' + updated);
                } else {
                    // Log error from the response
                    String errorMessage = responseMap.containsKey('error') 
                        ? (String)responseMap.get('error') 
                        : 'Unknown error';
                    
                    System.debug('Error checking payment status: ' + errorMessage);
                    createLogEntry('Payment Status Check', 'Error', errorMessage);
                }
            } else {
                // Log HTTP error
                String errorMessage = 'HTTP Error: ' + response.getStatusCode() + ' ' + response.getStatus();
                System.debug(errorMessage);
                createLogEntry('Payment Status Check', 'Error', errorMessage);
            }
        } catch (Exception e) {
            // Log any exceptions
            String errorMessage = 'Exception: ' + e.getMessage();
            System.debug(errorMessage);
            createLogEntry('Payment Status Check', 'Error', errorMessage);
        }
    }
    
    /**
     * Create a log entry for the payment status check
     * @param process The process name
     * @param status Success or Error
     * @param message Details about the process
     */
    private void createLogEntry(String process, String status, String message) {
        try {
            // Create a log record if the custom object exists
            if (Schema.getGlobalDescribe().containsKey('QB_Integration_Log__c')) {
                SObject logEntry = Schema.getGlobalDescribe().get('QB_Integration_Log__c').newSObject();
                logEntry.put('Process_Name__c', process);
                logEntry.put('Status__c', status);
                logEntry.put('Message__c', message);
                logEntry.put('Timestamp__c', Datetime.now());
                
                Database.insert(logEntry);
            } else {
                // If custom object doesn't exist, just log to debug logs
                System.debug('QB Integration Log - ' + process + ' - ' + status + ': ' + message);
            }
        } catch (Exception e) {
            System.debug('Error creating log entry: ' + e.getMessage());
        }
    }
    
    /**
     * Method to schedule the job to run nightly
     */
    public static void scheduleNightly() {
        // Schedule the job to run at 1:00 AM every night
        String cronExp = '0 0 1 * * ?';
        System.schedule('QuickBooks Payment Status Check', cronExp, new QBPaymentStatusScheduler());
    }
}
