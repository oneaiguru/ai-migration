# QB-SF Completion Plan V2 - Execution Blueprint

Purpose: copy/paste-ready plan to implement all phases in `COMPLETION_PLAN_V2.md` with exact code blocks and deployment/testing steps.

Source of truth:
- Salesforce metadata: `force-app/main/default`
- Middleware code: `deployment/sf-qb-integration-final/src`
- Docs/scripts: `docs/`, `scripts/`

---

## Phase 0 - Verify Reality (no code changes)

Run these commands and record outputs in `PROGRESS.md` before touching code:

```bash
# Verify target org (replace alias if needed)
sf org display --target-org myorg

# Retrieve deployed Apex/trigger metadata for diffing
sf project retrieve start --metadata ApexClass,ApexTrigger --target-org myorg
sf project retrieve start --metadata ValidationRule --target-org myorg

# Verify middleware version hash (server)
ssh -p 2323 roman@pve.atocomm.eu "md5sum /opt/qb-integration/src/routes/api.js"

# Check tokens on server (if allowed)
ssh -p 2323 roman@pve.atocomm.eu "cat /opt/qb-integration/data/tokens.json"
```

---

## Phase 1 - Salesforce Observability (P1 + P3)

### 1.1 Add Opportunity fields (new files)
Create these files under `force-app/main/default/objects/Opportunity/fields/`:

`QB_Sync_Status__c.field-meta.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Sync_Status__c</fullName>
    <label>QB Sync Status</label>
    <required>false</required>
    <type>Picklist</type>
    <valueSet>
        <restricted>true</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value><fullName>Pending</fullName><default>false</default><label>Pending</label></value>
            <value><fullName>Processing</fullName><default>false</default><label>Processing</label></value>
            <value><fullName>Success</fullName><default>false</default><label>Success</label></value>
            <value><fullName>Warning</fullName><default>false</default><label>Warning</label></value>
            <value><fullName>Error</fullName><default>false</default><label>Error</label></value>
            <value><fullName>Skipped</fullName><default>false</default><label>Skipped</label></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>
```

`QB_Last_Attempt__c.field-meta.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Last_Attempt__c</fullName>
    <label>QB Last Attempt</label>
    <required>false</required>
    <type>DateTime</type>
</CustomField>
```

`QB_Skip_Reason__c.field-meta.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Skip_Reason__c</fullName>
    <label>QB Skip Reason</label>
    <length>255</length>
    <required>false</required>
    <type>Text</type>
</CustomField>
```

`QB_Error_Code__c.field-meta.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Error_Code__c</fullName>
    <label>QB Error Code</label>
    <length>50</length>
    <required>false</required>
    <type>Text</type>
</CustomField>
```

`QB_Error_Message__c.field-meta.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Error_Message__c</fullName>
    <label>QB Error Message</label>
    <length>131072</length>
    <required>false</required>
    <type>LongTextArea</type>
    <visibleLines>3</visibleLines>
</CustomField>
```

`QB_Correlation_Id__c.field-meta.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Correlation_Id__c</fullName>
    <label>QB Correlation Id</label>
    <length>36</length>
    <required>false</required>
    <type>Text</type>
</CustomField>
```

`QB_Payment_Link_Status__c.field-meta.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Payment_Link_Status__c</fullName>
    <label>QB Payment Link Status</label>
    <length>50</length>
    <required>false</required>
    <type>Text</type>
</CustomField>
```

### 1.2 Replace trigger with skip logging + fallback error log
Replace `force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger` with:

```apex
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

        Map<Id, Account> suppliersById = supplierIds.isEmpty()
            ? new Map<Id, Account>()
            : new Map<Id, Account>([SELECT Id, Name FROM Account WHERE Id IN :supplierIds]);

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

            Account supplier = suppliersById.get(opp.Supplier__c);
            String normalizedName = supplier != null && supplier.Name != null
                ? supplier.Name.trim().toLowerCase()
                : '';

            if (normalizedName == 'ato comm') {
                oppsToSkip.add(new Opportunity(
                    Id = opp.Id,
                    QB_Sync_Status__c = 'Skipped',
                    QB_Skip_Reason__c = 'SUPPLIER_EXCLUDED: ATO COMM (Id: ' + supplier.Id + ')',
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

        // Mark pending before enqueue
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
        // Fallback: create error log even if Opportunity update fails
        List<QB_Integration_Error_Log__c> fallbackLogs = new List<QB_Integration_Error_Log__c>();
        for (Opportunity opp : Trigger.new) {
            if (opp.StageName == INVOICE_STAGE) {
                fallbackLogs.add(new QB_Integration_Error_Log__c(
                    Opportunity__c = opp.Id,
                    Error_Type__c = 'TRIGGER_EXCEPTION',
                    Error_Message__c = e.getMessage() + ' | ' + e.getStackTraceString().substring(0, 200)
                ));
            }
        }
        if (!fallbackLogs.isEmpty()) {
            Database.insert(fallbackLogs, false);
        }
        throw e;
    }
}
```

