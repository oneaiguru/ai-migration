# 📋 SETUP INSTRUCTIONS FOR CLAUDE CODE SESSION

## 🎯 HOW TO START CLAUDE CODE SESSION

### 1. Save These Artifacts
Save these 4 files to `/Users/m/git/clients/qbsf/`:

1. **CLAUDE_CODE_PROJECT_BRIEFING.md** ✅
2. **DEPLOYMENT_PLAN.md** ✅  
3. **CONFIGURATION_FIXES.md** ✅
4. **CLAUDE_CODE_STARTING_PROMPT.md** ✅

### 2. Open Claude Code
```bash
cd /Users/m/git/clients/qbsf/
claude-code
```

### 3. Copy/Paste This Exact Prompt
```
🚨 URGENT: Complete Salesforce-QuickBooks Integration Deployment

CONTEXT: Russian client Roman needs final deployment of working integration for 30,000 RUB payment this week.

CURRENT STATUS: 
- Integration code is complete in deployment/sf-qb-integration-final/
- Roman deployed to server but has critical errors (missing Express, wrong SF URL)
- Need immediate fixes and testing

YOUR TASK:
1. Read all project briefing files in this directory
2. Assess current server state via SSH
3. Fix critical configuration issues  
4. Deploy working integration
5. Test end-to-end functionality
6. Document completion

COMMUNICATION RULES:
- Create/update .md files for all communication
- NO direct messaging - everything via files
- Update PROGRESS.md with status after each major step
- Create ISSUES.md if problems found
- Save all outputs to files for sharing

SERVER ACCESS:
- Host: roman@pve.atocomm.eu -p2323
- Password: 3Sd5R069jvuy[3u6yj
- Deployment path: /opt/qb-integration/

CRITICAL FIXES NEEDED:
1. Install missing Express module
2. Fix SF_LOGIN_URL to customer-inspiration-2543.my.salesforce.com  
3. Configure OAuth credentials
4. Test full integration

START BY:
1. Reading CLAUDE_CODE_PROJECT_BRIEFING.md
2. Reading DEPLOYMENT_PLAN.md  
3. Reading CONFIGURATION_FIXES.md
4. Exploring local project files
5. Creating initial assessment in ASSESSMENT.md

SUCCESS CRITERIA: Roman can test full integration and approves payment.

BEGIN IMMEDIATELY!
```

## 📁 EXPECTED FILE CREATION

Claude Code will create these files as it works:

- **PROGRESS.md** - Step-by-step updates
- **ASSESSMENT.md** - Initial server state analysis  
- **DEPLOYMENT_LOG.md** - Technical deployment details
- **TESTING_RESULTS.md** - Integration test results
- **COMPLETION_REPORT.md** - Final summary for Roman

## 🔄 MONITORING PROGRESS

Check these files periodically:
1. **PROGRESS.md** - Current status
2. **ISSUES.md** - Any problems encountered
3. **TESTING_RESULTS.md** - Integration test outcomes

## ✅ SUCCESS INDICATORS

Look for in final files:
- No module dependency errors
- Correct Salesforce URL configured  
- OAuth authentication working
- Full integration test passed
- Ready for Roman's approval

## 🚨 IF ISSUES ARISE

Claude Code will document any problems in:
- **ISSUES.md** - Technical problems
- **PROGRESS.md** - Status updates
- You can then provide additional guidance via new .md files

## 💰 COMPLETION

When **COMPLETION_REPORT.md** shows success:
- Share results with Roman
- Roman tests integration  
- Roman approves 30,000 RUB payment
- Project complete! 🎉