# 🚀 UPDATED DEPLOYMENT STRATEGY 2025 - Based on Latest SF Documentation

## 📋 CONFIRMED REQUIREMENTS (Current as of 2025)

### ✅ TEST COVERAGE REQUIREMENTS
**75% OVERALL ORGANIZATION COVERAGE** - This is calculated across ALL Apex classes and triggers in the entire org, not per class

**TRIGGER REQUIREMENTS** - Every trigger must have at least 1% coverage (at least one line executed)

**PRODUCTION DEPLOYMENT** - When deploying to production, every unit test in your organization namespace is executed

### 🚨 CRITICAL UNDERSTANDING
If you have 500 existing Apex classes with 79% coverage and deploy 200 new classes, you need 75% coverage across ALL 700 classes total

Common failure: Sandbox shows good coverage but production deployment fails due to existing production code lowering overall percentage

---

## 🎯 ROMAN'S SPECIFIC SITUATION ANALYSIS

### Current State from Conversation:
- **Roman deleted old triggers/classes** in sandbox 
- **Roman got 55% on one class** - needs organization-wide coverage
- **api.js vs trigger mismatch** - sending different data types
- **OAuth issues identified** - redirect URIs need fixing

### Deployment Path Required:
**Sandbox → Production via Change Sets** - Roman's approach is correct for current SF architecture

**Test Coverage Validation** - Change sets don't automatically run tests unless explicitly selected during deployment

---

## 🔧 ITERATIVE TEST COVERAGE IMPROVEMENT STRATEGY

### PHASE 1: Assessment & Gap Analysis
```bash
# In Sandbox - Check current coverage
Setup → Apex Classes → "Estimate Your Organization's Code Coverage"

# Run ALL tests to get accurate picture
Setup → Apex Classes → "Run All Tests"
```

### PHASE 2: Systematic Coverage Improvement
**Target: 75%+ organization-wide coverage with systematic preparation and testing to decrease deployment failures by up to 50%**

#### Step 1: Identify Low/No Coverage Classes
```sql
-- Query to find classes needing coverage
SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered, Coverage
FROM ApexCodeCoverage 
ORDER BY Coverage ASC
```

#### Step 2: Create/Improve Test Classes Systematically
Focus on "good" test coverage that covers multiple use cases, including positive and negative cases, as well as bulk and single records

**Template for Integration Test Classes:**
```apex
@isTest
private class QBIntegrationTest {
    @testSetup
    static void setupTestData() {
        // Create test Account with all required fields
        Account testAcc = new Account(
            Name = 'Test Integration Company',
            BillingStreet = '123 Test St',
            BillingCity = 'Test City',
            BillingState = 'Test State',
            BillingPostalCode = '12345',
            BillingCountry = 'United States'
        );
        insert testAcc;
        
        // Create test Opportunity
        Opportunity testOpp = new Opportunity(
            Name = 'Test Integration Opportunity',
            AccountId = testAcc.Id,
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            Amount = 50000
        );
        insert testOpp;
    }
    
    @isTest
    static void testOpportunityTriggerSuccess() {
        // Test positive case - stage change triggers integration
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        opp.StageName = 'Proposal and Agreement';
        update opp;
        Test.stopTest();
        
        // Verify QB_Invoice_ID__c was populated
        opp = [SELECT QB_Invoice_ID__c FROM Opportunity WHERE Id = :opp.Id];
        System.assertNotEquals(null, opp.QB_Invoice_ID__c, 'QB Invoice ID should be populated');
    }
    
    @isTest
    static void testOpportunityTriggerBulk() {
        // Test bulk processing
        List<Opportunity> opps = [SELECT Id FROM Opportunity];
        
        Test.startTest();
        for(Opportunity opp : opps) {
            opp.StageName = 'Proposal and Agreement';
        }
        update opps;
        Test.stopTest();
        
        // Verify all were processed
        Integer processedCount = [SELECT COUNT() FROM Opportunity WHERE QB_Invoice_ID__c != null];
        System.assertEquals(opps.size(), processedCount, 'All opportunities should be processed');
    }
    
    @isTest
    static void testErrorHandling() {
        // Test negative case - invalid data
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        // Remove required data to test error handling
        Account acc = [SELECT Id FROM Account WHERE Id = :opp.AccountId];
        acc.BillingCountry = null;
        update acc;
        
        Test.startTest();
        opp.StageName = 'Proposal and Agreement';
        try {
            update opp;
        } catch (Exception e) {
            // Expected exception for invalid data
        }
        Test.stopTest();
    }
}
```

### PHASE 3: Validate Before Deployment
Use Salesforce's Change Set Validation feature prior to actual deployment to highlight syntax errors and dependency issues

```bash
# In Sandbox before creating Change Set:
1. Run All Tests → Verify 75%+ coverage
2. Check each trigger has >1% coverage  
3. Fix any failing tests
4. Create Change Set with test classes included
5. Upload to Production for validation
6. Run validation (don't deploy yet)
7. Fix any validation errors
8. Deploy with "Run All Tests" selected
```

---

## 🔄 PRODUCTION DEPLOYMENT BEST PRACTICES 2025

### Change Set Strategy
**Include Test Classes**: Always include relevant test classes in change sets and select "Run All Tests" during deployment

**Profile Limitations**: Update profile permissions manually after deployment rather than including in change sets

### Deployment Sequence
1. **Validate First**: Always validate change set before deployment to identify issues without locking the org
2. **Include Dependencies**: Ensure all dependencies are met - neglecting dependencies can lead to 40% of deployments experiencing issues
3. **Run All Tests**: When deploying to production, every unit test in your organization namespace is executed

---

## 🚨 SPECIFIC FIXES FOR ROMAN'S INTEGRATION

### 1. OAuth Configuration
- Fix redirect URIs in QB Developer Portal
- Ensure Salesforce Connected App has correct callback URL

### 2. Data Consistency Issue
- **Problem**: api.js sends Invoice data, trigger sends Opportunity data
- **Solution**: Align middleware to expect Opportunity data from trigger

### 3. Test Coverage Strategy
- **Current**: Roman has 55% on one class
- **Needed**: 75% across entire organization
- **Approach**: Create comprehensive test classes for all integration components

### 4. Deployment Path
- **Sandbox**: Complete development and testing
- **Change Set**: Include all components + test classes
- **Validation**: Test deployment without affecting production
- **Deploy**: Full deployment with all tests running

---

## ✅ SUCCESS CRITERIA FOR PAYMENT

1. **75%+ test coverage** across entire organization
2. **All tests passing** in production deployment
3. **End-to-end integration working**: Opportunity → QB Invoice → Payment sync
4. **Roman's approval** after successful testing
5. **30,000 RUB payment** collected

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Assess current coverage** in Roman's sandbox
2. **Identify coverage gaps** and create test plan
3. **Develop missing test classes** systematically
4. **Validate integration logic** (Invoice vs Opportunity data)
5. **Create Change Set** with all components
6. **Deploy to production** with proper testing

This strategy follows the latest 2025 Salesforce best practices and addresses the specific requirements for Roman's production deployment.