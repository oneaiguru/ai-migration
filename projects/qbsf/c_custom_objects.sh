#!/bin/bash
# Script C: Create Custom Objects and Settings

echo "=== Creating Custom Objects and Settings ==="

# Create custom object structure
echo "Creating QuickBooks Settings custom object..."
mkdir -p force-app/main/default/objects/QuickBooks_Settings__c/fields

# Create the custom object definition
cat > force-app/main/default/objects/QuickBooks_Settings__c/QuickBooks_Settings__c.object-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <customSettingsType>Hierarchy</customSettingsType>
    <enableFeeds>false</enableFeeds>
    <label>QuickBooks Settings</label>
    <visibility>Public</visibility>
</CustomObject>
EOF

# Create field: Middleware_URL__c
cat > force-app/main/default/objects/QuickBooks_Settings__c/fields/Middleware_URL__c.field-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Middleware_URL__c</fullName>
    <externalId>false</externalId>
    <label>Middleware URL</label>
    <length>255</length>
    <required>true</required>
    <trackTrending>false</trackTrending>
    <type>Text</type>
    <unique>false</unique>
</CustomField>
EOF

# Create field: API_Key__c
cat > force-app/main/default/objects/QuickBooks_Settings__c/fields/API_Key__c.field-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>API_Key__c</fullName>
    <externalId>false</externalId>
    <label>API Key</label>
    <length>255</length>
    <required>true</required>
    <trackTrending>false</trackTrending>
    <type>Text</type>
    <unique>false</unique>
</CustomField>
EOF

# Create field: QB_Realm_ID__c
cat > force-app/main/default/objects/QuickBooks_Settings__c/fields/QB_Realm_ID__c.field-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Realm_ID__c</fullName>
    <externalId>false</externalId>
    <label>QuickBooks Realm ID</label>
    <length>50</length>
    <required>true</required>
    <trackTrending>false</trackTrending>
    <type>Text</type>
    <unique>false</unique>
</CustomField>
EOF

echo "✓ Created QuickBooks Settings custom object"

# Create Remote Site Settings
echo "Creating Remote Site Settings..."
mkdir -p force-app/main/default/remoteSiteSettings

cat > force-app/main/default/remoteSiteSettings/QuickBooksMiddleware.remoteSite-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<RemoteSiteSetting xmlns="http://soap.sforce.com/2006/04/metadata">
    <disableProtocolSecurity>false</disableProtocolSecurity>
    <isActive>true</isActive>
    <url>http://localhost:3000</url>
</RemoteSiteSetting>
EOF

echo "✓ Created Remote Site Settings"

echo ""
echo "Custom objects and settings created successfully!"
echo "Next: Run ./d-create-opportunity-fields.sh"
