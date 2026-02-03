# 📦 DEPLOYMENT PACKAGE INSTRUCTIONS

**Package**: `qb-integration-deployment.tar.gz`  
**Contains**: Complete production-ready QuickBooks-Salesforce integration  
**For**: Roman Kapralov / Admin  

---

## 🚀 DEPLOYMENT INSTRUCTIONS

### Option 1: Direct Deployment (Recommended)

```bash
# 1. Upload package to server
scp -P 2323 qb-integration-deployment.tar.gz roman@pve.atocomm.eu:/tmp/

# 2. SSH to server
ssh roman@pve.atocomm.eu -p2323

# 3. Backup current installation
cp -r /opt/qb-integration /opt/qb-integration.backup.$(date +%Y%m%d)

# 4. Extract new version
cd /opt/qb-integration
tar -xzf /tmp/qb-integration-deployment.tar.gz

# 5. Fix configuration
sed -i 's|olga-rybak-atocomm2023-eu|customer-inspiration-2543|g' .env
echo "SF_INSTANCE_URL=https://customer-inspiration-2543.my.salesforce.com" >> .env

# 6. Install dependencies
npm install

# 7. Start server
pkill -f node
NODE_ENV=production node src/server.js
```

### Option 2: Complete Replacement

```bash
# 1. Stop current server
pkill -f node

# 2. Backup and replace
mv /opt/qb-integration /opt/qb-integration.old
mkdir /opt/qb-integration
cd /opt/qb-integration

# 3. Extract package
tar -xzf /path/to/qb-integration-deployment.tar.gz

# 4. Create .env file with correct settings
cat > .env << 'EOF'
# Server Configuration
PORT=3000
NODE_ENV=production
MIDDLEWARE_BASE_URL=https://sqint.atocomm.eu

# Salesforce Configuration - FIXED URLs
SF_CLIENT_ID=YOUR_SF_CLIENT_ID
SF_CLIENT_SECRET=YOUR_SF_CLIENT_SECRET
SF_REDIRECT_URI=https://sqint.atocomm.eu/auth/salesforce/callback
SF_LOGIN_URL=https://customer-inspiration-2543.my.salesforce.com
SF_INSTANCE_URL=https://customer-inspiration-2543.my.salesforce.com

# QuickBooks Configuration  
QB_CLIENT_ID=YOUR_QB_CLIENT_ID
QB_CLIENT_SECRET=YOUR_QB_CLIENT_SECRET
QB_REDIRECT_URI=https://sqint.atocomm.eu/auth/quickbooks/callback
QB_ENVIRONMENT=production

# Security
API_KEY=qb-sf-integration-api-key-2024
TOKEN_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Scheduler (5-minute intervals)
INVOICE_CREATION_CRON=*/5 * * * *
PAYMENT_CHECK_CRON=*/5 * * * *
EOF

# 5. Install and start
npm install
NODE_ENV=production node src/server.js
```

---

## 📋 PACKAGE CONTENTS

```
qb-integration-deployment.tar.gz contains:
├── src/
│   ├── server.js              ✅ Correct main server file
│   ├── app.js                 ✅ Express application
│   ├── config/                ✅ Configuration management
│   ├── routes/
│   │   └── api.js            ✅ Complete API endpoints
│   ├── services/
│   │   ├── salesforce-api.js ✅ Salesforce integration
│   │   ├── quickbooks-api.js ✅ QuickBooks integration
│   │   ├── oauth-manager.js  ✅ OAuth handling
│   │   └── scheduler.js      ✅ Automated tasks
│   └── transforms/
│       └── opportunity-to-invoice.js ✅ Data mapping
├── package.json               ✅ All dependencies listed
└── .env.example              ✅ Configuration template
```

---

## ✅ THIS PACKAGE FIXES

1. **Missing mapOpportunityToInvoice** - ✅ Included in transforms/
2. **Complete API endpoints** - ✅ All routes implemented
3. **Scheduler functionality** - ✅ Payment checks every 5 minutes
4. **Error handling** - ✅ Comprehensive error management
5. **OAuth management** - ✅ Token refresh logic included

---

## 🔧 POST-DEPLOYMENT CONFIGURATION

### 1. Get Salesforce OAuth Credentials
```
1. Login: https://customer-inspiration-2543.my.salesforce.com
   User: olga.rybak@atocomm2023.eu
   Pass: 0mj3DqPv28Dp2

2. Setup → App Manager → New Connected App
   - Name: QB Integration
   - Callback: https://sqint.atocomm.eu/auth/salesforce/callback
   - Scopes: Full, API, Refresh Token

3. Copy Client ID and Secret to .env
```

### 2. Get QuickBooks OAuth Credentials
```
1. Login to QuickBooks Developer
2. Select "Middleware" app (not SF Integration)
3. Complete compliance requirements
4. Get production keys
5. Update .env with credentials
```

### 3. Authenticate Services
```bash
# After updating .env with credentials:

# Salesforce OAuth
curl https://sqint.atocomm.eu/auth/salesforce

# QuickBooks OAuth  
curl https://sqint.atocomm.eu/auth/quickbooks
```

---

## 🔍 VERIFICATION STEPS

```bash
# 1. Check server running
ps aux | grep node

# 2. Test API health
curl https://sqint.atocomm.eu/api/health

# 3. Check with API key
curl -H "X-API-Key: qb-sf-integration-api-key-2024" \
     https://sqint.atocomm.eu/api/health

# 4. Monitor scheduler
tail -f /opt/qb-integration/server.log | grep Scheduler

# 5. Check for errors
grep ERROR /opt/qb-integration/server.log
```

---

## 📞 SUPPORT

If deployment fails:
1. Check `/opt/qb-integration/server.log` for errors
2. Verify all dependencies installed: `npm list`
3. Ensure port 3000 is not in use: `lsof -i :3000`
4. Check Node.js version: `node --version` (should be 14+)

---

**This package contains the COMPLETE, PRODUCTION-READY integration code.**  
**All critical issues from Roman's screenshots are addressed.**

*Package created: August 12, 2025*