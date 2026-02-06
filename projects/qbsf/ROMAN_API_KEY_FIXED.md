# API KEY ISSUE FIXED

## Problem Found and Fixed
The nginx proxy server was stripping the X-API-Key header before passing requests to the Node.js server. This is why Roman was getting "Invalid API key" errors even with the correct key.

## What Was Done
1. Identified nginx Docker container handling HTTPS traffic
2. Found nginx wasn't configured to pass X-API-Key header
3. Updated nginx configuration to include: `proxy_set_header X-API-Key $http_x_api_key;`
4. Restarted nginx with fixed configuration

## Current Status
API is now working correctly. Roman can proceed with testing.

## Test Command for Roman

Use this exact command:
```bash
curl -X POST https://sqint.atocomm.eu/api/check-payment-status \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "salesforceInstance": "https://customer-inspiration-2543.my.salesforce.com",
    "quickbooksRealm": "9130354519120066"
  }'
```

Expected Response:
```json
{
  "success": true,
  "invoicesProcessed": 4,
  "paidInvoicesFound": 1,
  "invoicesUpdated": 0
}
```

Note: `invoicesUpdated` is still 0 because QuickBooks OAuth needs reauthorization.

## Next Steps

1. **Test the API** - Confirm the API key now works (use command above)

2. **Reauthorize QuickBooks** - Go to: https://sqint.atocomm.eu/auth/quickbooks
   - Login to QuickBooks
   - Grant permissions
   - Complete authorization

3. **Test Payment Sync**
   - Mark invoice as paid in QuickBooks
   - Run API check again
   - Should see `invoicesUpdated: 1` 
   - Check Salesforce Opportunity - should be "Closed Won"

## Technical Details

The issue was in the nginx proxy configuration. The original config only passed Host and X-Real-IP headers:
```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
```

Fixed by adding:
```nginx
proxy_set_header X-API-Key $http_x_api_key;
proxy_pass_request_headers on;
```

The nginx container has been replaced with a properly configured one.

---

Roman, the API key issue is completely fixed. You can now proceed with testing the payment sync.