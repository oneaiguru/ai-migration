# 🔑 CRITICAL CONFIGURATIONS - Next Agent Reference

## 🔐 WORKING API KEY (DO NOT CHANGE)
```
UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=
```

## 🌐 WORKING ENDPOINTS
```
Middleware: https://sqint.atocomm.eu
Health Check: curl -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" https://sqint.atocomm.eu/api/health
Expected Response: {"success":true,"status":"healthy","timestamp":"..."}
```

## 📊 SALESFORCE SETTINGS
```sql
-- QB_Integration_Settings__c record ID: a0nSo000002xKO9IAM
UPDATE QB_Integration_Settings__c 
SET API_Key__c = 'UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=',
    Middleware_Endpoint__c = 'https://sqint.atocomm.eu',
    QB_Realm_ID__c = '9341454378379755'
WHERE Id = 'a0nSo000002xKO9IAM';

-- QuickBooks_Settings__c record ID: a0oSo00000DvP8gIAF  
UPDATE QuickBooks_Settings__c
SET API_Key__c = 'UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=',
    Middleware_URL__c = 'https://sqint.atocomm.eu'
WHERE Id = 'a0oSo00000DvP8gIAF';
```

## 🔧 SF CLI COMMANDS THAT WORK
```bash
# Test coverage (current: 52%)
sf apex run test --code-coverage --synchronous -o sanboxsf

# Deploy single class
sf project deploy start --source-dir force-app/main/default/classes/ClassName.cls -o sanboxsf

# Deployment validation  
sf project deploy validate --source-dir force-app/main/default/ --test-level RunLocalTests -o sanboxsf

# Check metadata
sf org list metadata -m ApexClass -o sanboxsf | grep QuickBooks
```

## ⚠️ WHAT NOT TO TOUCH
```
❌ disabled-tests/ folder (removed components)
❌ API key values (working correctly)
❌ OpportunityQuickBooksTrigger.trigger (100% coverage)
❌ Authentication settings (already working)
```

## 📁 EXACT FILE PATHS FOR EDITING
```
Main test to improve:
/Users/m/git/clients/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls

Target class being tested:
/Users/m/git/clients/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls

Additional test file to check:
/Users/m/git/clients/qbsf/QuickBooksInvoiceControllerExtraTest.cls

Project root:
/Users/m/git/clients/qbsf/
```

## 🎯 CURRENT COVERAGE BREAKDOWN
```
OpportunityQuickBooksTrigger   100% ✅ (don't touch)
QuickBooksInvoiceController     90% ✅ (good enough)  
QuickBooksInvoker              84% ✅ (good enough)
QuickBooksAPIService           83% ✅ (good enough)
QBInvoiceIntegrationQueueable   20% ❌ (NEEDS WORK)
```

## 🚨 SUCCESS CRITERIA CHECKLIST
- [ ] Org-wide coverage ≥ 75%
- [ ] All tests passing (100% pass rate)
- [ ] Deployment validation successful
- [ ] End-to-end test working
- [ ] API key authentication working (already ✅)

**Time Needed**: 1-2 hours focused work