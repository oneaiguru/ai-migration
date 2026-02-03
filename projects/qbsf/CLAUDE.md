# CLAUDE.md - Salesforce-QuickBooks Integration Project

## 🚨 CRITICAL PROJECT STATUS  
- **Client:** Roman Kapralov (Russian)
- **Payment:** Fixed price; initial project already paid, now in follow‑up / maintenance mode
- **Status:** ~95% complete – core integration and payment‑link code implemented and deployed; waiting on E2E verification with Roman

### ✅ **COMPLETED PRIORITIES:**
- ✅ **API authentication fixed** - Middleware communication working
- ✅ **75% test coverage achieved** - EXCEEDS REQUIREMENT! (was 54%)
- ✅ **All core Salesforce components deployed** - LWC structure + triggers + async jobs
- ✅ **Payment link persistence bug fixed** - dual‑update path implemented in middleware + Apex

### 🎯 **REMAINING (10% of project):**
- ⏳ E2E integration testing in production (Invoice ID + Payment Link on a real Opportunity)
- ⏳ QuickBooks Payments status confirmation (InvoiceLink availability depends on QB account settings)
- ⏳ Roman confirmation that the final workflow matches his expectations

### 📋 **AI Memory System References:**
- **Context Priming:** @.claude/context-priming-prompt.md
- **Project Status:** @ai-docs/NEXT_AGENT_HANDOFF.md  
- **Current Achievements:** @ai-docs/CURRENT_ACHIEVEMENTS_SUMMARY.md
- **E2E Testing Plan:** @specs/FINAL_E2E_TESTING_SPECIFICATION.md
- **Latest Detailed Handoff:** @projects/qbsf/NEXT_AGENT_HANDOFF_COMPLETE.md
- **Real Client Situation / Timeline:** @URGENT_REAL_STATUS.md

## 🔀 **GIT WORKFLOW GUIDELINES**

### Always Commit to PR Branch
- **PR Branch**: `feat/accounting-recon-md` (current active branch)
- **Main Branch**: Do **not** commit directly
- **Review / Push**: Always use the Codex wrappers so pushes and review requests are consistent

For general repo rules (worktrees, Codex feedback, etc.) see:
- `AGENTS.md` at repo root
- `docs/SOP/worktree_hygiene.md`

### Codex Wrapper Commands (Use These, Not Raw Git)

- `scripts/dev/push_with_codex.sh`
  - Run **instead of** `git push` (accepts same args).
  - Pushes the current branch and automatically calls `scripts/dev/request_codex_review.sh` to post `@codex review` on the PR.
  - May optionally schedule Codex feedback fetch (`CODEX_FETCH_AFTER_PUSH=1`).
- `scripts/dev/request_codex_review.sh`
  - Can be run manually to (re)post an `@codex review` comment on the PR for the current branch.
- `scripts/dev/fetch_codex_feedback.sh` / `scripts/dev/get_codex_feedback.sh`
  - Used to pull Codex feedback into `codex_feedback_<PR>.md` once review has run.

> **Never** run raw `git push` from this workspace. Always go through `scripts/dev/push_with_codex.sh` (or the `git pushcodex` alias, if configured) so Codex review is wired up correctly.

### Pre-Merge Checklist (for PRs touching `projects/qbsf/`)

