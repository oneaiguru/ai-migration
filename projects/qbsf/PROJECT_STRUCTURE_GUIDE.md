# Project Structure Guide - Salesforce-QuickBooks Integration

## 🎯 Overview
This project has been organized following AI Agent Memory Principles to maximize effectiveness when working with Claude Code or other AI assistants. The structure provides persistent memory, clear specifications, and reusable context for efficient development and deployment.

## 📁 Folder Structure

```
/Users/m/git/clients/qbsf/
├── CLAUDE.md                    # 🧠 Master project documentation
├── PROJECT_STRUCTURE_GUIDE.md   # 📋 This file
├── AI Docs/                     # 📚 Third-party API documentation & patterns
│   ├── salesforce-api-reference.md
│   ├── quickbooks-api-reference.md
│   └── integration-patterns.md
├── Specs/                       # 📝 Deployment and testing specifications
│   ├── deployment-spec.md
│   └── testing-spec.md
├── .claude/                     # 🤖 Reusable prompts and context
│   ├── context-primer.md
│   ├── deployment-quick-reference.md
│   └── troubleshooting-guide.md
├── deployment/                  # 💻 Production code
│   └── sf-qb-integration-final/
├── force-app/                   # ☁️ Salesforce components
└── final-integration/           # 🔧 Current middleware (needs update)
```

## 📖 How to Use This Structure

### Starting a New Session
1. **Always start by reading `CLAUDE.md`** - Contains all critical project information
2. **Use `.claude/context-primer.md`** - Quick context for any AI assistant
3. **Reference specific docs as needed** - API docs, specs, troubleshooting

### For Deployment
1. **Follow `Specs/deployment-spec.md`** - Step-by-step deployment guide
2. **Use `.claude/deployment-quick-reference.md`** - Quick command reference
3. **Check `CLAUDE.md`** - For credentials and server details

### For Testing
1. **Follow `Specs/testing-spec.md`** - Comprehensive test cases
2. **Use test data templates** - Pre-configured in testing spec
3. **Document results** - Create TESTING_RESULTS.md

### For Troubleshooting
1. **Check `.claude/troubleshooting-guide.md`** - Common issues and solutions
2. **Reference error patterns** - Documented with exact fixes
3. **Create ISSUES.md** - If new problems arise

## 🚨 Critical Information

### Urgent Status
- **Client**: Roman Kapralov (Russian)
- **Payment**: 30,000 RUB on completion
- **Deadline**: THIS WEEK
- **Current Issues**: Wrong SF URL, missing OAuth, wrong server running

### Quick Fixes Needed
```bash
# 1. Fix Salesforce URL
sed -i 's|olga-rybak-atocomm2023-eu|customer-inspiration-2543|g' /opt/qb-integration/.env

# 2. Start correct server
cd /opt/qb-integration
pkill -f node
node src/server.js
```

### Server Access
```bash
ssh roman@pve.atocomm.eu -p2323
# Password: $SSH_PASS
```

## 💡 Best Practices

### When Working with AI Assistants
1. **Provide context** - Point to CLAUDE.md first
2. **Be specific** - Reference exact files and sections
3. **Use templates** - Leverage pre-written specs and guides
4. **Document changes** - Update relevant .md files

### Communication with Roman
- **All updates via .md files** - No direct messaging
- **Create status reports**:
  - PROGRESS.md - Current status
  - ISSUES.md - Problems found
  - TESTING_RESULTS.md - Test outcomes
  - COMPLETION_REPORT.md - Final summary

### Code Changes
1. **Production code** → `deployment/sf-qb-integration-final/`
2. **Salesforce components** → `force-app/main/default/`
3. **Live middleware** → `/opt/qb-integration/` (on server)

## 🎯 Next Steps

### Immediate Actions
1. ✅ Project structure organized
2. ⏳ Deploy fixes to production server
3. ⏳ Configure OAuth credentials
4. ⏳ Test end-to-end integration
5. ⏳ Get Roman's approval
6. ⏳ Receive payment

### To Deploy Now
```bash
# Quick deployment command sequence
ssh roman@pve.atocomm.eu -p2323
cd /opt/qb-integration
# Fix configuration as per CLAUDE.md
# Start server with PM2
# Test integration
```

## 📞 Support

If you need help:
1. Read the documentation in this structure
2. Check troubleshooting guide
3. Create detailed ISSUES.md file
4. Reference specific error messages and logs

---
*Project organized using AI Agent Memory Principles*
*Ready for immediate deployment and testing*