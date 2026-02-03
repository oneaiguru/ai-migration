# 🔐 OAUTH CONFIGURATION GUIDE

**CRITICAL**: Both Salesforce and QuickBooks OAuth must be configured for the integration to work.

---

## 📋 PART 1: SALESFORCE OAUTH SETUP

### Step 1: Login to Salesforce
```
URL: https://customer-inspiration-2543.my.salesforce.com
Username: olga.rybak@atocomm2023.eu
Password: 0mj3DqPv28Dp2
```

### Step 2: Create Connected App
1. Navigate to: **Setup** → **Apps** → **App Manager**
2. Click **New Connected App**
3. Fill in the form:

```
Connected App Name: QuickBooks Integration Middleware
API Name: QuickBooks_Integration_Middleware
Contact Email: admin@atocomm.eu

☑ Enable OAuth Settings

Callback URL: https://sqint.atocomm.eu/auth/salesforce/callback

Selected OAuth Scopes:
- Access and manage your data (api)
- Perform requests on your behalf at any time (refresh_token, offline_access)
- Full access (full)

☑ Require Secret for Web Server Flow
☐ Require Secret for Refresh Token Flow
```

4. Click **Save**
5. Click **Continue**
6. Click **Manage Consumer Details**
7. Copy these values:

```bash
# Add to .env file:
SF_CLIENT_ID=3MVG9... (Consumer Key)
SF_CLIENT_SECRET=1234567890ABCDEF... (Consumer Secret)
```

### Step 3: Set OAuth Policies
1. Click **Manage** → **Edit Policies**
2. Set:
   - **Permitted Users**: All users may self-authorize
   - **IP Relaxation**: Relax IP restrictions
   - **Refresh Token Policy**: Refresh token is valid until revoked

---

## 📋 PART 2: QUICKBOOKS OAUTH SETUP

### Step 1: Access QuickBooks Developer
1. Go to: https://developer.intuit.com
2. Sign in with QuickBooks credentials
3. Navigate to **My Apps**

### Step 2: Configure "Middleware" App
**IMPORTANT**: Use the "Middleware" app, NOT "SF Integration 20..."

1. Select the **Middleware** app
2. Go to **Production Settings**

### Step 3: Complete Compliance
Before getting production keys, you must:

1. **Add EULA URL**:
   ```
   https://sqint.atocomm.eu/eula
   ```

2. **Add Privacy Policy URL**:
   ```
   https://sqint.atocomm.eu/privacy
   ```

3. **Submit for Review** (if required)

### Step 4: Get Production Keys
1. Go to **Keys & credentials**
2. Select **Production**
3. Copy these values:

```bash
# Add to .env file:
QB_CLIENT_ID=AB0kfuEcwI4T5GNqdyLRuUWV3ubHP26TOjVhxLZxiMySeHXoZo
QB_CLIENT_SECRET=HABiuDv2kWBWVVudjrsXEGhmI8PCZIrleojpKtx0
QB_ENVIRONMENT=production  # IMPORTANT: Set to production
```

### Step 5: Configure Redirect URI
1. In QuickBooks app settings
2. Add Redirect URI:
   ```
   https://sqint.atocomm.eu/auth/quickbooks/callback
   ```

---

## 📋 PART 3: COMPLETE .env CONFIGURATION

After getting both OAuth credentials, your .env should look like:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production
MIDDLEWARE_BASE_URL=https://sqint.atocomm.eu

# Salesforce Configuration (FROM CONNECTED APP)
SF_CLIENT_ID=3MVG9_kZcLde7U5r7ykzu2c1PeyOueQqRgmwyqmPC4yLcImPruS_CxHVVLptVBa28pP76goj0p4YMLcLT7m9C
SF_CLIENT_SECRET=6BC99FF9F8C3A3F662F05AEF854603A2712A5E3FB97B8B0301B941F3E57F5DE4
SF_REDIRECT_URI=https://sqint.atocomm.eu/auth/salesforce/callback
SF_LOGIN_URL=https://customer-inspiration-2543.my.salesforce.com
SF_INSTANCE_URL=https://customer-inspiration-2543.my.salesforce.com

