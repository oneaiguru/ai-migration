/**
 * Trigger for Opportunity object to integrate with QuickBooks Online
 *
 * Fires on Opportunity creation/update to send data to QuickBooks Online
 * when an opportunity reaches a specific stage.
 * Logs skip reasons and error statuses on the Opportunity.
 */
trigger OpportunityQuickBooksTrigger on Opportunity (after insert, after update) {
    List<Opportunity> oppsToProcess = new List<Opportunity>();
    List<Opportunity> oppsToSkip = new List<Opportunity>();
    Set<Id> supplierIds = new Set<Id>();
    final String INVOICE_STAGE = 'Proposal and Agreement';

    try {
        for (Opportunity opp : Trigger.new) {
            if (Trigger.isInsert) {
                if (opp.StageName == INVOICE_STAGE) {
                    oppsToProcess.add(opp);
                    if (opp.Supplier__c != null) {
                        supplierIds.add(opp.Supplier__c);
                    }
                }
            } else if (Trigger.isUpdate) {
                Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
                if (opp.StageName == INVOICE_STAGE && oldOpp.StageName != INVOICE_STAGE) {
                    oppsToProcess.add(opp);
                    if (opp.Supplier__c != null) {
                        supplierIds.add(opp.Supplier__c);
                    }
                }
            }
        }

        if (oppsToProcess.isEmpty()) {
            return;
        }

        String supplierObjectApiName = null;
        List<Schema.SObjectType> supplierReferenceTargets = Opportunity.Supplier__c.getDescribe().getReferenceTo();
        if (!supplierReferenceTargets.isEmpty()) {
            supplierObjectApiName = supplierReferenceTargets[0].getDescribe().getName();
        }

        Map<Id, String> supplierNamesById = new Map<Id, String>();
        if (!supplierIds.isEmpty() && String.isNotBlank(supplierObjectApiName)) {
            String supplierQuery = 'SELECT Id, Name FROM ' + supplierObjectApiName + ' WHERE Id IN :supplierIds';
            for (SObject supplierRecord : Database.query(supplierQuery)) {
                supplierNamesById.put((Id) supplierRecord.get('Id'), (String) supplierRecord.get('Name'));
            }
        }

        List<Opportunity> filteredOpps = new List<Opportunity>();
        for (Opportunity opp : oppsToProcess) {
            if (opp.Supplier__c == null) {
                oppsToSkip.add(new Opportunity(
                    Id = opp.Id,
                    QB_Sync_Status__c = 'Skipped',
                    QB_Skip_Reason__c = 'SUPPLIER_MISSING: Supplier__c field is required',
                    QB_Last_Attempt__c = DateTime.now()
                ));
                continue;
            }

            String supplierName = supplierNamesById.get(opp.Supplier__c);
            String normalizedName = String.isNotBlank(supplierName)
                ? supplierName.trim().toLowerCase()
                : '';

            if (normalizedName == 'ato comm') {
                oppsToSkip.add(new Opportunity(
                    Id = opp.Id,
                    QB_Sync_Status__c = 'Skipped',
                    QB_Skip_Reason__c = 'SUPPLIER_EXCLUDED: ATO COMM (Id: ' + opp.Supplier__c + ')',
                    QB_Last_Attempt__c = DateTime.now()
                ));
                continue;
            }

            if (String.isNotBlank(opp.QB_Invoice_ID__c)) {
                oppsToSkip.add(new Opportunity(
                    Id = opp.Id,
                    QB_Sync_Status__c = 'Skipped',
                    QB_Skip_Reason__c = 'ALREADY_HAS_INVOICE: ' + opp.QB_Invoice_ID__c,
                    QB_Last_Attempt__c = DateTime.now()
                ));
                continue;
            }

            filteredOpps.add(opp);
        }

        if (!oppsToSkip.isEmpty()) {
            Database.update(oppsToSkip, false);
        }

        if (filteredOpps.isEmpty()) {
            return;
        }

        List<Opportunity> oppsPending = new List<Opportunity>();
        for (Opportunity opp : filteredOpps) {
            oppsPending.add(new Opportunity(
                Id = opp.Id,
                QB_Sync_Status__c = 'Pending',
                QB_Last_Attempt__c = DateTime.now()
            ));
        }
        if (!oppsPending.isEmpty()) {
            Database.update(oppsPending, false);
        }

        try {
            System.enqueueJob(new QBInvoiceIntegrationQueueable(filteredOpps));
        } catch (Exception enqueueEx) {
            List<Opportunity> oppsWithEnqueueError = new List<Opportunity>();
            for (Opportunity opp : filteredOpps) {
                oppsWithEnqueueError.add(new Opportunity(
                    Id = opp.Id,
                    QB_Sync_Status__c = 'Error',
                    QB_Error_Code__c = 'ENQUEUE_FAILED',
                    QB_Error_Message__c = enqueueEx.getMessage(),
                    QB_Last_Attempt__c = DateTime.now()
                ));
            }
            Database.update(oppsWithEnqueueError, false);
            throw enqueueEx;
        }
    } catch (Exception e) {
        List<QB_Integration_Error_Log__c> fallbackLogs = new List<QB_Integration_Error_Log__c>();
        for (Opportunity opp : Trigger.new) {
            if (opp.StageName == INVOICE_STAGE) {
                String stackTrace = e.getStackTraceString();
                String stackSnippet = (stackTrace != null && stackTrace.length() > 200)
                    ? stackTrace.substring(0, 200)
                    : stackTrace;
                String errorMessage = e.getMessage();
                if (stackSnippet != null) {
                    errorMessage += ' | ' + stackSnippet;
                }
                fallbackLogs.add(new QB_Integration_Error_Log__c(
                    Opportunity__c = opp.Id,
                    Error_Type__c = 'Integration Error',
                    Error_Message__c = errorMessage
                ));
            }
        }
        if (!fallbackLogs.isEmpty()) {
            Database.insert(fallbackLogs, false);
        }
    }
}
