public class QBPaymentMonitor implements Schedulable {
    
    public void execute(SchedulableContext context) {
        checkPaymentStatus();
    }
    
    @future(callout=true)
    public static void checkPaymentStatus() {
        try {
            QB_Integration_Settings__c qbSettings = QB_Integration_Settings__c.getOrgDefaults();
            String middlewareEndpoint = qbSettings.Middleware_Endpoint__c;
            String apiKey = qbSettings.API_Key__c;
            String qbRealmId = qbSettings.QB_Realm_ID__c;
            
            if (String.isBlank(middlewareEndpoint)) {
                System.debug('Payment monitor: Middleware endpoint not configured');
                return;
            }
            
            HttpRequest req = new HttpRequest();
            req.setEndpoint(middlewareEndpoint + '/api/check-invoice-payment-status');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', apiKey);
            req.setTimeout(30000);
            
            Map<String, String> requestBody = new Map<String, String>();
            requestBody.put('salesforceInstance', URL.getSalesforceBaseUrl().toExternalForm());
            requestBody.put('quickbooksRealm', qbRealmId);
            req.setBody(JSON.serialize(requestBody));
            
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseData = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
                
                if (responseData.containsKey('success') && (Boolean)responseData.get('success')) {
                    Integer processed = (Integer)responseData.get('invoicesProcessed');
                    Integer paid = (Integer)responseData.get('paidInvoicesFound');
                    Integer updated = (Integer)responseData.get('invoicesUpdated');
                    
                    System.debug('Payment monitor: Processed ' + processed + ' invoices, found ' + paid + ' paid, updated ' + updated);
                    
                    // Логируем успешную проверку
                    logPaymentCheck(processed, paid, updated, null);
                } else {
                    String errorMsg = responseData.containsKey('error') ? 
                        (String)responseData.get('error') : 'Unknown error';
                    System.debug('Payment monitor error: ' + errorMsg);
                    logPaymentCheck(0, 0, 0, errorMsg);
                }
            } else {
                String errorMsg = 'HTTP Error: ' + res.getStatusCode() + ' - ' + res.getBody();
                System.debug('Payment monitor HTTP error: ' + errorMsg);
                logPaymentCheck(0, 0, 0, errorMsg);
            }
        } catch (Exception e) {
            System.debug('Payment monitor exception: ' + e.getMessage());
            logPaymentCheck(0, 0, 0, e.getMessage());
        }
    }
    
    private static void logPaymentCheck(Integer processed, Integer paid, Integer updated, String errorMessage) {
        try {
            QB_Integration_Log__c logEntry = new QB_Integration_Log__c();
            logEntry.Operation__c = 'Payment Status Check';
            logEntry.Records_Processed__c = processed;
            logEntry.Success_Count__c = updated;
            logEntry.Error_Count__c = String.isNotBlank(errorMessage) ? 1 : 0;
            logEntry.Details__c = String.isNotBlank(errorMessage) ? 
                errorMessage : 'Processed: ' + processed + ', Paid: ' + paid + ', Updated: ' + updated;
            logEntry.Timestamp__c = Datetime.now();
            
            insert logEntry;
        } catch (Exception e) {
            System.debug('Error logging payment check: ' + e.getMessage());
        }
    }
    
    // Метод для настройки автоматического запуска каждые 10 минут
    public static void schedulePaymentMonitoring() {
        // Удаляем существующие задачи
        List<CronTrigger> existingJobs = [
            SELECT Id FROM CronTrigger 
            WHERE CronJobDetail.Name LIKE 'QB Payment Monitor%'
        ];
        for (CronTrigger job : existingJobs) {
            System.abortJob(job.Id);
        }
        
        // Запускаем новую задачу каждые 10 минут
        String cronExp = '0 */10 * * * ?';
        String jobName = 'QB Payment Monitor ' + System.now().getTime();
        System.schedule(jobName, cronExp, new QBPaymentMonitor());
        
        System.debug('Scheduled payment monitoring: ' + jobName);
    }
    
    // Метод для одноразовой проверки (для тестирования)
    public static void runPaymentCheckNow() {
        if (!Test.isRunningTest()) {
            checkPaymentStatus();
        } else {
            System.debug('Skipping payment check in test context');
        }
    }
}