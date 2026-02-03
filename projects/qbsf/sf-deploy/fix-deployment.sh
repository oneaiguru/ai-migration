#!/bin/bash
# Script to fix and deploy Salesforce components

# Navigate to the sf-deploy directory
cd /Users/m/git/clients/qbsf/sf-deploy

# Create all meta files with correct formatting
echo "Creating correctly formatted metadata files..."

# 1. Apex Class Meta File
cat > force-app/main/default/classes/QuickBooksInvoker.cls-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

# 2. LWC Meta File
cat > force-app/main/default/lwc/createQuickBooksInvoice/createQuickBooksInvoice.js-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>Create QuickBooks Invoice</masterLabel>
    <description>Create QuickBooks invoice from Opportunity</description>
    <targets>
        <target>lightning__RecordAction</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__RecordAction">
            <actionType>ScreenAction</actionType>
            <objects>
                <object>Opportunity</object>
            </objects>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
EOF

# 3. Custom Field Meta File
cat > force-app/main/default/objects/Opportunity/fields/QB_Invoice_ID__c.field-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Invoice_ID__c</fullName>
    <description>QuickBooks Invoice ID</description>
    <externalId>false</externalId>
    <label>QuickBooks Invoice ID</label>
    <length>100</length>
    <required>false</required>
    <trackHistory>false</trackHistory>
    <type>Text</type>
    <unique>false</unique>
</CustomField>
EOF

# 4. Quick Action Meta File
cat > force-app/main/default/quickActions/CreateQuickBooksInvoice.quickAction-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<QuickAction xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Create QuickBooks Invoice</label>
    <optionsCreateFeedItem>false</optionsCreateFeedItem>
    <successMessage>QuickBooks invoice creation initiated! Check the opportunity in a few seconds for the invoice ID.</successMessage>
    <targetObject>Opportunity</targetObject>
    <type>Create</type>
    <lightningWebComponent>createQuickBooksInvoice</lightningWebComponent>
</QuickAction>
EOF

# Verify the structure
echo "Verifying file structure..."
find force-app -type f -name "*.xml" | sort

# Try to deploy each component separately
echo "Deploying each component individually..."

echo "1. Deploying Apex class..."
sf project deploy start -d force-app/main/default/classes -o myOrgAlias --wait 10

echo "2. Deploying LWC component..."
sf project deploy start -d force-app/main/default/lwc -o myOrgAlias --wait 10

echo "3. Deploying Custom Field..."
sf project deploy start -d force-app/main/default/objects/Opportunity/fields -o myOrgAlias --wait 10

echo "4. Deploying Quick Action..."
sf project deploy start -d force-app/main/default/quickActions -o myOrgAlias --wait 10

echo "Deployment completed."
echo "Don't forget to create the Remote Site Setting in Salesforce:"
echo "  - Go to Setup → Remote Site Settings"
echo "  - Click 'New Remote Site'"
echo "  - Remote Site Name: QuickBooksMiddleware"
echo "  - Remote Site URL: http://localhost:3000"
echo "  - Active: ✓ Checked"
echo "  - Save"