# QuickBooks Configuration (FROM MIDDLEWARE APP)
QB_CLIENT_ID=AB0kfuEcwI4T5GNqdyLRuUWV3ubHP26TOjVhxLZxiMySeHXoZo
QB_CLIENT_SECRET=HABiuDv2kWBWVVudjrsXEGhmI8PCZIrleojpKtx0
QB_REDIRECT_URI=https://sqint.atocomm.eu/auth/quickbooks/callback
QB_ENVIRONMENT=production  # CRITICAL: Must be 'production' not 'sandbox'

# Security
API_KEY=qb-sf-integration-api-key-2024
TOKEN_ENCRYPTION_KEY=this-is-a-32-character-secret-key-for-encryption

# Scheduler
INVOICE_CREATION_CRON=*/5 * * * *
PAYMENT_CHECK_CRON=*/5 * * * *
```

---

## 📋 PART 4: AUTHORIZE CONNECTIONS

After updating .env with credentials:

### 1. Restart Server
```bash
cd /opt/qb-integration
pkill -f node
NODE_ENV=production node src/server.js
```

### 2. Authorize Salesforce
1. Open browser
2. Navigate to: `https://sqint.atocomm.eu/auth/salesforce`
3. Login with Salesforce credentials
4. Click "Allow" to authorize
5. You'll be redirected back with success message

### 3. Authorize QuickBooks
1. Open browser
2. Navigate to: `https://sqint.atocomm.eu/auth/quickbooks`
3. Login with QuickBooks credentials
4. Select the company to connect
5. Click "Authorize" 
6. You'll be redirected back with success message

### 4. Verify Connections
```bash
# Check OAuth status
curl -H "X-API-Key: qb-sf-integration-api-key-2024" \
     https://sqint.atocomm.eu/api/oauth/status

# Should return:
{
  "salesforce": {
    "connected": true,
    "expires": "2025-08-13T..."
  },
  "quickbooks": {
    "connected": true,
    "expires": "2025-08-13T..."
  }
}
```

---

## 🔍 TROUBLESHOOTING OAUTH

### "Invalid Client" Error
- Verify CLIENT_ID and CLIENT_SECRET are correct
- Ensure no extra spaces in .env file
- Check you're using production keys for QB_ENVIRONMENT=production

### "Redirect URI Mismatch"
- Exact match required (including https://)
- Update both in app settings and .env file
- Common mistake: http vs https

### "Invalid Grant" Error
- OAuth code expired (valid for 10 minutes)
- Try authorization flow again
- Clear browser cookies and retry

### Token Expired
- Tokens auto-refresh using refresh token
- If refresh fails, re-authorize manually
- Check logs for refresh errors

---

## ✅ OAUTH SETUP COMPLETE CHECKLIST

- [ ] Salesforce Connected App created
- [ ] Salesforce CLIENT_ID in .env
- [ ] Salesforce CLIENT_SECRET in .env
- [ ] QuickBooks app in production mode
- [ ] QuickBooks CLIENT_ID in .env
- [ ] QuickBooks CLIENT_SECRET in .env
- [ ] QB_ENVIRONMENT=production in .env
- [ ] Server restarted with new config
- [ ] Salesforce authorized via browser
- [ ] QuickBooks authorized via browser
- [ ] OAuth status verified via API

---

## 📞 NEXT STEPS

Once OAuth is configured:
1. Test invoice creation from Salesforce
2. Verify payment sync from QuickBooks
3. Check scheduler is running every 5 minutes
4. Monitor logs for any errors

---

*OAuth configuration is CRITICAL for integration to work*  
*Both services must be authorized before testing*