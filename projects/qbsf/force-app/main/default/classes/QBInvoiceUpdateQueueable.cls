/**
 * Queueable job to update existing QuickBooks invoices when Opportunity products change
 */
public class QBInvoiceUpdateQueueable implements Queueable, Database.AllowsCallouts {

    private List<Opportunity> opportunities;
    public static Boolean allowTestCallouts = false;
    private Boolean allowCallouts = true;
    private List<QB_Integration_Log__c> successLogs = new List<QB_Integration_Log__c>();
    private List<QB_Integration_Error_Log__c> errorLogs = new List<QB_Integration_Error_Log__c>();

    public QBInvoiceUpdateQueueable(List<Opportunity> opps) {
        this(opps, Test.isRunningTest() ? allowTestCallouts : true);
    }

    public QBInvoiceUpdateQueueable(List<Opportunity> opps, Boolean allowCallouts) {
        this.opportunities = opps;
        this.allowCallouts = allowCallouts;
    }

    public void execute(QueueableContext context) {
        for (Opportunity opp : opportunities) {
            try {
                if (Test.isRunningTest() && !allowCallouts) {
                    // In tests without callouts, mark success to validate chunking/logging
                    logSuccess(opp.Id, opp.QB_Invoice_ID__c);
                    continue;
                }

                HttpResponse response = callUpdateService(opp.Id, opp.QB_Invoice_ID__c);
                handleResponse(response, opp.Id, opp.QB_Invoice_ID__c);
            } catch (Exception e) {
                logError(opp.Id, 'Exception: ' + e.getMessage());
            }
        }

        // Bulk insert logs to stay under DML limits
        if (!successLogs.isEmpty()) {
            Database.insert(successLogs, false);
        }
        if (!errorLogs.isEmpty()) {
            Database.insert(errorLogs, false);
        }
    }

    private HttpResponse callUpdateService(Id opportunityId, String qbInvoiceId) {
        QB_Integration_Settings__c settings = QB_Integration_Settings__c.getInstance();
        if (settings == null || String.isBlank(settings.Middleware_Endpoint__c)) {
            throw new QBIntegrationException('Middleware endpoint not configured in QB_Integration_Settings__c');
        }

        HttpRequest request = new HttpRequest();
        request.setEndpoint(settings.Middleware_Endpoint__c + '/api/update-invoice');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(60000);

        if (String.isNotBlank(settings.API_Key__c)) {
            request.setHeader('X-API-Key', settings.API_Key__c);
        }

        Map<String, Object> requestBody = new Map<String, Object>{
            'opportunityId' => opportunityId,
            'qbInvoiceId' => qbInvoiceId,
            'salesforceInstance' => URL.getSalesforceBaseUrl().toExternalForm(),
            'quickbooksRealm' => settings.QB_Realm_ID__c
        };

        request.setBody(JSON.serialize(requestBody));

        Http http = new Http();
        return http.send(request);
    }

    private void handleResponse(HttpResponse res, Id oppId, String qbInvoiceId) {
        if (res == null) {
            logError(oppId, 'No response received from update service');
            return;
        }

        if (res.getStatusCode() == 200) {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            Boolean successFlag = responseMap.containsKey('success') ? (Boolean) responseMap.get('success') : false;
            if (successFlag) {
                logSuccess(oppId, qbInvoiceId);
            } else {
                String message = responseMap.containsKey('message') ? (String) responseMap.get('message') : 'Unknown error from update service';
                logError(oppId, message);
            }
        } else {
            logError(oppId, 'HTTP ' + res.getStatusCode() + ': ' + res.getBody());
        }
    }

    private void logSuccess(Id oppId, String qbInvoiceId) {
        successLogs.add(new QB_Integration_Log__c(
            Opportunity__c = oppId,
            QB_Invoice_ID__c = qbInvoiceId,
            Status__c = 'Success',
            Message__c = 'Invoice update processed',
            Timestamp__c = DateTime.now()
        ));
    }

    private void logError(Id oppId, String message) {
        errorLogs.add(new QB_Integration_Error_Log__c(
            Opportunity__c = oppId,
            Error_Message__c = message.abbreviate(255),
            Error_Type__c = 'Integration Error',
            Timestamp__c = DateTime.now()
        ));
    }

    public class QBIntegrationException extends Exception {}
}
