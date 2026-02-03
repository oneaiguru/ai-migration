# QB-SF Integration: Completion Plan v2

## The Three Dec 26 Problems (Exact Requirements)

From Roman's Dec 26 messages:

| Problem | Roman's Words | Root Cause | Success Criteria |
|---------|---------------|------------|------------------|
| **P1: No logs** | "Запись лога просто не создается" / "ни одного лога с ошибкой" | Logging only happens AFTER middleware returns; if trigger skips/fails before callout, nothing is logged | Roman sees a log entry for EVERY Opportunity that reaches "Proposal and Agreement" - even skipped/failed ones |
| **P2: Payment link fails** | "Если с аккаунтом связан хоть один контакт у которого нет email то ссылка на оплату не приходит" | Non-deterministic email selection (`LIMIT 1` without ORDER BY) picks wrong contact | Payment link appears when `Email_for_invoice__c` is filled, regardless of other contacts |
| **P3: Self-service debug** | "Как мне можно дебажить без тебя?" / "при каких случаях требует повторную авторизацию?" | No visibility into why failures happen; no auth status signal | Roman can see exact failure reason on Opportunity record; AUTH_EXPIRED is explicit and actionable |

---

## Phase 0: Verify Reality (MUST - Before Any Code Changes)

**Duration**: 2-4 hours

### Tasks

| Task | Command/Action | Expected Output |
|------|----------------|-----------------|
| 0.1 Confirm production SF org | `sf org display --target-org myorg` | Verify `customer-inspiration-2543` is the target |
| 0.2 Retrieve deployed Apex | `sf project retrieve start --metadata ApexClass,ApexTrigger --target-org myorg` | Compare with local codebase |
| 0.3 Retrieve validation rules | `sf project retrieve start --metadata ValidationRule --target-org myorg` | Document any rules not in repo |
| 0.4 Confirm middleware version | `ssh -p 2323 roman@pve.atocomm.eu "md5sum /opt/qb-integration/src/routes/api.js"` | Compare hash with local |
| 0.5 Get failing Opportunity IDs | Ask Roman for 2-3 specific Opportunity IDs from Dec 26 | Trace these end-to-end |
| 0.6 Check QB token status | `cat /opt/qb-integration/data/tokens.json` | Verify `expiresAt` and refresh token validity |

### Acceptance Criteria (Phase 0)
- [ ] Document: Which Apex version is deployed
- [ ] Document: Which middleware version is deployed
- [ ] Document: Any validation rules not in source control
- [ ] Document: Root cause of 2-3 specific Dec 26 failures
- [ ] Decision: Confirm target org for deployment

---

## Phase 1: Salesforce-Side Observability (MUST)

**Problem Solved**: P1 (No logs) + P3 (Self-service debug)

**Duration**: 1-2 days

### 1.1 New Fields on Opportunity

| API Name | Type | Purpose |
|----------|------|---------|
| `QB_Sync_Status__c` | Picklist | Current state: `Pending`, `Processing`, `Success`, `Warning`, `Error`, `Skipped` |
| `QB_Last_Attempt__c` | DateTime | When last sync was attempted |
| `QB_Skip_Reason__c` | Text(255) | Why sync was skipped (if Status = Skipped) |
| `QB_Error_Code__c` | Text(50) | Machine-readable error code |
| `QB_Error_Message__c` | LongTextArea | Full error details |
| `QB_Correlation_Id__c` | Text(36) | UUID to trace through middleware logs |

### 1.2 Logging at Every Decision Point

**File**: `OpportunityQuickBooksTrigger.trigger`

