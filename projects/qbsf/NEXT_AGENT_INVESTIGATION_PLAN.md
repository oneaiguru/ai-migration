# Investigation Plan - Invoice Creation Filtering & Re-submission

## Critical Questions from Roman

1. **Invoice creation inconsistency**: Some accounts create invoices, others don't
   - Which accounts work? Which don't?
   - What are the filtering conditions?
   - Is email on contact required?

2. **Re-submission feature**: Need ability to update existing invoices
   - Currently: Can only create new invoices
   - Needed: Re-send same opportunity to update invoice products
   - Use case: Add missing products after initial creation

---

## TASK 1: Identify Filtering Conditions (MUST DO FIRST)

### Step 1: Find Working vs Non-Working Accounts
```bash
# In Salesforce, run this query:
SELECT
  Id, Name, Account_Type__c, Country__c, Email__c, Phone,
  (SELECT Id, Name, QB_Invoice_ID__c FROM Opportunities)
FROM Account
WHERE Account_Type__c = 'Поставщик'
ORDER BY Name
```

### Step 2: Analyze Pattern
Compare accounts WITH invoices vs WITHOUT:
- Check `Account_Type__c` value (must be exactly 'Поставщик'?)
- Check `Country__c` value (must be 'US'?)
- Check if Contact email exists (required for payment link?)
- Check if Account email exists
- Check Account phone number
- Check other custom fields

### Step 3: Check Middleware Logs
For accounts that FAILED to create invoices:
```bash
ssh roman@pve.atocomm.eu -p 2323
tail -200 /tmp/server.log | grep -i "error\|failed\|account"
```

Look for:
- "Customer not found"
- "Invalid field"
- "Email missing"
- "Country validation"
- Any QB API errors

### Step 4: Check Salesforce Logs
For failed opportunities:
```
Setup → Logs → Debug Logs
Recent Apex Logs → Find opportunities with NULL QB_Invoice_ID__c
Search for "ERROR" or "Exception"
```

---

## TASK 2: Email on Contact Requirement

### Check Current Implementation
Read these files:
1. `src/services/salesforce-api.js` - Line 50-70 (customer creation)
2. `src/routes/api.js` - Line 60-95 (email extraction)

### Questions to Answer:
- Is email extracted from Contact or Account?
- What happens if no email found? (error or continue?)
- Is email REQUIRED for QB invoice creation or just for payment links?

### Test:
1. Create test Account WITHOUT any email
2. Add Contact to account WITHOUT email
3. Create Opportunity → move to "Proposal and Agreement"
4. Check: Does invoice create? Does it fail?
5. Check middleware logs

---

## TASK 3: Re-submission / Update Feature Design

### Current Flow:
```
Opportunity (Stage → "Proposal and Agreement")
→ Trigger fires
→ Queueable calls middleware
→ Middleware creates QB invoice
→ Update SF with QB_Invoice_ID__c
```

### Problem:
- If opportunity already has QB_Invoice_ID__c, trigger won't fire again
- User cannot update products and re-send

### Solution Options:

#### Option A: Add "Resync" Button (Easiest)
1. Create custom button on Opportunity
2. Button calls Apex method to re-queue the opportunity
3. Middleware endpoint `/api/opportunity-to-invoice` should UPDATE existing invoice
4. QB API supports invoice updates via PUT request

#### Option B: Add "Force Resync" Field
1. Add checkbox field `Force_QB_Sync__c` to Opportunity
2. Modify trigger to check this field
3. If TRUE, always requeue even if QB_Invoice_ID__c exists
4. After sync, set to FALSE

#### Option C: Add "Sync to QB" Button + Conditional Endpoint
1. Button re-queues opportunity regardless of status
2. Middleware detects existing QB_Invoice_ID__c
3. Calls QB API PUT instead of POST (update instead of create)
4. Updates invoice with new products

### RECOMMENDED: Option C (Most Flexible)
- Preserves existing invoice ID
- Allows product updates
- Works with QB API update capabilities

---

## Implementation Checklist for Next Agent

### PHASE 1: Diagnosis (2-3 hours)
- [ ] Run Salesforce query to find working vs non-working accounts
- [ ] Identify pattern (filtering conditions)
- [ ] Check middleware logs for error messages
- [ ] Check Salesforce debug logs
- [ ] Document findings in `FILTERING_CONDITIONS_REPORT.md`

### PHASE 2: Email Requirement Testing (1 hour)
- [ ] Test account with no email
- [ ] Test account with only Account email
- [ ] Test account with only Contact email
- [ ] Document requirements

### PHASE 3: Re-submission Feature (2-4 hours)
- [ ] Design chosen option (recommend Option C)
- [ ] Modify middleware to support PUT/update
- [ ] Add SF button or field
- [ ] Test with real opportunity
- [ ] Document usage for Roman

---

## Key Files to Read

### Must Read (Filtering Logic):
1. `/deployment/sf-qb-integration-final/src/services/salesforce-api.js` (line 1-100)
   - Shows what Account/Contact fields are queried
   - Shows filtering applied

2. `/force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger`
   - Shows which opportunities trigger invoice creation

3. `/deployment/sf-qb-integration-final/src/routes/api.js` (line 40-100)
   - Shows account validation before customer creation

### Must Read (Email Handling):
1. `/deployment/sf-qb-integration-final/src/services/salesforce-api.js` (line 50-70)
   - Email extraction logic

2. `/deployment/sf-qb-integration-final/src/routes/api.js` (line 56-95)
   - Email usage when creating QB customer

### Should Read (QB API):
1. `/deployment/sf-qb-integration-final/src/services/quickbooks-api.js`
   - Invoice creation method
   - Check if update method exists

---

## Questions to Answer in Report

1. **Filtering Conditions**
   - Exact values for Account_Type__c?
   - Exact values for Country__c?
   - Any other field requirements?
   - Boolean logic (AND vs OR)?

2. **Email Requirement**
   - Is email REQUIRED or OPTIONAL?
   - Source: Contact email or Account email?
   - What happens if missing?

3. **QB Invoice Update**
   - Does QB API support PUT /invoice/{id}?
   - Can we update products in existing invoice?
   - Any limitations?

---

## Success Criteria

**Diagnosis Phase Complete When:**
- [x] Know exactly which accounts work and why
- [x] Know exact filtering conditions
- [x] Know if email is required
- [x] Have list of failing accounts and reasons
- [x] Written report for Roman with answers

**Re-submission Feature Complete When:**
- [x] Can update existing QB invoice via SF button/field
- [x] Product changes are reflected in QB
- [x] Invoice ID doesn't change
- [x] Roman can test and confirm works

---

## Expected Outcomes

### Report Section 1: Filtering Conditions
Example format:
```
Account Type: Must be 'Поставщик' (exact match) ✓
Country: Must be 'US' (exact match) ✓
Email: Required on Contact, email@company.com format
Phone: Optional but recommended
Status: Must be Active (if field exists)
```

### Report Section 2: Working Accounts
List accounts that successfully create invoices:
- Account name
- Type
- Country
- Contact email status
- Invoice created: Yes/No

### Report Section 3: Non-Working Accounts
List accounts that fail:
- Account name
- Type
- Country
- Contact email status
- Reason for failure

---

## Questions to Ask Roman

Once diagnosis complete, ask Roman:
1. "Which of these accounts should be creating invoices?"
2. "Are accounts without emails correct, or should they have emails?"
3. "Do you want the re-submission feature? Which option?"
4. "Should we update existing invoices or create new versions?"

---

*This plan ensures systematic diagnosis before any code changes*
*Next agent: Follow tasks in order, document findings, then proceed to implementation*