### 1.3 Replace QBInvoiceIntegrationQueueable with status + chunking
Replace `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls` with:

```apex
/**
 * QuickBooks Invoice Integration Queueable
 * Adds status/error tracking on Opportunity and correlation IDs.
 */
public class QBInvoiceIntegrationQueueable implements Queueable, Database.AllowsCallouts {

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
        List<Opportunity> oppsToUpdate = new List<Opportunity>();
        List<QB_Integration_Log__c> logsToInsert = new List<QB_Integration_Log__c>();
        List<QB_Integration_Error_Log__c> errorLogsToInsert = new List<QB_Integration_Error_Log__c>();

        // Mark as Processing
        for (Opportunity opp : chunk) {
            String correlationId = Crypto.getRandomUUID();
            oppsToUpdate.add(new Opportunity(
                Id = opp.Id,
                QB_Sync_Status__c = 'Processing',
                QB_Last_Attempt__c = DateTime.now(),
                QB_Correlation_Id__c = correlationId
            ));
        }
        if (!oppsToUpdate.isEmpty()) {
            Database.update(oppsToUpdate, false);
            oppsToUpdate.clear();
        }

        for (Opportunity opp : chunk) {
            String correlationId = Crypto.getRandomUUID();
            try {
                if (String.isNotBlank(opp.QB_Invoice_ID__c)) {
                    oppsToUpdate.add(buildStatusUpdate(
                        opp.Id, 'Skipped', 'ALREADY_HAS_INVOICE',
                        'Invoice ' + opp.QB_Invoice_ID__c + ' already exists',
                        correlationId
                    ));
                    continue;
                }

                if (Test.isRunningTest() && !allowTestCallouts) {
                    oppsToUpdate.add(buildStatusUpdate(
                        opp.Id, 'Success', null,
                        null, correlationId
                    ));
                    oppsToUpdate.add(new Opportunity(
                        Id = opp.Id,
                        QB_Invoice_ID__c = 'TEST-QB-INV-' + String.valueOf(opp.Id).substring(15),
                        QB_Last_Sync_Date__c = DateTime.now()
                    ));
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

                        oppsToUpdate.add(new Opportunity(
                            Id = opp.Id,
                            QB_Invoice_ID__c = qbInvoiceId,
                            QB_Payment_Link__c = (paymentLink != null && !String.isBlank(paymentLink)) ? paymentLink : null,
                            QB_Payment_Link_Status__c = paymentStatus,
                            QB_Error_Message__c = (paymentLink != null) ? null : paymentMessage,
                            QB_Last_Sync_Date__c = DateTime.now()
                        ));

                        String finalStatus = (paymentStatus == 'SUCCESS') ? 'Success' : 'Warning';
                        oppsToUpdate.add(buildStatusUpdate(
                            opp.Id, finalStatus, null, null, correlationId
                        ));

                        logsToInsert.add(new QB_Integration_Log__c(
                            Opportunity__c = opp.Id,
                            QB_Invoice_ID__c = qbInvoiceId,
                            Status__c = 'Success',
                            Message__c = 'Invoice successfully created in QuickBooks',
                            Timestamp__c = DateTime.now()
                        ));
                    } else {
                        String errorMessage = responseMap.containsKey('error')
                            ? (String) responseMap.get('error')
                            : 'Unknown error from integration service';
                        oppsToUpdate.add(buildStatusUpdate(
                            opp.Id, 'Error', 'INTEGRATION_ERROR', errorMessage, correlationId
                        ));
                        errorLogsToInsert.add(buildErrorLog(opp.Id, 'Integration Error', errorMessage));
                    }
                } else if (statusCode == 401) {
                    Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                    String errorCode = (String) responseMap.get('errorCode');
                    String errorMsg = (String) responseMap.get('error');
                    if (errorCode == 'AUTH_EXPIRED') {
                        oppsToUpdate.add(buildStatusUpdate(
                            opp.Id, 'Error', 'AUTH_EXPIRED',
                            'QuickBooks authorization expired. Visit https://sqint.atocomm.eu/auth/quickbooks to reconnect.',
                            correlationId
                        ));
                    } else {
                        oppsToUpdate.add(buildStatusUpdate(
                            opp.Id, 'Error', 'AUTH_ERROR', errorMsg, correlationId
                        ));
                    }
                } else {
                    String errorMsg = 'HTTP Error: ' + statusCode + ' ' + response.getStatus() + '. Body: ' + response.getBody();
                    oppsToUpdate.add(buildStatusUpdate(
                        opp.Id, 'Error', 'HTTP_ERROR', errorMsg, correlationId
                    ));
                    errorLogsToInsert.add(buildErrorLog(opp.Id, 'Integration Error', errorMsg));
                }
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
        String endpoint = settings.Middleware_Endpoint__c;
        if (String.isBlank(endpoint)) {
            throw new QBIntegrationException('Middleware endpoint not configured in QB_Integration_Settings__c');
        }

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

    public class QBIntegrationException extends Exception {}
}
```

