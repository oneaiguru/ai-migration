# CRITICAL FILES TO READ - Plan Solution

> **Purpose**: Know exactly which files to read BEFORE planning solution
> **Why**: These files contain the truth about what's broken and how to fix it

---

## 🔴 ABSOLUTELY MUST READ (Non-negotiable)

### For Task 1: Fix Integration

**1. The Failing Test File**
```
/Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls
```
- **Why**: Line 38 has the error - `REQUIRED_FIELD_MISSING: [Supplierc]`
- **What to find**: How Account is created in setupTestData() method
- **Critical line**: Line 38

**2. The Trigger That Fires**
```
/Users/m/ai/projects/qbsf/force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger
```
- **Why**: This is what calls QBInvoiceIntegrationQueueable when stage changes
- **What to find**: The exact logic that executes
- **Critical**: Understand execution context

**3. The Queueable That Calls Middleware**
```
/Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls
```
- **Why**: This is where the HTTP call to middleware happens
- **What to find**: How it constructs request and parses response
- **Critical lines**: ~30-50 (HTTP setup), ~140-150 (response parsing)

---

### For Task 2: Add Payment Link

**4. Middleware QB API Service**
```
/Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js
```
- **Why**: This is where we extract payment link from QB response
- **What to find**:
  - How `createInvoice()` is called
  - What QB returns (the response structure)
  - Where to add payment link extraction
- **Critical**: The actual QB response object

**5. How Middleware Returns Data**
```
/Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js
```
- **Why**: This is where middleware sends response back to Salesforce
- **What to find**: The API endpoint that QBInvoiceIntegrationQueueable calls
- **Critical**: Response format (what fields we return)

**6. How Salesforce Parses Middleware Response**
```
/Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls
```
- **Why**: Lines 140-150 show how response is parsed
- **What to find**: How `result.get('invoiceId')` works - we'll add `result.get('paymentLink')`
- **Critical**: The deserialization and field mapping pattern

---

## 🟠 SHOULD READ (Highly Important)

**7. Test Class for QB Service**
```
/Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls
```
- **Why**: To see how to mock HTTP responses and test payment link
- **What to find**: Test patterns, mock HTTP response structure
- **Critical**: HTTP mock patterns we need to copy

**8. QB API Reference (in repo)**
```
/Users/m/ai/projects/qbsf/ai-docs/quickbooks-api-reference.md
```
- **Why**: Know QB invoice structure (where payment link is)
- **What to find**: Invoice endpoints, response fields
- **Critical**: Data transformation rules (lines 90-109)

**9. Salesforce API Reference (in repo)**
```
/Users/m/ai/projects/qbsf/ai-docs/salesforce-api-reference.md
```
- **Why**: Know field mapping patterns
- **What to find**: QB_Invoice_ID__c field definition, how other QB fields work
- **Critical**: Field mapping examples

---

## 🟡 NICE TO READ (Context/Understanding)

**10. Task Exact Requirements**
```
/Users/m/ai/projects/qbsf/EXACT_TASKS_FROM_ROMAN.md
```
- **Why**: Know exactly what Roman wants
- **What to find**: Exact quotes, scope limitations
- **Critical**: "Don't touch anything else" constraint

**11. Implementation Guide**
```
/Users/m/ai/projects/qbsf/IMPLEMENTATION_GUIDE.md
```
- **Why**: Know the technical approach (we created this)
- **What to find**: Code examples, deployment steps
- **Critical**: Code patterns for both tasks

---

## 📋 READING ORDER (Start Here)

### PHASE 1: Understand What's Broken (15 minutes)

1. **Read failing test** (5 min):
   - File: `QBInvoiceIntegrationQueueableTest.cls`
   - Focus: Lines 30-45 (setupTestData method)
   - Goal: Find where Account is created, why Supplierc is missing

2. **Read trigger** (5 min):
   - File: `OpportunityQuickBooksTrigger.trigger`
   - Focus: What fires and when
   - Goal: Understand execution flow

3. **Check QB field** (5 min):
   - Grep: `grep -r "Supplierc" force-app/`
   - Goal: Find if field is defined somewhere

