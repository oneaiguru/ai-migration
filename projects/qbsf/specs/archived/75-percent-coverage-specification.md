# 📋 Achieve 75% Test Coverage - Implementation Specification

## 🎯 Objective
Increase Salesforce org-wide test coverage from current 54% to required 75% for production deployment.

## 📊 Current Status Analysis

### Coverage Breakdown
```
CURRENT ORG-WIDE: 54% (Target: 75% - Gap: +21%)

HIGH PERFORMERS (Stable):
✅ OpportunityQuickBooksTrigger: 92% 
✅ QuickBooksInvoiceController: 100%
✅ QuickBooksInvoker: 84%
✅ QuickBooksAPIService: 88%

CRITICAL BLOCKER:
❌ QBInvoiceIntegrationQueueable: 20% (NEEDS WORK)
```

## 🚨 Root Cause Analysis

### QBInvoiceIntegrationQueueable Coverage Issue
**File**: `/Users/m/git/clients/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`

**Problem**: Lines 28-32 contain this test bypass:
```apex
if (Test.isRunningTest()) {
    System.debug('Skipping API callout in test context for opportunity: ' + opp.Id);
    updateOpportunityWithQBInvoiceId(opp.Id, 'TEST-QB-INV-' + String.valueOf(opp.Id).substring(15));
    continue; // SKIPS LINES 36-77 - ALL HTTP LOGIC
}
```

**Impact**: 
- ~80 lines of HTTP logic are untestable
- Represents ~15-20% of total org coverage
- Prevents reaching 75% requirement

## ✅ Implementation Plan

### Phase 1: Modify QBInvoiceIntegrationQueueable Testing (2-3 hours)

#### Step 1: Update Class Structure
**File**: `QBInvoiceIntegrationQueueable.cls`

Replace the test bypass with configurable testing:
```apex
// Replace Test.isRunningTest() with configurable flag
public static Boolean allowTestCallouts = false;

// In execute method:
if (Test.isRunningTest() && !allowTestCallouts) {
    System.debug('Skipping API callout in test context for opportunity: ' + opp.Id);
    updateOpportunityWithQBInvoiceId(opp.Id, 'TEST-QB-INV-' + String.valueOf(opp.Id).substring(15));
    continue;
}
```

#### Step 2: Enhance Test Class
**File**: `QBInvoiceIntegrationQueueableTest.cls`

Add new test methods that enable HTTP testing:
```apex
@isTest
static void testHttpCalloutPaths() {
    // Enable HTTP callouts for this test
    QBInvoiceIntegrationQueueable.allowTestCallouts = true;
    
    Test.setMock(HttpCalloutMock.class, new SuccessfulHttpMock());
    Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
    
    Test.startTest();
    QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
    System.enqueueJob(queueable);
    Test.stopTest();
    
    // This will now execute the HTTP logic paths (lines 36-77)
}
```

#### Expected Result
- QBInvoiceIntegrationQueueable: 20% → 70%+ coverage
- Org-wide improvement: +15% = 69% total coverage

### Phase 2: Find Additional 6% Coverage (30-60 minutes)

#### Option A: Deploy Additional Classes
Check for undeployed working classes:
```bash
find /Users/m/git/clients/qbsf/deployment-package -name "*Test*.cls" | head -10
ls /Users/m/git/clients/qbsf/ | grep -E "(Test|Mock)"
```

#### Option B: Improve Existing Classes
Target classes with remaining uncovered lines:
- QuickBooksAPIService: 88% → 95% (+2%)
- QuickBooksInvoker: 84% → 90% (+2%)
- Add utility classes if found (+2%)

### Phase 3: Validation & Deployment (30 minutes)

#### Test Coverage Verification
```bash
sf apex run test --code-coverage --synchronous -o sanboxsf
```

#### Deployment Validation
```bash
sf project deploy validate --source-dir force-app/main/default/ --test-level RunLocalTests -o sanboxsf
```

## 🎯 Success Criteria

### Required Metrics
- ✅ Org-wide coverage ≥ 75%
- ✅ 100% test pass rate
- ✅ Deployment validation passes
- ✅ All existing functionality preserved

### Verification Commands
```bash
# Check coverage
sf apex run test --code-coverage --synchronous -o sanboxsf | grep "Org Wide Coverage"

# Validate deployment
sf project deploy validate --source-dir force-app/main/default/ --test-level RunLocalTests -o sanboxsf

# Test middleware connectivity
curl -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" https://sqint.atocomm.eu/api/health
```

## ⚠️ Risk Mitigation

### Backup Before Changes
```bash
# Backup current working state
cp force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls.backup
cp force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls.backup
```

### Rollback Plan
If changes break existing functionality:
1. Restore from backup files
2. Deploy original versions
3. Verify 54% coverage is maintained

## 🚀 Execution Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1 | 2-3 hours | QBInvoiceIntegrationQueueable at 70%+ coverage |
| 2 | 30-60 min | Additional 6% coverage identified/implemented |
| 3 | 30 min | Deployment validation passes |
| **Total** | **3-4 hours** | **75%+ coverage ready for production** |

## ✅ Definition of Done

- [ ] Org-wide test coverage ≥ 75%
- [ ] All tests passing (100% pass rate)
- [ ] Deployment validation successful
- [ ] API authentication still working
- [ ] No regression in existing functionality
- [ ] Documentation updated with new coverage metrics

**Only after ALL criteria met → Approve 30,000 RUB payment**