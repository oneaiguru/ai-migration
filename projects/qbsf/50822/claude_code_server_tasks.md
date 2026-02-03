# 🤖 CLAUDE CODE SERVER ASSESSMENT TASKS

## 📋 IMMEDIATE SERVER CHECKS NEEDED

Please execute these tasks and document results:

### ✅ TASK 1: Check Current Server Status
```bash
ssh roman@pve.atocomm.eu -p2323
cd /opt/qb-integration
pwd
ls -la
ps aux | grep node
```
**Document**: What's running? Is server active?

---

### ✅ TASK 2: Check Current Configuration
```bash
cd /opt/qb-integration
cat .env | grep -E "(SF_|QB_)"
cat tokens.json
```
**Document**: Are OAuth credentials configured? What endpoints?

---

### ✅ TASK 3: Check Server Logs
```bash
cd /opt/qb-integration
tail -50 server.log
# Or find other log files:
find . -name "*.log" -exec tail -20 {} \;
```
**Document**: Any recent errors? What's happening when Roman tests?

---

### ✅ TASK 4: Test API Endpoints
```bash
curl -s https://sqint.atocomm.eu/api/health
curl -s https://sqint.atocomm.eu/auth/salesforce
curl -s https://sqint.atocomm.eu/auth/quickbooks
```
**Document**: Are endpoints responding? Any OAuth errors?

---

### ✅ TASK 5: Check OAuth Configuration
Look for these in QuickBooks/Salesforce apps:
- Redirect URIs should include: https://sqint.atocomm.eu/auth/salesforce/callback
- Redirect URIs should include: https://sqint.atocomm.eu/auth/quickbooks/callback

**Document**: Are redirect URIs properly configured in external apps?

---

### ✅ TASK 6: Check Integration Logic
```bash
cd /opt/qb-integration/src
ls -la
cat routes/api.js | head -50
cat services/salesforce-api.js | head -30
```
**Document**: What does the integration logic expect? Invoice vs Opportunity?

---

### ✅ TASK 7: Test Webhook Endpoint
```bash
curl -X POST https://sqint.atocomm.eu/api/opportunity-to-invoice \
  -H "Content-Type: application/json" \
  -H "X-API-Key: qb-sf-integration-api-key-2024" \
  -d '{"opportunityId":"test123","accountName":"TEST","amount":1000}'
```
**Document**: Does webhook endpoint respond correctly?

---

### ✅ TASK 8: Check Dependencies
```bash
cd /opt/qb-integration
npm list --depth=0
node -e "console.log('Node version:', process.version)"
```
**Document**: Are all dependencies installed? Node version?

---

## 📝 RESULTS TEMPLATE

Create **CLAUDE_CODE_SERVER_FINDINGS.md** with:

```markdown
# 🤖 CLAUDE CODE SERVER ASSESSMENT RESULTS

## ✅ TASK 1 - Server Status:
- Server running: [Yes/No]
- Process: [describe what's running]
- Working directory: [path]

## ✅ TASK 2 - Configuration:
- SF credentials: [configured/missing]
- QB credentials: [configured/missing]  
- Endpoints: [list what you found]

## ✅ TASK 3 - Server Logs:
- Recent errors: [describe]
- Integration attempts: [what you see]

## ✅ TASK 4 - API Endpoints:
- /api/health: [response]
- /auth/salesforce: [response]
- /auth/quickbooks: [response]

## ✅ TASK 5 - OAuth Status:
- Redirect URIs configured: [Yes/No]
- Issues found: [describe]

## ✅ TASK 6 - Integration Logic:
- Expecting: [Invoice/Opportunity/Both]
- Current code: [describe what you found]

## ✅ TASK 7 - Webhook Test:
- Response: [what happened]
- Errors: [any issues]

## ✅ TASK 8 - Dependencies:
- All installed: [Yes/No]
- Node version: [version]
- Missing packages: [list any]

## 🚨 CRITICAL ISSUES FOUND:
[List any blocking issues]

## 🎯 RECOMMENDED NEXT STEPS:
[What needs to be fixed first]
```

## 🔄 COORDINATION

After completing these checks:
1. Compare your findings with SAFARI_SF_FINDINGS.md
2. Identify gaps between server expectations and SF configuration
3. Create specific fix plans for any issues found
4. Update CURRENT_SITUATION_ASSESSMENT.md with complete picture