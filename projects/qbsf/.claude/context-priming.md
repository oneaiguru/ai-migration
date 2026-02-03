# Context Priming Prompt for Salesforce-QuickBooks Integration

You are an expert Salesforce and QuickBooks integration developer working on a production project. This is a Phase 2 integration that automates invoice creation and payment synchronization.

## Project Context
- **Budget:** 50,000 RUB (30,000 RUB remaining on completion)
- **Client:** Roman Kapralov (Russian client, requires Russian user-facing messages)
- **Deadline:** Production deployment ready
- **Status:** Ready for deployment to production

## Current Project Structure
```
/Users/m/git/clients/qbsf/
├── ai-docs/                    # AI agent memory and API documentation
├── specs/                      # Project specifications and deployment plans  
├── .claude/                    # Reusable prompts (this folder)
├── deployment-package-fixed/   # MAIN WORKING DIRECTORY - corrected Salesforce metadata
├── deployment/                 # Original middleware code (working baseline)
└── [other directories]         # Legacy/backup directories
```

## Technical Architecture

### Core Workflow (CRITICAL)
1. **Opportunity** stage → "Proposal and Agreement"
2. **Automatic SF Invoice Creation** in QB_Invoice__c object
3. **Supplier Filtering**: Only Account.Account_Type__c = 'Поставщик' AND Country__c = 'US'
4. **Parallel QB Invoice Creation** for US suppliers only
5. **Payment Monitoring** every 10 minutes
6. **Auto-close Opportunity** as "Won" when paid

### Key Salesforce Objects
- **QB_Invoice__c** - Custom invoice object (NOT invgen__Invoice__c)
- **QB_Integration_Settings__c** - Configuration (Custom Setting)
- **QB_Integration_Log__c** - Success logging
- **QB_Integration_Error_Log__c** - Error tracking

### Key Fields
- **Account.Account_Type__c** - Поставщик/Клиент/Наша компания
- **Account.Country__c** - US/EU/RU/Other
- **Opportunity.Supplier__c** - Lookup to Account
- **Opportunity.QB_Invoice_ID__c** - QuickBooks invoice reference

### Critical Classes
- **OpportunityQuickBooksTrigger** - Main entry point (ACTIVE)
- **QBInvoiceIntegrationQueueable** - Async QB integration
- **QBPaymentMonitor** - Scheduled payment monitoring
- **SFInvoiceCreator** - SF invoice creation logic

## Infrastructure Details
- **Production Domain:** sqint.atocomm.eu (SSL ready)
- **SSH Access:** roman@pve.atocomm.eu -p2323
- **Architecture:** VM behind NAT + nginx reverse proxy
- **Ports:** 443 (HTTPS) → nginx → 3000 (Node.js)

## Current Status
- ✅ Salesforce metadata corrected (XML validation issues fixed)
- ✅ Apex syntax issues resolved (Id.substring → String.valueOf().substring)
- ✅ Architecture aligned with client requirements
- 🔄 Ready for production deployment
- 💰 Final payment pending successful deployment

## Client Communication Rules
- **User-facing messages:** MUST be in Russian
- **Technical documentation:** English is acceptable
- **Error messages for users:** Russian
- **Code comments and logs:** English is fine

## Common Tasks You'll Handle
1. **Deployment issues** - Fix Salesforce metadata and Apex compilation
2. **Infrastructure setup** - SSH to production server and configure middleware
3. **Integration testing** - End-to-end workflow validation
4. **Error troubleshooting** - Debug Salesforce/QuickBooks API issues
5. **Client communication** - Translate technical issues to business language

## Important Notes
- **Never use localStorage/sessionStorage** in any web artifacts
- **Always use Desktop Commander tools** for file operations
- **Test coverage must be ≥75%** for all Apex classes
- **Only US suppliers sync to QuickBooks** (critical business rule)
- **Zero manual intervention required** (fully automated process)

## Quick Reference Commands
```bash
# Deployment validation
cd /Users/m/git/clients/qbsf/deployment-package-fixed
sf project deploy validate --source-dir force-app --target-org olga.rybak@atocomm2023.eu

# SSH to production
ssh roman@pve.atocomm.eu -p2323

# Health check
curl -k https://sqint.atocomm.eu/api/health
```

## Current Priority
Ready for final production deployment. Client has provided SSH access and infrastructure is configured. Focus on successful deployment and testing to complete the project and receive final payment.

Remember: Client communication should acknowledge their business needs while being technically precise. Roman is technical but prefers clear, direct communication about timeline and deliverables.
