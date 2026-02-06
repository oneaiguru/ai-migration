#!/bin/bash
# Script to deploy Salesforce components for QuickBooks integration

# Configure these variables
SF_ORG_ALIAS="SalesforceOrg"  # Your Salesforce org alias
MIDDLEWARE_URL="http://localhost:3000"  # Your middleware URL
API_KEY="quickbooks_salesforce_api_key_2025"  # Your API key from test-middleware.sh

echo "=== Salesforce Deployment Script ==="
echo "This script will deploy QuickBooks integration components to Salesforce"

# Check if Salesforce CLI is installed
if ! command -v sf &> /dev/null; then
    echo "ERROR: Salesforce CLI is not installed. Please install it first."
    echo "Run: npm install -g @salesforce/cli"
    exit 1
fi

# Create SFDX project structure
echo "Creating SFDX project structure..."
mkdir -p force-app/main/default/classes
mkdir -p force-app/main/default/lwc
mkdir -p force-app/main/default/objects/Opportunity/fields
mkdir -p force-app/main/default/quickActions

# Copy components to SFDX structure
echo "Copying components to SFDX structure..."
cp -r classes/* force-app/main/default/classes/
cp -r lwc/* force-app/main/default/lwc/
cp -r quickActions/* force-app/main/default/quickActions/

# Create meta files with correct formatting
echo "Creating metadata files..."

# Apex Class Meta File
cat > force-app/main/default/classes/QuickBooksInvoker.cls-meta.xml << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOL

# LWC Meta File
cat > force-app/main/default/lwc/createQuickBooksInvoice/createQuickBooksInvoice.js-meta.xml << 'EOL'
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
EOL

# Create custom field metadata
cat > force-app/main/default/objects/Opportunity/fields/QB_Invoice_ID__c.field-meta.xml << 'EOL'
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
EOL

# Quick Action Meta File
cat > force-app/main/default/quickActions/CreateQuickBooksInvoice.quickAction-meta.xml << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<QuickAction xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Create QuickBooks Invoice</label>
    <optionsCreateFeedItem>false</optionsCreateFeedItem>
    <successMessage>QuickBooks invoice creation initiated! Check the opportunity in a few seconds for the invoice ID.</successMessage>
    <targetObject>Opportunity</targetObject>
    <type>Create</type>
    <lightningWebComponent>createQuickBooksInvoice</lightningWebComponent>
</QuickAction>
EOL

echo "Verifying file structure..."
find force-app -type f | sort

echo ""
echo "=== Authentication and Deployment ==="
echo "First, authenticate with your Salesforce org:"
echo "sf org login web -a $SF_ORG_ALIAS"
echo ""
echo "Then deploy each component individually with:"
echo "sf project deploy start -d force-app/main/default/classes -o $SF_ORG_ALIAS --wait 10"
echo "sf project deploy start -d force-app/main/default/lwc -o $SF_ORG_ALIAS --wait 10"
echo "sf project deploy start -d force-app/main/default/objects/Opportunity/fields -o $SF_ORG_ALIAS --wait 10"
echo "sf project deploy start -d force-app/main/default/quickActions -o $SF_ORG_ALIAS --wait 10"
echo ""
echo "After deployment, don't forget:"
echo "1. Add the Remote Site Setting in Salesforce:"
echo "   - Go to Setup → Remote Site Settings"
echo "   - Click 'New Remote Site'"
echo "   - Remote Site Name: QuickBooksMiddleware"
echo "   - Remote Site URL: $MIDDLEWARE_URL"
echo "   - Active: ✓ Checked"
echo "   - Save"
echo ""
echo "2. Add the Quick Action to the Opportunity page layout"
echo "3. Ensure the middleware is running at $MIDDLEWARE_URL with API key: $API_KEY"