# 🔍 SAFARI SALESFORCE PRODUCTION CHECKS

## 📋 WHAT TO CHECK IN SALESFORCE PRODUCTION

Since you're logged into SF production in Safari, please check these items:

### ✅ CHECK 1: Current Triggers
**Location**: Setup → Apex Triggers
**Look for**: 
- OpportunityQuickBooksTrigger
- Any other QB/integration related triggers

**Report**: List all triggers you see and their status (Active/Inactive)

---

### ✅ CHECK 2: Custom Fields on Opportunity
**Location**: Setup → Object Manager → Opportunity → Fields & Relationships
**Look for**:
- QB_Invoice_ID__c
- QB_Payment_Date__c  
- QB_Payment_Status__c
- Any other QB_* fields

**Report**: List all QB-related fields and their API names

---

### ✅ CHECK 3: Custom Objects
**Location**: Setup → Object Manager  
**Look for**:
- QB_Integration_Settings__c
- QB_Integration_Log__c
- QB_Integration_Error_Log__c

**Report**: Which custom objects exist?

---

### ✅ CHECK 4: Apex Classes
**Location**: Setup → Apex Classes
**Look for**:
- QBInvoiceIntegrationQueueable
- QBInvoiceSyncQueueable  
- Any other QB/integration classes

**Report**: List all integration-related classes

---

### ✅ CHECK 5: Connected Apps
**Location**: Setup → App Manager
**Look for**: Any apps related to QuickBooks/Integration
**Check**: OAuth callback URLs - should be https://sqint.atocomm.eu/auth/salesforce/callback

---

### ✅ CHECK 6: Debug Logs (If Available)
**Location**: Setup → Debug Logs
**Look for**: Recent logs from trigger executions
**Report**: Any recent errors or trigger activities

---

### ✅ CHECK 7: Test Opportunity Creation
**Try this**:
1. Go to Opportunities tab
2. Create new opportunity:
   - Name: "TEST INTEGRATION AUG22"
   - Stage: "Prospecting" 
   - Close Date: Future date
   - Amount: 1000
3. Save it
4. Edit and change Stage to "Proposal and Agreement"
5. Save again
6. Check if QB_Invoice_ID__c field gets populated

**Report**: What happens? Any errors? Does field get populated?

---

## 📝 RESPONSE FORMAT

Please copy this template and fill in your findings:

```
SAFARI SF PRODUCTION CHECK RESULTS:

✅ CHECK 1 - Triggers:
- Found: [list triggers]
- Status: [Active/Inactive]

✅ CHECK 2 - Opportunity Fields:
- QB_Invoice_ID__c: [Yes/No]
- Other QB fields: [list them]

✅ CHECK 3 - Custom Objects:
- QB_Integration_Settings__c: [Yes/No]
- QB_Integration_Log__c: [Yes/No] 
- QB_Integration_Error_Log__c: [Yes/No]

✅ CHECK 4 - Apex Classes:
- Found: [list classes]

✅ CHECK 5 - Connected Apps:
- Found: [list apps]
- Callback URL: [what you see]

✅ CHECK 6 - Debug Logs:
- Recent activity: [describe]

✅ CHECK 7 - Test Opportunity:
- Created successfully: [Yes/No]
- Stage change worked: [Yes/No] 
- QB_Invoice_ID__c populated: [Yes/No]
- Any errors: [describe]
```

Save your results as **SAFARI_SF_FINDINGS.md** for Claude Code to read.