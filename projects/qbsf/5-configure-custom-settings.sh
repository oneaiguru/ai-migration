#!/bin/bash
# Script 5: Configure Custom Settings

echo "=== Configuring Custom Settings in Salesforce ==="

# Get middleware configuration from environment
MIDDLEWARE_URL="${MIDDLEWARE_URL:-http://localhost:3000}"
API_KEY="${API_KEY:-quickbooks_salesforce_api_key_2025}"
QB_REALM="${QB_REALM:-9341454378379755}"

echo "Current configuration:"
echo "Middleware URL: $MIDDLEWARE_URL"
echo "API Key: $API_KEY"
echo "QuickBooks Realm: $QB_REALM"
echo ""

# Create the custom settings object
echo "Creating QuickBooks Settings custom object..."

# Create custom setting metadata
mkdir -p force-app/main/default/objects/QuickBooks_Settings__c
cat > force-app/main/default/objects/QuickBooks_Settings__c/QuickBooks_Settings__c.object-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <customSettingsType>Hierarchy</customSettingsType>
    <label>QuickBooks Settings</label>
    <enableFeeds>false</enableFeeds>
    <visibility>Public</visibility>
</CustomObject>
EOF

# Create fields
mkdir -p "force-app/main/default/objects/QuickBooks_Settings__c/fields"

cat > "force-app/main/default/objects/QuickBooks_Settings__c/fields/Middleware_URL__c.field-meta.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Middleware_URL__c</fullName>
    <label>Middleware URL</label>
    <type>Text</type>
    <length>255</length>
    <required>true</required>
</CustomField>
EOF

cat > "force-app/main/default/objects/QuickBooks_Settings__c/fields/API_Key__c.field-meta.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>API_Key__c</fullName>
    <label>API Key</label>
    <type>Text</type>
    <length>255</length>
    <required>true</required>
</CustomField>
EOF

cat > "force-app/main/default/objects/QuickBooks_Settings__c/fields/QB_Realm_ID__c.field-meta.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Realm_ID__c</fullName>
    <label>QuickBooks Realm ID</label>
    <type>Text</type>
    <length>50</length>
    <required>true</required>
</CustomField>
EOF

# Update package.xml to include custom settings
cat > force-app/main/default/package.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>QuickBooksInvoiceController</members>
        <members>QuickBooksAPIService</members>
        <members>QuickBooksInvoiceControllerTest</members>
        <name>ApexClass</name>
    </types>
    <types>
        <members>quickBooksInvoice</members>
        <name>LightningComponentBundle</name>
    </types>
    <types>
        <members>QuickBooks_Settings__c</members>
        <name>CustomObject</name>
    </types>
    <types>
        <members>QuickBooks_Settings__c.Middleware_URL__c</members>
        <members>QuickBooks_Settings__c.API_Key__c</members>
        <members>QuickBooks_Settings__c.QB_Realm_ID__c</members>
        <name>CustomField</name>
    </types>
    <version>57.0</version>
</Package>
EOF

# Get org alias
echo "Enter your Salesforce org alias:"
read ORG_ALIAS

if [ -z "$ORG_ALIAS" ]; then
    ORG_ALIAS="myorg"
fi

# Deploy custom settings
echo "Deploying custom settings..."
sf project deploy start --source-dir force-app/main/default/objects --target-org "$ORG_ALIAS" --wait 10

# Create script to insert the settings data
echo "Creating settings data script..."
cat > insertSettings.apex << EOF
// Insert QuickBooks Settings
QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
settings.Middleware_URL__c = '$MIDDLEWARE_URL';
settings.API_Key__c = '$API_KEY';
settings.QB_Realm_ID__c = '$QB_REALM';
upsert settings;
System.debug('QuickBooks Settings configured: ' + settings);
EOF

# Execute the script
echo "Configuring settings in Salesforce..."
sf apex run --file insertSettings.apex --target-org "$ORG_ALIAS"

echo ""
echo "✓ Custom settings configured successfully!"
echo ""
echo "Next step: Run ./6-configure-lightning-app-builder.sh"