### 1.4 Update test classes (minimal changes)
Update `force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls`:
- Ensure test methods set `QBInvoiceIntegrationQueueable.allowTestCallouts = true` when using HTTP mocks.
- Update successful mock response to include `qbInvoiceId` and `paymentLinkStatus`.

Use this mock response body:
```apex
res.setBody('{"success": true, "qbInvoiceId": "INV-TEST", "paymentLink": "https://example.com/pay", "paymentLinkStatus": "SUCCESS", "paymentLinkMessage": null}');
```

Update `force-app/main/default/classes/OpportunityQuickBooksTriggerTest.cls`:
- Add assertions for `QB_Sync_Status__c` and `QB_Skip_Reason__c` on skipped records.

### 1.5 Permissions
Create `force-app/main/default/permissionsets/QB_Integration_User.permissionset-meta.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>QB Integration User</label>
    <hasActivationRequired>false</hasActivationRequired>
    <objectPermissions>
        <allowCreate>false</allowCreate>
        <allowDelete>false</allowDelete>
        <allowEdit>true</allowEdit>
        <allowRead>true</allowRead>
        <modifyAllRecords>false</modifyAllRecords>
        <object>Opportunity</object>
        <viewAllRecords>false</viewAllRecords>
    </objectPermissions>
    <fieldPermissions><field>Opportunity.QB_Sync_Status__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
    <fieldPermissions><field>Opportunity.QB_Last_Attempt__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
    <fieldPermissions><field>Opportunity.QB_Skip_Reason__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
    <fieldPermissions><field>Opportunity.QB_Error_Code__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
    <fieldPermissions><field>Opportunity.QB_Error_Message__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
    <fieldPermissions><field>Opportunity.QB_Correlation_Id__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
    <fieldPermissions><field>Opportunity.QB_Payment_Link_Status__c</field><readable>true</readable><editable>true</editable></fieldPermissions>
</PermissionSet>
```

### 1.6 Manual UI updates (document only)
- Add a "QB Integration Status" section to the Opportunity Lightning page with new fields.
- Add list view "QB Integration Issues" filtered by `QB_Sync_Status__c IN ('Error','Warning')`.

---

## Phase 2 - Payment Link Correctness (P2)

### 2.1 Deterministic email selection in middleware SF API
Replace the contact/email block in `deployment/sf-qb-integration-final/src/services/salesforce-api.js` with:

