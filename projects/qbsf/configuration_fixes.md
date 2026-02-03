# 🔧 CONFIGURATION FIXES REQUIRED

## 🚨 IMMEDIATE FIXES NEEDED

Based on Roman's error screenshots from July 10, 2025:

### 1. Missing Express Module Error
```
Error: Cannot find module 'express'
Require stack:
/opt/qb-integration/src/app.js
/opt/qb-integration/src/server.js
```

**FIX:**
```bash
cd /opt/qb-integration
npm install express
npm install  # Install all dependencies from package.json
```

### 2. Wrong Salesforce URL
**CURRENT (WRONG):**
```
SF_LOGIN_URL=https://olga-rybak-atocomm2023-eu.my.salesforce.com
```

**SHOULD BE:**
```
SF_LOGIN_URL=https://customer-inspiration-2543.my.salesforce.com
```

### 3. Connection Errors
From logs: "Cannot run payment check: Missing connection to Salesforce or QuickBooks"

**ROOT CAUSE:** Missing or invalid OAuth credentials

## 📝 COMPLETE .env FILE TEMPLATE

```bash
# Server Configuration
PORT=3000
NODE_ENV=production
MIDDLEWARE_BASE_URL=https://sqint.atocomm.eu

# Salesforce Configuration - CORRECTED URLs
SF_CLIENT_ID=TO_BE_CONFIGURED
SF_CLIENT_SECRET=TO_BE_CONFIGURED
SF_REDIRECT_URI=https://sqint.atocomm.eu/auth/salesforce/callback
SF_LOGIN_URL=https://customer-inspiration-2543.my.salesforce.com
SF_INSTANCE_URL=https://customer-inspiration-2543.my.salesforce.com

# QuickBooks Configuration  
QB_CLIENT_ID=TO_BE_CONFIGURED
QB_CLIENT_SECRET=TO_BE_CONFIGURED
QB_REDIRECT_URI=https://sqint.atocomm.eu/auth/quickbooks/callback
QB_ENVIRONMENT=production

# Security
API_KEY=qb-sf-integration-api-key-2024
TOKEN_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Scheduler (5-minute intervals)
INVOICE_CREATION_CRON=*/5 * * * *
PAYMENT_CHECK_CRON=*/5 * * * *
```

## 🔑 OAUTH CREDENTIALS SETUP

### Salesforce Connected App
1. **Access:** https://customer-inspiration-2543.my.salesforce.com
2. **Login:** olga.rybak@atocomm2023.eu / 0mj3DqPv28Dp2
3. **Setup → App Manager → New Connected App**
4. **Callback URL:** https://sqint.atocomm.eu/auth/salesforce/callback

### QuickBooks Production App
1. **Use:** "Middleware" app (AppID: a64d511c...)
2. **Complete:** Compliance requirements (EULA/Privacy)
3. **Get:** Production Client ID & Secret
4. **Set:** QB_ENVIRONMENT=production

## 📦 DEPENDENCY VERIFICATION

Check these are installed in `/opt/qb-integration/`:

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "axios": "^1.0.0",
    "dotenv": "^16.0.0",
    "node-cron": "^3.0.0",
    "crypto": "^1.0.1"
  }
}
```

## 🔍 VERIFICATION COMMANDS

After fixes, verify with:

```bash
# 1. Check dependencies
cd /opt/qb-integration
npm list --depth=0

# 2. Test server startup
node src/server.js

# 3. Check API endpoints
curl https://sqint.atocomm.eu/api/health

# 4. Check logs for errors
tail -f server.log
```

## ⚡ EXPECTED RESULTS

After fixes:
- ✅ No module errors on startup
- ✅ "Server running on port 3000 in production mode"
- ✅ Successful Salesforce API connection test
- ✅ QuickBooks OAuth flow working
- ✅ Scheduled jobs starting successfully