#!/bin/bash
# Script G: Create custom fields on Opportunity

echo "=== Creating Custom Fields on Opportunity ==="

# Get org alias
echo "Enter your Salesforce org alias (or leave blank for default):"
read ORG_ALIAS

if [ -z "$ORG_ALIAS" ]; then
    ORG_ALIAS="myorg"
fi

# Create Opportunity custom fields
echo "Creating custom fields on Opportunity object..."
mkdir -p force-app/main/default/objects/Opportunity/fields

# Create QB_Invoice_ID__c field
cat > force-app/main/default/objects/Opportunity/fields/QB_Invoice_ID__c.field-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Invoice_ID__c</fullName>
    <externalId>false</externalId>
    <label>QB Invoice ID</label>
    <length>255</length>
    <required>false</required>
    <type>Text</type>
    <unique>false</unique>
</CustomField>
EOF

# Create QB_Invoice_Number__c field
cat > force-app/main/default/objects/Opportunity/fields/QB_Invoice_Number__c.field-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Invoice_Number__c</fullName>
    <externalId>false</externalId>
    <label>QB Invoice Number</label>
    <length>255</length>
    <required>false</required>
    <type>Text</type>
    <unique>false</unique>
</CustomField>
EOF

echo "✓ Created custom field definitions"

# Create package.xml for Opportunity fields
cat > force-app/main/default/package-opportunity-fields.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>Opportunity.QB_Invoice_ID__c</members>
        <members>Opportunity.QB_Invoice_Number__c</members>
        <n>CustomField</n>
    </types>
    <version>57.0</version>
</Package>
EOF

# Deploy the custom fields
echo ""
echo "Deploying custom fields to Opportunity..."
sf project deploy start --manifest force-app/main/default/package-opportunity-fields.xml --target-org "$ORG_ALIAS" --wait 10

echo ""
echo "Custom fields deployment complete!"
echo "Next: Run ./h-deploy-to-salesforce.sh to deploy the Apex classes and LWC"
