#!/bin/bash

echo "=== Fixing localhost endpoint issue ==="
echo ""

# 1. First, let's delete the old Remote Site Setting
echo "1. Deleting old Remote Site Setting..."
cat > delete_remote_site.apex << 'EOF'
// Query ToolingAPI to find the RemoteSiteSetting
List<Tooling.RemoteSiteSetting> sites = [
    SELECT Id, SiteName, EndpointUrl 
    FROM RemoteSiteSetting 
    WHERE SiteName = 'QuickBooksMiddleware' 
    LIMIT 1
];
if (!sites.isEmpty()) {
    delete sites[0];
    System.debug('Deleted RemoteSiteSetting: ' + sites[0].SiteName);
} else {
    System.debug('No RemoteSiteSetting found with name QuickBooksMiddleware');
}
EOF

# Since the above Tooling API approach might not work, let's use metadata API
echo "Using metadata API to remove remote site..."
mkdir -p temp_delete/remoteSiteSettings

# Create a destructive changes XML
cat > temp_delete/destructiveChanges.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>QuickBooksMiddleware</members>
        <name>RemoteSiteSetting</name>
    </types>
    <version>60.0</version>
</Package>
EOF

# Create empty package.xml
cat > temp_delete/package.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <version>60.0</version>
</Package>
EOF

# Deploy destructive changes
sf project deploy start -d temp_delete -o myorg

# Clean up
rm -rf temp_delete

echo ""
echo "2. Creating new Remote Site Setting with correct URL..."

# Update the Remote Site Setting with the correct ngrok URL
cat > force-app/main/default/remoteSiteSettings/QuickBooksMiddleware.remoteSite-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<RemoteSiteSetting xmlns="http://soap.sforce.com/2006/04/metadata">
    <disableProtocolSecurity>false</disableProtocolSecurity>
    <isActive>true</isActive>
    <url>https://3a62-166-1-160-232.ngrok-free.app</url>
</RemoteSiteSetting>
EOF

# Deploy the new Remote Site Setting
sf project deploy start -m RemoteSiteSetting:QuickBooksMiddleware -o myorg

echo ""
echo "3. Verifying Custom Settings..."
cat > verify_settings.apex << 'EOF'
QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
System.debug('=== Current Settings ===');
System.debug('Middleware URL: ' + settings.Middleware_URL__c);
System.debug('API Key: ' + settings.API_Key__c);
System.debug('Realm ID: ' + settings.QB_Realm_ID__c);

// Test the actual endpoint being used
String endpoint = settings.Middleware_URL__c + '/api/create-invoice';
System.debug('Full endpoint: ' + endpoint);

// Let's also check if there's any instance-specific setting overriding org defaults
List<QuickBooks_Settings__c> allSettings = [
    SELECT Id, Name, SetupOwnerId, Middleware_URL__c 
    FROM QuickBooks_Settings__c
];
System.debug('All settings records: ' + allSettings);
EOF

sf apex run --file verify_settings.apex --target-org myorg

echo ""
echo "4. Testing the actual callout..."
cat > test_actual_callout.apex << 'EOF'
// Test with the actual service
try {
    // Get settings 
    QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
    System.debug('Using URL: ' + settings.Middleware_URL__c);
    
    // Create request
    HttpRequest req = new HttpRequest();
    String endpoint = settings.Middleware_URL__c + '/health';
    req.setEndpoint(endpoint);
    req.setMethod('GET');
    req.setHeader('X-API-Key', settings.API_Key__c);
    req.setTimeout(10000);
    
    System.debug('Testing endpoint: ' + endpoint);
    
    // Make callout
    Http http = new Http();
    HttpResponse res = http.send(req);
    
    System.debug('Response status: ' + res.getStatusCode());
    System.debug('Response body: ' + res.getBody());
    
} catch(Exception e) {
    System.debug('Error: ' + e.getMessage());
    System.debug('Stack trace: ' + e.getStackTraceString());
}
EOF

sf apex run --file test_actual_callout.apex --target-org myorg

echo ""
echo "5. Alternative: Update settings directly if needed..."
echo "If the above doesn't work, run this command to force update the settings:"
echo ""
echo "sf data update record --sobject QuickBooks_Settings__c --record-id \$(sf data query --query \"SELECT Id FROM QuickBooks_Settings__c WHERE SetupOwnerId = '00e06000000B0AuAAK' LIMIT 1\" --json | jq -r '.result.records[0].Id') --values \"Middleware_URL__c='https://3a62-166-1-160-232.ngrok-free.app'\" --target-org myorg"

# Clean up
rm verify_settings.apex test_actual_callout.apex delete_remote_site.apex 2>/dev/null || true

echo ""
echo "=== Fix Complete ==="
echo "The Remote Site Setting should now be updated with the correct ngrok URL."
echo "Try the Create Invoice button in Salesforce again."
