#!/bin/bash

echo "=== Salesforce QuickBooks Integration Diagnostic ==="
echo ""

# 1. Check all settings
echo "1. Checking all Custom Settings..."
echo "SELECT Id, Name, SetupOwnerId, Middleware_URL__c, API_Key__c, QB_Realm_ID__c FROM QuickBooks_Settings__c" | sf data query --query --target-org myorg

echo ""
echo "2. Testing the actual endpoint being used in the error..."
cat > diagnose_issue.apex << 'EOF'
// Get the opportunity that's failing
String oppId = '0060600000JqPqtAAF'; // Replace with your opportunity ID

try {
    // Simulate exactly what happens when the button is clicked
    System.debug('=== Starting Invoice Creation Process ===');
    
    // Get settings
    QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
    System.debug('Settings URL: ' + settings.Middleware_URL__c);
    System.debug('API Key: ' + settings.API_Key__c);
    
    // Build the endpoint
    String endpoint = settings.Middleware_URL__c + '/api/create-invoice';
    System.debug('Constructed endpoint: ' + endpoint);
    
    // Create the request exactly as the service does
    HttpRequest req = new HttpRequest();
    req.setEndpoint(endpoint);
    req.setMethod('POST');
    req.setHeader('Content-Type', 'application/json');
    req.setHeader('X-API-Key', settings.API_Key__c);
    req.setTimeout(60000);
    
    // Create request body
    Map<String, Object> requestBody = new Map<String, Object>{
        'opportunityId' => oppId,
        'salesforceInstance' => URL.getOrgDomainUrl().toExternalForm(),
        'quickbooksRealm' => settings.QB_Realm_ID__c
    };
    
    String body = JSON.serialize(requestBody);
    req.setBody(body);
    
    System.debug('Request endpoint: ' + req.getEndpoint());
    System.debug('Request body: ' + body);
    
    // Attempt the callout
    Http http = new Http();
    HttpResponse res = http.send(req);
    
    System.debug('Response status: ' + res.getStatusCode());
    System.debug('Response body: ' + res.getBody());
    
} catch(System.CalloutException e) {
    System.debug('CALLOUT ERROR: ' + e.getMessage());
    System.debug('Error Type: ' + e.getTypeName());
    System.debug('Stack Trace: ' + e.getStackTraceString());
} catch(Exception e) {
    System.debug('OTHER ERROR: ' + e.getMessage());
    System.debug('Error Type: ' + e.getTypeName());
    System.debug('Stack Trace: ' + e.getStackTraceString());
}
EOF

echo "IMPORTANT: Update the oppId in the script above with your actual opportunity ID"
sf apex run --file diagnose_issue.apex --target-org myorg

echo ""
echo "3. Alternative approach - Using hardcoded ngrok URL directly..."
cat > test_hardcoded.apex << 'EOF'
try {
    HttpRequest req = new HttpRequest();
    // Hardcode the ngrok URL to bypass any settings issues
    req.setEndpoint('https://3a62-166-1-160-232.ngrok-free.app/api/create-invoice');
    req.setMethod('POST');
    req.setHeader('Content-Type', 'application/json');
    req.setHeader('X-API-Key', 'quickbooks_salesforce_api_key_2025');
    
    Map<String, Object> testBody = new Map<String, Object>{
        'opportunityId' => '0060600000JqPqtAAF', // Replace with your opportunity ID
        'salesforceInstance' => 'https://your-instance.my.salesforce.com',
        'quickbooksRealm' => '4620816365337654250'
    };
    
    req.setBody(JSON.serialize(testBody));
    
    System.debug('Testing with hardcoded URL: ' + req.getEndpoint());
    
    Http http = new Http();
    HttpResponse res = http.send(req);
    
    System.debug('Response: ' + res.getStatusCode() + ' - ' + res.getBody());
} catch(Exception e) {
    System.debug('Error with hardcoded URL: ' + e.getMessage());
}
EOF

sf apex run --file test_hardcoded.apex --target-org myorg

# Clean up
rm diagnose_issue.apex test_hardcoded.apex 2>/dev/null || true

echo ""
echo "=== Diagnosis Complete ==="
echo ""
echo "If you're still seeing localhost in the error, it might be because:"
echo "1. There's a cached version of the Remote Site Setting"
echo "2. There's a workflow or process that's overriding the settings"
echo "3. The error is being generated from a different part of the code"
echo ""
echo "Try these manual steps:"
echo "1. Go to Setup → Custom Settings → QuickBooks Settings → Manage"
echo "2. Click 'New' or 'Edit' for Organization Default"
echo "3. Set Middleware URL to: https://3a62-166-1-160-232.ngrok-free.app"
echo "4. Save"
echo ""
echo "Then go to Setup → Security → Remote Site Settings and ensure the ngrok URL is there."