```apex
trigger OpportunityQuickBooksTrigger on Opportunity (after insert, after update) {
    try {
        List<Opportunity> oppsToProcess = new List<Opportunity>();
        List<Opportunity> oppsToSkip = new List<Opportunity>();
        final String INVOICE_STAGE = 'Proposal and Agreement';
        Set<Id> supplierIds = new Set<Id>();

        // Collect opportunities that match stage change
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

        // Query suppliers for filtering
        Map<Id, Account> suppliersById = supplierIds.isEmpty()
            ? new Map<Id, Account>()
            : new Map<Id, Account>([SELECT Id, Name FROM Account WHERE Id IN :supplierIds]);

        // Filter and log skip reasons
        List<Opportunity> filteredOpps = new List<Opportunity>();
        for (Opportunity opp : oppsToProcess) {
            // Check supplier
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

            // Already has invoice
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

        // Update skipped opportunities
        if (!oppsToSkip.isEmpty()) {
            Database.update(oppsToSkip, false);
        }

        // Enqueue processing for non-skipped
        if (!filteredOpps.isEmpty()) {
            try {
                System.enqueueJob(new QBInvoiceIntegrationQueueable(filteredOpps));
            } catch (Exception enqueueEx) {
                // Log enqueue failure
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
        }

    } catch (Exception e) {
        // FALLBACK: Create error log even if Opportunity update fails
        List<QB_Integration_Error_Log__c> fallbackLogs = new List<QB_Integration_Error_Log__c>();
        for (Opportunity opp : Trigger.new) {
            if (opp.StageName == 'Proposal and Agreement') {
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

**ATO COMM Filter Known Limitation**:

The current implementation uses Account.Name string matching. **Risk**: If Account is renamed, filter stops working silently.

**Recommended Migration** (Phase 7 - Future):
1. Add custom field `Account.Exclude_From_QB__c` (Checkbox)
2. Set checkbox on ATO COMM account
3. Change trigger to: `if (supplier.Exclude_From_QB__c) { ... }`
4. Remove hardcoded name check

**For now**: Log includes Account ID for troubleshooting: `'SUPPLIER_EXCLUDED: ATO COMM (Id: ' + supplier.Id + ')'`

### Acceptance Criteria (Phase 1 Enhanced)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| AC1.1 | Create Opportunity with Supplier = "ATO COMM", set Stage = "Proposal and Agreement" | Status = "Skipped", Skip_Reason = "SUPPLIER_EXCLUDED: ATO COMM (Id: ...)" |
| AC1.2 | Create Opportunity with Supplier__c = null, set Stage = "Proposal and Agreement" | Status = "Skipped", Skip_Reason = "SUPPLIER_MISSING" |
| AC1.3 | Create Opportunity that already has QB_Invoice_ID__c, toggle Stage | Status = "Skipped", Skip_Reason = "ALREADY_HAS_INVOICE" |
| AC1.4 | Create valid Opportunity while middleware is down | Status = "Error", Error_Code = "CALLOUT_FAILED" |
| AC1.5 | Create valid Opportunity with working middleware | Status = "Success", QB_Invoice_ID__c populated |
| AC1.6 | Trigger throws exception before it can update Opportunity | QB_Integration_Error_Log__c created with Error_Type = "TRIGGER_EXCEPTION" |
| `SUPPLIER_EXCLUDED` | Supplier name = "ATO COMM" |
| `SUPPLIER_MISSING` | Supplier__c field is null |
| `STAGE_NOT_MATCHED` | Stage != "Proposal and Agreement" |
| `ALREADY_HAS_INVOICE` | QB_Invoice_ID__c is already populated |
| `CONFIG_MISSING` | QB_Integration_Settings__c not configured |
| `ENQUEUE_FAILED` | System.enqueueJob threw exception |

**File**: `QBInvoiceIntegrationQueueable.cls`

```apex
public void execute(QueueableContext context) {
    for (Opportunity opp : opportunities) {
        String correlationId = generateUUID();

        // Mark as Processing BEFORE callout
        updateStatus(opp.Id, 'Processing', null, null, correlationId);

        try {
            // Skip if already has invoice (idempotency)
            if (String.isNotBlank(opp.QB_Invoice_ID__c)) {
                updateStatus(opp.Id, 'Skipped', 'ALREADY_HAS_INVOICE',
                    'Invoice ' + opp.QB_Invoice_ID__c + ' already exists', correlationId);
                continue;
            }

            HttpResponse response = callIntegrationService(opp.Id, correlationId);
            // ... process response ...

        } catch (CalloutException e) {
            updateStatus(opp.Id, 'Error', 'CALLOUT_FAILED', e.getMessage(), correlationId);
        } catch (Exception e) {
            updateStatus(opp.Id, 'Error', 'UNEXPECTED_ERROR', e.getMessage(), correlationId);
        }
    }
}

