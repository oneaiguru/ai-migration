# 🔧 OAUTH CONFIGURATION FIX

**Problem**: QuickBooks OAuth error - "redirect_uri query parameter value is invalid"

---

## 🚨 ROMAN - DO THIS NOW

### For QuickBooks Developer Portal:

1. **Login to QuickBooks Developer**: https://developer.intuit.com
2. **Select your app** (should be "Middleware" or similar)
3. **Go to "Keys & OAuth"** or "Keys" tab
4. **In "Redirect URIs" section, ADD this EXACT URL**:
   ```
   https://sqint.atocomm.eu/auth/quickbooks/callback
   ```
   ⚠️ MUST BE EXACT - including https:// and /callback

5. **Save changes**

6. **Wait 2-3 minutes** for changes to propagate

7. **Try again**: https://sqint.atocomm.eu/auth/quickbooks

---

## 🔍 CHECK SALESFORCE CONNECTED APP

### For Salesforce:
1. **Login**: https://customer-inspiration-2543.my.salesforce.com
2. **Go to**: Setup → Apps → App Manager
3. **Find your Connected App** (or create new one)
4. **Edit** → OAuth Settings
5. **Callback URL must be**:
   ```
   https://sqint.atocomm.eu/auth/salesforce/callback
   ```
6. **Save**

---

## 📝 IF QUICKBOOKS STILL DOESN'T WORK

### Option 1: Check QuickBooks Environment
The app might be in Sandbox mode. Check:
```bash
# On server, check if it's set to production
grep QB_ENVIRONMENT /opt/qb-integration/.env
# Should show: QB_ENVIRONMENT=production
```

### Option 2: Use Different QuickBooks App
If current app is sandbox-only:
1. Create NEW app in QuickBooks Developer
2. Set it for Production
3. Get new Client ID & Secret
4. Update on server:
   ```bash
   ssh roman@pve.atocomm.eu -p2323
   nano /opt/qb-integration/.env
   # Update QB_CLIENT_ID and QB_CLIENT_SECRET
   # Restart server
   ```

---

## ✅ CORRECT URLs FOR OAUTH

### QuickBooks OAuth URL Structure:
```
https://appcenter.intuit.com/connect/oauth2?
client_id=YOUR_QB_CLIENT_ID&
scope=com.intuit.quickbooks.accounting&
redirect_uri=https://sqint.atocomm.eu/auth/quickbooks/callback&
response_type=code&
state=randomstring
```

### Salesforce OAuth URL Structure:
```
https://customer-inspiration-2543.my.salesforce.com/services/oauth2/authorize?
response_type=code&
client_id=YOUR_SF_CLIENT_ID&
redirect_uri=https://sqint.atocomm.eu/auth/salesforce/callback&
scope=api refresh_token
```

---

## 🔍 VERIFY SERVER ROUTES ARE WORKING

Test that OAuth endpoints exist:
```bash
# Should not return 404
curl https://sqint.atocomm.eu/auth/salesforce
curl https://sqint.atocomm.eu/auth/quickbooks
```

---

## 📞 ROMAN - QUICK STEPS:

1. **QuickBooks Developer Portal** → Add redirect URI:
   ```
   https://sqint.atocomm.eu/auth/quickbooks/callback
   ```

2. **Salesforce Setup** → Connected App → Add callback URL:
   ```
   https://sqint.atocomm.eu/auth/salesforce/callback
   ```

3. **Wait 2-3 minutes**

4. **Try OAuth again**:
   - https://sqint.atocomm.eu/auth/salesforce
   - https://sqint.atocomm.eu/auth/quickbooks

---

## ⚠️ IMPORTANT NOTES

- URLs must match EXACTLY (including https://)
- No trailing slashes
- Case sensitive
- Must include /callback at the end
- QuickBooks may take a few minutes to update

---

**The server is working correctly. The issue is just the redirect URI configuration in QuickBooks/Salesforce apps.**