---

### PHASE 2: Understand Current Integration (15 minutes)

4. **Read Queueable** (10 min):
   - File: `QBInvoiceIntegrationQueueable.cls`
   - Focus: Lines 1-50 (setup), lines 140-150 (response parsing)
   - Goal: See how middleware is called and response handled

5. **Read QB Service** (5 min):
   - File: `quickbooks-api.js`
   - Focus: `createInvoice()` function
   - Goal: See what QB returns

---

### PHASE 3: Know What To Add (10 minutes)

6. **Read test patterns** (5 min):
   - File: `QBInvoiceIntegrationQueueableTest.cls`
   - Focus: HTTP mock pattern
   - Goal: Know how to test payment link

7. **Read API refs** (5 min):
   - Files: Both API reference files
   - Focus: QB Invoice structure, Salesforce field patterns
   - Goal: Know data structure

---

## 🎯 WHAT YOU'LL KNOW AFTER READING

### After Phase 1:
- ✅ Why integration is broken (Supplierc field)
- ✅ Where the error occurs (test setup)
- ✅ What Supplierc is (if field exists)

### After Phase 2:
- ✅ How request goes from SF to middleware to QB
- ✅ How response comes back
- ✅ What QB actually returns

### After Phase 3:
- ✅ How to write tests
- ✅ Data structure for both systems
- ✅ How to map payment link field

---

## ⚡ QUICK REFERENCE - File Locations

### TASK 1 FILES (Fix Integration)
```bash
# The failing test
cat /Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls | sed -n '30,45p'

# The trigger
cat /Users/m/ai/projects/qbsf/force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger

# Check for Supplierc field
grep -r "Supplierc" /Users/m/ai/projects/qbsf/force-app/
```

### TASK 2 FILES (Add Payment Link)
```bash
# QB API service (where to extract link)
cat /Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js

# API routes (where link goes in response)
cat /Users/m/ai/projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js

# Salesforce parser (where to handle link)
cat /Users/m/ai/projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls | sed -n '140,160p'
```

---

## 🚨 READING STRATEGY

### Before Planning (read these FIRST):
1. QBInvoiceIntegrationQueueableTest.cls (lines 30-45)
2. OpportunityQuickBooksTrigger.trigger (all)
3. QBInvoiceIntegrationQueueable.cls (lines 1-50, 140-160)
4. quickbooks-api.js (createInvoice function)

### During Planning (reference these):
5. Both API reference files
6. EXACT_TASKS_FROM_ROMAN.md
7. IMPLEMENTATION_GUIDE.md

### These tell the truth:
- The actual source code (not docs)
- The actual tests (not promises)
- The actual responses (not examples)

---

## ✅ CONFIDENCE CHECK

You'll have PERFECT KNOWLEDGE when you can answer:

**For Task 1:**
- [ ] Why is Supplierc missing? (What is it?)
- [ ] Where in test file does it fail? (Line number)
- [ ] How is Account created in tests? (See current pattern)
- [ ] What value should Supplierc have? (Research field)

**For Task 2:**
- [ ] What does QB return in invoice response? (See actual object)
- [ ] Which field contains payment link? (InvoiceLink? PaymentUrl?)
- [ ] How is middleware response structured? (See api.js)
- [ ] How does Salesforce parse response? (See lines 140-150)
- [ ] Where should we add payment link extraction? (In qb service)

---

## 🎯 FINAL ANSWER

**Read these files in this order:**

1. `QBInvoiceIntegrationQueueableTest.cls` - Why it's broken
2. `OpportunityQuickBooksTrigger.trigger` - Execution flow
3. `QBInvoiceIntegrationQueueable.cls` - Request/response handling
4. `quickbooks-api.js` - QB response structure
5. `api.js` - Middleware response format
6. Both API reference files - Data structures
7. `EXACT_TASKS_FROM_ROMAN.md` - Requirements
8. `IMPLEMENTATION_GUIDE.md` - Approach

**That's it. After that, you'll have PERFECT knowledge to plan both solutions.**

---

*No guessing. No assumptions. Truth from source code.*
