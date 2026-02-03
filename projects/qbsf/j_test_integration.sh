#!/bin/bash
# Script J: Test Integration

echo "=== Testing Salesforce-QuickBooks Integration ==="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get org alias
echo "Enter your Salesforce org alias (or leave blank to use default):"
read ORG_ALIAS

if [ -z "$ORG_ALIAS" ]; then
    ORG_ALIAS="myorg"
fi

# Start middleware if not running
echo -e "${YELLOW}Checking if middleware is running...${NC}"
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${RED}Middleware is not running${NC}"
    echo "Looking for middleware directory..."
    
    MIDDLEWARE_DIR="./final-integration"
    if [[ ! -d "$MIDDLEWARE_DIR" ]]; then
        if [[ -d "../final-integration" ]]; then
            MIDDLEWARE_DIR="../final-integration"
        elif [[ -d "../../final-integration" ]]; then
            MIDDLEWARE_DIR="../../final-integration"
        else
            echo -e "${RED}Error: Cannot find final-integration directory${NC}"
            exit 1
        fi
    fi
    
    echo "Starting middleware from $MIDDLEWARE_DIR..."
    cd "$MIDDLEWARE_DIR"
    npm start &
    MIDDLEWARE_PID=$!
    cd - > /dev/null
    sleep 5
    echo -e "${GREEN}Middleware started with PID: $MIDDLEWARE_PID${NC}"
else
    echo -e "${GREEN}Middleware is already running${NC}"
fi

# Test middleware health
echo ""
echo -e "${YELLOW}1. Testing middleware health...${NC}"
curl -s http://localhost:3000/health | jq . || echo "jq not installed, showing raw output:" && curl -s http://localhost:3000/health

# Test API connectivity
echo ""
echo -e "${YELLOW}2. Testing API connectivity...${NC}"
API_KEY="${API_KEY:-quickbooks_salesforce_api_key_2025}"
curl -s -H "X-API-Key: $API_KEY" http://localhost:3000/api/health | jq . || echo "API health check response:" && curl -s -H "X-API-Key: $API_KEY" http://localhost:3000/api/health

# Test Apex connection from Salesforce
echo ""
echo -e "${YELLOW}3. Testing Apex connection to middleware...${NC}"
cat > testConnection.apex << 'EOF'
// Test the connection from Salesforce to middleware
Boolean result = QuickBooksAPIService.testConnection();
System.debug('Connection test result: ' + result);
if (result) {
    System.debug('✓ Successfully connected to middleware');
} else {
    System.debug('✗ Failed to connect to middleware');
    QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
    System.debug('Current settings:');
    System.debug('- Middleware URL: ' + settings.Middleware_URL__c);
    System.debug('- API Key: ' + (String.isBlank(settings.API_Key__c) ? 'NOT SET' : 'SET'));
    System.debug('- QB Realm: ' + settings.QB_Realm_ID__c);
}
EOF

echo "Running Apex connection test..."
sf apex run --file testConnection.apex --target-org "$ORG_ALIAS"
rm testConnection.apex

echo ""
echo -e "${GREEN}=== Integration Test Complete ===${NC}"
echo ""
echo -e "${YELLOW}To test the full flow:${NC}"
echo "1. Open Salesforce in your browser:"
echo "   ${GREEN}sf org open --target-org $ORG_ALIAS${NC}"
echo ""
echo "2. Navigate to any Opportunity record"
echo ""
echo "3. Click the 'Create QuickBooks Invoice' button in the action bar"
echo ""
echo "4. Watch the progress and check for:"
echo "   - Success message in Salesforce"
echo "   - Invoice ID populated on the Opportunity"
echo "   - New invoice in QuickBooks"
echo ""
echo -e "${YELLOW}Monitoring API calls...${NC}"
echo "Press Ctrl+C to stop monitoring"
echo ""

# Try to tail logs
LOG_FILE="./final-integration/logs/combined.log"
if [[ ! -f "$LOG_FILE" ]]; then
    LOG_FILE="../final-integration/logs/combined.log"
fi
if [[ ! -f "$LOG_FILE" ]]; then
    LOG_FILE="../../final-integration/logs/combined.log"
fi

if [[ -f "$LOG_FILE" ]]; then
    echo "Watching log file: $LOG_FILE"
    tail -f "$LOG_FILE"
else
    echo "No log file found. Watch the middleware console for activity."
    if [[ -n "$MIDDLEWARE_PID" ]]; then
        wait $MIDDLEWARE_PID
    fi
fi
