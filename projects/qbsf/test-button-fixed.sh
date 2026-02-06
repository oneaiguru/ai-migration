#!/bin/bash
# Script to test and fix QuickBooks button integration
# Ensures middleware is properly running and accessible

echo "=== Testing QuickBooks-Salesforce Button Integration ==="
echo ""

# Configuration
API_KEY="quickbooks_salesforce_api_key_2025"
ORG_ALIAS="myorg"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if middleware is running locally
echo -e "${YELLOW}1. Checking local middleware...${NC}"
if [ -d "final-integration" ]; then
    cd final-integration
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing middleware dependencies..."
        npm install
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo "Creating .env file..."
        cat > .env << EOF
API_KEY=$API_KEY
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret
EOF
    fi
    
    # Start middleware
    echo "Starting middleware..."
    npm start &
    MIDDLEWARE_PID=$!
    sleep 5
    
    cd ..
else
    echo -e "${RED}Error: 'final-integration' directory not found${NC}"
    exit 1
fi

# Step 2: Check middleware health
echo ""
echo -e "${YELLOW}2. Testing middleware health...${NC}"
curl -s http://localhost:3000/health
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Local middleware is running${NC}"
else
    echo -e "${RED}Local middleware is not running${NC}"
    exit 1
fi

# Step 3: Start ngrok
echo ""
echo -e "${YELLOW}3. Starting ngrok tunnel...${NC}"
ngrok http 3000 > /dev/null &
NGROK_PID=$!
sleep 5

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o "https://[^\"]*\.ngrok-free\.app" | head -1)

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}Could not get ngrok URL${NC}"
    echo "Please start ngrok manually: ngrok http 3000"
    exit 1
fi

echo -e "${GREEN}Ngrok URL: $NGROK_URL${NC}"

# Step 4: Test ngrok accessibility
echo ""
echo -e "${YELLOW}4. Testing ngrok accessibility...${NC}"
curl -s "$NGROK_URL/health" -H "ngrok-skip-browser-warning: true"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Ngrok tunnel is working${NC}"
else
    echo -e "${RED}Ngrok tunnel is not accessible${NC}"
fi

# Step 5: Update Salesforce settings
echo ""
echo -e "${GREEN}=== Update Salesforce Settings ===${NC}"
echo ""
echo "1. Log in to Salesforce"
echo "2. Go to Setup > Custom Settings > QuickBooks Settings"
echo "3. Click 'Manage' then 'Edit'"
echo "4. Update these fields:"
echo "   - Middleware URL: $NGROK_URL"
echo "   - API Key: $API_KEY"
echo "5. Save the settings"
echo ""
echo -e "${GREEN}=== Test the Button ===${NC}"
echo ""
echo "1. Navigate to an Opportunity record (preferably 'Closed Won')"
echo "2. Click the 'Create QuickBooks Invoice' button"
echo "3. Watch the logs below for activity"
echo ""
echo -e "${YELLOW}Monitoring logs (Ctrl+C to stop)...${NC}"
tail -f final-integration/logs/combined.log
