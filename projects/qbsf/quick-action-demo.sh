#!/bin/bash
# Demo script for Salesforce QuickAction with QuickBooks integration

# Configuration
API_KEY="quickbooks_salesforce_api_key_2025"
SERVER_URL="http://localhost:3000"
SF_INSTANCE="https://customer-inspiration-2543.my.salesforce.com"
QB_REALM="9341454378379755"
OPP_ID="006QBjWnuEzXs5kUhL" # Example Opportunity ID

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display section header
section() {
  echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Kill any running servers
pkill -f "node src/server.js" || true

# Starting the demo
section "Salesforce QuickAction to QuickBooks Integration Demo"

# Step 1: Setup middleware
section "Step 1: Setting up middleware"
echo -e "${YELLOW}Copying latest tokens.json to final-integration...${NC}"
mkdir -p /Users/m/git/clients/qbsf/final-integration/data
cp /Users/m/git/clients/qbsf/automated-integration/data/tokens.json /Users/m/git/clients/qbsf/final-integration/data/tokens.json

# Step 2: Show the key files
section "Step 2: Showing key components"
echo -e "${YELLOW}1. Salesforce Quick Action metadata:${NC}"
cat /Users/m/git/clients/qbsf/automated-integration/salesforce-demo-components/quickActions/CreateInvoice.quickAction-meta.xml

echo -e "\n${YELLOW}2. Salesforce LWC JavaScript:${NC}"
cat /Users/m/git/clients/qbsf/automated-integration/salesforce-demo-components/lwc/createQuickBooksInvoice/createQuickBooksInvoice.js | head -15

echo -e "\n${YELLOW}3. Salesforce Apex Class:${NC}"
cat /Users/m/git/clients/qbsf/automated-integration/salesforce-demo-components/classes/QuickBooksInvoker.cls | head -15

echo -e "\n${YELLOW}4. API Endpoint in middleware:${NC}"
cat /Users/m/git/clients/qbsf/final-integration/src/routes/api.js | grep -A 20 "create-invoice"

# Step 3: Start the middleware
section "Step 3: Starting the middleware"
cd /Users/m/git/clients/qbsf/final-integration
echo -e "${YELLOW}Starting the server...${NC}"
node src/server.js &
SERVER_PID=$!
echo $SERVER_PID > /tmp/demo_server.pid
echo -e "${GREEN}Server started with PID: $SERVER_PID${NC}"
sleep 3

# Step 4: Simulate the Quick Action
section "Step 4: Simulating the Quick Action button click"
echo -e "${YELLOW}When a user clicks 'Create QuickBooks Invoice' on an Opportunity:${NC}"
echo "1. The LWC component calls the Apex method"
echo "2. Apex makes HTTP callout to middleware"
echo "3. Middleware creates the invoice in QuickBooks"
echo "4. Invoice ID is returned and stored in Salesforce"
echo ""

echo -e "${YELLOW}Simulating API call from Salesforce:${NC}"
curl -s -X POST \
  "$SERVER_URL/api/create-invoice" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{\"opportunityId\": \"$OPP_ID\", \"salesforceInstance\": \"$SF_INSTANCE\", \"quickbooksRealm\": \"$QB_REALM\"}" | jq .

# Step 5: Verify the logs
section "Step 5: Verifying middleware logs"
echo -e "${YELLOW}Server logs showing the Quick Action process:${NC}"
echo -e "Check logs with: tail -f /Users/m/git/clients/qbsf/final-integration/logs/combined.log"
echo ""

# Step 6: Show deployment instructions
section "Step 6: Salesforce deployment instructions"
echo -e "${YELLOW}To deploy these components to your Salesforce org:${NC}"
echo "1. Deploy the Apex class: QuickBooksInvoker.cls"
echo "2. Create a custom field: QB_Invoice_ID__c on Opportunity object"
echo "3. Deploy the LWC component: createQuickBooksInvoice"
echo "4. Create the Quick Action on Opportunity page layout"

echo -e "\n${GREEN}Files are ready in:${NC}"
echo "  - /Users/m/git/clients/qbsf/sfdx-deploy/"
echo "  - /Users/m/git/clients/qbsf/automated-integration/salesforce-demo-components/"

# Final summary
section "Demo Summary"
echo -e "${GREEN}The demo shows:${NC}"
echo "1. How the Salesforce Quick Action integrates with the middleware"
echo "2. How the middleware creates QuickBooks invoices from Salesforce opportunities"
echo "3. How the Salesforce-QuickBooks integration is automated end-to-end"
echo ""
echo -e "${YELLOW}To stop the server:${NC} kill $SERVER_PID"