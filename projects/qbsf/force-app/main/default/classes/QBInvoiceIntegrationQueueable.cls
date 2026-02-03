/**
 * QuickBooks Invoice Integration Queueable
 * Adds status/error tracking on Opportunity and correlation IDs.
 */
public class QBInvoiceIntegrationQueueable implements Queueable, Database.AllowsCallouts {

    private static final String CONFIG_MISSING_MESSAGE =
        'Middleware endpoint not configured in QB_Integration_Settings__c';
    private List<Opportunity> opportunities;
    public static Boolean allowTestCallouts = false;

    public QBInvoiceIntegrationQueueable(List<Opportunity> opps) {
        this.opportunities = opps;
    }

    public void execute(QueueableContext context) {
        Integer chunkSize = 10;
        List<Opportunity> chunk = new List<Opportunity>();

        for (Integer i = 0; i < opportunities.size(); i++) {
            chunk.add(opportunities[i]);
            if (chunk.size() >= chunkSize || i == opportunities.size() - 1) {
                processChunk(chunk);
                chunk.clear();
            }
        }
    }

    private void processChunk(List<Opportunity> chunk) {
        Map<Id, String> correlationById = new Map<Id, String>();
        List<Opportunity> oppsToUpdate = new List<Opportunity>();
        List<QB_Integration_Log__c> logsToInsert = new List<QB_Integration_Log__c>();
        List<QB_Integration_Error_Log__c> errorLogsToInsert = new List<QB_Integration_Error_Log__c>();
        Boolean missingSettings = isMiddlewareEndpointMissing();

        Set<Id> chunkOpportunityIds = new Set<Id>();
        for (Opportunity opp : chunk) {
            if (opp != null && opp.Id != null) {
                chunkOpportunityIds.add(opp.Id);
            }
        }

        Map<Id, Opportunity> opportunitiesById = chunkOpportunityIds.isEmpty()
            ? new Map<Id, Opportunity>()
            : new Map<Id, Opportunity>([
                SELECT Id, QB_Invoice_ID__c
                FROM Opportunity
                WHERE Id IN :chunkOpportunityIds
            ]);

        for (Opportunity opp : chunk) {
            correlationById.put(opp.Id, EncodingUtil.convertToHex(Crypto.generateAesKey(128)).substring(0, 32));
        }

        for (Opportunity opp : chunk) {
            String correlationId = correlationById.get(opp.Id);
            try {
                Opportunity opportunity = opportunitiesById.containsKey(opp.Id)
                    ? opportunitiesById.get(opp.Id)
                    : opp;

                if (String.isNotBlank(opportunity.QB_Invoice_ID__c)) {
                    Opportunity finalUpdate = buildStatusUpdate(
                        opp.Id, 'Skipped', 'ALREADY_HAS_INVOICE',
                        'Invoice ' + opportunity.QB_Invoice_ID__c + ' already exists',
                        correlationId
                    );
                    oppsToUpdate.add(finalUpdate);
                    continue;
                }

                if (Test.isRunningTest() && !allowTestCallouts) {
                    if (missingSettings) {
                        oppsToUpdate.add(buildStatusUpdate(
                            opp.Id, 'Error', 'CONFIG_MISSING', CONFIG_MISSING_MESSAGE, correlationId
                        ));
                        errorLogsToInsert.add(buildErrorLog(
                            opp.Id, 'Configuration Error', CONFIG_MISSING_MESSAGE
                        ));
                    } else {
                        Opportunity finalUpdate = buildStatusUpdate(
                            opp.Id, 'Success', null, null, correlationId
                        );
                        finalUpdate.QB_Invoice_ID__c = 'TEST-QB-INV-' + String.valueOf(opp.Id).substring(15);
                        finalUpdate.QB_Last_Sync_Date__c = DateTime.now();
                        oppsToUpdate.add(finalUpdate);
                    }
                    continue;
                }

                HttpResponse response = callIntegrationService(opp.Id, correlationId);
                Integer statusCode = response.getStatusCode();

                if (statusCode == 200 || statusCode == 201) {
                    Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                    if (responseMap.containsKey('success') && (Boolean) responseMap.get('success')) {
                        String qbInvoiceId = (String) responseMap.get('qbInvoiceId');
                        String paymentLink = (String) responseMap.get('paymentLink');
                        String paymentStatus = (String) responseMap.get('paymentLinkStatus');
                        String paymentMessage = (String) responseMap.get('paymentLinkMessage');
                        String warningCode = (String) responseMap.get('warningCode');
                        String warningMessage = (String) responseMap.get('warningMessage');

                        String finalStatus = (String.isBlank(paymentStatus) || paymentStatus == 'SUCCESS')
                            ? 'Success'
                            : 'Warning';
                        Boolean hasWarningCode = String.isNotBlank(warningCode);
                        if (hasWarningCode) {
                            finalStatus = 'Warning';
                        }
                        Boolean hasPaymentLink = String.isNotBlank(paymentLink);
                        String combinedWarningMessage = null;
                        if (String.isNotBlank(warningMessage) && String.isNotBlank(paymentMessage)) {
                            combinedWarningMessage = warningMessage + ' | ' + paymentMessage;
                        } else if (String.isNotBlank(warningMessage)) {
                            combinedWarningMessage = warningMessage;
                        } else if (String.isNotBlank(paymentMessage)) {
                            combinedWarningMessage = paymentMessage;
                        }
                        Opportunity finalUpdate = buildStatusUpdate(
                            opp.Id,
                            finalStatus,
                            hasWarningCode ? warningCode : null,
                            combinedWarningMessage,
                            correlationId
                        );
                        finalUpdate.QB_Invoice_ID__c = qbInvoiceId;
                        if (hasPaymentLink) {
                            finalUpdate.QB_Payment_Link__c = paymentLink;
                        }
                        finalUpdate.QB_Payment_Link_Status__c = paymentStatus;
                        finalUpdate.QB_Error_Message__c = combinedWarningMessage;
                        finalUpdate.QB_Last_Sync_Date__c = DateTime.now();
                        oppsToUpdate.add(finalUpdate);

                        logsToInsert.add(new QB_Integration_Log__c(
                            Opportunity__c = opp.Id,
                            QB_Invoice_ID__c = qbInvoiceId,
                            Status__c = finalStatus,
                            Message__c = 'Invoice successfully created in QuickBooks',
                            Timestamp__c = DateTime.now()
                        ));
                    } else {
                        String errorMessage = null;
                        if (responseMap.containsKey('error')) {
                            Object errorObj = responseMap.get('error');
                            if (errorObj instanceof String) {
                                errorMessage = (String) errorObj;
                            } else if (errorObj instanceof Map<String, Object>) {
                                errorMessage = (String) ((Map<String, Object>) errorObj).get('message');
                            }
                        }
                        if (String.isBlank(errorMessage) && responseMap.containsKey('errorMessage')) {
                            errorMessage = (String) responseMap.get('errorMessage');
                        }
                        if (String.isBlank(errorMessage)) {
                            errorMessage = 'Unknown error from integration service';
                        }

                        String errorCode = responseMap.containsKey('errorCode')
                            ? (String) responseMap.get('errorCode')
                            : 'INTEGRATION_ERROR';

                        oppsToUpdate.add(buildStatusUpdate(
                            opp.Id, 'Error', errorCode, errorMessage, correlationId
                        ));
                        errorLogsToInsert.add(buildErrorLog(opp.Id, 'Integration Error', errorMessage));
                    }
                } else if (statusCode == 401) {
                    Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                    String errorCode = (String) responseMap.get('errorCode');
                    String errorMsg = (String) responseMap.get('error');
                    String reauthorizeUrl = (String) responseMap.get('reauthorizeUrl');
                    String actionUrl = String.isNotBlank(reauthorizeUrl)
                        ? reauthorizeUrl
                        : 'https://sqint.atocomm.eu/auth/quickbooks';
                    if (String.isBlank(errorMsg)) {
                        errorMsg = 'Authentication error';
                    }
                    if (errorCode == 'AUTH_EXPIRED') {
                        String expiredMessage =
                            'QuickBooks authorization expired. Action required: Visit ' + actionUrl + ' to reconnect.';
                        oppsToUpdate.add(buildStatusUpdate(
                            opp.Id, 'Error', 'AUTH_EXPIRED',
                            expiredMessage,
                            correlationId
                        ));
                        errorLogsToInsert.add(buildErrorLog(opp.Id, 'API Error', expiredMessage));
                    } else if (errorCode == 'NO_TOKENS') {
                        String noTokensMessage =
                            'QuickBooks not connected. Action required: Visit ' + actionUrl + ' to authorize.';
                        oppsToUpdate.add(buildStatusUpdate(
                            opp.Id, 'Error', 'NO_TOKENS',
                            noTokensMessage,
                            correlationId
                        ));
                        errorLogsToInsert.add(buildErrorLog(opp.Id, 'API Error', noTokensMessage));
                    } else {
                        oppsToUpdate.add(buildStatusUpdate(
                            opp.Id, 'Error', 'AUTH_ERROR', errorMsg, correlationId
                        ));
                        errorLogsToInsert.add(buildErrorLog(opp.Id, 'API Error', errorMsg));
                    }
                } else {
                    String errorMsg = 'HTTP Error: ' + statusCode + ' ' + response.getStatus() + '. Body: ' + response.getBody();
                    String parsedErrorCode = null;
                    String parsedErrorMessage = null;
                    try {
                        Map<String, Object> bodyMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                        if (bodyMap != null) {
                            if (bodyMap.containsKey('errorCode')) {
                                parsedErrorCode = (String) bodyMap.get('errorCode');
                            }
                            if (bodyMap.containsKey('error')) {
                                Object errorObj = bodyMap.get('error');
                                if (errorObj instanceof String) {
                                    parsedErrorMessage = (String) errorObj;
                                } else if (errorObj instanceof Map<String, Object>) {
                                    parsedErrorMessage = (String) ((Map<String, Object>) errorObj).get('message');
                                    if (String.isBlank(parsedErrorCode)) {
                                        parsedErrorCode = (String) ((Map<String, Object>) errorObj).get('code');
                                    }
                                }
                            }
                            if (bodyMap.containsKey('errorMessage') && String.isBlank(parsedErrorMessage)) {
                                parsedErrorMessage = (String) bodyMap.get('errorMessage');
                            }
                        }
                    } catch (Exception ignored) {}

                    oppsToUpdate.add(buildStatusUpdate(
                        opp.Id,
                        'Error',
                        String.isNotBlank(parsedErrorCode) ? parsedErrorCode : 'HTTP_ERROR',
                        String.isNotBlank(parsedErrorMessage) ? parsedErrorMessage : errorMsg,
                        correlationId
                    ));
                    errorLogsToInsert.add(buildErrorLog(opp.Id, 'Integration Error', errorMsg));
                }
            } catch (QBIntegrationException e) {
                oppsToUpdate.add(buildStatusUpdate(
                    opp.Id, 'Error', 'CONFIG_MISSING', e.getMessage(), correlationId
                ));
                errorLogsToInsert.add(buildErrorLog(opp.Id, 'Configuration Error', e.getMessage()));
            } catch (CalloutException e) {
                String errorMsg = 'Callout Exception: ' + e.getMessage();
                oppsToUpdate.add(buildStatusUpdate(
                    opp.Id, 'Error', 'CALLOUT_FAILED', errorMsg, correlationId
                ));
                errorLogsToInsert.add(buildErrorLog(opp.Id, 'Integration Error', errorMsg));
            } catch (Exception e) {
                String errorMsg = 'Exception: ' + e.getMessage();
                oppsToUpdate.add(buildStatusUpdate(
                    opp.Id, 'Error', 'UNEXPECTED_ERROR', errorMsg, correlationId
                ));
                errorLogsToInsert.add(buildErrorLog(opp.Id, 'Integration Error', errorMsg));
            }
        }

        if (!oppsToUpdate.isEmpty()) {
            Database.update(oppsToUpdate, false);
        }
        if (!logsToInsert.isEmpty()) {
            Database.insert(logsToInsert, false);
        }
        if (!errorLogsToInsert.isEmpty()) {
            Database.insert(errorLogsToInsert, false);
        }
    }

