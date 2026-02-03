#\!/bin/bash
# Demo script to create invoice from specific opportunity

# Check if opportunity ID is provided
if [ -z "$1" ]; then
    echo "Usage: ./create-invoice-demo.sh <OPPORTUNITY_ID>"
    exit 1
fi

OPPORTUNITY_ID=$1
API_KEY="quickbooks_salesforce_api_key_2025"
SERVER_URL="http://localhost:3000"
SF_INSTANCE="https://customer-inspiration-2543.my.salesforce.com"
QB_REALM="9341454378379755"

echo "Creating invoice for Opportunity: $OPPORTUNITY_ID"

# Create invoice
curl -s -X POST "$SERVER_URL/api/create-invoice" \
     -H "Content-Type: application/json" \
     -H "X-API-Key: $API_KEY" \
     -d "{
       \"opportunityId\": \"$OPPORTUNITY_ID\",
       \"salesforceInstance\": \"$SF_INSTANCE\",
       \"quickbooksRealm\": \"$QB_REALM\"
     }" | jq
