# 🎯 FINAL COORDINATION PLAN 2025 - Based on Latest Requirements

## 📋 UPDATED STRATEGY (Based on 2025 SF Documentation)

### ✅ CONFIRMED REQUIREMENTS:
- **75% coverage across ENTIRE organization** (not per class)
- **Every trigger needs 1%+ coverage** 
- **ALL tests run during production deployment**
- **Change Sets require explicit test selection**
- **Validation before deployment prevents 40% of issues**

### 🚨 ROMAN'S SITUATION:
- Has working sandbox with his changes
- Needs organization-wide 75% coverage for production
- OAuth redirect URIs need fixing
- Data mismatch (Invoice vs Opportunity) needs resolution

---

## 🔄 IMMEDIATE COORDINATION TASKS

### 1️⃣ Save These Updated Files for Claude Code:
- `UPDATED_DEPLOYMENT_STRATEGY_2025.md` ✅
- `FINAL_COORDINATION_PLAN_2025.md` ✅ (this file)
- Previous assessment files ✅

### 2️⃣ Claude Code Updated Tasks:
Give Claude Code this prompt:
```
Read UPDATED_DEPLOYMENT_STRATEGY_2025.md for current 2025 requirements.

Execute these priority tasks:

1. OAUTH VERIFICATION:
   - Check if QB redirect URI fix was implemented
   - Verify https://sqint.atocomm.eu/auth/quickbooks/callback is configured
   - Test OAuth endpoints are working

2. SERVER DATA ANALYSIS:
   - Check what data middleware expects (Invoice vs Opportunity)
   - Verify alignment with Salesforce trigger implementation
   - Identify any data transformation needed

3. SANDBOX ACCESS SETUP:
   - Verify sandbox connection: olga.rybak@atocomm2023.eu.sanboxsf / oYfNMU2N
   - Check what Roman has already built in sandbox
   - Document current test coverage percentage

4. PRODUCTION ASSESSMENT:
   - Check current production org coverage percentage
   - Identify how much additional coverage needed for 75%
   - Plan test development strategy

Create PRIORITY_ASSESSMENT.md with findings and immediate action plan.
```

### 3️⃣ Your Safari SF Tasks (Updated):
Focus on **TEST COVERAGE ASSESSMENT** in production:

```
1. PRODUCTION COVERAGE CHECK:
   - Setup → Apex Classes → "Estimate Your Organization's Code Coverage"
   - Document current percentage
   - Run "Run All Tests" if possible
   - Note any failing tests

2. SANDBOX ACCESS:
   - Switch to sandbox: olga.rybak@atocomm2023.eu.sanboxsf / oYfNMU2N
   - Check what Roman has deployed there
   - Run all tests in sandbox
   - Document coverage percentage in sandbox

3. INTEGRATION COMPONENTS CHECK:
   - Look for OpportunityQuickBooksTrigger in sandbox
   - Check QB_Invoice_ID__c field exists
   - Verify any test classes Roman created

Create COVERAGE_ASSESSMENT.md with findings.
```

---

## 🎯 PRIORITY SEQUENCE (Based on 2025 Best Practices)

### PHASE 1: Technical Foundation
- ✅ Fix OAuth redirect URIs (blocks integration)
- ✅ Resolve Invoice vs Opportunity data mismatch
- ✅ Verify sandbox → production deployment path

### PHASE 2: Test Coverage Strategy  
- 📊 Assess current org coverage (production)
- 📊 Calculate coverage gap to reach 75%
- 📝 Create systematic test development plan
- 🧪 Develop missing test classes in sandbox

### PHASE 3: Deployment Preparation
- ✅ Validate all tests pass in sandbox (75%+)
- ✅ Create Change Set with all components + tests
- ✅ Run Change Set validation (don't deploy yet)
- ✅ Fix any validation errors

### PHASE 4: Production Deployment
- 🚀 Deploy Change Set with "Run All Tests" selected
- ✅ Verify 75%+ coverage maintained
- ✅ Test end-to-end integration
- 💰 Roman approval → 30,000 RUB payment

---

## 🚨 CRITICAL SUCCESS FACTORS (2025 Requirements)

### 1. ORGANIZATION-WIDE COVERAGE
**NOT** individual class coverage - must be 75% across entire org including existing production code

### 2. PRODUCTION TEST EXECUTION
ALL tests in organization run during deployment - existing production tests must also pass

### 3. CHANGE SET VALIDATION
Use validation feature before deployment to catch issues without locking production org

### 4. DATA CONSISTENCY  
Middleware and Salesforce must agree on data format (Invoice vs Opportunity)

### 5. OAUTH CONFIGURATION
Redirect URIs must be properly configured in both QB and SF apps

---

## ⚡ START SEQUENCE

**YOU**: 
1. Save updated artifacts
2. Check production coverage percentage in Safari
3. Switch to sandbox and assess Roman's work

**CLAUDE CODE**:
1. Verify OAuth fixes are implemented  
2. Check server data expectations
3. Access sandbox and document Roman's changes
4. Create priority action plan

**COORDINATION**:
1. Compare findings to identify gaps
2. Create specific test coverage development plan
3. Execut