#!/bin/bash
# Script F: Deploy custom object first

echo "=== Deploying Custom Object First ==="

# Get org alias
echo "Enter your Salesforce org alias (or leave blank for default):"
read ORG_ALIAS

if [ -z "$ORG_ALIAS" ]; then
    ORG_ALIAS="myorg"
fi

# Create custom object structure
echo "Creating QuickBooks Settings custom object..."
mkdir -p force-app/main/default/objects/QuickBooks_Settings__c/fields

# Create the custom object definition (fixed XML structure)
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
    <type>Text</type>
    <unique>false</unique>
</CustomField>
EOF

echo "✓ Created custom object structure"

# Create package.xml for custom object only
cat > force-app/main/default/package-customobject.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>QuickBooks_Settings__c</members>
        <n>CustomObject</n>
    </types>
    <types>
        <members>QuickBooks_Settings__c.Middleware_URL__c</members>
        <members>QuickBooks_Settings__c.API_Key__c</members>
        <members>QuickBooks_Settings__c.QB_Realm_ID__c</members>
        <n>CustomField</n>
    </types>
    <version>57.0</version>
</Package>
EOF

# Deploy only the custom object
echo ""
echo "Deploying custom object to Salesforce..."
sf project deploy start --manifest force-app/main/default/package-customobject.xml --target-org "$ORG_ALIAS" --wait 10

echo ""
echo "Custom object deployment complete!"
echo "Next: Run ./g-deploy-opportunity-fields.sh to add fields to Opportunity"
