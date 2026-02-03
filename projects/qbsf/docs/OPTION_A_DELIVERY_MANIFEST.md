# Option A Delivery Manifest (20k RUB)

**Client:** Roman Kapralov
**Date:** December 29, 2025
**Scope:** Invoice creation + Payment link population

---

## Deployed Components

### Middleware (Node.js)

**Server:** `pve.atocomm.eu:2323` → `/opt/qb-integration/`

**Endpoints Available:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/opportunity-to-invoice` | POST | Create QB invoice + payment link |
| `/auth/quickbooks` | GET | OAuth authorization flow |

**Files Deployed:**
```
/opt/qb-integration/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/index.js
│   ├── routes/api.js, auth.js
│   ├── services/salesforce-api.js, quickbooks-api.js, oauth-manager.js
│   ├── transforms/opportunity-to-invoice.js
│   ├── middleware/error-handler.js
│   └── utils/logger.js
├── data/tokens.json
├── package.json
└── .env
```

**NOT deployed:** `tests/` directory

---

### Salesforce (Apex)

**Org:** Roman's production org

**Components Deployed:**
| Type | Name | Purpose |
|------|------|---------|
| Trigger | `OpportunityQuickBooksTrigger` | Fires on stage = "Proposal and Agreement" |
| Class | `QBInvoiceIntegrationQueueable` | Async HTTP callout to middleware |
| Class | `QuickBooksAPIService` | HTTP service for callouts |
| Custom Setting | `QB_Integration_Settings__c` | Middleware URL, API key, realm ID |

**Custom Fields Deployed (Opportunity):**
| Field | Type | Purpose |
|-------|------|---------|
| `QB_Invoice_ID__c` | Text | QuickBooks invoice ID |
| `QB_Invoice_Number__c` | Text | DocNumber for display |
| `QB_Payment_Link__c` | URL | Payment link from QB |
| `QB_Last_Sync_Date__c` | DateTime | Last successful sync |
| `Supplier__c` | Lookup (org-specific; in Roman org it references `Supplier__c`) | Supplier for exclusion logic |
| `Email_for_invoice__c` | Email | Billing email override |
| `QB_Sync_Status__c` | Picklist | Processing/Success/Error/Skipped |
| `QB_Error_Code__c` | Text | Error code (AUTH_EXPIRED, etc.) |
| `QB_Error_Message__c` | Long Text | Human-readable error |
| `QB_Skip_Reason__c` | Text | Skip reason code |
| `QB_Correlation_Id__c` | Text | Request tracing ID |
| `QB_Last_Attempt__c` | DateTime | Last attempt timestamp |
| `QB_Payment_Link_Status__c` | Picklist | Link status reason |

**Custom Fields Deployed (Account):**
| Field | Type | Purpose |
|-------|------|---------|
| `Email__c` | Email | Account email (billing priority 3) |

**NOT deployed:**
- All test classes (`*Test.cls`)
- `QB_Integration_Error_Log__c` custom object
- `QB_Integration_Log__c` custom object

---

## Configuration

**QB_Integration_Settings__c:**
```
Middleware_Endpoint__c = https://sqint.atocomm.eu
API_Key__c = UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=
QB_Realm_ID__c = 9130354519120066
```

---

## Behavior

### Invoice Creation Flow
1. Opportunity stage changes to "Proposal and Agreement"
2. Trigger fires → enqueues `QBInvoiceIntegrationQueueable`
3. Queueable calls `POST /api/opportunity-to-invoice`
4. Middleware:
   - Gets Opportunity data from Salesforce
   - Determines billing email (Opp > OCR > Account > Contact)
   - Creates/finds customer in QuickBooks
   - Creates invoice in QuickBooks
   - Fetches payment link
   - Updates Opportunity with `QB_Invoice_ID__c` and `QB_Payment_Link__c`

### Billing Email Priority
1. `Opportunity.Email_for_invoice__c` (if filled)
2. Primary OpportunityContactRole.Contact.Email (IsPrimary=true)
3. `Account.Email__c` (if filled)
4. Most recent Contact.Email by LastModifiedDate

### Supplier Exclusion
- Opportunities with Supplier = "ATO COMM" are skipped
- Opportunities without Supplier are skipped

---

## What Roman DOES NOT Get

| Feature | Status |
|---------|--------|
| Payment status sync scheduler | Not deployed |
| Invoice update endpoint | Not deployed |
| Error logging objects | Not deployed |
| Test classes | Not deployed |
| Backfill scripts | Not delivered |
| Support beyond 3 fix cycles | Not included |

---

## Verification Criteria

- 20 Opportunities with valid email
- Each moved to "Proposal and Agreement"
- Each gets: `QB_Invoice_ID__c` + `QB_Payment_Link__c` populated
- All 20 pass = CLOSED

---

## Responsibility

| Issue | Owner |
|-------|-------|
| Code bug in invoice/link logic | Misha (fix within 3 cycles) |
| Missing email in SF data | Roman |
| QB Payments not enabled | Roman |
| SF configuration issue | Roman |
| OAuth token expired | Roman (re-authorize at `/auth/quickbooks`) |
| New feature request | New scope, new price |