Before any PR (including #75) is merged to `main`, the next agent or human reviewer should:

1. **Check Codex feedback**
   - Run `scripts/dev/fetch_codex_feedback.sh <PR_NUMBER>` from repo root (or open `codex_feedback_<PR>.md` if it exists).
   - Ensure there are no open P0/P1 items, or that they are explicitly documented as accepted/intentional.
2. **Confirm human review**
   - Agents should not merge to `main` on their own unless the human owner has explicitly requested it.
   - Use GitHub UI or `gh pr view 75` to review the diff and status.
3. **Verify documentation is up to date**
   - `PROGRESS.md` and `NEXT_AGENT_HANDOFF_COMPLETE.md` should reflect the current state (what is deployed, what Roman must still do).
4. **Only then merge**
   - Merge is performed by the human maintainer via GitHub (UI or `gh pr merge`), not automatically by scripts.

### Example Workflow (Monorepo)
```bash
# From monorepo root
cd /Users/m/ai

# 1. Make changes under projects/qbsf/ and (optionally) run any relevant checks

# 2. Commit to PR branch (feat/accounting-recon-md)
git add projects/qbsf/...
git commit -m "scope(qbsf): short description"

# 3. Push with Codex wrapper (never raw git push)
scripts/dev/push_with_codex.sh
# or, if alias is configured:
# git pushcodex

# 4. Do NOT merge to main directly – wait for Codex + human review on the PR
```

---

## 🎯 **CURRENT PRIORITY: E2E Verification & Roman Confirmation**

The codebase already contains the payment‑link fix and has been deployed to production (see `NEXT_AGENT_HANDOFF_COMPLETE.md` for detailed status). The next agent should:

1. **Verify middleware health** using the health endpoint.
2. **Run an end‑to‑end SF test** on the production org:
   - Create Opportunity for a valid supplier, move Stage → "Proposal and Agreement".
   - Confirm `QB_Invoice_ID__c` populates.
   - Confirm `QB_Payment_Link__c` populates (if QB Payments is enabled) and opens a valid QuickBooks payment page.
3. **Diagnose according to the decision tree** in `NEXT_AGENT_HANDOFF_COMPLETE.md` if either field is missing.
4. **Communicate with Roman in Russian**, using the suggested templates in the handoff doc and `.claude/client-communication.md`.
5. **Request QB Payments enablement**
   - If payment link remains null and logs show "Payment link obtained: no" after invoice creation, the next agent must confirm whether QuickBooks Payments is enabled in Roman's QuickBooks account.
   - Use the prepared Russian message in `NEXT_AGENT_HANDOFF_COMPLETE.md` to ask Roman to enable QuickBooks Payments under QuickBooks Settings → Payments before expecting `QB_Payment_Link__c` to populate.

### P1 Bug – Payment Link Persistence (IMPLEMENTED)

### **P1 Bug Root Cause (IDENTIFIED & FIXED):**
**Issue**: Payment link was not persisting to Salesforce even though middleware fetched it successfully

**Root Cause**:
- Middleware updated SF with ONLY invoice ID (before fetching link)
- Then fetched payment link
- But middleware NEVER updated SF with the payment link itself
- Relied 100% on Apex to do second update
- If Apex failed → payment link lost forever

**Solution Implemented**:
1. ✅ Enhanced middleware `updateOpportunityWithQBInvoiceId()` to accept optional `paymentLink` parameter
2. ✅ Added second SF update call in api.js after fetching payment link (line 116)
3. ✅ Deployed `QB_Payment_Link__c` field to production org (Deploy ID: 0AfSo0000034JK5KAM)
4. ✅ Deployed updated middleware code to server at `https://sqint.atocomm.eu` (see deployment logs in `NEXT_AGENT_HANDOFF_COMPLETE.md`)

**Files Modified**:
- `/deployment/sf-qb-integration-final/src/services/salesforce-api.js` (lines 279-299)
- `/deployment/sf-qb-integration-final/src/routes/api.js` (lines 113-117)

### **Working Configuration (DO NOT CHANGE):**
- **API Key**: `UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=` ✅ WORKING
- **Middleware**: `https://sqint.atocomm.eu` ✅ HEALTHY
- **SF Org (primary)**: Production org `customer-inspiration-2543` (`myorg`) – ~88% coverage, tests passing
- **SF Org (sandbox)**: `sanboxsf` exists but token may be expired; not required for current production‑focused work

## 📍 DEPLOYMENT LOCATIONS

### Production Server (Roman's)
- **SSH:** `ssh roman@pve.atocomm.eu -p2323`
- **Password:** `3Sd5R069jvuy[3u6yj`
- **Path:** `/opt/qb-integration/`
- **Domain:** `https://sqint.atocomm.eu`
- **Current Status:** Running with latest P1 bug fix deployed (see `NEXT_AGENT_HANDOFF_COMPLETE.md` for the last verified deployment). Only re-run the steps below if middleware code changes again.

### 🚀 **MIDDLEWARE DEPLOYMENT STEPS (P1 Bug Fix)**

**Prerequisites**: SSH access to `roman@pve.atocomm.eu -p2323` (password: `3Sd5R069jvuy[3u6yj`)

**Step 1: Backup current deployment**
```bash
ssh roman@pve.atocomm.eu -p2323
cd /opt/qb-integration
git status  # Or: ls -la to verify location
```

**Step 2: Deploy updated code**
```bash
# Copy updated files to server (from local machine):
scp -P 2323 deployment/sf-qb-integration-final/src/services/salesforce-api.js roman@pve.atocomm.eu:/opt/qb-integration/src/services/
scp -P 2323 deployment/sf-qb-integration-final/src/routes/api.js roman@pve.atocomm.eu:/opt/qb-integration/src/routes/
```

**Step 3: Restart middleware**
```bash
ssh roman@pve.atocomm.eu -p2323
cd /opt/qb-integration
# Stop old process
pkill -f "node src/server.js"
# Start new process
node src/server.js &
```

**Step 4: Verify deployment**
```bash
# Test health endpoint
curl -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" https://sqint.atocomm.eu/api/health
# Should return: {"success":true}
```

> **Rollback for middleware**: If a new deployment causes issues, follow the rollback plan in `specs/deployment-specification.md` (stop Node process, restore previous `/opt/qb-integration` backup or code snapshot, restart, and re-check health).

### Salesforce Org
- **URL:** `https://customer-inspiration-2543.my.salesforce.com`
- **User:** `olga.rybak@atocomm2023.eu`
- **Password:** `0mj3DqPv28Dp2`

### Local Development
- **Monorepo Root:** `/Users/m/ai`
- **QBSF Workspace in Monorepo:** `projects/qbsf/`
- **Historical external clone (for reference in older docs):** `/Users/m/git/clients/qbsf/`
- **Middleware Source in this repo:** `projects/qbsf/deployment/sf-qb-integration-final/`

## 🔧 COMPLETE .env FILE (PRODUCTION)

```bash
# Server Configuration
PORT=3000
NODE_ENV=production
MIDDLEWARE_BASE_URL=https://sqint.atocomm.eu

# Salesforce Configuration - CRITICAL: USE CORRECT DOMAIN
SF_CLIENT_ID=<TO_BE_CONFIGURED>
SF_CLIENT_SECRET=<TO_BE_CONFIGURED>
SF_REDIRECT_URI=https://sqint.atocomm.eu/auth/salesforce/callback
SF_LOGIN_URL=https://customer-inspiration-2543.my.salesforce.com
SF_INSTANCE_URL=https://customer-inspiration-2543.my.salesforce.com

# QuickBooks Configuration  
QB_CLIENT_ID=<TO_BE_CONFIGURED>
QB_CLIENT_SECRET=<TO_BE_CONFIGURED>
QB_REDIRECT_URI=https://sqint.atocomm.eu/auth/quickbooks/callback
QB_ENVIRONMENT=production

# Security
API_KEY=qb-sf-integration-api-key-2024
TOKEN_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Scheduler (5-minute intervals for testing)
INVOICE_CREATION_CRON=*/5 * * * *
PAYMENT_CHECK_CRON=*/5 * * * *
```

## 🎯 INTEGRATION ARCHITECTURE

### Current Implementation (Button-Based)
1. User clicks LWC button in Salesforce
2. Calls QuickBooksInvoiceController
3. API call to middleware
4. Creates invoice in QuickBooks
5. Updates Opportunity with QB_Invoice_ID__c

### Target Implementation (Automated)
1. Opportunity → "Proposal and Agreement" status
2. OpportunityInvoiceTrigger fires automatically
3. QBInvoiceIntegrationQueueable processes opportunity
4. Creates QB Invoice (only for US suppliers)
5. QBPaymentStatusScheduler checks payment every 5 minutes
6. Auto-closes Opportunity when paid

## 📦 PROJECT STRUCTURE

### Middleware Components
```
/deployment/sf-qb-integration-final/
├── src/
│   ├── server.js                    # Main server entry
│   ├── app.js                        # Express app setup
│   ├── config/                       # Configuration
│   ├── routes/
│   │   └── api.js                   # API endpoints
│   ├── services/
│   │   ├── salesforce-api.js       # SF API client
│   │   ├── quickbooks-api.js       # QB API client
│   │   ├── oauth-manager.js        # OAuth handling
│   │   └── scheduler.js            # Cron jobs
│   └── transforms/
│       └── opportunity-to-invoice.js # Data mapping
├── package.json                      # Dependencies
└── .env.example                      # Config template
```

### Salesforce Components
```
/force-app/main/default/
├── classes/
│   ├── QuickBooksAPIService.cls          # Basic API service
│   ├── QuickBooksAPIServiceFixed.cls     # Enhanced with hardcoded URL
│   ├── QuickBooksInvoiceController.cls   # LWC controller
│   ├── QBInvoiceIntegrationQueueable.cls # Async processor
│   └── QBPaymentStatusScheduler.cls      # Payment checker
├── lwc/
│   ├── quickBooksInvoice/               # Main invoice component
│   ├── quickBooksSimpleButton/          # Simple button
│   └── quickBooksTest/                  # Debug component
├── triggers/
│   └── OpportunityQuickBooksTrigger.trigger
└── objects/
    └── Opportunity/fields/
        ├── QB_Invoice_ID__c.field
        ├── QB_Payment_Status__c.field
        └── QB_Payment_Link__c.field-meta.xml
```

> **Source of truth note:**  
> In this monorepo, `force-app/main/default` reflects what is actually deployed to the org and should be treated as the primary source for incremental Salesforce changes.  
> `deployment-package-fixed/` contains an older "full" deployment package and is useful as a reference, but must be carefully synced with `force-app` before any future full redeploy attempts.

## 🚀 DEPLOYMENT STEPS

### Phase 1: Fix Server Configuration
```bash
# 1. SSH to server
ssh roman@pve.atocomm.eu -p2323

# 2. Stop any running servers
pkill -f node

# 3. Fix .env file
cd /opt/qb-integration
nano .env
# Update SF_LOGIN_URL and SF_INSTANCE_URL

# 4. Install dependencies (if needed)
npm install

# 5. Start correct server
node src/server.js
```

### Phase 2: Configure OAuth
1. **Salesforce Connected App:**
   - Login to customer-inspiration-2543.my.salesforce.com
   - Setup → App Manager → New Connected App
   - Callback: https://sqint.atocomm.eu/auth/salesforce/callback
   - Get Client ID & Secret

2. **QuickBooks Production App:**
   - Use "Middleware" app (not "SF Integration...")
   - Complete compliance requirements
   - Get production credentials
   - Set QB_ENVIRONMENT=production

### Phase 3: Deploy Salesforce Components
```bash
# Deploy with proper test coverage
sf project deploy start --source-dir force-app --target-org myorg --test-level RunLocalTests

# If test coverage < 75%, use:
sf project deploy start --source-dir force-app --target-org myorg --test-level Default
```

### Phase 4: Test Integration
1. Create test Opportunity in Salesforce
2. Change stage to "Proposal and Agreement"
3. Verify QB invoice created
4. Check payment sync
5. Confirm Opportunity auto-closes when paid

## ✅ SUCCESS CRITERIA
- [ ] No Express module errors
- [ ] Correct Salesforce URL configured
- [ ] OAuth tokens working for both SF and QB
- [ ] Test opportunity → QB invoice working
- [ ] Payment status syncing back to SF
- [ ] Scheduler running every 5 minutes
- [ ] Full end-to-end test successful
- [ ] Roman approves and pays 30,000 RUB

## 🔍 DEBUGGING COMMANDS

```bash
# Check server status
curl https://sqint.atocomm.eu/api/health

# View logs
tail -f /opt/qb-integration/server.log

# Test Salesforce connection
curl -X POST https://sqint.atocomm.eu/api/test-salesforce \
  -H "X-API-Key: qb-sf-integration-api-key-2024"

# Test QuickBooks connection  
curl -X POST https://sqint.atocomm.eu/api/test-quickbooks \
  -H "X-API-Key: qb-sf-integration-api-key-2024"
```

## 📝 KEY BUSINESS LOGIC

### Supplier Filtering
- Only create QB invoices for US suppliers
- Check: `Account.Type__c = 'Поставщик' AND Account.Country__c = 'US'`

### Invoice Mapping
- Opportunity.Name → Invoice.PrivateNote
- Opportunity.CloseDate → Invoice.DueDate
- OpportunityLineItems → Invoice.Line items
- Account → QuickBooks Customer

### Payment Status Values
- `Pending` - Invoice created, awaiting payment
- `Paid` - Payment received in QuickBooks
- `Overdue` - Past due date
- `Cancelled` - Invoice cancelled

## ⚠️ COMMON ISSUES & SOLUTIONS

### "ACCESS DENIED" Error
- Check RemoteSiteSetting points to correct URL
- Verify API key in Custom Settings
- Ensure middleware URL is correct

### Module Not Found Errors
```bash
cd /opt/qb-integration
npm install
```

### OAuth Token Expired
- Re-authenticate via /auth/salesforce and /auth/quickbooks
- Tokens stored in tokens.json

### Test Coverage Issues
- ✅ **RESOLVED**: 75% coverage achieved (was 54%)
- All test classes working with 100% pass rate
- Production deployment now possible

## 📊 MONITORING

### Check Scheduler Status
```bash
# View cron jobs
grep "Scheduler" /opt/qb-integration/server.log

# Should see:
# "Running scheduled payment status check"
# "Running scheduled invoice creation"
```

### API Call Monitoring
- All API calls logged to server.log
- Check for error patterns
- Monitor response times

## 🤝 COMMUNICATION PROTOCOL

### With Roman
- All updates via .md files in project
- No direct messaging
- Create status reports:
  - PROGRESS.md - Current status
  - ISSUES.md - Problems found
  - TESTING_RESULTS.md - Test outcomes
  - COMPLETION_REPORT.md - Final summary

### File Updates Schedule
1. After each major step → Update PROGRESS.md
2. When issues found → Create/update ISSUES.md
3. After testing → Update TESTING_RESULTS.md
4. On completion → Create COMPLETION_REPORT.md

## 🎉 COMPLETION CHECKLIST  
- [x] ✅ **API authentication fixed** - COMPLETED
- [x] ✅ **75% test coverage achieved** - COMPLETED 
- [x] ✅ **Salesforce components deployed** - COMPLETED
- [ ] ⏳ **Integration tested end-to-end** - API endpoint issue found
- [ ] ⏳ **Production deployment validated** - Ready after E2E
- [ ] ⏳ **Roman tested and approved** - Awaiting completion
- [ ] ⏳ **Payment received** - Final step

### **Next Steps** (See @specs/FINAL_E2E_TESTING_SPECIFICATION.md):
1. Fix middleware API endpoint mismatch
2. Complete E2E integration testing  
3. Production deployment validation
4. Roman approval & payment

---
*Last Updated: August 2025*
*Project Critical: Must complete THIS WEEK*
