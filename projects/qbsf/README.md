# Salesforce-QuickBooks Integration Project

## AI-Optimized Codebase Structure

This project follows **IndyDevDan's best practices** for AI coding tools with 3 essential folders that enable AI agents to understand and work with the codebase effectively.

## 📁 Project Structure

```
/Users/m/git/clients/qbsf/
├── 🧠 ai-docs/                    # AI Agent Memory
│   ├── salesforce-api-reference.md     # SF objects, fields, SOQL queries
│   ├── quickbooks-api-reference.md     # QB API v3 endpoints, auth, mappings
│   └── middleware-architecture.md      # Node.js app structure, security
├── 📋 specs/                      # AI Coding Plans  
│   ├── integration-specification.md    # Complete project requirements
│   └── deployment-specification.md     # Production deployment plan
├── 🔧 .claude/                    # Reusable Prompts
│   ├── context-priming.md             # PRIMARY: Context for AI agents
│   ├── deployment-commands.md          # Common commands and scripts
│   └── client-communication.md         # Russian client response templates
├── 🚀 deployment-package-fixed/   # MAIN WORKING DIRECTORY
│   └── force-app/main/default/         # Corrected Salesforce metadata
└── 📦 deployment/                 # Original working middleware code
```

## 🎯 Quick Start for AI Agents

### 1. Context Priming (ESSENTIAL)
Always start by reading: `.claude/context-priming.md`
This gives you complete project context, current status, and critical business rules.

### 2. Technical Reference
For API details and architecture: `ai-docs/` folder
- Salesforce objects and fields
- QuickBooks API integration points  
- Middleware security and infrastructure

### 3. Project Planning
For specifications and deployment: `specs/` folder
- Complete business requirements
- Technical architecture decisions
- Step-by-step deployment procedures

### 4. Common Tasks
For commands and responses: `.claude/` folder
- Ready-to-use deployment commands
- Client communication templates in Russian
- Troubleshooting procedures

## Ralph Loop Quick Start
1. Read `PROJECT_BRIEF.md`, `PROMPT_plan.md`, and `PROMPT_build.md`.
2. Plan loop: `./loop.sh plan 1`
3. Build loop: `./loop.sh 1`
4. Follow `docs/SOP/loop_start.md` and `docs/Tasks/README.md` for role flow.

## 🚀 Current Project Status

**Phase:** Ready for Production Deployment
**Budget:** 50,000 RUB (30,000 RUB remaining on completion)
**Infrastructure:** SSH access ready - roman@pve.atocomm.eu -p2323
**Domain:** sqint.atocomm.eu (SSL configured)

## 🎯 Core Business Logic

### Automated Workflow
1. **Opportunity** stage → "Proposal and Agreement"
2. **Auto-create SF Invoice** in QB_Invoice__c object  
3. **Filter US Suppliers** only (Account.Account_Type__c = 'Поставщик' AND Country__c = 'US')
4. **Create QB Invoice** parallel for US suppliers
5. **Monitor Payments** every 10 minutes automatically
6. **Close Opportunity** as "Won" when paid

### Key Integration Points
- **Salesforce Trigger:** OpportunityQuickBooksTrigger  
- **Async Processing:** QBInvoiceIntegrationQueueable
- **Middleware API:** https://sqint.atocomm.eu/api/opportunity-to-invoice
- **Payment Monitor:** QBPaymentMonitor (scheduled every 10 min)

## 🛠️ AI Agent Instructions

### For Development Tasks
1. **Read context priming first** - `.claude/context-priming.md`
2. **Check current status** - Files in `deployment-package-fixed/`
3. **Reference APIs** - Documentation in `ai-docs/`
4. **Follow deployment plan** - `specs/deployment-specification.md`

### For Client Communication
1. **Use Russian for user-facing messages** (templates in `.claude/client-communication.md`)
2. **Technical documentation can be English**
3. **Always acknowledge business impact**
4. **Provide clear timelines and next steps**

### For Troubleshooting
1. **Check logs first** - `.claude/deployment-commands.md` has monitoring commands
2. **Validate Salesforce** - Use validation commands before deployment
3. **Test integration flow** - End-to-end test procedures documented
4. **Monitor health endpoints** - https://sqint.atocomm.eu/api/health

## 🔧 Development Environment

### Required Tools
- **Salesforce CLI** (v2.87.7+) - `sf` commands (not legacy `sfdx`)
- **Node.js 18+** - For middleware development
- **SSH Client** - Access to production VM
- **Desktop Commander** - For file operations (preferred tool)

### Key Commands
```bash
# Salesforce deployment validation
cd /Users/m/git/clients/qbsf/deployment-package-fixed
sf project deploy validate --source-dir force-app --target-org olga.rybak@atocomm2023.eu

# SSH to production  
ssh roman@pve.atocomm.eu -p2323

# Health check
curl -k https://sqint.atocomm.eu/api/health
```

## 🎯 Success Criteria

### Technical Acceptance
- [ ] Salesforce deploys without errors (75%+ test coverage)
- [ ] Middleware runs on sqint.atocomm.eu with SSL
- [ ] OAuth connections work (SF + QB)
- [ ] Health endpoint returns 200 OK
- [ ] End-to-end test: Opportunity → QB Invoice works

### Business Acceptance  
- [ ] Zero manual intervention required
- [ ] Only US suppliers sync to QuickBooks
- [ ] Payment monitoring works automatically
- [ ] Opportunities close automatically when paid
- [ ] Error logging and monitoring functional

## 📞 Client Information

**Roman Kapralov** - Russian client, technical background
- Prefers direct, clear communication
- Requires Russian for user-facing content
- Has provided SSH access and infrastructure  
- Ready to pay final 30,000 RUB on successful deployment

## 🚨 Critical Notes

1. **Client Communication:** Always use Russian for user-facing messages
2. **Architecture:** VM behind NAT + nginx reverse proxy (this is GOOD)
3. **Supplier Filtering:** ONLY US suppliers go to QuickBooks (critical business rule)
4. **Zero Manual Work:** Complete automation required
5. **Test Coverage:** Must maintain 75%+ for all Apex classes

## 🎉 Project Completion

When deployment succeeds:
1. ✅ Integration works end-to-end
2. ✅ Documentation delivered  
3. ✅ Client acceptance confirmed
4. 💰 Final payment 30,000 RUB received

---

**This structure enables any AI agent to quickly understand the project context and execute tasks effectively. The ai-docs/ folder serves as persistent memory, specs/ contains comprehensive plans, and .claude/ provides reusable workflows.**
