# Context Primer for Salesforce-QuickBooks Integration

You are working on an urgent Salesforce-QuickBooks integration project for Roman Kapralov, a Russian client who will pay 30,000 RUB upon successful completion. The project is 95% complete but has critical configuration issues on the production server that need immediate fixing.

## Current Situation
- Integration deployed to https://sqint.atocomm.eu but not working
- Wrong Salesforce URL in configuration (using olga-rybak-atocomm2023-eu instead of customer-inspiration-2543)
- Missing OAuth connections causing "Cannot run payment check" errors
- Roman has been waiting since July 2025 and is ready to pay someone else if not completed this week

## Your Primary Tasks
1. Fix server configuration issues (wrong URLs, missing OAuth)
2. Ensure correct server is running (src/server.js not simple-server.js)
3. Deploy and test the complete integration
4. Document everything for Roman's approval

## Key Resources
- **CLAUDE.md** - Complete project documentation and instructions
- **AI Docs/** - API references and integration patterns
- **Specs/** - Deployment and testing specifications
- **deployment/sf-qb-integration-final/** - Production-ready code

## Critical Information
- Server: roman@pve.atocomm.eu -p2323 (password: $SSH_PASS)
- Salesforce: customer-inspiration-2543.my.salesforce.com
- Path: /opt/qb-integration/
- API Key: qb-sf-integration-api-key-2024

## Communication Rules
- Create .md files for all updates (PROGRESS.md, ISSUES.md, etc.)
- No direct messaging - everything via files
- Roman reads files and provides feedback

Start by reading CLAUDE.md for complete project details.