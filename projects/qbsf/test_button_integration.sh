#!/bin/bash
# Test script for QuickBooks-Salesforce button integration

echo "=== Testing QuickBooks-Salesforce Button Integration ==="
echo ""

# Configuration - update these values if needed
API_KEY="quickbooks_salesforce_api_key_2025"
ORG_ALIAS="myorg"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}Error: ngrok is not installed${NC}"
    echo "Please install ngrok from https://ngrok.com/download"
    exit 1
fi

# Check if middleware directory exists
if [ ! -d "final-integration" ]; then
    echo -e "${RED}Error: 'final-integration' directory not found${NC}"
    echo "Please ensure you are in the correct project directory"
    exit 1
fi

# Start middleware if not running
echo -e "${YELLOW}1. Starting middleware...${NC}"
cd final-integration

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file with default API key..."
    echo "API_KEY=$API_KEY" > .env
fi

# Check if middleware is already running
if curl -s http://localhost:3000/health > /dev/null; then
    echo "Middleware already running on port 3000"
else
    echo "Starting middleware server..."
    npm start &
    MIDDLEWARE_PID=$!
    sleep 3
    echo "Middleware started with PID: $MIDDLEWARE_PID"
fi

# Start ngrok in a new terminal
echo ""
echo -e "${YELLOW}2. Starting ngrok tunnel...${NC}"
echo "Opening new terminal window for ngrok..."

# Open new terminal window based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell application "Terminal" to do script "cd '$(pwd)' && ngrok http 3000"'
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "ngrok http 3000; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "ngrok http 3000" &
    else
        echo "Could not open new terminal window. Please run ngrok manually in a new terminal:"
        echo "ngrok http 3000"
    fi
else
    echo "Please run ngrok manually in a new terminal:"
    echo "ngrok http 3000"
fi

# Wait for ngrok to start
echo "Waiting for ngrok to start (8 seconds)..."
sleep 8

# Get ngrok URL
echo -e "${YELLOW}3. Getting ngrok URL...${NC}"
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o "https://[^\"]*\.ngrok-free\.app" | head -1)

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}Could not get ngrok URL automatically${NC}"
    echo "Please enter the ngrok URL (e.g., https://abc123.ngrok-free.app):"
    read NGROK_URL
fi

echo ""
echo -e "${GREEN}Ngrok URL: $NGROK_URL${NC}"
echo ""

# Test middleware health
echo -e "${YELLOW}4. Testing middleware health...${NC}"
curl -s "$NGROK_URL/health" | grep -q "ok"
if [ $? -ne 0 ]; then
    echo -e "${RED}Middleware health check failed${NC}"
    echo "Please check if middleware is running correctly"
else
    echo -e "${GREEN}Middleware health check passed${NC}"
fi

echo ""
echo -e "${YELLOW}5. Testing API connectivity...${NC}"
curl -s -H "X-API-Key: $API_KEY" "$NGROK_URL/api/health" | grep -q "ok"
if [ $? -ne 0 ]; then
    echo -e "${RED}API connectivity test failed${NC}"
    echo "Please check API key and middleware configuration"
else
    echo -e "${GREEN}API connectivity test passed${NC}"
fi

echo ""
echo -e "${GREEN}=== Manual Button Test Instructions ===${NC}"
echo ""
echo "IMPORTANT: Update the middleware URL in Salesforce:"
echo "1. Log in to Salesforce"
echo "2. Go to Setup > Custom Settings > QuickBooks Settings"
echo "3. Update the 'Middleware URL' field to: $NGROK_URL"
echo "4. Ensure the API Key matches: $API_KEY"
echo ""
echo "To test the button:"
echo "1. Navigate to an Opportunity record (preferably in 'Closed Won' stage)"
echo "2. Click the 'Create QuickBooks Invoice' button"
echo "3. The button should show 'Success' and the opportunity should be updated"
echo "4. Check the middleware logs for more details"
echo ""

# Monitor logs
echo -e "${YELLOW}Monitoring middleware logs (press Ctrl+C to stop)...${NC}"
tail -f ../final-integration/logs/combined.log