private void updateStatus(Id oppId, String status, String errorCode, String errorMsg, String correlationId) {
    Opportunity opp = new Opportunity(
        Id = oppId,
        QB_Sync_Status__c = status,
        QB_Last_Attempt__c = DateTime.now(),
        QB_Error_Code__c = errorCode,
        QB_Error_Message__c = errorMsg?.abbreviate(131072),
        QB_Correlation_Id__c = correlationId
    );

    try {
        update opp;
    } catch (Exception e) {
        System.debug('Failed to update status: ' + e.getMessage());
        // Still create error log as backup
        createErrorLog(oppId, errorCode, errorMsg);
    }
}
```

### 1.3 Page Layout Updates

Add to Opportunity Lightning page:
- **QB Integration Status** section with all new fields
- Conditional formatting: Red for Error, Yellow for Warning, Green for Success
- Related list: QB_Integration_Log__c filtered to this Opportunity

### Acceptance Criteria (Phase 1)

**Roman can verify in Salesforce UI**:

| Test | Steps | Expected Result |
|------|-------|-----------------|
| AC1.1 | Create Opportunity with Supplier = "ATO COMM", set Stage = "Proposal and Agreement" | Status = "Skipped", Skip_Reason = "SUPPLIER_EXCLUDED: ATO COMM" |
| AC1.2 | Create Opportunity with Supplier__c = null, set Stage = "Proposal and Agreement" | Status = "Skipped", Skip_Reason = "SUPPLIER_MISSING" |
| AC1.3 | Create Opportunity that already has QB_Invoice_ID__c, toggle Stage | Status = "Skipped", Skip_Reason = "ALREADY_HAS_INVOICE" |
| AC1.4 | Create valid Opportunity while middleware is down | Status = "Error", Error_Code = "CALLOUT_FAILED" |
| AC1.5 | Create valid Opportunity with working middleware | Status = "Success", QB_Invoice_ID__c populated |

---

## Phase 2: Payment Link Correctness (MUST)

**Problem Solved**: P2 (Payment link fails)

**Duration**: 1-2 days

### 2.1 Root Cause Analysis

**Current broken code** (`salesforce-api.js` lines 251-267):
```javascript
// PROBLEM: No ORDER BY, picks random contact
const contactQuery = `
  SELECT Id, Email FROM Contact
  WHERE AccountId = '${opportunity.AccountId}'
  AND Email != null
  LIMIT 1
`;
```

**Roman's symptom**: "if any Contact has no email, link doesn't come"

**Hypothesis**: The query sometimes picks a contact record that was UPDATED to have no email (returning stale cache or different record), OR the billing email is being overwritten by blank elsewhere.

### 2.2 Deterministic Email Selection

**File**: `salesforce-api.js` - Replace contact email query

```javascript
async getOpportunityWithRelatedData(opportunityId) {
    // ... existing code ...

    // NEW: Deterministic email resolution
    let billingEmail = null;
    let emailSource = null;

    // Priority 1: Opportunity.Email_for_invoice__c (always wins if set)
    if (opportunity.Email_for_invoice__c && opportunity.Email_for_invoice__c.trim()) {
        billingEmail = opportunity.Email_for_invoice__c.trim();
        emailSource = 'OPPORTUNITY_FIELD';
        logger.info(`Email from Opportunity.Email_for_invoice__c: ${billingEmail}`);
    }

    // Priority 2: Primary OpportunityContactRole
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

    // Priority 3: Account.Email__c (custom field)
    if (!billingEmail && account.Email__c && account.Email__c.trim()) {
        billingEmail = account.Email__c.trim();
        emailSource = 'ACCOUNT_FIELD';
        logger.info(`Email from Account.Email__c: ${billingEmail}`);
    }

    // Priority 4: Most recently modified Contact with email (deterministic)
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

    // NO email found - this is expected to fail payment link
    if (!billingEmail) {
        emailSource = 'NONE';
        logger.warn(`No billing email found for Opportunity ${opportunityId}`);
    }

    return {
        opportunity,
        account,
        products,
        billingEmail,      // String or null (NEVER empty string)
        emailSource        // For debugging
    };
}
```

### 2.3 Never Overwrite with Blank

**File**: `api.js` - Modify customer creation

```javascript
// BEFORE (sends blank email):
PrimaryEmailAddr: {
    Address: billingEmail  // Could be ''
}

