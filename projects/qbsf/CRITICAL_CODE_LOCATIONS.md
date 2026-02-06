# CRITICAL CODE LOCATIONS AND LINE NUMBERS
## All Changes Made and Locations to Monitor

## 1. FILES WE MODIFIED

### 1.1 OAuth Manager - Token Encryption Disabled
**File**: `/opt/qb-integration/src/services/oauth-manager.js`
- **Line 127**: Changed from `fs.writeFileSync(TOKENS_FILE, encryptedData);` to `fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));`
- **Line 153**: Same change as above
- **Backup**: `/opt/qb-integration/src/services/oauth-manager.js.backup`
- **Issue Fixed**: Tokens were saved as encrypted blob instead of JSON

### 1.2 QuickBooks API - Payment Detection Simplified
**File**: `/opt/qb-integration/src/services/quickbooks-api.js`
- **Lines 431-460**: Complete rewrite of `getPaymentForInvoice()` method
- **Old Logic**: Complex SQL query with subquery that caused Error 610
- **New Logic**: Simple invoice balance check (if balance = 0, then paid)
- **Backup**: `/opt/qb-integration/src/services/quickbooks-api.js.backup2`

### 1.3 Nginx Configuration - Added API Key Header
**File**: `/root/ci/proxy/config/nginx.conf`
- **Docker Container**: `proxy_nginx_fixed`
- **Critical Addition**: `proxy_set_header X-API-Key $http_x_api_key;`
- **Location**: Inside server block for sqint.atocomm.eu

### 1.4 Tokens File Reset
**File**: `/opt/qb-integration/data/tokens.json`
- **Original Corrupted**: `/opt/qb-integration/data/tokens.json.corrupted.backup`
- **Current Structure**: Proper JSON with quickbooks and salesforce objects

## 2. CRITICAL METHOD LOCATIONS (From Subagent Research)

