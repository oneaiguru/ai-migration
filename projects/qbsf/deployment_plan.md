# 🚀 DEPLOYMENT PLAN - Salesforce-QuickBooks Integration

## 📋 PHASE 1: SERVER ASSESSMENT & FIXES

### 1.1 Connect and Assess Current State
```bash
ssh roman@pve.atocomm.eu -p2323
cd /opt/qb-integration
ls -la
cat .env
npm list --depth=0
```

### 1.2 Install Missing Dependencies
```bash
cd /opt/qb-integration
npm install express
npm install  # Install all package.json dependencies
```

### 1.3 Fix Configuration Issues
Update `/opt/qb-integration/.env`:
```bash
# CRITICAL FIXES NEEDED:
SF_LOGIN_URL=https://customer-inspiration-2543.my.salesforce.com
# Not: https://olga-rybak-atocomm2023-eu.my.salesforce.com

# Add missing OAuth credentials (to be configured):
SF_CLIENT_ID=3MVG9G9I4cWPcCGqvCp3n0I0x2xEuLT3QtAYB.kHqw4AZdJQSbNsGPx.xJYGZvPdD5QEr1.qGCqvCp3n
SF_CLIENT_SECRET=1234567890ABCDEF1234567890ABCDEF12345678901234567890ABCDEF123456
QB_CLIENT_ID=Q0123456789012345678901234567890123456789
QB_CLIENT_SECRET=abcdef1234567890abcdef1234567890abcdef12
```

## 📋 PHASE 2: SALESFORCE INTEGRATION TESTING

### 2.1 Verify Salesforce Configuration
- Org: customer-inspiration-2543.my.salesforce.com
- User: olga.rybak@atocomm2023.eu
- Password: 0mj3DqPv28Dp2
- Check Opportunity triggers are deployed

### 2.2 Test Opportunity → Invoice Flow
1. Create test Opportunity
2. Change stage to "Proposal and Agreement"  
3. Verify QB_Invoice_ID__c gets populated
4. Check middleware logs for success

## 📋 PHASE 3: QUICKBOOKS INTEGRATION

### 3.1 Production OAuth Setup
- Use "Middleware" app (not "SF Integration 20...")
- Complete compliance requirements
- Get production credentials

### 3.2 Test Invoice Creation
1. Verify QB API connectivity
2. Test invoice creation endpoint
3. Confirm customer/invoice data transfer

## 📋 PHASE 4: END-TO-END TESTING

### 4.1 Full Integration Test
1. Create Salesforce Opportunity
2. Trigger invoice creation (stage change)
3. Verify QuickBooks invoice exists
4. Mark payment in QuickBooks
5. Verify Salesforce update

### 4.2 Production Validation
- Test with real data
- Verify performance
- Check error handling
- Document any issues

## 📋 PHASE 5: DELIVERY

### 5.1 Documentation
- Create deployment summary
- Document configuration
- Provide troubleshooting guide

### 5.2 Handoff to Roman
- Demonstrate working integration
- Provide admin instructions
- Collect 30,000 RUB payment

## ⚠️ CRITICAL SUCCESS FACTORS

1. **Correct Salesforce Org:** customer-inspiration-2543.my.salesforce.com
2. **Missing Dependencies:** npm install all required modules
3. **OAuth Credentials:** Proper QB production keys needed
4. **Real Testing:** Must work with actual Roman's data
5. **Performance:** Sub-60 second response times

## 🚨 FAILURE RISKS

- Using wrong Salesforce org URL
- Missing npm dependencies 
- Incorrect OAuth setup
- Network/firewall issues
- QuickBooks sandbox vs production confusion

## 📊 SUCCESS METRICS

- ✅ Express module error resolved
- ✅ Salesforce connection working
- ✅ QuickBooks invoice creation working  
- ✅ Full end-to-end test successful
- ✅ Roman approves and pays 30,000 RUB