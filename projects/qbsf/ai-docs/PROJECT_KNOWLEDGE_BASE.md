# 📚 Project Knowledge Base - Salesforce-QuickBooks Integration

## 🎯 Project Context

### **Business Overview**
- **Client**: Roman Kapralov (Russian-speaking)
- **Payment**: 30,000 RUB on successful completion  
- **Deadline**: URGENT - Roman waiting since July 2025
- **Integration**: Salesforce Enterprise → QuickBooks Online via Node.js middleware

### **Technical Architecture**
```
Salesforce Opportunity (Stage Change) 
    ↓ OpportunityQuickBooksTrigger
    ↓ QBInvoiceIntegrationQueueable (async)
    ↓ Node.js Middleware (https://sqint.atocomm.eu)
    ↓ QuickBooks Online API
    ↓ Invoice Created & ID returned to Salesforce
```

## 🔧 Critical Configurations

### **Working API Authentication**
- **API Key**: `$API_KEY` ✅ VERIFIED WORKING
- **Middleware**: `https://sqint.atocomm.eu` ✅ RESPONDING
- **Health Check**: `curl -H "X-API-Key: $API_KEY" https://sqint.atocomm.eu/api/health`
- **Expected Response**: `{"success":true,"status":"healthy"}`

### **Salesforce Org Details**
- **Org**: `olga.rybak@atocomm2023.eu.sanboxsf`
- **CLI Alias**: `sanboxsf`
- **Instance**: `https://customer-inspiration-2543.my.salesforce.com`

### **Custom Settings (CONFIGURED)**
```
QB_Integration_Settings__c (ID: a0nSo000002xKO9IAM):
├── API_Key__c: $API_KEY
├── Middleware_Endpoint__c: https://sqint.atocomm.eu
└── QB_Realm_ID__c: 9341454378379755

QuickBooks_Settings__c (ID: a0oSo00000DvP8gIAF):
├── API_Key__c: $API_KEY
├── Middleware_URL__c: https://sqint.atocomm.eu
└── QB_Realm_ID__c: 9341454378379755
```

## 📊 Current Technical Status

### **Test Coverage Analysis (Updated August 22, 2025)**
```
CURRENT ORG-WIDE: 54% ❌ (Target: 75%)
Pass Rate: 100% ✅

Component Breakdown:
✅ OpportunityQuickBooksTrigger: 92% coverage
✅ QuickBooksInvoiceController: 100% coverage  
✅ QuickBooksInvoker: 84% coverage
✅ QuickBooksAPIService: 88% coverage
❌ QBInvoiceIntegrationQueueable: 20% coverage (BLOCKER)
```

### **Root Cause of Coverage Issue**
**File**: `QBInvoiceIntegrationQueueable.cls` (lines 28-32)
```apex
if (Test.isRunningTest()) {
    // Skips ALL HTTP logic (lines 36-77)
    // Represents ~15-20% of total org coverage
    continue;
}
```

## 🗂️ File Structure & Locations

### **Core Salesforce Components**
```
/Users/m/git/clients/qbsf/force-app/main/default/
├── classes/
│   ├── QBInvoiceIntegrationQueueable.cls      ❌ 20% coverage
│   ├── QBInvoiceIntegrationQueueableTest.cls   ✅ Enhanced with HTTP mocks
│   ├── QuickBooksInvoiceController.cls         ✅ 100% coverage
│   ├── QuickBooksAPIService.cls                ✅ 88% coverage
│   └── QuickBooksInvoker.cls                   ✅ 84% coverage
├── triggers/
│   └── OpportunityQuickBooksTrigger.trigger    ✅ 92% coverage
└── objects/
    └── Opportunity/fields/
        ├── QB_Invoice_ID__c.field              ✅ Deployed
        └── QB_Last_Sync_Date__c.field          ✅ Deployed
```

### **Additional Resources**
```
/Users/m/git/clients/qbsf/
├── QuickBooksInvoiceControllerExtraTest.cls    ✅ Deployed
├── deployment-package/                         📦 Additional classes
├── disabled-tests/                            🚫 Removed broken components
└── 50822/                                     📚 Original project files
```

## 🚨 Known Issues & Solutions

### **Fixed Issues** ✅
1. **API Key Mismatch**: Found correct key in Russian instructions
2. **Compilation Errors**: Missing QuickBooksAPIService class deployed
3. **Test Failures**: Broken Invoice Generation package dependencies removed
4. **Authentication**: Middleware now responds correctly

### **Current Blocker** ❌
**QBInvoiceIntegrationQueueable Testing**: 
- **Issue**: Test bypass prevents HTTP logic coverage
- **Impact**: ~15% of total org coverage missing
- **Solution**: Modify test approach to allow HTTP mocking

## 🎯 Salesforce Deployment Requirements

### **Production Criteria (2025)**
- **Test Coverage**: ≥75% org-wide aggregate
- **Test Pass Rate**: 100% (no failures allowed)
- **Trigger Coverage**: Every trigger must have >0% coverage
- **Deployment Validation**: Must pass before production deploy

### **Verification Commands**
```bash
# Check coverage
sf apex run test --code-coverage --synchronous -o sanboxsf

# Validate deployment  
sf project deploy validate --source-dir force-app/main/default/ --test-level RunLocalTests -o sanboxsf

# Test API connectivity
curl -H "X-API-Key: $API_KEY" https://sqint.atocomm.eu/api/health
```

## 🔄 Integration Flow

### **Trigger Flow (Working)**
1. User changes Opportunity stage → "Proposal and Agreement"
2. OpportunityQuickBooksTrigger fires (after update)
3. QBInvoiceIntegrationQueueable queued for async processing
4. Queueable calls middleware with opportunity data
5. Middleware creates QuickBooks invoice
6. QB Invoice ID returned and stored in QB_Invoice_ID__c field

### **Business Logic**
- **Supplier Filter**: Only US suppliers (`Account.Type__c = 'Поставщик' AND Account.Country__c = 'US'`)
- **Stage Trigger**: "Proposal and Agreement" stage change
- **Data Mapping**: Opportunity → QB Invoice, Account → QB Customer

## 💡 Patterns & Conventions

### **Testing Patterns**
- Use Test.setMock(HttpCalloutMock.class, mockInstance) for HTTP calls
- Test both success and error scenarios
- Validate field updates and error logging
- Use @testSetup for data preparation

### **Error Handling**
- Log errors to QB_Integration_Error_Log__c
- Continue processing other records on individual failures  
- Use try-catch around HTTP callouts
- Debug statements for troubleshooting

### **Apex Conventions**
- Use Database.AllowsCallouts for HTTP operations
- Implement Queueable for async processing
- Handle bulk operations (list of opportunities)
- Test-aware code with appropriate mocking

## 📋 Next Agent Success Checklist

- [ ] Read context priming prompt first
- [ ] Verify current 54% coverage baseline
- [ ] Focus on QBInvoiceIntegrationQueueable fix
- [ ] Achieve 75%+ org-wide coverage
- [ ] Pass deployment validation
- [ ] Document verification steps
- [ ] Only then approve 30,000 RUB payment