# Salesforce-QuickBooks Integration Demo Cheat Sheet

This cheat sheet provides quick reference instructions for running the Salesforce-QuickBooks integration demo for clients.

## Prerequisites

- Working middleware in `/Users/m/git/clients/qbsf/final-integration`
- Salesforce organization with Opportunity records
- QuickBooks account properly authenticated
- Valid OAuth tokens in `data/tokens.json`

## Demo Scripts

We have two main scripts for running the demo:

1. **Interactive Demo Controller** - Full featured with menus and detailed output
   ```bash
   ./demo-controller.sh
   ```

2. **Quick Demo Script** - Direct command execution for fast demonstration
   ```bash
   ./quick-demo.sh [command] [opportunity_id]
   ```

## Demo Flow

### Step 1: Start Middleware Server

**Using the Interactive Controller:**
```bash
./demo-controller.sh
# Choose option 1 to start/check middleware
```

**Using the Quick Demo Script:**
```bash
./quick-demo.sh start
```

### Step 2: Test Connection

**Using the Interactive Controller:**
```bash
# Choose option 2 to test connection
```

**Using the Quick Demo Script:**
This is automatically tested when starting the middleware.

### Step 3: Query Opportunities

**Using the Interactive Controller:**
```bash
# Choose option 3 to query opportunities
```

**Manual Query Example:**
If needed, you can directly query Salesforce using:
```bash
ACCESS_TOKEN=$(cat final-integration/data/tokens.json | jq -r '.salesforce."https://customer-inspiration-2543.my.salesforce.com".accessToken')

curl -s -X GET "https://customer-inspiration-2543.my.salesforce.com/services/data/v57.0/query?q=SELECT+Id,Name,StageName,Amount+FROM+Opportunity+WHERE+Amount+%3E+0+LIMIT+5" \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Content-Type: application/json" | jq
```

### Step 4: Create Invoice

**Using the Interactive Controller:**
```bash
# Choose option 4 to create invoice
# Enter opportunity ID when prompted or press Enter for sample
```

**Using the Quick Demo Script:**
```bash
./quick-demo.sh create 006QBjWnuEzXs5kUhL  # Replace with actual opportunity ID
```

**Manual Creation Example:**
```bash
curl -s -X POST "http://localhost:3000/api/create-invoice" \
     -H "Content-Type: application/json" \
     -H "X-API-Key: quickbooks_salesforce_api_key_2025" \
     -d "{
       \"opportunityId\": \"006QBjWnuEzXs5kUhL\",
       \"salesforceInstance\": \"https://customer-inspiration-2543.my.salesforce.com\",
       \"quickbooksRealm\": \"9341454378379755\"
     }" | jq
```

### Step 5: Check Payment Status

**Using the Interactive Controller:**
```bash
# Choose option 5 to check payment status
```

**Using the Quick Demo Script:**
```bash
./quick-demo.sh check
```

**Manual Check Example:**
```bash
curl -s -X POST "http://localhost:3000/api/check-payment-status" \
     -H "Content-Type: application/json" \
     -H "X-API-Key: quickbooks_salesforce_api_key_2025" \
     -d "{
       \"salesforceInstance\": \"https://customer-inspiration-2543.my.salesforce.com\",
       \"quickbooksRealm\": \"9341454378379755\"
     }" | jq
```

### Step 6: Run Full Flow

**Using the Interactive Controller:**
```bash
# Choose option 6 to run full demo flow
```

**Using the Quick Demo Script:**
```bash
./quick-demo.sh all [opportunity_id]
```

## Sample Opportunity IDs

Use these sample IDs for the demo:

- `006QBjWnuEzXs5kUhL` - Burlington Textiles Weaving Plant Generator ($235,000.00)
- `006QBjWnuEzXs5kUm3` - Grand Hotels Kitchen Generator ($155,000.00)
- `006QBjWnuEzXs5kUn9` - United Oil Office Supplies ($75,000.00)

## Troubleshooting

### Middleware Issues

1. **Middleware Not Starting:**
   ```bash
   # Check for existing Node processes
   ps aux | grep node
   
   # Kill any existing middleware processes
   pkill -f "node /Users/m/git/clients/qbsf/final-integration/src/server.js"
   
   # Start middleware manually
   cd /Users/m/git/clients/qbsf/final-integration
   npm start
   ```

2. **API Endpoint Errors:**
   - Verify server is running on port 3000
   - Check API key matches in requests
   - Inspect logs at `/tmp/middleware.log`

### Authentication Issues

1. **OAuth Token Expired:**
   If you see authentication errors, try refreshing the tokens:
   ```bash
   cd /Users/m/git/clients/qbsf/final-integration
   node ../test-oauth.js
   ```

2. **Check Token Status:**
   ```bash
   cat data/tokens.json | jq
   ```

### Common Error Messages

| Error Message | Possible Solution |
|---------------|-------------------|
| `Middleware is not running` | Start middleware with `./quick-demo.sh start` |
| `Error: Could not get access token` | Refresh OAuth tokens |
| `Error creating invoice: Missing required parameters` | Check the opportunity ID is valid |
| `Failed to check payment status` | Verify QuickBooks connection |

## Quick Recovery

If the demo gets stuck or fails:

1. Kill all middleware processes:
   ```bash
   pkill -f "node /Users/m/git/clients/qbsf/final-integration/src/server.js"
   ```

2. Restart with the quick demo script:
   ```bash
   ./quick-demo.sh all 006QBjWnuEzXs5kUhL
   ```

## API Reference

| Endpoint | Purpose | Required Parameters |
|----------|---------|---------------------|
| `GET /health` | Check if middleware is running | None |
| `POST /api/test-connection` | Test connection to both systems | `salesforceInstance`, `quickbooksRealm` |
| `POST /api/create-invoice` | Create QB invoice from SF opportunity | `opportunityId`, `salesforceInstance`, `quickbooksRealm` |
| `POST /api/check-payment-status` | Check QB payment status & update SF | `salesforceInstance`, `quickbooksRealm` |
| `GET /api/logs` | View middleware logs | None |