    private HttpResponse callIntegrationService(Id opportunityId, String correlationId) {
        QB_Integration_Settings__c settings = QB_Integration_Settings__c.getInstance();
        if (settings == null || String.isBlank(settings.Middleware_Endpoint__c)) {
            throw new QBIntegrationException(CONFIG_MISSING_MESSAGE);
        }
        String endpoint = settings.Middleware_Endpoint__c;

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(endpoint + '/api/opportunity-to-invoice');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setTimeout(60000);

        if (String.isNotBlank(settings.API_Key__c)) {
            request.setHeader('X-API-Key', settings.API_Key__c);
        }

        String instanceUrl = URL.getSalesforceBaseUrl().toExternalForm();
        Map<String, String> requestBody = new Map<String, String>{
            'opportunityId' => opportunityId,
            'salesforceInstance' => instanceUrl,
            'quickbooksRealm' => settings.QB_Realm_ID__c,
            'correlationId' => correlationId
        };
        request.setBody(JSON.serialize(requestBody));
        return http.send(request);
    }

    private Opportunity buildStatusUpdate(Id oppId, String status, String errorCode, String errorMsg, String correlationId) {
        return new Opportunity(
            Id = oppId,
            QB_Sync_Status__c = status,
            QB_Last_Attempt__c = DateTime.now(),
            QB_Error_Code__c = errorCode,
            QB_Error_Message__c = (errorMsg != null) ? errorMsg.abbreviate(131072) : null,
            QB_Correlation_Id__c = correlationId
        );
    }

    private QB_Integration_Error_Log__c buildErrorLog(Id oppId, String errorType, String errorMsg) {
        return new QB_Integration_Error_Log__c(
            Opportunity__c = oppId,
            Error_Message__c = errorMsg != null ? errorMsg.abbreviate(255) : null,
            Error_Type__c = errorType,
            Timestamp__c = DateTime.now()
        );
    }

    private Boolean isMiddlewareEndpointMissing() {
        QB_Integration_Settings__c settings = QB_Integration_Settings__c.getInstance();
        if (settings == null) {
            return true;
        }
        return String.isBlank(settings.Middleware_Endpoint__c);
    }

    public class QBIntegrationException extends Exception {}
}
