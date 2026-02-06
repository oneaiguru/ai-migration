# Contents of /ignore Folder

**Added to .gitignore on Dec 6, 2025 - CONTAINS SENSITIVE DATA**

This folder was provided by the user and contains:
1. QB/SF credentials and token files
2. Roman Kapralov's communications (Telegram messages)
3. Configuration templates
4. Deployment archives

## Folder Structure

### 1. qb-sf-credentials-package/
**Contains**: QB/SF credentials, tokens, deployment data

**Key Files**:
- `sf-credentials.markdown` - **IN RUSSIAN** - Instructions for configuring QB credentials on server
  - How to SSH to Roman's server
  - How to edit `/opt/qb-integration/.env`
  - Which fields need QB production credentials
  - How to restart the server

- `deployment-data/tokens.json` - QB/SF OAuth tokens
- `final-integration-data/tokens.json` - Backup of OAuth tokens
- `.env.backup` - Backup of environment configuration
- `qb-integration-deployment.tar.gz` - Zipped deployment package

**Critical Info**:
- Server SSH: `ssh roman@pve.atocomm.eu -p2323`
- Password: `$SSH_PASS`
- QB credentials needed in: `/opt/qb-integration/.env`

### 2. qb-sf-shareable-package/
**Contains**: Public-safe documentation (no actual secrets)

**Key Files**:
- `CREDENTIALS_OVERVIEW_FOR_AGENT.md` - **Maps credential locations** (variable names only, not secrets)
  - Documents all env vars used (.env on server)
  - Shows where each credential is used in code
  - Lists Salesforce custom settings objects
  - Explains token storage

- `sf-deploy/README.md` - Deployment instructions
- `sf-deploy/sfdx-project.json` - SFDX project config
- `sf-deploy/FINAL_STEPS.md` - Manual steps needed:
  - Create Quick Action in Salesforce
  - Add to Page Layout
  - Create Remote Site Setting
  - Test the integration

### 3. qb-sf-communication-package/
**Contains**: Roman Kapralov's Telegram messages (conversations with Misha Granin)

**Files**: 2.markdown through 99.markdown (message logs)

**Key Context from Messages**:
- **Sep 4, 2025**: Roman approved and paid 30,000 RUB for initial integration
- **Nov 7, 2025**: Roman requested payment link feature
- **Nov 20, 2025**: Roman blocked by broken integration (invoice ID stopped returning)
- **Nov 20+**: Roman confirmed:
  - Do NOT touch partial payment logic yet
  - Only add payment link feature now
  - Integration was working since Sept (no code changes)
  - Something broke around Nov 19-20
- **Dec 1, 2025**: Issue confirmed - "Номер не возвращает теперь" (Invoice number not returning)
- **Dec 3, 2025**: Roman expects delivery "сегодня" (today)

**Critical Quote from Roman** (Dec 1, 2025):
> "у нас перестала работать интеграция. Номер не возвращает теперь. Проверь завтра. У нас на неделе показ"
>
> Translation: "Integration stopped working. Invoice number isn't returning now. Check tomorrow. We have a demo this week"

## What This Tells Us About Current Status

### Phase 0 Blockers (Now Clear)
1. **SF CLI token expired**
   - Need interactive browser login
   - Run: `sf org login web --alias sanboxsf --set-default`

2. **Middleware returning 502**
   - QB credentials NOT configured in `/opt/qb-integration/.env`
   - Need to SSH to server and update:
     - `QB_CLIENT_ID` (production)
     - `QB_CLIENT_SECRET` (production)
     - `QB_ENVIRONMENT` (change to: production)
   - Then restart: `node src/server.js`

### Working Configuration (From CREDENTIALS_OVERVIEW_FOR_AGENT.md)
- API Key: In `QB_Integration_Settings__c` custom setting in SF
- Middleware URL: `https://sqint.atocomm.eu`
- QB Realm ID: Stored in custom settings
- Token storage: `/opt/qb-integration/data/tokens.json` on server

### Test Coverage Issue (From Message Dec 1)
Roman's deployment failed with:
- **Code Coverage**: 20% (need 75%)
- **Test Failure**: "REQUIRED_FIELD_MISSING: [Supplierc]"
- This is exactly what we're fixing in Phase 1!

## How to Proceed

### Immediate (Phase 0)
1. ✅ Read credentials overview (DONE - now understanding credential structure)
2. Need QB production credentials to configure middleware
3. Need to login to SF CLI interactively

### Next (Phase 1)
Deploy from `deployment-package-fixed/` which has:
- Correct Account fields (Account_Type__c, Country__c)
- Correct test setup with these fields populated
- This will fix the "REQUIRED_FIELD_MISSING: [Supplierc]" error

### Then (Phase 2)
Add payment link feature using instructions in plan

## Why This Folder Exists

User said: "See this to get working credentials using a task"
- This folder contains the **actual working configuration**
- Shows what's needed to get integration running
- Contains historical context (Roman's messages)
- Provides deployment archives and backups

---

**Added to .gitignore**: `ignore/` - This prevents accidental commit of credentials/tokens/private communications
