#\!/bin/bash
# Demo script to check payment status and update Salesforce

API_KEY="quickbooks_salesforce_api_key_2025"
SERVER_URL="http://localhost:3000"
SF_INSTANCE="https://customer-inspiration-2543.my.salesforce.com"
QB_REALM="9341454378379755"

echo "Checking payment status for invoices..."

# Check payment status
curl -s -X POST "$SERVER_URL/api/check-payment-status" \
     -H "Content-Type: application/json" \
     -H "X-API-Key: $API_KEY" \
     -d "{
       \"salesforceInstance\": \"$SF_INSTANCE\",
       \"quickbooksRealm\": \"$QB_REALM\"
     }" | jq