// AFTER (omit if blank):
...(billingEmail && {
    PrimaryEmailAddr: {
        Address: billingEmail
    }
})
```

**File**: `quickbooks-api.js` - Update existing customer only if email is non-blank

```javascript
async findOrCreateCustomer(customerData) {
    // ... find existing customer ...

    if (existingCustomer) {
        // Only update email if NEW email is non-blank AND different
        if (customerData.PrimaryEmailAddr?.Address &&
            customerData.PrimaryEmailAddr.Address !== existingCustomer.PrimaryEmailAddr?.Address) {

            logger.info(`Updating customer email: ${existingCustomer.PrimaryEmailAddr?.Address} → ${customerData.PrimaryEmailAddr.Address}`);
            await this.updateCustomer(existingCustomer.Id, {
                PrimaryEmailAddr: customerData.PrimaryEmailAddr,
                SyncToken: existingCustomer.SyncToken
            });
        }
        return existingCustomer.Id;
    }

    // Create new customer...
}
```

### 2.4 Payment Link Reason Codes

**File**: `quickbooks-api.js` - Enhanced getInvoicePaymentLink

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
            return {
                link: invoiceLink,
                reason: 'SUCCESS',
                billEmail
            };
        }

        // Diagnose WHY no link
        if (!billEmail) {
            return {
                link: null,
                reason: 'INVOICE_NO_BILLEMAIL',
                billEmail: null,
                message: 'Invoice has no BillEmail - QB cannot generate payment link'
            };
        }

        // Has email but still no link - likely QB Payments not enabled
        return {
            link: null,
            reason: 'QB_PAYMENTS_DISABLED',
            billEmail,
            message: 'Invoice has BillEmail but no InvoiceLink - check QB Payments settings'
        };

    } catch (error) {
        if (error.response?.status === 401) {
            return {
                link: null,
                reason: 'AUTH_EXPIRED',
                message: 'QuickBooks authentication expired - reauthorization required'
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

### 2.5 Surface Payment Link Status to Salesforce

**New field**: `QB_Payment_Link_Status__c` (Text 50)

Values: `SUCCESS`, `INVOICE_NO_BILLEMAIL`, `QB_PAYMENTS_DISABLED`, `AUTH_EXPIRED`, `API_ERROR`, `NOT_ATTEMPTED`

**File**: `api.js` - Update Salesforce with payment link status

```javascript
// After fetching payment link:
const linkResult = await qbApi.getInvoicePaymentLink(qbInvoiceId);

