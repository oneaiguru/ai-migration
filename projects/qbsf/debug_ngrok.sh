#!/bin/bash
# Complete debug script for ngrok integration

NGROK_URL="https://3a62-166-1-160-232.ngrok-free.app"
API_KEY="quickbooks_salesforce_api_key_2025"

echo "=== Debugging ngrok integration ==="
echo ""

# 1. Check custom settings
echo "1. Checking Custom Settings..."
cat > check_settings.apex << 'EOF'
QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
System.debug('=== Custom Settings ===');
System.debug('Middleware URL: ' + settings.Middleware_URL__c);
System.debug('API Key: ' + settings.API_Key__c);
System.debug('QB Realm: ' + settings.QB_Realm_ID__c);
EOF
sf apex run --file check_settings.apex --target-org myorg
rm check_settings.apex

# 2. Check Remote Site Settings
echo ""
echo "2. Checking Remote Site Settings..."
cat > check_remote_site.apex << 'EOF'
List<RemoteSiteSetting> sites = [
    SELECT Id, SiteName, EndpointUrl, IsActive 
    FROM RemoteSiteSetting 
    WHERE SiteName = 'QuickBooksMiddleware'
];
for(RemoteSiteSetting site : sites) {
    System.debug('=== Remote Site ===');
    System.debug('Name: ' + site.SiteName);
    System.debug('URL: ' + site.EndpointUrl);
    System.debug('Active: ' + site.IsActive);
}
EOF
sf apex run --file check_remote_site.apex --target-org myorg
rm check_remote_site.apex

# 3. Test the connection
echo ""
echo "3. Testing Connection..."
cat > test_connection.apex << 'EOF'
try {
    Boolean result = QuickBooksAPIService.testConnection();
    System.debug('Connection result: ' + result);
} catch(Exception e) {
    System.debug('Connection error: ' + e.getMessage());
    System.debug('Stack trace: ' + e.getStackTraceString());
}
EOF
sf apex run --file test_connection.apex --target-org myorg
rm test_connection.apex

# 4. Check the actual endpoint being called
echo ""
echo "4. Checking endpoint in service..."
cat > check_endpoint.apex << 'EOF'
QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
String middlewareUrl = settings.Middleware_URL__c;
String healthEndpoint = middlewareUrl + '/health';
System.debug('Configured URL: ' + middlewareUrl);
System.debug('Health endpoint: ' + healthEndpoint);

// Try a simple HTTP request to see what URL is actually being used
HttpRequest req = new HttpRequest();
req.setEndpoint(healthEndpoint);
req.setMethod('GET');
req.setHeader('X-API-Key', settings.API_Key__c);
System.debug('Request endpoint: ' + req.getEndpoint());
EOF
sf apex run --file check_endpoint.apex --target-org myorg
rm check_endpoint.apex

# 5. Direct test from command line
echo ""
echo "5. Testing ngrok directly..."
curl -s "$NGROK_URL/health" | jq .

echo ""
echo "6. Testing with API key..."
curl -s -H "X-API-Key: $API_KEY" "$NGROK_URL/api/health" | jq .

echo ""
echo "=== Next Steps ==="
echo "If the settings show correct URLs but still failing:"
echo "1. Check if there's a hardcoded localhost in QuickBooksAPIService.cls"
echo "2. Check if there's a proxy configuration issue"
echo "3. Try creating a new Remote Site Setting with a different name"
echo ""
echo "Share the output of this script with Claude Code for debugging"
