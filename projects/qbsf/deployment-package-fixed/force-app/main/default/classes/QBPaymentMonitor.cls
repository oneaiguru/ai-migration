/**
 * QuickBooks Payment Monitor - автоматический мониторинг оплат
 * Проверяет статус оплат в QuickBooks и обновляет Opportunities в Salesforce
 * Запускается по расписанию каждые 10 минут
 */
public class QBPaymentMonitor implements Schedulable, Database.AllowsCallouts {
    
    /**
     * Scheduled execution метод
     * @param context SchedulableContext
     */
    public void execute(SchedulableContext context) {
        // Вызываем метод проверки оплат
        checkPaymentStatus();
    }
    
    /**
     * Основной метод проверки статуса оплат
     * Может быть вызван как из scheduler, так и вручную
     */
    public static void checkPaymentStatus() {
        try {
            // Получаем настройки интеграции
            QB_Integration_Settings__c settings = QB_Integration_Settings__c.getInstance();
            if (settings == null || String.isBlank(settings.Middleware_Endpoint__c)) {
                System.debug('QB Integration settings not configured');
                return;
            }
            
            // Получаем все opportunities с QB Invoice ID, которые еще не закрыты
            List<Opportunity> oppsWithInvoices = [
                SELECT Id, Name, QB_Invoice_ID__c, Amount, AccountId, Account.Name,
                       QB_Last_Payment_Check__c, StageName
                FROM Opportunity
                WHERE QB_Invoice_ID__c != null 
                AND StageName != 'Closed Won'
                AND StageName != 'Closed Lost'
                LIMIT 50
            ];
            
            if (oppsWithInvoices.isEmpty()) {
                System.debug('No opportunities with QB invoices to check');
                return;
            }
            
            System.debug('Checking payment status for ' + oppsWithInvoices.size() + ' opportunities');
            
            // Вызываем middleware для проверки статуса оплат
            HttpResponse response = callPaymentCheckService(settings);
            
            if (response.getStatusCode() == 200) {
                processPaymentCheckResponse(response.getBody(), oppsWithInvoices);
            } else {
                System.debug('Error calling payment check service: ' + response.getStatusCode() + ' ' + response.getBody());
            }
            
        } catch (Exception e) {
            System.debug('Error in payment status check: ' + e.getMessage() + ' ' + e.getStackTraceString());
            logError('Payment Status Check Error: ' + e.getMessage());
        }
    }
    
    /**
     * Вызывает middleware сервис для проверки статуса оплат
     * @param settings QB Integration Settings
     * @return HttpResponse
     */
    private static HttpResponse callPaymentCheckService(QB_Integration_Settings__c settings) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        request.setEndpoint(settings.Middleware_Endpoint__c + '/api/check-payment-status');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('X-API-Key', settings.API_Key__c);
        request.setTimeout(60000);
        
        // Request body
        Map<String, String> requestBody = new Map<String, String>{
            'salesforceInstance' => URL.getSalesforceBaseUrl().toExternalForm(),
            'quickbooksRealm' => settings.QB_Realm_ID__c
        };
        
        request.setBody(JSON.serialize(requestBody));
        
        return http.send(request);
    }
    
    /**
     * Обрабатывает ответ от payment check сервиса
     * @param responseBody JSON ответ от сервиса
     * @param opportunities Список opportunities для обновления
     */
    private static void processPaymentCheckResponse(String responseBody, List<Opportunity> opportunities) {
        try {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(responseBody);
            
            if (responseMap.containsKey('success') && (Boolean)responseMap.get('success')) {
                Integer paidInvoicesFound = responseMap.containsKey('paidInvoicesFound') 
                    ? (Integer)responseMap.get('paidInvoicesFound') : 0;
                
                if (paidInvoicesFound > 0) {
                    System.debug('Payment check found ' + paidInvoicesFound + ' paid invoices');
                    
                    // Обновляем все opportunities - middleware уже обновил их в QB
                    // Здесь мы просто отмечаем время последней проверки
                    updateLastPaymentCheckTime(opportunities);
                    
                    logSuccess('Payment check completed', paidInvoicesFound);
                }
            } else {
                String errorMessage = responseMap.containsKey('error') 
                    ? (String)responseMap.get('error') 
                    : 'Unknown error from payment check service';
                logError('Payment check service error: ' + errorMessage);
            }
        } catch (Exception e) {
            System.debug('Error processing payment check response: ' + e.getMessage());
            logError('Error processing payment check response: ' + e.getMessage());
        }
    }
    
    /**
     * Обновляет время последней проверки оплат для opportunities
     * @param opportunities Список opportunities
     */
    private static void updateLastPaymentCheckTime(List<Opportunity> opportunities) {
        try {
            List<Opportunity> oppsToUpdate = new List<Opportunity>();
            DateTime checkTime = DateTime.now();
            
            for (Opportunity opp : opportunities) {
                oppsToUpdate.add(new Opportunity(
                    Id = opp.Id,
                    QB_Last_Payment_Check__c = checkTime
                ));
            }
            
            if (!oppsToUpdate.isEmpty()) {
                update oppsToUpdate;
                System.debug('Updated last payment check time for ' + oppsToUpdate.size() + ' opportunities');
            }
        } catch (Exception e) {
            System.debug('Error updating last payment check time: ' + e.getMessage());
        }
    }
    
    /**
     * Логирует успешное выполнение
     * @param message Сообщение
     * @param recordsProcessed Количество обработанных записей
     */
    private static void logSuccess(String message, Integer recordsProcessed) {
        try {
            QB_Integration_Log__c logEntry = new QB_Integration_Log__c(
                Status__c = 'Success',
                Message__c = message,
                Records_Processed__c = recordsProcessed,
                Timestamp__c = DateTime.now()
            );
            insert logEntry;
        } catch (Exception e) {
            System.debug('Error creating success log: ' + e.getMessage());
        }
    }
    
    /**
     * Логирует ошибку
     * @param errorMessage Сообщение об ошибке
     */
    private static void logError(String errorMessage) {
        try {
            QB_Integration_Error_Log__c errorLog = new QB_Integration_Error_Log__c(
                Error_Message__c = errorMessage.abbreviate(255),
                Error_Type__c = 'Payment Monitor Error',
                Timestamp__c = DateTime.now()
            );
            insert errorLog;
        } catch (Exception e) {
            System.debug('Error creating error log: ' + e.getMessage());
        }
    }
    
    /**
     * Запускает scheduler для автоматической проверки оплат каждые 10 минут
     * Вызывать из Anonymous Apex или из Setup процедуры
     */
    public static void schedulePaymentMonitor() {
        try {
            // Останавливаем существующие jobs если есть
            List<CronTrigger> existingJobs = [
                SELECT Id FROM CronTrigger 
                WHERE CronJobDetail.Name LIKE 'QB Payment Monitor%'
            ];
            
            for (CronTrigger job : existingJobs) {
                System.abortJob(job.Id);
            }
            
            // Запускаем новый job каждые 10 минут
            String cronExp = '0 */10 * * * ?'; // Каждые 10 минут
            System.schedule('QB Payment Monitor ' + DateTime.now().getTime(), cronExp, new QBPaymentMonitor());
            
            System.debug('QB Payment Monitor scheduled successfully');
        } catch (Exception e) {
            System.debug('Error scheduling payment monitor: ' + e.getMessage());
            logError('Error scheduling payment monitor: ' + e.getMessage());
        }
    }
}
