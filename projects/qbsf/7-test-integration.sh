#!/bin/bash
# Script 7: Test Integration

echo "=== Testing Salesforce-QuickBooks Integration ==="
echo ""

# Start middleware if not running
echo "Checking if middleware is running..."
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "Starting middleware..."
    cd final-integration
    npm start &
    MIDDLEWARE_PID=$!
    sleep 5
    echo "Middleware started with PID: $MIDDLEWARE_PID"
else
    echo "Middleware is already running"
fi

# Test middleware health
echo ""
echo "1. Testing middleware health..."
curl -s http://localhost:3000/health | jq .

# Test API connectivity
echo ""
echo "2. Testing API connectivity..."
API_KEY="quickbooks_salesforce_api_key_2025"
curl -s -H "X-API-Key: $API_KEY" http://localhost:3000/api/health | jq .

# Test connections
echo ""
echo "3. Testing Salesforce and QuickBooks connections..."
curl -s -X POST http://localhost:3000/api/test-connection \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "salesforceInstance": "https://customer-inspiration-2543.my.salesforce.com",
    "quickbooksRealm": "9341454378379755"
  }' | jq .

echo ""
echo "=== Integration Test Complete ==="
echo ""
echo "To test the full flow:"
echo "1. Open Salesforce and navigate to an Opportunity"
echo "2. Click 'Create QuickBooks Invoice' button"
echo "3. Monitor this terminal for API calls"
echo "4. Check QuickBooks for the created invoice"
echo ""
echo "API Logs will appear here when button is clicked..."
echo "Press Ctrl+C to stop monitoring"
echo ""

# Keep the script running to show logs
tail -f final-integration/logs/combined.log 2>/dev/null || \
tail -f logs/combined.log 2>/dev/null || \
echo "No log file found. Check middleware console output."
