# SKILLS & KNOWLEDGE MAP - Perfect Knowledge for Both Tasks

> **Source**: `skillsideas.markdown` + API References analysis
> **Purpose**: Map what we need to know vs. what references we have
> **Result**: Know exactly what to study for perfect implementation

---

## 🎯 CRITICAL KNOWLEDGE AREAS

### FOR TASK 1: Fix Broken Integration

#### 1. Test Data & Field Requirements
**What we need**: Understand what `Supplierc` field is and why it's required

**Files to read**:
- ✅ `ai-docs/salesforce-api-reference.md` - Has Account fields
- ✅ `EXACT_TASKS_FROM_ROMAN.md` - Explains the issue

**Missing**: Exact field definition of `Supplierc`
- Need to: Search codebase for field metadata
- Search: `grep -r "Supplierc" force-app/`

#### 2. Salesforce Test Coverage Patterns
**What we need**: How to write tests that provide code coverage

**Files to read**:
- ✅ `IMPLEMENTATION_GUIDE.md` - Has test class examples
- ✅ `ai-docs/salesforce-api-reference.md` - Field definitions

**Missing**: Detailed Apex test best practices specific to this project
- Need to: Read existing test classes for patterns
- Check: `force-app/main/default/classes/*Test.cls`

#### 3. Salesforce Trigger Execution Model
**What we need**: Why trigger tests are failing (what's the execution path?)

**Files to read**:
- ✅ `ai-docs/salesforce-api-reference.md` - Has trigger definition
  ```
  OpportunityQuickBooksTrigger
  - Trigger Condition: StageName = "Proposal and Agreement"
  - Supplier Filter: Account.Account_Type__c = 'Поставщик' AND Country__c = 'US'
  ```

**Missing**: Understanding what changed in trigger logic
- Need to: Read actual trigger code
- Check: `force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger`

---

### FOR TASK 2: Add Payment Link Field

#### 1. QuickBooks API Invoice Response Structure
**What we need**: Where is payment link in QB API response?

**Files to read**:
- ✅ `ai-docs/quickbooks-api-reference.md` - Has Invoice endpoints
  ```
  POST /v3/company/{realmId}/invoice
  GET /v3/company/{realmId}/invoice/{invoiceId}
  ```
- ⚠️ **INCOMPLETE**: Doesn't show full response structure with payment link

**Missing**: Complete QB Invoice object structure including:
- InvoiceLink field
- OnlinePaymentUrl field
- Full response example
- Need to: Check QB API documentation (Intuit Developer Portal)
- Or: Check middleware code for what QB returns

#### 2. Middleware HTTP Response Handling
**What we need**: How to extract and pass payment link through middleware

**Files to read**:
- ✅ `IMPLEMENTATION_GUIDE.md` - Has code example for extraction
- ✅ `ai-docs/quickbooks-api-reference.md` - Has data transformation rules

**Specific code**:
```javascript
// From ai-docs/quickbooks-api-reference.md
{
  "CustomerRef": { "value": qbCustomerId },
  "DocNumber": `№"${randomNumber.padStart(4, '0')}"`,
  "Line": [{...}],
  "PrivateNote": `Created from Salesforce Opportunity: ${opportunity.Id}`
}
```

**Missing**: Exact middleware file location and current structure
- Need to: Read `/deployment/sf-qb-integration-final/src/services/quickbooks-api.js`

#### 3. Salesforce Field Mapping & Update Logic
**What we need**: How to store payment link in custom field

**Files to read**:
- ✅ `ai-docs/salesforce-api-reference.md` - Has Opportunity fields
  - Shows `QB_Invoice_ID__c`, `QB_Last_Sync_Date__c` fields
  - Shows custom fields pattern

**Code pattern from reference**:
```apex
// From existing integration logic
opp.QB_Invoice_ID__c = (String) result.get('invoiceId');
// We need to add:
opp.QB_Payment_Link__c = (String) result.get('paymentLink');
```

**Missing**: How the response parsing works currently
- Need to: Read `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`

---

## 📚 KEY DOCUMENTS ALREADY IN REPO

### API References (Complete)
| File | Coverage | Status |
|------|----------|--------|
| `ai-docs/quickbooks-api-reference.md` | 70% | ✅ Has core endpoints, response mapping, error codes |
| `ai-docs/salesforce-api-reference.md` | 80% | ✅ Has objects, fields, SOQL, triggers |

### Implementation Guides (Complete)
| File | Coverage | Status |
|------|----------|--------|
| `EXACT_TASKS_FROM_ROMAN.md` | 100% | ✅ Exact requirements from client |
| `IMPLEMENTATION_GUIDE.md` | 90% | ✅ Technical steps, code examples, commands |

### Missing/Incomplete
| Topic | Need to Find | Priority |
|-------|-------------|----------|
| **Salesforce Field Metadata** | `Supplierc` field definition | 🔴 CRITICAL |
| **QB Invoice Response** | Full structure with payment link field | 🔴 CRITICAL |
| **Middleware Code** | Current invoice creation response | 🟠 HIGH |
| **Apex Test Patterns** | Best practices for this codebase | 🟠 HIGH |

---

## 🔧 EXACT FILES TO READ FOR PERFECT KNOWLEDGE

### TASK 1 Knowledge Sources (In Order)

**Step 1: Understand the broken integration**
```
1. /Users/m/ai/projects/qbsf/EXACT_TASKS_FROM_ROMAN.md
   → Why it's broken (Supplierc field missing)

2. /Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls
   → Line 38 (setupTestData method) - where it breaks

3. /Users/m/ai/projects/qbsf/force-app/main/default/classes/OpportunityQuickBooksTriggerTest.cls
   → Lines 42 & 71 (test method setup) - where it breaks
```

**Step 2: Understand test patterns**
```
1. /Users/m/ai/projects/qbsf/force-app/main/default/classes/QuickBooksAPIServiceTest.cls
   → Study how tests are written in this project

2. /Users/m/ai/projects/qbsf/force-app/main/default/classes/QuickBooksInvoiceControllerTest.cls
   → Another test pattern example
```

**Step 3: Find Supplierc field definition**
```
1. Grep in codebase:
   grep -r "Supplierc" /Users/m/ai/projects/qbsf/force-app/

2. Check Account object fields:
   /Users/m/ai/projects/qbsf/force-app/main/default/objects/Account/fields/
```

**Step 4: Understand trigger logic**
```
1. /Users/m/ai/projects/qbsf/force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger
   → What fires when stage changes?

2. /Users/m/ai/projects/qbsf/ai-docs/salesforce-api-reference.md
   → Understanding the trigger condition
```

---

### TASK 2 Knowledge Sources (In Order)

**Step 1: Understand QB API for payment links**
```
1. /Users/m/ai/projects/qbsf/ai-docs/quickbooks-api-reference.md
   → Study Invoice endpoints and response structure

2. Official QB API Docs (external):
   https://developer.intuit.com/app/developer/qbo/docs/api/latest/resources/invoice
   → Full Invoice object structure
```

**Step 2: Understand middleware structure**
```
1. /Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js
   → How QB API is called and response handled

2. /Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js
   → How response is returned to Salesforce
```

**Step 3: Understand Salesforce response parsing**
```
1. /Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls
   → Lines ~140-150: How middleware response is parsed

2. /Users/m/ai/projects/qbsf/ai-docs/salesforce-api-reference.md
   → Field mapping patterns
```

**Step 4: Study payment link field pattern**
```
1. Existing payment field mappings:
   grep -r "QB_Invoice_ID__c" /Users/m/ai/projects/qbsf/force-app/
   → See how QB_Invoice_ID__c is populated

2. Apply same pattern to QB_Payment_Link__c
```

---

## 📖 KNOWLEDGE SOURCES BY DOMAIN

### Salesforce Apex/Triggers
| Topic | Where to Learn | File |
|-------|---|---|
| **Test Class Structure** | Example test classes | `*Test.cls` files |
| **Trigger Execution** | API Reference + Trigger code | `salesforce-api-reference.md` + `.trigger` files |
| **Custom Fields** | API Reference | `salesforce-api-reference.md` |
| **SOQL Queries** | API Reference + actual code | `salesforce-api-reference.md` |

### QuickBooks API
| Topic | Where to Learn | File |
|-------|---|---|
| **Invoice Creation** | QB API Reference | `quickbooks-api-reference.md` |
| **Invoice Response** | QB API Reference + QB Dev Docs | `quickbooks-api-reference.md` + Intuit Docs |
| **Payment Link Location** | QB Dev Portal + middleware code | Need to research |
| **Error Handling** | QB API Reference | `quickbooks-api-reference.md` |

### Middleware (Node.js)
| Topic | Where to Learn | File |
|-------|---|---|
| **QB API Calls** | Middleware code | `/deployment/sf-qb-integration-final/src/services/quickbooks-api.js` |
| **HTTP Response** | Middleware code | `/deployment/sf-qb-integration-final/src/routes/api.js` |
| **Error Handling** | Middleware code | middleware files |

---

## 🎓 SKILL AREAS TO MASTER

### Level 1: Foundation (Already Have)
- ✅ Salesforce API basics (covered in api-reference.md)
- ✅ QuickBooks API basics (covered in api-reference.md)
- ✅ Apex/LWC fundamentals (implied by existing code)
- ✅ Node.js middleware patterns (can infer from code)

### Level 2: Required for This Task (Need to Verify)
- ❓ Test class best practices (need to read existing tests)
- ❓ HTTP mock testing in Salesforce (check test classes)
- ❓ QB API full response structure (need QB docs)
- ❓ Middleware HTTP response formatting (need to read code)

### Level 3: Optional (Nice to Have)
- MCP server patterns (from skillsideas.markdown)
- SFDX deployment best practices
- Git/version control for Salesforce

---

## 🎯 ACTION PLAN FOR PERFECT KNOWLEDGE

### TODAY (Before Starting Code)
1. Read `EXACT_TASKS_FROM_ROMAN.md` - Know exactly what to build
2. Read `IMPLEMENTATION_GUIDE.md` - Know technical approach
3. Read both API reference files - Know the contracts
4. Grep for `Supplierc` - Know the missing field

### THEN (While Starting Code)
1. Read test class that's failing - See exact error
2. Read middleware QB service - See current response
3. Read Salesforce QBInvoiceIntegrationQueueable - See how it's used

### FINALLY (During Implementation)
1. Check QB API docs for payment link field name
2. Study similar field mappings in existing code
3. Copy/paste patterns from working code

---

## 📊 KNOWLEDGE COVERAGE MATRIX

| Task | Topic | Have Doc | Need Research | Confidence |
|------|-------|----------|---|---|
| **Task 1** | Supplierc field requirement | ❌ | 🔴 CRITICAL | 20% |
| **Task 1** | Test class patterns | ✅ | 🟡 Verify | 70% |
| **Task 1** | Trigger execution | ✅ | 🟡 Details | 60% |
| **Task 2** | QB payment link location | ❌ | 🔴 CRITICAL | 30% |
| **Task 2** | Middleware response format | ✅ (partial) | 🟡 Full structure | 50% |
| **Task 2** | Salesforce field mapping | ✅ | ✅ Complete | 90% |

---

## 💡 QUICK START READING ORDER

1. **5 min**: `EXACT_TASKS_FROM_ROMAN.md` - Understand requirements
2. **10 min**: `ai-docs/quickbooks-api-reference.md` - QB endpoints
3. **10 min**: `ai-docs/salesforce-api-reference.md` - SF objects
4. **15 min**: `IMPLEMENTATION_GUIDE.md` - Technical approach
5. **20 min**: Read failing test classes - See exact errors
6. **20 min**: Read QB middleware service - See current response
7. **Total: ~90 minutes** for complete knowledge

---

## 🔗 EXTERNAL RESOURCES TO RESEARCH

### For Task 1 (Supplierc field)
- [x] Grep codebase
- [ ] Check git history for field creation
- [ ] Check Account object metadata
- [ ] Ask Roman if unclear

### For Task 2 (Payment link)
- [x] QB API Reference (we have it)
- [ ] **NEED**: Official QB Invoice API docs (Intuit Developer Portal)
- [ ] **NEED**: Check middleware response structure (read code)
- [ ] **NEED**: Check QB sandbox for actual payment link format

---

## ✅ SUMMARY

**Knowledge we HAVE:**
- ✅ API contracts (QB & SF)
- ✅ Implementation approach
- ✅ Exact task requirements
- ✅ Code patterns from existing implementation

**Knowledge we NEED to RESEARCH:**
- 🔴 CRITICAL: What is `Supplierc` field exactly?
- 🔴 CRITICAL: Where is payment link in QB response?
- 🟠 HIGH: Exact QB API payment link field name
- 🟠 HIGH: Current middleware invoice response format

**Once researched, we'll have PERFECT knowledge for both tasks.**

---

## 📌 NEXT STEP

Read the following BEFORE writing any code:

```bash
# 1. Find Supplierc field
grep -r "Supplierc" /Users/m/ai/projects/qbsf/force-app/

# 2. Check QB API docs for payment link field
# Visit: https://developer.intuit.com/app/developer/qbo/docs/api/latest/resources/invoice

# 3. Read failing tests
cat /Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls | head -50

# 4. Read middleware QB service
cat /Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js | grep -A 20 "createInvoice"
```

**With all this done, you'll have perfect knowledge to execute both tasks flawlessly.**