```javascript
// NEW: deterministic billing email resolution
let billingEmail = null;
let emailSource = null;

if (opportunity.Email_for_invoice__c && opportunity.Email_for_invoice__c.trim()) {
  billingEmail = opportunity.Email_for_invoice__c.trim();
  emailSource = 'OPPORTUNITY_FIELD';
  logger.info(`Email from Opportunity.Email_for_invoice__c: ${billingEmail}`);
}

if (!billingEmail) {
  try {
    const ocrQuery = `
      SELECT Contact.Email
      FROM OpportunityContactRole
      WHERE OpportunityId = '${opportunityId}'
      AND IsPrimary = true
      AND Contact.Email != null
      LIMIT 1
    `;
    const ocrResult = await this.query(ocrQuery);
    if (ocrResult.records?.[0]?.Contact?.Email) {
      const email = ocrResult.records[0].Contact.Email.trim();
      if (email) {
        billingEmail = email;
        emailSource = 'PRIMARY_CONTACT_ROLE';
        logger.info(`Email from Primary OpportunityContactRole: ${billingEmail}`);
      }
    }
  } catch (err) {
    logger.warn(`Could not query OpportunityContactRole: ${err.message}`);
  }
}

if (!billingEmail && account.Email__c && account.Email__c.trim()) {
  billingEmail = account.Email__c.trim();
  emailSource = 'ACCOUNT_FIELD';
  logger.info(`Email from Account.Email__c: ${billingEmail}`);
}

if (!billingEmail) {
  try {
    const contactQuery = `
      SELECT Email FROM Contact
      WHERE AccountId = '${opportunity.AccountId}'
      AND Email != null
      ORDER BY LastModifiedDate DESC
      LIMIT 1
    `;
    const contactResult = await this.query(contactQuery);
    if (contactResult.records?.[0]?.Email) {
      const email = contactResult.records[0].Email.trim();
      if (email) {
        billingEmail = email;
        emailSource = 'CONTACT_FALLBACK';
        logger.info(`Email from Contact (fallback): ${billingEmail}`);
      }
    }
  } catch (err) {
    logger.warn(`Could not query Contact: ${err.message}`);
  }
}

if (!billingEmail) {
  emailSource = 'NONE';
  logger.warn(`No billing email found for Opportunity ${opportunityId}`);
}

return {
  opportunity,
  account,
  products: lineItemsResult.records,
  billingEmail,
  emailSource
};
```

### 2.2 Avoid blank customer email + return payment link status
Update `deployment/sf-qb-integration-final/src/routes/api.js`:

```javascript
// Use deterministic email from Salesforce API client
const billingEmail = opportunityData.billingEmail || null;

const customerData = {
  DisplayName: opportunityData.account.Name,
  CompanyName: opportunityData.account.Name,
  CurrencyRef: { value: currency },
  ...(billingEmail && { PrimaryEmailAddr: { Address: billingEmail } }),
  PrimaryPhone: { FreeFormNumber: opportunityData.account.Phone || '' },
  BillAddr: {
    Line1: opportunityData.account.BillingStreet || '',
    City: opportunityData.account.BillingCity || '',
    CountrySubDivisionCode: opportunityData.account.BillingState || '',
    PostalCode: opportunityData.account.BillingPostalCode || '',
    Country: opportunityData.account.BillingCountry || ''
  }
};
```

After creating invoice, replace payment link logic with:
```javascript
const linkResult = await qbApi.getInvoicePaymentLink(qbInvoiceId);

await sfApi.updateOpportunity(opportunityId, {
  QB_Invoice_ID__c: qbInvoiceId,
  QB_Payment_Link__c: linkResult.link || null,
  QB_Payment_Link_Status__c: linkResult.reason,
  QB_Error_Message__c: linkResult.link ? null : linkResult.message
});

res.json({
  success: true,
  qbInvoiceId,
  paymentLink: linkResult.link || null,
  paymentLinkStatus: linkResult.reason,
  paymentLinkMessage: linkResult.message || null,
  message: 'Invoice created successfully in QuickBooks'
});
```

### 2.3 quickbooks-api.js payment link reason codes
Replace `getInvoicePaymentLink` in `deployment/sf-qb-integration-final/src/services/quickbooks-api.js` with:

```javascript
async getInvoicePaymentLink(invoiceId) {
  try {
    const response = await this.request(
      'get',
      `invoice/${invoiceId}?minorversion=65&include=invoiceLink`
    );

    const invoice = response.Invoice;
    const invoiceLink = invoice?.InvoiceLink;
    const billEmail = invoice?.BillEmail?.Address;

    if (invoiceLink) {
      return { link: invoiceLink, reason: 'SUCCESS', billEmail };
    }

    if (!billEmail) {
      return {
        link: null,
        reason: 'INVOICE_NO_BILLEMAIL',
        billEmail: null,
        message: 'Invoice has no BillEmail - QB cannot generate payment link'
      };
    }

    return {
      link: null,
      reason: 'QB_PAYMENTS_DISABLED',
      billEmail,
      message: 'Invoice has BillEmail but no InvoiceLink - check QB Payments settings'
    };
  } catch (error) {
    if (error.isAuthError) {
      return {
        link: null,
        reason: 'AUTH_EXPIRED',
        message: error.message
      };
    }
    return {
      link: null,
      reason: 'API_ERROR',
      message: error.message
    };
  }
}
```

---

## Phase 3 - OAuth Self-Heal (P3)

