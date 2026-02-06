# 🚀 CLAUDE CODE STARTING PROMPT

## 📁 STARTING FOLDER
```
/Users/m/git/clients/qbsf/
```

## 🎯 INITIAL PROMPT FOR CLAUDE CODE

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
- Password: $SSH_PASS
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

## 📋 FOLDER STRUCTURE TO CREATE

Claude Code should create these files during work:

```
/Users/m/git/clients/qbsf/
├── CLAUDE_CODE_PROJECT_BRIEFING.md     ✅ (provided)
├── DEPLOYMENT_PLAN.md                  ✅ (provided)  
├── CONFIGURATION_FIXES.md              ✅ (provided)
├── PROGRESS.md                         📝 (Claude Code creates)
├── ASSESSMENT.md                       📝 (Claude Code creates)
├── ISSUES.md                           📝 (Claude Code creates if needed)
├── DEPLOYMENT_LOG.md                   📝 (Claude Code creates)
├── TESTING_RESULTS.md                  📝 (Claude Code creates)
└── COMPLETION_REPORT.md                📝 (Claude Code creates)
```

## 🔄 WORKFLOW COMMUNICATION

1. **Start:** Claude Code reads briefing files
2. **Assess:** Creates ASSESSMENT.md with current state
3. **Deploy:** Updates PROGRESS.md with each step
4. **Test:** Documents results in TESTING_RESULTS.md  
5. **Complete:** Creates COMPLETION_REPORT.md for Roman

## 📊 SUCCESS INDICATORS

Look for these in final reports:
- ✅ No Express module errors
- ✅ Correct Salesforce URL configured
- ✅ OAuth tokens working
- ✅ Test opportunity → QB invoice working
- ✅ Payment sync working
- ✅ Roman ready to approve payment