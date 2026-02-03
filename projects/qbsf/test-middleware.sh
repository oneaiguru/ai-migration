#!/bin/bash
# Script to test the Salesforce-QuickBooks middleware

# Configuration
API_KEY="quickbooks_salesforce_api_key_2025"
SERVER_URL="http://localhost:3000"
SF_INSTANCE="https://customer-inspiration-2543.my.salesforce.com"
QB_REALM="9341454378379755"
OPP_ID="006QBjWnuEzXs5kUhL"

# Kill any existing server process
pkill -f "node src/server.js" || true

# Start the middleware server
cd /Users/m/git/clients/qbsf/final-integration
nohup npm start > /tmp/middleware.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > /tmp/middleware.pid

echo "Middleware server started with PID: $SERVER_PID"
echo "Waiting for server to start..."
sleep 3

# Test health endpoint
echo -e "\n=== Testing Health Endpoint ==="
curl -s "$SERVER_URL/health" \
     -H "X-API-Key: $API_KEY" | jq

# Test connection to both systems
echo -e "\n=== Testing Connections ==="
curl -s -X POST "$SERVER_URL/api/test-connection" \
     -H "Content-Type: application/json" \
     -H "X-API-Key: $API_KEY" \
     -d "{
       \"salesforceInstance\": \"$SF_INSTANCE\",
       \"quickbooksRealm\": \"$QB_REALM\"
     }" | jq

# Test creating an invoice
echo -e "\n=== Creating Invoice ==="
curl -s -X POST "$SERVER_URL/api/create-invoice" \
     -H "Content-Type: application/json" \
     -H "X-API-Key: $API_KEY" \
     -d "{
       \"opportunityId\": \"$OPP_ID\",
       \"salesforceInstance\": \"$SF_INSTANCE\",
       \"quickbooksRealm\": \"$QB_REALM\"
     }" | jq

echo -e "\nMiddleware tests complete. Press Ctrl+C to stop the server."
echo "Or run: kill $SERVER_PID"