### 3.1 Add AuthError in quickbooks-api.js
At the top of `deployment/sf-qb-integration-final/src/services/quickbooks-api.js`, add:

```javascript
class AuthError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.isAuthError = true;
  }
}
```

Replace `getAccessToken()` with:
```javascript
async getAccessToken() {
  const tokens = await oauthManager.getQuickBooksTokens(this.realmId);
  if (!tokens) {
    throw new AuthError('NO_TOKENS', 'QuickBooks not connected - authorization required');
  }

  if (tokens.expiresAt <= Date.now()) {
    try {
      const newTokens = await oauthManager.refreshQuickBooksToken(this.realmId, this.oauthConfig);
      return newTokens.accessToken;
    } catch (error) {
      throw new AuthError(
        'AUTH_EXPIRED',
        'QuickBooks refresh token expired - reauthorization required. Visit: https://sqint.atocomm.eu/auth/quickbooks'
      );
    }
  }

  return tokens.accessToken;
}
```

In `request()`, if refresh fails, rethrow `AuthError` instead of generic Error.

### 3.2 Surface AUTH_EXPIRED in middleware response
In `deployment/sf-qb-integration-final/src/routes/api.js` wrap the main handler:

```javascript
} catch (error) {
  if (error.isAuthError) {
    return res.status(401).json({
      success: false,
      errorCode: error.code,
      error: error.message,
      reauthorizeUrl: 'https://sqint.atocomm.eu/auth/quickbooks'
    });
  }
  logger.error('Error creating invoice:', error);
  next(error);
}
```

### 3.3 Apex handling of AUTH_EXPIRED
In `QBInvoiceIntegrationQueueable.cls`, when statusCode == 401:
```apex
if (errorCode == 'AUTH_EXPIRED') {
  oppsToUpdate.add(buildStatusUpdate(
    opp.Id, 'Error', 'AUTH_EXPIRED',
    'QuickBooks authorization expired. Action required: Visit https://sqint.atocomm.eu/auth/quickbooks to reconnect.',
    correlationId
  ));
}
```

### 3.4 Add runbook doc
Create `docs/ROMAN_AUTH_RUNBOOK.md`:
```markdown
# Что делать при ошибке AUTH_EXPIRED

## Как определить
На Сделке (Opportunity) вы увидите:
- QB_Sync_Status__c = "Error"
- QB_Error_Code__c = "AUTH_EXPIRED"
- QB_Error_Message__c содержит "reauthorization required"

## Что делать
1. Откройте: https://sqint.atocomm.eu/auth/quickbooks
2. Войдите в QuickBooks (если требуется)
3. Нажмите "Разрешить" (Authorize)
4. Дождитесь сообщения "Authorization successful"
5. Вернитесь в Salesforce и измените Stage сделки (назад и обратно)

## Когда это происходит
- Refresh token истекает через ~100 дней неактивности
- Или: если доступ был отозван в QuickBooks
```

---

## Phase 4 - Idempotency & Reliability

### 4.1 Tag invoices with SF Opportunity ID
Update `deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js`:

```javascript
PrivateNote: `SF_OPP:${opportunity.Id} | Created: ${new Date().toISOString()}`,
```

### 4.2 Find existing invoice by Opportunity ID
Add to `deployment/sf-qb-integration-final/src/services/quickbooks-api.js`:

```javascript
async findInvoiceByOpportunityId(opportunityId) {
  const query = `SELECT * FROM Invoice WHERE PrivateNote LIKE '%SF_OPP:${opportunityId}%' MAXRESULTS 1`;
  try {
    const response = await this.request('get', `query?query=${encodeURIComponent(query)}`);
    return response.QueryResponse?.Invoice?.[0] || null;
  } catch (error) {
    logger.warn(`Could not search for existing invoice: ${error.message}`);
    return null;
  }
}
```

### 4.3 Reconcile existing invoices before create
In `deployment/sf-qb-integration-final/src/routes/api.js`, before create:

```javascript
const existingInvoice = await qbApi.findInvoiceByOpportunityId(opportunityId);
if (existingInvoice) {
  await sfApi.updateOpportunity(opportunityId, {
    QB_Invoice_ID__c: existingInvoice.DocNumber || existingInvoice.Id,
    QB_Sync_Status__c: 'Success',
    QB_Error_Message__c: 'Reconciled with existing invoice'
  });
  const linkResult = await qbApi.getInvoicePaymentLink(existingInvoice.Id);
  await sfApi.updateOpportunity(opportunityId, {
    QB_Invoice_ID__c: existingInvoice.DocNumber || existingInvoice.Id,
    QB_Payment_Link__c: linkResult.link || null,
    QB_Payment_Link_Status__c: linkResult.reason,
    QB_Error_Message__c: linkResult.link ? null : linkResult.message
  });
  return res.json({ success: true, qbInvoiceId: existingInvoice.Id, reconciled: true });
}
```

