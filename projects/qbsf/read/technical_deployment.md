# 🔧 Technical Deployment Guide - Working Baseline

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **Research-Based Decision:**
Based on 2024-2025 industry analysis, deploying the working baseline aligns with current best practices:
- ✅ Direct Opportunity → QuickBooks integration (no intermediate objects)
- ✅ Minimal dependencies (standard objects + custom fields)
- ✅ Proven architecture from working codebase
- ✅ Foundation for future MuleSoft/third-party upgrade

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Validate Working Baseline**
```bash
cd /Users/m/git/clients/qbsf/deployment/sf-qb-integration-final

# Check components
ls -la force-app/main/default/classes/
ls -la force-app/main/default/triggers/

# Validate before deployment
sf project deploy validate --source-dir force-app --target-org olga.rybak@atocomm2023.eu
```

### **Step 2: Deploy Core Components**
```bash
# Deploy the working baseline (should have minimal dependencies)
sf project deploy start --source-dir force-app --target-org olga.rybak@atocomm2023.eu --wait 10

# Check deployment status
sf project deploy report --target-org olga.rybak@atocomm2023.eu
```

### **Step 3: Create Required Custom Fields**
```bash
# If custom fields don't exist, create them via workbench or manual deployment
# Required fields based on working baseline code:
# - Opportunity.QB_Invoice_ID__c (Text, External ID)
# - Opportunity.QB_Last_Sync_Date__c (DateTime)
# - QB_Integration_Settings__c (Custom Setting)
```

### **Step 4: Configure Custom Settings**
```apex
// Run in Developer Console Anonymous Apex
QB_Integration_Settings__c settings = new QB_Integration_Settings__c(
    Name = 'Default',
    Middleware_Endpoint__c = 'https://sqint.atocomm.eu',
    API_Key__c = 'your-api-key-here',
    QB_Realm_ID__c = 'quickbooks-realm-id'
);
insert settings;
```

### **Step 5: Test the Integration**
```apex
// Test script in Developer Console
// Create test opportunity
Account testAccount = new Account(
    Name = 'Test US Supplier',
    Account_Type__c = 'Поставщик',
    Country__c = 'US'
);
insert testAccount;

Opportunity testOpp = new Opportunity(
    Name = 'Test QB Integration',
    AccountId = testAccount.Id,
    StageName = 'Prospecting',
    CloseDate = Date.today().addDays(30),
    Amount = 1000
);
insert testOpp;

// Trigger integration by changing stage
testOpp.StageName = 'Proposal and Agreement';
update testOpp;

// Check if queueable job was enqueued
System.debug('Test opportunity created: ' + testOpp.Id);
```

---

## 🔍 **COMPARISON: WORKING VS FAILED APPROACH**

### **Working Baseline Architecture:**
```
Opportunity (Standard Object)
├── Stage Change → "Proposal and Agreement"
├── QBInvoiceIntegrationQueueable (Simple)
├── Direct API Call to Middleware
└── Update Opportunity.QB_Invoice_ID__c
```
**Dependencies**: 1 class, 1 trigger, 2-3 custom fields

### **Failed Complex Architecture:**  
```
Opportunity → SF Invoice Creation → QB Sync
├── QB_Invoice__c (Custom Object)
├── QB_Invoice_Line_Item__c (Custom Object) 
├── QB_Integration_Log__c (Custom Object)
├── QB_Integration_Error_Log__c (Custom Object)
├── Multiple Apex Classes (5+)
└── Complex Test Coverage Requirements
```
**Dependencies**: 4+ custom objects, 8+ classes, 145 compilation errors

---

## 🏗️ **INFRASTRUCTURE SETUP**

### **Middleware Deployment:**
```bash
# SSH to production server
ssh roman@pve.atocomm.eu -p2323

# Navigate to application directory
cd /path/to/sf-qb-integration

# Check if Node.js app exists and is configured
ls -la
cat package.json

# Install dependencies and start
npm install
npm start

# Verify endpoint is accessible
curl -k https://sqint.atocomm.eu/api/health
```

### **Environment Variables:**
```bash
# Ensure these are configured
SALESFORCE_CLIENT_ID=your_sf_client_id
SALESFORCE_CLIENT_SECRET=your_sf_client_secret
QUICKBOOKS_CLIENT_ID=your_qb_client_id  
QUICKBOOKS_CLIENT_SECRET=your_qb_client_secret
API_KEY=your_api_key
PORT=3000
```