### 2.1 Invoice Creation Flow
**File**: `/opt/qb-integration/src/services/salesforce-api.js`
- **Lines 315-327**: `getUnpaidInvoices()` - Returns opportunities with QB_Invoice_ID__c
- **Issue**: Was returning orphaned references (invoice IDs that don't exist in QB)

**File**: `/opt/qb-integration/src/services/quickbooks-api.js`
- **Lines 217-249**: `createInvoice()` method
- **Lines 179-206**: `getFirstAvailableItem()` - Fallback for missing items

**File**: `/opt/qb-integration/src/services/scheduler.js`
- **Line (unknown)**: Cron expression `*/5 * * * *` (every 5 minutes)
- **Two schedulers**: Invoice creation + Payment check

### 2.2 Payment Sync Flow
**File**: `/opt/qb-integration/src/routes/api.js`
- **Lines 140-180** (approx): `/api/check-payment-status` endpoint
- **Line 157**: Calls `batchCheckPaymentStatus()`

**File**: `/opt/qb-integration/src/services/quickbooks-api.js`
- **Line 495**: `checkInvoicePaymentStatus()` - Was failing with Error 610
- **Lines 541-550** (approx): `batchCheckPaymentStatus()` method

### 2.3 OAuth Flow
**File**: `/opt/qb-integration/src/routes/auth.js`
- **Lines 55-59**: `/auth/quickbooks` endpoint
- **Lines 64-102**: `/auth/quickbooks/callback` - Saves tokens
- **Lines 11-15**: `/auth/salesforce` endpoint
- **Lines 20-50**: `/auth/salesforce/callback`

**File**: `/opt/qb-integration/src/services/oauth-manager.js`
- **Line 207**: `refreshQuickBooksToken()` function
- **Line 444**: Token refresh attempt in `getValidAccessToken()`
- **Lines 106-160** (approx): `initializeTokenStorage()` - Tries JSON parse first, then decrypt

## 3. SALESFORCE COMPONENTS

### 3.1 Custom Fields on Opportunity
- `QB_Invoice_ID__c` - Stores QuickBooks invoice ID
- `QB_Payment_Date__c` - Payment date from QB
- `QB_Payment_Amount__c` - Payment amount
- `QB_Payment_Method__c` - Payment method
- `QB_Payment_Reference__c` - Payment reference number
- `QB_Payment_Status__c` - Payment status

### 3.2 Apex Classes
**File**: `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`
- Handles async invoice creation

**File**: `force-app/main/default/classes/QBPaymentStatusScheduler.cls`
- Scheduled job for payment checks

**File**: `force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger`
- Triggers on Stage = "Proposal and Agreement"

## 4. ERROR PATTERNS FOUND

### 4.1 Error 610 - Object Not Found
**Location**: `/opt/qb-integration/server.log`
**Pattern**: `"error": "QuickBooks API validation error (Field: 4000): Error parsing query"`
**Cause**: Invoice IDs 2048, 2050, 2055, 2083 didn't exist in QB
**Solution**: Cleared from Salesforce opportunities

### 4.2 OAuth Token Expiry
**Location**: `/opt/qb-integration/server.log`
**Pattern**: `"QuickBooks refresh token is invalid or expired for realm 9130354519120066"`
**Frequency**: Every 101 days for QuickBooks
**Solution**: Manual reauthorization required

## 5. CONFIGURATION FILES

### 5.1 Environment Variables
**File**: `/opt/qb-integration/.env`
```
PORT=3000
API_KEY=$API_KEY
QB_ENVIRONMENT=production
QB_SANDBOX=false
TOKEN_ENCRYPTION_KEY=$API_KEY
SF_INSTANCE_URL=https://customer-inspiration-2543.my.salesforce.com
```

### 5.2 Server Entry Points
**Main Server**: `/opt/qb-integration/src/server.js`
**Express App**: `/opt/qb-integration/src/app.js`
**Config**: `/opt/qb-integration/src/config/index.js`

## 6. DATABASE/STORAGE

### 6.1 Token Storage
**File**: `/opt/qb-integration/data/tokens.json`
**Structure**:
```json
{
  "quickbooks": {
    "9130354519120066": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresAt": "..."
    }
  },
  "salesforce": {
    "https://customer-inspiration-2543.my.salesforce.com": {
      "accessToken": "...",
      "refreshToken": "...",
      "instanceUrl": "..."
    }
  }
}
```

## 7. CRITICAL ISSUES TO MONITOR

1. **Token Corruption**: Watch for tokens.json becoming non-JSON
2. **Error 610**: Invoice not found in QuickBooks
3. **OAuth Expiry**: Both systems need reauth periodically
4. **Orphaned References**: QB_Invoice_ID__c without matching QB invoice
5. **Docker Container**: Ensure proxy_nginx_fixed stays running

## 8. TEST COMMANDS WITH EXACT PARAMETERS

```bash
# Check payment status
curl -X POST https://sqint.atocomm.eu/api/check-payment-status \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"salesforceInstance":"https://customer-inspiration-2543.my.salesforce.com","quickbooksRealm":"9130354519120066"}'

# Check OAuth status
curl https://sqint.atocomm.eu/auth/status

# Server logs
tail -f /opt/qb-integration/server.log

# Process check
ps aux | grep "node src/server.js"
```

## 9. PERMANENT FIXES NEEDED (NOT YET IMPLEMENTED)

### Fix 1: Handle Error 610 Gracefully
**File**: `/opt/qb-integration/src/services/quickbooks-api.js`
**Location**: Line ~495 in `checkInvoicePaymentStatus()`
**Add**: Try-catch for Object Not Found errors

### Fix 2: Clear Invalid Invoice IDs
**File**: `/opt/qb-integration/src/services/salesforce-api.js`  
**Location**: New method needed
**Add**: `clearOrphanedInvoiceId()` method

### Fix 3: Re-enable Token Encryption
**File**: `/opt/qb-integration/src/services/oauth-manager.js`
**Location**: Lines 127 and 153
**Fix**: Ensure proper JSON structure before encryption

---

**NOTE**: This document contains all line numbers and locations discovered during debugging. Use this for reference in future sessions.