### 4.4 Remove placeholder invoice IDs
Remove the block in `QBInvoiceIntegrationQueueable.cls` that writes `QB-PENDING-*` IDs.

---

## Phase 5 - Backfill Script

Create `scripts/backfill-payment-links.js`:

```javascript
const SalesforceAPI = require('../deployment/sf-qb-integration-final/src/services/salesforce-api');
const QuickBooksAPI = require('../deployment/sf-qb-integration-final/src/services/quickbooks-api');

async function backfillPaymentLinks() {
  const sfApi = new SalesforceAPI(process.env.SF_INSTANCE_URL);
  const qbApi = new QuickBooksAPI(process.env.QB_REALM_ID);

  const query = `
    SELECT Id, QB_Invoice_ID__c, QB_Payment_Link__c
    FROM Opportunity
    WHERE QB_Invoice_ID__c != null
    AND QB_Payment_Link__c = null
    AND (QB_Payment_Link_Status__c = null OR QB_Payment_Link_Status__c != 'QB_PAYMENTS_DISABLED')
  `;

  const result = await sfApi.query(query);
  console.log(`Found ${result.records.length} opportunities to backfill`);

  for (const opp of result.records) {
    try {
      const linkResult = await qbApi.getInvoicePaymentLink(opp.QB_Invoice_ID__c);
      await sfApi.updateOpportunity(opp.Id, {
        QB_Payment_Link__c: linkResult.link || null,
        QB_Payment_Link_Status__c: linkResult.reason,
        QB_Error_Message__c: linkResult.link ? null : linkResult.message
      });
      console.log(`${opp.Id}: ${linkResult.reason}`);
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`${opp.Id}: ${error.message}`);
    }
  }
}

backfillPaymentLinks().catch(console.error);
```

---

## Phase 6 - Permissions + UI

### Permission set
Deploy `QB_Integration_User.permissionset-meta.xml` (above) and assign to Roman.

### UI (manual)
- Add new fields to Opportunity Lightning page (QB Integration Status section).
- Create list view "QB Integration Issues" (filter: `QB_Sync_Status__c` in Error/Warning).

---

## Phase 7 - Tests & Deployment

### Apex tests
```bash
sf apex run test --target-org myorg --tests OpportunityQuickBooksTriggerTest,QBInvoiceIntegrationQueueableTest --result-format human --wait 30
sf apex run test --target-org myorg --test-level RunLocalTests --code-coverage --result-format human --wait 30
```

### Salesforce deploy (fields + code)
```bash
sf project deploy start \
  --source-dir force-app/main/default \
  --target-org myorg \
  --test-level RunLocalTests
```

### Middleware deploy (server)
```bash
scp -P 2323 deployment/sf-qb-integration-final/src/services/quickbooks-api.js roman@pve.atocomm.eu:/opt/qb-integration/src/services/
scp -P 2323 deployment/sf-qb-integration-final/src/services/salesforce-api.js roman@pve.atocomm.eu:/opt/qb-integration/src/services/
scp -P 2323 deployment/sf-qb-integration-final/src/routes/api.js roman@pve.atocomm.eu:/opt/qb-integration/src/routes/
scp -P 2323 deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js roman@pve.atocomm.eu:/opt/qb-integration/src/transforms/
ssh -p 2323 roman@pve.atocomm.eu "pkill -f 'node src/server.js' && cd /opt/qb-integration && node src/server.js > /tmp/server.log 2>&1 &"
```

### Health check
```bash
curl -H "X-API-Key: <API_KEY>" https://sqint.atocomm.eu/api/health
```

---

## Phase 8 - E2E Acceptance

1. Create Opportunity + LineItem.
2. Change Stage to "Proposal and Agreement".
3. Verify:
   - `QB_Sync_Status__c` not blank
   - `QB_Invoice_ID__c` populated
   - `QB_Payment_Link__c` populated when QB Payments enabled
   - `QB_Payment_Link_Status__c` shows reason when missing

Document results in `PROGRESS.md` and send Roman the Russian status update.
