# 🎯 CLAUDE CODE PROJECT BRIEFING
## Salesforce-QuickBooks Integration - Final Deployment

### 📋 PROJECT STATUS
- **Client:** Roman Kapralov (Russian)
- **Payment:** 30,000 RUB on successful completion
- **Deadline:** This week (urgent)
- **Current Status:** 95% complete, needs final fixes and deployment

### 🚨 CRITICAL ISSUES TO FIX

From Roman's latest screenshots (July 10, 2025):

1. **Missing Express Module:**
   ```
   Error: Cannot find module 'express'
   ```

2. **Wrong Salesforce URL in .env:**
   ```
   SF_LOGIN_URL=https://olga-rybak-atocomm2023-eu.my.salesforce.com
   ```
   **SHOULD BE:**
   ```
   SF_LOGIN_URL=https://customer-inspiration-2543.my.salesforce.com
   ```

3. **Connection Errors:**
   - Cannot run payment check: Missing connection to Salesforce or QuickBooks
   - Need proper OAuth setup

### 🎯 DEPLOYMENT TARGET
- **Server:** roman@pve.atocomm.eu -p2323
- **Password:** $SSH_PASS  
- **Path:** /opt/qb-integration/
- **Domain:** https://sqint.atocomm.eu

### 📁 LOCAL PROJECT STRUCTURE
- **Source:** `/Users/m/git/clients/qbsf/deployment/sf-qb-integration-final/`
- **Contains:** Complete Node.js middleware application
- **Status:** Developed and tested locally

### 🔧 REQUIRED FIXES
1. Install missing npm dependencies (express, etc.)
2. Fix Salesforce URL in .env file  
3. Configure proper OAuth credentials
4. Test full integration flow
5. Verify Salesforce trigger is working

### 💰 SUCCESS CRITERIA
- Opportunity stage change → QuickBooks invoice creation
- Payment in QuickBooks → Salesforce opportunity update  
- Full end-to-end test successful
- Roman approves and pays 30,000 RUB

### 📞 COMMUNICATION
- All updates via file artifacts (no direct communication)
- Create status reports in markdown files
- Roman reads files and provides feedback via Telegram

### ⚡ URGENCY LEVEL: MAXIMUM
Roman has been waiting since July. He's ready to pay someone else if not completed this week.