# QB-SF Integration Fix - Agent Instructions

## Your Mission
Fix Roman's broken Salesforce-QuickBooks integration. Two tasks:
1. **TASK 1 (URGENT)**: Fix broken integration - Invoice ID not returning
2. **TASK 2**: Add payment link field (QB_Payment_Link__c)

## Start Here
Read these files FIRST (in order):
1. `MASTER_PLAN.md` - Full task breakdown with phases
2. `PROGRESS.md` - Current status and what's done
3. `EXACT_TASKS_FROM_ROMAN.md` - Client requirements in Russian

## Phase 0: Prerequisites (DO THESE FIRST)

### 0.1 Verify Salesforce CLI Auth
```bash
sf org display --target-org sanboxsf
```

### 0.2 Test Middleware
```bash
curl -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" https://sqint.atocomm.eu/api/health
```

### 0.3 Get Baseline Coverage
```bash
sf apex run test --code-coverage --synchronous --target-org sanboxsf
```

### 0.4 CRITICAL: Find Supplierc Field
The error says `REQUIRED_FIELD_MISSING: [Supplierc]` on Account insert.
Your local metadata shows `Supplier__c` on Opportunity, NOT Account.

Query the actual org:
```bash
sf sobject describe Account --target-org sanboxsf | grep -i "supplier\|Supplierc"
```

If not found, try:
```bash
sf data query --query "SELECT QualifiedApiName, DataType, Label FROM FieldDefinition WHERE EntityDefinitionId = 'Account'" --target-org sanboxsf | grep -i supplier
```

**Document what you find in PROGRESS.md before proceeding!**

## Key Files to Modify

### For Task 1 (Fix Integration):
- `force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls` - Line 19-28, add Supplierc field
- `force-app/main/default/classes/OpportunityQuickBooksTriggerTest.cls` - Lines 42, 71

### For Task 2 (Payment Link):
- `deployment/sf-qb-integration-final/src/services/quickbooks-api.js` - Extract payment link
- `deployment/sf-qb-integration-final/src/routes/api.js` - Return payment link (lines 106-110)
- `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls` - Parse & store (lines 46-49, 158-172)

## Credentials
- **SF Sandbox**: `sanboxsf` alias
- **Middleware**: https://sqint.atocomm.eu
- **API Key**: `UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=`
- **SSH**: `ssh roman@pve.atocomm.eu -p2323` (pw: `3Sd5R069jvuy[3u6yj`)

## Rules
1. **Update PROGRESS.md** after EVERY completed task
2. **Don't skip Phase 0** - blockers will stop you later
3. **Test locally before deploying**
4. **Don't modify payment sync logic** - Roman said "пока больше ничего не надо трогать"

## Success Criteria
- [ ] All tests pass (0 failures)
- [ ] Code coverage ≥ 75%
- [ ] QB_Invoice_ID__c populates when Opportunity stage = "Proposal and Agreement"
- [ ] QB_Payment_Link__c populates with clickable URL

## If Blocked
1. Document blocker in PROGRESS.md
2. Try alternative approaches from MASTER_PLAN.md
3. If OAuth tokens expired, will need Roman to re-authenticate

---
**START WITH PHASE 0.1 - Verify SF CLI Auth**
