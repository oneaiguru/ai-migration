#!/bin/bash
# Script to test QuickBooks-Salesforce integration

echo "=== Testing QuickBooks-Salesforce Integration ==="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "ngrok is not installed. Please install it from https://ngrok.com/"
    exit 1
fi

# Check if middleware is installed
if [ ! -d "final-integration" ]; then
    echo "Middleware directory not found. Please ensure you have the 'final-integration' folder."
    exit 1
fi

# Start middleware
echo "Starting middleware server..."
cd final-integration
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.backup .env 2>/dev/null || echo "API_KEY=quickbooks_salesforce_api_key_2025" > .env
fi

# Check if the middleware is already running
if curl -s http://localhost:3000/health > /dev/null; then
    echo "Middleware is already running on port 3000"
else
    echo "Starting middleware..."
    npm start &
    MIDDLEWARE_PID=$!
    echo "Middleware started with PID: $MIDDLEWARE_PID"
    sleep 5
fi

# Start ngrok tunnel
echo ""
echo "Starting ngrok tunnel to expose middleware..."
ngrok http 3000 &
NGROK_PID=$!
echo "ngrok started with PID: $NGROK_PID"
sleep 5

# Get the ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*')

if [ -z "$NGROK_URL" ]; then
    echo "Failed to get ngrok URL. Please check if ngrok is running."
    exit 1
fi

echo ""
echo "Middleware is now accessible at: $NGROK_URL"
echo ""
echo "IMPORTANT: You need to update the Middleware URL in Salesforce:"
echo "1. Log in to your Salesforce org"
echo "2. Go to Setup > Custom Settings > QuickBooks Settings"
echo "3. Update the 'Middleware URL' field to: $NGROK_URL"
echo "4. Also ensure the API key matches the one in your .env file"
echo ""

# Test the middleware
echo "Testing middleware health..."
curl -s $NGROK_URL/health

echo ""
echo "=== Testing Instructions ==="
echo ""
echo "To test the full integration:"
echo "1. Update the QuickBooks_Settings__c custom setting in Salesforce with the ngrok URL"
echo "2. Open an Opportunity record in Salesforce"
echo "3. Click the 'Create QuickBooks Invoice' button"
echo "4. Check the results - the button should create an invoice in QuickBooks"
echo "5. Verify the Opportunity record shows the Invoice ID from QuickBooks"
echo ""
echo "Press Ctrl+C to stop the servers when you're done testing."

# Keep the script running to show logs
tail -f logs/combined.log