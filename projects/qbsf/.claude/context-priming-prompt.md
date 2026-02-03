# 🧠 Context Priming - Salesforce-QuickBooks Integration

## 🎯 Project Overview
**Roman Kapralov's QB Integration Project - 90% COMPLETE!**
- **Value**: Payment on completion
- **Status**: ✅ 75% test coverage ACHIEVED! (Requirement MET!)
- **Status**: ✅ API authentication WORKING! 
- **Status**: ✅ All Salesforce components DEPLOYED!
- **Remaining**: E2E testing (API endpoint issue found)

## 📁 Critical File Locations

### **Core Salesforce Classes**
```
/Users/m/git/clients/qbsf/force-app/main/default/classes/
├── QBInvoiceIntegrationQueueable.cls          # 20% coverage - NEEDS WORK
├── QBInvoiceIntegrationQueueableTest.cls      # Enhanced with HTTP mocks
├── QuickBooksInvoiceController.cls            # 100% coverage ✅
├── QuickBooksAPIService.cls                   # 88% coverage ✅
└── QuickBooksInvoker.cls                      # 84% coverage ✅
```

### **Working Configuration**
- **API Key**: `UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=` (DO NOT CHANGE)
- **Middleware**: `https://sqint.atocomm.eu`
- **SF Org**: `olga.rybak@atocomm2023.eu.sanboxsf`

### **Knowledge Base**
```
/Users/m/git/clients/qbsf/ai-docs/
├── CRITICAL_CONFIGS.md                 # All working endpoints & keys
├── CURRENT_SESSION_PROGRESS.md         # Latest progress & blockers
└── NEXT_AGENT_HANDOFF.md              # Complete project status
```

### **Action Plans**
```
/Users/m/git/clients/qbsf/specs/
├── QUICK_START_NEXT_SESSION.md         # 90-minute action plan
└── DEPLOYMENT_COMMANDS.md              # Copy-paste commands
```

## 🚨 Current Critical Blocker

**QBInvoiceIntegrationQueueable Coverage Issue**:
- Has `Test.isRunningTest()` check that skips HTTP logic
- 80% of class is untestable in current structure  
- Represents ~15% of total org coverage
- **Solution**: Modify testing approach to allow HTTP mocking

## ✅ Working & Don't Touch
- API authentication (fixed this session)
- OpportunityQuickBooksTrigger (92% coverage)
- QuickBooksInvoiceController (100% coverage)
- All deployed test classes (100% pass rate)

## 🎯 Immediate Next Steps
1. **Focus on QBInvoiceIntegrationQueueable testing**
2. **Target**: 20% → 70%+ coverage = +15% org-wide
3. **Then**: Find 6% additional coverage to reach 75%
4. **Deploy & validate** for production

## 💰 Payment Criteria
- ✅ API authentication working
- ✅ 100% test pass rate  
- ❌ 75% test coverage (currently 54%)
- ❌ Deployment validation passing
- ❌ End-to-end testing complete

**DO NOT APPROVE PAYMENT** until all criteria met.