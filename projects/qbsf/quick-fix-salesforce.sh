#!/bin/bash

echo "=== Quick Fix for Salesforce-QuickBooks Integration ==="
echo ""

# 1. First check what's actually being used in the callout
echo "1. Checking current endpoint in QuickBooksAPIService..."
cat > debug_endpoint.apex << 'EOF'
// Debug the actual endpoint being used
QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
String endpoint = settings.Middleware_URL__c + '/api/create-invoice';
System.debug('Settings URL: ' + settings.Middleware_URL__c);
System.debug('Full endpoint: ' + endpoint);

// Check if there's hardcoded localhost anywhere
System.debug('Contains localhost: ' + endpoint.contains('localhost'));

// Try to make a test request
HttpRequest req = new HttpRequest();
req.setEndpoint(endpoint);
System.debug('HttpRequest endpoint: ' + req.getEndpoint());
EOF

sf apex run --file debug_endpoint.apex --target-org myorg
rm debug_endpoint.apex

echo ""
echo "2. Force updating the Custom Setting..."
cat > update_settings.apex << 'EOF'
QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
settings.Middleware_URL__c = 'https://3a62-166-1-160-232.ngrok-free.app';
settings.API_Key__c = 'quickbooks_salesforce_api_key_2025';
settings.QB_Realm_ID__c = '4620816365337654250'; // Update this if different
upsert settings;
System.debug('Settings updated successfully');
System.debug('New URL: ' + settings.Middleware_URL__c);
EOF

sf apex run --file update_settings.apex --target-org myorg
rm update_settings.apex

echo ""
echo "3. Creating Named Credential (alternative approach)..."
echo "Sometimes Remote Site Settings cache. Let's try a Named Credential instead."

# Create a Named Credential
cat > force-app/main/default/namedCredentials/QuickBooksMiddleware.namedCredential-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<NamedCredential xmlns="http://soap.sforce.com/2006/04/metadata">
    <allowMergeFieldsInBody>false</allowMergeFieldsInBody>
    <allowMergeFieldsInHeader>true</allowMergeFieldsInHeader>
    <endpoint>https://3a62-166-1-160-232.ngrok-free.app</endpoint>
    <generateAuthorizationHeader>false</generateAuthorizationHeader>
    <label>QuickBooks Middleware</label>
    <principalType>NamedUser</principalType>
    <protocol>NoAuthentication</protocol>
    <isActive>true</isActive>
</NamedCredential>
EOF

# Deploy Named Credential
sf project deploy start -m NamedCredential:QuickBooksMiddleware -o myorg

echo ""
echo "4. Test the connection using different approaches..."
cat > test_connection.apex << 'EOF'
// Test 1: Direct HTTP call
try {
    Http http = new Http();
    HttpRequest req = new HttpRequest();
    req.setEndpoint('https://3a62-166-1-160-232.ngrok-free.app/health');
    req.setMethod('GET');
    req.setHeader('X-API-Key', 'quickbooks_salesforce_api_key_2025');
    HttpResponse res = http.send(req);
    System.debug('Direct call result: ' + res.getStatusCode() + ' - ' + res.getBody());
} catch(Exception e) {
    System.debug('Direct call error: ' + e.getMessage());
}

// Test 2: Using Custom Settings
try {
    QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
    Http http = new Http();
    HttpRequest req = new HttpRequest();
    req.setEndpoint(settings.Middleware_URL__c + '/health');
    req.setMethod('GET');
    req.setHeader('X-API-Key', settings.API_Key__c);
    HttpResponse res = http.send(req);
    System.debug('Custom settings call result: ' + res.getStatusCode() + ' - ' + res.getBody());
} catch(Exception e) {
    System.debug('Custom settings call error: ' + e.getMessage());
}

// Test 3: Using Named Credential
try {
    Http http = new Http();
    HttpRequest req = new HttpRequest();
    req.setEndpoint('callout:QuickBooksMiddleware/health');
    req.setMethod('GET');
    req.setHeader('X-API-Key', 'quickbooks_salesforce_api_key_2025');
    HttpResponse res = http.send(req);
    System.debug('Named credential call result: ' + res.getStatusCode() + ' - ' + res.getBody());
} catch(Exception e) {
    System.debug('Named credential call error: ' + e.getMessage());
}
EOF

sf apex run --file test_connection.apex --target-org myorg
rm test_connection.apex

echo ""
echo "=== IMPORTANT: Manual Steps Required ==="
echo "1. Go to Setup → Security → Remote Site Settings"
echo "2. Delete the 'QuickBooksMiddleware' entry if it exists"
echo "3. Create a new Remote Site Setting:"
echo "   - Remote Site Name: QuickBooksMiddleware"
echo "   - Remote Site URL: https://3a62-166-1-160-232.ngrok-free.app"
echo "   - Active: checked"
echo ""
echo "4. If using Named Credential, update your Apex code to use:"
echo "   req.setEndpoint('callout:QuickBooksMiddleware/api/create-invoice');"
echo ""
echo "5. Clear any browser cache and try the Create Invoice button again."
