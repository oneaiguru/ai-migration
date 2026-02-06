#!/bin/bash
# Client demo script for the Salesforce-QuickBooks integration

# Variables
API_KEY="quickbooks_salesforce_api_key_2025"
SERVER_URL="http://localhost:3000"
SF_INSTANCE="https://customer-inspiration-2543.my.salesforce.com"
QB_REALM="9341454378379755"
OPP_ID="006QBjWnuEzXs5kUhL"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Stop any running servers
echo -e "${BLUE}=== Salesforce-QuickBooks Integration Client Demo ===${NC}"
echo -e "${YELLOW}Stopping any running servers...${NC}"
pkill -f "node src/server.js" || true
sleep 2

# Navigate to final-integration
cd /Users/m/git/clients/qbsf/final-integration

# Start the server
echo -e "${YELLOW}Starting the middleware server...${NC}"
nohup npm start > /tmp/server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > /tmp/server.pid
echo -e "${GREEN}Server started with PID: $SERVER_PID${NC}"
sleep 5

# Test endpoints
echo -e "${YELLOW}Testing connection to Salesforce and QuickBooks...${NC}"
curl -s -X POST "${SERVER_URL}/api/test-connection" \
     -H "Content-Type: application/json" \
     -H "X-API-Key: ${API_KEY}" \
     -d "{\"salesforceInstance\": \"${SF_INSTANCE}\", \"quickbooksRealm\": \"${QB_REALM}\"}" | jq

echo -e "${YELLOW}Creating an invoice for Opportunity ${OPP_ID}...${NC}"
curl -s -X POST "${SERVER_URL}/api/create-invoice" \
     -H "Content-Type: application/json" \
     -H "X-API-Key: ${API_KEY}" \
     -d "{\"opportunityId\": \"${OPP_ID}\", \"salesforceInstance\": \"${SF_INSTANCE}\", \"quickbooksRealm\": \"${QB_REALM}\"}" | jq

# Show Salesforce components
echo -e "${YELLOW}Salesforce components ready for deployment:${NC}"
echo -e "${GREEN}1. Apex Class:${NC} /Users/m/git/clients/qbsf/sf-deploy/classes/QuickBooksInvoker.cls"
echo -e "${GREEN}2. LWC Component:${NC} /Users/m/git/clients/qbsf/sf-deploy/lwc/createQuickBooksInvoice/"
echo -e "${GREEN}3. Quick Action:${NC} /Users/m/git/clients/qbsf/sf-deploy/quickActions/CreateInvoice.quickAction-meta.xml"

echo -e "${BLUE}=== Demo Complete ===${NC}"
echo -e "The server is running on port 3000"
echo -e "To stop the server: kill $SERVER_PID"