await sfApi.updateOpportunity(opportunityId, {
    QB_Invoice_ID__c: qbInvoiceId,
    QB_Payment_Link__c: linkResult.link || null,
    QB_Payment_Link_Status__c: linkResult.reason,
    QB_Error_Message__c: linkResult.link ? null : linkResult.message
});
```

### Acceptance Criteria (Phase 2)

**Roman can verify in Salesforce UI**:

| Test | Setup | Expected Result |
|------|-------|-----------------|
| AC2.1 | Opportunity with `Email_for_invoice__c` = "test@example.com", Account has Contact with blank email | Payment link appears, Status = "SUCCESS" |
| AC2.2 | Opportunity with `Email_for_invoice__c` blank, Primary Contact Role has email | Payment link appears, Status = "SUCCESS" |
| AC2.3 | Opportunity with no email anywhere | Invoice created, Payment_Link_Status = "INVOICE_NO_BILLEMAIL", clear error message |
| AC2.4 | Valid opportunity with QB Payments disabled in QuickBooks | Invoice created, Payment_Link_Status = "QB_PAYMENTS_DISABLED" |
| AC2.5 | Re-run sync after adding `Email_for_invoice__c` to previously failed opp | Payment link now appears |

---

## Phase 3: OAuth Self-Heal + Runbook (MUST)

**Problem Solved**: P3 (Self-service debug - OAuth clarity)

**Duration**: 4-8 hours

### 3.1 Detect and Surface AUTH_EXPIRED

**File**: `quickbooks-api.js` - Token refresh with explicit status

```javascript
async getAccessToken() {
    const tokens = await oauthManager.getTokens('quickbooks', this.realmId);

    if (!tokens) {
        throw new AuthError('NO_TOKENS', 'QuickBooks not connected - authorization required');
    }

    if (this.isTokenExpired(tokens)) {
        try {
            const newTokens = await this.refreshToken(tokens.refreshToken);
            await oauthManager.saveTokens('quickbooks', this.realmId, newTokens);
            return newTokens.accessToken;
        } catch (error) {
            if (error.response?.status === 400 || error.response?.status === 401) {
                // Refresh token is invalid/expired - need full reauth
                throw new AuthError('AUTH_EXPIRED',
                    'QuickBooks refresh token expired - reauthorization required. ' +
                    'Visit: https://sqint.atocomm.eu/auth/quickbooks to reconnect.');
            }
            throw error;
        }
    }

    return tokens.accessToken;
}

class AuthError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.isAuthError = true;
    }
}
```

**File**: `api.js` - Catch auth errors and return clear status

```javascript
try {
    const qbApi = new QuickBooksAPI(quickbooksRealm);
    // ... do work ...
} catch (error) {
    if (error.isAuthError) {
        logger.error('Auth error:', error.message);
        return res.status(401).json({
            success: false,
            errorCode: error.code,  // 'AUTH_EXPIRED' or 'NO_TOKENS'
            error: error.message,
            reauthorizeUrl: 'https://sqint.atocomm.eu/auth/quickbooks'
        });
    }
    // ... other error handling ...
}
```

### 3.2 Surface to Salesforce

When Apex receives `errorCode: 'AUTH_EXPIRED'`:

```apex
if (errorCode == 'AUTH_EXPIRED') {
    updateStatus(opp.Id, 'Error', 'AUTH_EXPIRED',
        'QuickBooks authorization expired. Action required: Visit https://sqint.atocomm.eu/auth/quickbooks to reconnect.',
        correlationId);
}
```

### 3.3 Runbook for Roman

**Create**: `/Users/m/ai/projects/qbsf/docs/ROMAN_AUTH_RUNBOOK.md`

```markdown
# Что делать при ошибке AUTH_EXPIRED

## Как определить
На Сделке (Opportunity) вы увидите:
- QB_Sync_Status__c = "Error"
- QB_Error_Code__c = "AUTH_EXPIRED"
- QB_Error_Message__c содержит "reauthorization required"

## Что делать
1. Откройте в браузере: https://sqint.atocomm.eu/auth/quickbooks
2. Войдите в QuickBooks (если требуется)
3. Нажмите "Разрешить" (Authorize)
4. Дождитесь сообщения "Authorization successful"
5. Вернитесь в Salesforce и измените Stage сделки (назад и обратно) чтобы повторить синхронизацию

## Когда это происходит
- Токен QuickBooks обновляется автоматически каждые ~60 минут
- НО: refresh token истекает через ~100 дней неактивности
- Или: если вы отозвали доступ в настройках QuickBooks