---

## ✅ **VALIDATION CHECKLIST**

### **Salesforce Components:**
- [ ] `OpportunityQuickBooksTrigger` deployed successfully
- [ ] `QBInvoiceIntegrationQueueable` class deployed
- [ ] Custom fields created on Opportunity object
- [ ] `QB_Integration_Settings__c` custom setting configured
- [ ] No compilation errors in Developer Console

### **Middleware Service:**
- [ ] Node.js application running on port 3000
- [ ] nginx reverse proxy configured (443 → 3000)  
- [ ] SSL certificate working (https://sqint.atocomm.eu)
- [ ] Health endpoint responds correctly
- [ ] OAuth tokens configured for SF and QB

### **End-to-End Test:**
- [ ] Create opportunity with US supplier
- [ ] Change stage to "Proposal and Agreement"
- [ ] Verify queueable job executes
- [ ] Check middleware logs for API calls
- [ ] Confirm QB invoice created
- [ ] Verify opportunity updated with QB ID

---

## 🚨 **TROUBLESHOOTING GUIDE**

### **Common Issues & Solutions:**

#### **1. Missing Custom Fields:**
```bash
# Check if fields exist
sf data query --query "SELECT QualifiedApiName FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = 'Opportunity' AND QualifiedApiName LIKE '%QB_%'" --target-org olga.rybak@atocomm2023.eu
```

#### **2. Queueable Job Not Executing:**
```apex
// Check debug logs in Developer Console
// Verify trigger is active and criteria are met
System.debug('Opportunity stage: ' + trigger.new[0].StageName);
```

#### **3. Middleware Connection Issues:**
```bash
# Check middleware logs
tail -f middleware.log

# Test direct connection
curl -X POST https://sqint.atocomm.eu/api/opportunity-to-invoice \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"opportunityId":"test"}'
```

#### **4. QuickBooks Authentication:**
```bash
# Verify QB OAuth tokens in middleware
# Check token expiration and refresh logic
curl https://sqint.atocomm.eu/api/auth/quickbooks/status
```

---

## 📊 **SUCCESS METRICS**

### **Deployment Success Indicators:**
- ✅ Zero compilation errors in Salesforce
- ✅ Trigger executes on stage change
- ✅ Queueable jobs complete successfully  
- ✅ Middleware responds to API calls
- ✅ QB invoices created for test opportunities
- ✅ Error handling works correctly

### **Performance Benchmarks:**
- **Stage Change → QB Invoice**: < 5 minutes
- **API Response Time**: < 30 seconds
- **Error Rate**: < 1% of processed records
- **System Availability**: 99.9% uptime

---

## 🔄 **POST-DEPLOYMENT TASKS**

### **Immediate (Next 30 minutes):**
1. **Test with Roman's data** - Use real opportunity
2. **Monitor first QB invoice creation**
3. **Verify payment monitoring works**
4. **Document any issues found**

### **Within 24 hours:**
1. **Send success confirmation to Roman**
2. **Request final payment (30,000 RUB)**  
3. **Provide basic user documentation**
4. **Schedule follow-up for modern upgrade discussion**

### **Future Enhancement Planning:**
1. **Present MuleSoft Composer option**
2. **Evaluate Breadwinner for easier maintenance**
3. **Plan migration strategy if client interested**
4. **Focus on business value vs technical complexity**

---

## 💡 **KEY ADVANTAGES OF THIS APPROACH**

### **Immediate Benefits:**
- ✅ **Fast Deployment**: 2 hours vs 6+ hours for complex approach
- ✅ **Low Risk**: Proven working codebase  
- ✅ **Minimal Dependencies**: Standard objects + few custom fields
- ✅ **Budget Friendly**: Fits 50K RUB constraint

### **Strategic Benefits:**
- ✅ **2024-2025 Aligned**: Direct integration matches modern trends
- ✅ **Upgrade Path**: Foundation for MuleSoft/third-party migration
- ✅ **Client Satisfaction**: Working solution delivered on time
- ✅ **Business Focus**: Enables revenue generation vs technical debt

---

**EXECUTION COMMAND:**
```bash
# Start deployment now
cd /Users/m/git/clients/qbsf/deployment/sf-qb-integration-final
sf project deploy start --source-dir force-app --target-org olga.rybak@atocomm2023.eu
```