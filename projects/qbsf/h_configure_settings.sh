#!/bin/bash
# Script H: Configure QuickBooks Settings in Salesforce

echo "=== Configuring QuickBooks Settings ==="

# Get environment values
MIDDLEWARE_URL="${MIDDLEWARE_URL:-http://localhost:3000}"
API_KEY="${API_KEY:-quickbooks_salesforce_api_key_2025}"
QB_REALM="${QB_REALM:-9341454378379755}"

echo "Current configuration:"
echo "Middleware URL: $MIDDLEWARE_URL"
echo "API Key: ${API_KEY:0:10}..." # Show only first 10 chars for security
echo "QuickBooks Realm: $QB_REALM"
echo ""

# Get org alias
echo "Enter your Salesforce org alias (or leave blank to use default):"
read ORG_ALIAS

if [ -z "$ORG_ALIAS" ]; then
    ORG_ALIAS="myorg"
fi

# Create script to insert the settings data
echo "Creating settings configuration script..."
cat > configureSettings.apex << EOF
// Insert or update QuickBooks Settings
QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
if (settings == null) {
    settings = new QuickBooks_Settings__c();
}
settings.Middleware_URL__c = '$MIDDLEWARE_URL';
settings.API_Key__c = '$API_KEY';
settings.QB_Realm_ID__c = '$QB_REALM';
upsert settings;
System.debug('QuickBooks Settings configured: ' + settings);

// Verify the settings were saved
QuickBooks_Settings__c savedSettings = QuickBooks_Settings__c.getOrgDefaults();
System.debug('Middleware URL: ' + savedSettings.Middleware_URL__c);
System.debug('API Key: ' + savedSettings.API_Key__c);
System.debug('QB Realm ID: ' + savedSettings.QB_Realm_ID__c);
EOF

# Execute the script
echo "Configuring settings in Salesforce..."
sf apex run --file configureSettings.apex --target-org "$ORG_ALIAS"

# Clean up
rm configureSettings.apex

echo ""
echo "✓ QuickBooks Settings configured successfully!"
echo ""
echo "Next step: Run ./i-configure-lightning-page.sh"
echo ""
echo "Settings Summary:"
echo "- Middleware URL: $MIDDLEWARE_URL"
echo "- API Key: Configured (hidden for security)"
echo "- QuickBooks Realm ID: $QB_REALM"