## Как предотвратить
- Убедитесь что интеграция используется хотя бы раз в месяц
- При смене пароля QuickBooks - повторите авторизацию
```

### Acceptance Criteria (Phase 3)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| AC3.1 | Invalidate refresh token in tokens.json, create Opportunity | QB_Error_Code__c = "AUTH_EXPIRED", message contains reauthorize URL |
| AC3.2 | Follow reauth URL, complete OAuth flow | New tokens saved, next sync works |
| AC3.3 | Roman reads error message on Opportunity | Clear Russian instructions on what to do |

---

## Phase 4: Idempotency + Reliability (MUST)

**Problem Solved**: Prevent duplicate invoices, handle retries safely

**Duration**: 1 day

### 4.1 Salesforce-Side Idempotency

**Already covered in Phase 1** - check `QB_Invoice_ID__c` before calling middleware:

```apex
if (String.isNotBlank(opp.QB_Invoice_ID__c)) {
    updateStatus(opp.Id, 'Skipped', 'ALREADY_HAS_INVOICE', ...);
    continue;
}
```

### 4.2 Middleware-Side Idempotency

**File**: `api.js` - Check for existing invoice before creating

```javascript
// Before creating invoice, check if one exists for this Opportunity
const existingInvoice = await qbApi.findInvoiceByOpportunityId(opportunityId);
if (existingInvoice) {
    logger.info(`Invoice already exists for Opportunity ${opportunityId}: ${existingInvoice.Id}`);

    // Update SF with existing invoice (reconciliation)
    await sfApi.updateOpportunity(opportunityId, {
        QB_Invoice_ID__c: existingInvoice.DocNumber || existingInvoice.Id,
        QB_Sync_Status__c: 'Success',
        QB_Error_Message__c: 'Reconciled with existing invoice'
    });

    // Still try to get payment link
    const linkResult = await qbApi.getInvoicePaymentLink(existingInvoice.Id);
    // ... update payment link ...

    return res.json({
        success: true,
        qbInvoiceId: existingInvoice.Id,
        reconciled: true
    });
}
```

**File**: `quickbooks-api.js` - Find invoice by Opportunity ID

```javascript
async findInvoiceByOpportunityId(opportunityId) {
    // Store OpportunityId in PrivateNote during creation
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

**File**: `opportunity-to-invoice.js` - Add OpportunityId to invoice

```javascript
function mapOpportunityToInvoice(opportunity, account, products, customerId, billingEmail, currency) {
    return {
        // ... existing fields ...
        PrivateNote: `SF_OPP:${opportunity.Id} | Created: ${new Date().toISOString()}`,
        // ...
    };
}
```

### 4.3 Remove Placeholder Invoice IDs

**File**: `QBInvoiceIntegrationQueueable.cls` - Remove QB-PENDING behavior

```apex
// BEFORE (creates fake IDs):
if (errorMsg != null && errorMsg.contains('Invalid Reference Id')) {
    String placeholderInvoiceId = 'QB-PENDING-' + ...;
    updateOpportunityWithQBInvoiceId(opp.Id, placeholderInvoiceId);
}

// AFTER (just log the error):
if (errorMsg != null && errorMsg.contains('Invalid Reference Id')) {
    updateStatus(opp.Id, 'Error', 'INVALID_ITEMREF',
        'QuickBooks rejected invoice: ' + errorMsg + '. Check that products exist in QB.',
        correlationId);
    // DO NOT write fake invoice ID
}
```

### 4.4 Bulk Safety

**File**: `QBInvoiceIntegrationQueueable.cls` - Chunk processing

```apex
public void execute(QueueableContext context) {
    List<Opportunity> oppsToUpdate = new List<Opportunity>();
    List<QB_Integration_Log__c> logsToInsert = new List<QB_Integration_Log__c>();

    Integer CHUNK_SIZE = 10; // Process 10 at a time to avoid timeout
    List<Opportunity> chunk = new List<Opportunity>();

    for (Integer i = 0; i < opportunities.size(); i++) {
        chunk.add(opportunities[i]);

        if (chunk.size() >= CHUNK_SIZE || i == opportunities.size() - 1) {
            processChunk(chunk, oppsToUpdate, logsToInsert);
            chunk.clear();
        }
    }

    // Bulk DML at end
    if (!oppsToUpdate.isEmpty()) {
        Database.update(oppsToUpdate, false); // Allow partial success
    }
    if (!logsToInsert.isEmpty()) {
        Database.insert(logsToInsert, false);
    }
}
```

### Acceptance Criteria (Phase 4)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| AC4.1 | Create invoice, then toggle Stage again | Status = "Skipped", Reason = "ALREADY_HAS_INVOICE", no duplicate in QB |
| AC4.2 | Create invoice in QB manually with SF OppId in PrivateNote, then sync | SF shows existing invoice ID (reconciled) |
| AC4.3 | Trigger sync with Invalid ItemRef error | Status = "Error", no fake "QB-PENDING-*" ID written |
| AC4.4 | Update 50 Opportunities to "Proposal and Agreement" at once | All processed without governor limit errors |

---

## Phase 5: Backfill Existing Data (SHOULD)

**Problem Solved**: Historical records with missing payment links

**Duration**: 2-4 hours

### 5.1 Backfill Script

**File**: `/Users/m/ai/projects/qbsf/scripts/backfill-payment-links.js`

```javascript
const SalesforceAPI = require('../src/services/salesforce-api');
const QuickBooksAPI = require('../src/services/quickbooks-api');

async function backfillPaymentLinks() {
    const sfApi = new SalesforceAPI(process.env.SF_INSTANCE_URL);
    const qbApi = new QuickBooksAPI(process.env.QB_REALM_ID);

    // Find opportunities with invoice but no payment link
    const query = `
        SELECT Id, QB_Invoice_ID__c, Email_for_invoice__c
        FROM Opportunity
        WHERE QB_Invoice_ID__c != null
        AND QB_Payment_Link__c = null
        AND QB_Payment_Link_Status__c != 'QB_PAYMENTS_DISABLED'
    `;

    const result = await sfApi.query(query);
    console.log(`Found ${result.records.length} opportunities to backfill`);

    for (const opp of result.records) {
        try {
            console.log(`Processing ${opp.Id} (Invoice: ${opp.QB_Invoice_ID__c})`);

            const linkResult = await qbApi.getInvoicePaymentLink(opp.QB_Invoice_ID__c);

            await sfApi.updateOpportunity(opp.Id, {
                QB_Payment_Link__c: linkResult.link,
                QB_Payment_Link_Status__c: linkResult.reason
            });

            console.log(`  -> ${linkResult.reason}`);

            // Rate limit
            await new Promise(r => setTimeout(r, 500));

        } catch (error) {
            console.error(`  -> Error: ${error.message}`);
        }
    }
}

backfillPaymentLinks().catch(console.error);
```

### Acceptance Criteria (Phase 5)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| AC5.1 | Run backfill script | All eligible records updated with payment link or status |
| AC5.2 | Check previously broken Opportunity | Either has payment link OR has clear status (QB_PAYMENTS_DISABLED, etc.) |

---

## Phase 6: Permissions + Page Layout (MUST)

**Problem Solved**: Roman can't see the new fields

**Duration**: 2-4 hours

### 6.1 Permission Set

**Create**: `QB_Integration_User` permission set

- Read/Edit on all new Opportunity fields
- Read on QB_Integration_Log__c
- Read on QB_Integration_Error_Log__c

### 6.2 Page Layout Updates

Add to Opportunity Lightning Record Page:

**Section: "QB Integration Status"**
- QB_Sync_Status__c (with conditional highlighting)
- QB_Last_Attempt__c
- QB_Invoice_ID__c (link to QB if possible)
- QB_Payment_Link__c (as hyperlink)
- QB_Payment_Link_Status__c
- QB_Error_Code__c
- QB_Error_Message__c (read-only, larger text area)
- QB_Skip_Reason__c
- QB_Correlation_Id__c

### 6.3 List View

Create "QB Integration Issues" list view:
- Filter: `QB_Sync_Status__c IN ('Error', 'Warning')`
- Columns: Name, QB_Sync_Status__c, QB_Error_Code__c, QB_Last_Attempt__c, Owner

### Acceptance Criteria (Phase 6)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| AC6.1 | Open any Opportunity as Roman | See "QB Integration Status" section |
| AC6.2 | Open "QB Integration Issues" list view | See all failed/warning syncs |
| AC6.3 | Click on QB_Payment_Link__c | Opens payment page in new tab |

---

## What Is NOT In Scope (Nice-to-Have for Later)

| Item | Why Deferred |
|------|--------------|
| External diagnostics dashboard | SF-side visibility is sufficient per Dec 26 requirements |
| LWC debug component | Standard fields on page layout achieve same goal |
| Refactoring files <300 LOC | Not blocking reliability |
| Middleware metrics/observability | SF-side logging is primary source of truth |
| Email alerts via Platform Events | List view + manual monitoring is sufficient for now |

---

## Deployment Sequence

### Step 1: Deploy Salesforce Metadata (1 hour)

```bash
# Deploy new fields + permission set
sf project deploy start \
  --source-dir force-app/main/default/objects/Opportunity/fields/QB_Sync_Status__c.field-meta.xml \
  --source-dir force-app/main/default/objects/Opportunity/fields/QB_Last_Attempt__c.field-meta.xml \
  --source-dir force-app/main/default/objects/Opportunity/fields/QB_Skip_Reason__c.field-meta.xml \
  --source-dir force-app/main/default/objects/Opportunity/fields/QB_Error_Code__c.field-meta.xml \
  --source-dir force-app/main/default/objects/Opportunity/fields/QB_Error_Message__c.field-meta.xml \
  --source-dir force-app/main/default/objects/Opportunity/fields/QB_Correlation_Id__c.field-meta.xml \
  --source-dir force-app/main/default/objects/Opportunity/fields/QB_Payment_Link_Status__c.field-meta.xml \
  --source-dir force-app/main/default/permissionsets/QB_Integration_User.permissionset-meta.xml \
  --target-org myorg

# Assign permission set to Roman
sf org assign permset --name QB_Integration_User --target-org myorg
```

### Step 2: Deploy Apex Changes (30 min)

```bash
# Deploy trigger + queueable with tests
sf project deploy start \
  --source-dir force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger \
  --source-dir force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls \
  --source-dir force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls \
  --target-org myorg \
  --test-level RunLocalTests
```

### Step 3: Deploy Middleware Changes (30 min)

```bash
# On server
cd /opt/qb-integration
git pull  # Or scp files

# Backup current
cp src/services/salesforce-api.js src/services/salesforce-api.js.bak
cp src/services/quickbooks-api.js src/services/quickbooks-api.js.bak
cp src/routes/api.js src/routes/api.js.bak

# Deploy new versions
# ... copy files ...

# Restart
pm2 restart qb-integration  # Or: pkill node && node src/server.js &
```

### Step 4: Smoke Test (15 min)

1. Create new Opportunity with valid data → Expect Success
2. Create Opportunity with Supplier = ATO COMM → Expect Skipped
3. Create Opportunity with no email → Expect invoice created, payment link status = INVOICE_NO_BILLEMAIL
4. Check Roman can see all fields

### Step 5: Run Backfill (30 min)

```bash
cd /opt/qb-integration
node scripts/backfill-payment-links.js
```

---

## Total Effort Estimate

| Phase | Hours | Priority |
|-------|-------|----------|
| Phase 0: Verify Reality | 4h | MUST |
| Phase 1: SF Observability | 12h | MUST |
| Phase 2: Payment Link Fix | 8h | MUST |
| Phase 3: OAuth Clarity | 4h | MUST |
| Phase 4: Idempotency | 6h | MUST |
| Phase 5: Backfill | 2h | SHOULD |
| Phase 6: Permissions/Layout | 4h | MUST |
| **Total MUST** | **38h** | |
| **Total All** | **40h** | |

**At $50/hour**: 40h × $50 = **$2,000 USD (60,000 RUB)**

---

## Verification Checklist for Roman

After deployment, Roman should be able to verify ALL of these in Salesforce without looking at server logs:

- [ ] Every Opportunity that reaches "Proposal and Agreement" has QB_Sync_Status__c set (never blank)
- [ ] Skipped opportunities show clear reason (SUPPLIER_EXCLUDED, ALREADY_HAS_INVOICE, etc.)
- [ ] Failed opportunities show error code and message
- [ ] AUTH_EXPIRED errors include reauthorization instructions
- [ ] Payment links appear when Email_for_invoice__c is filled
- [ ] Missing payment links show clear reason (INVOICE_NO_BILLEMAIL, QB_PAYMENTS_DISABLED)
- [ ] "QB Integration Issues" list view shows all problems at a glance
- [ ] No duplicate invoices are created on retry/re-sync
