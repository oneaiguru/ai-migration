#!/bin/bash
# Script D: Create Opportunity Custom Fields

echo "=== Creating Custom Fields on Opportunity ==="

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
    <trackFeedHistory>false</trackFeedHistory>
    <trackHistory>false</trackHistory>
    <trackTrending>false</trackTrending>
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
    <trackFeedHistory>false</trackFeedHistory>
    <trackHistory>false</trackHistory>
    <trackTrending>false</trackTrending>
    <type>Text</type>
    <unique>false</unique>
</CustomField>
EOF

# Create QB_Payment_ID__c field
cat > force-app/main/default/objects/Opportunity/fields/QB_Payment_ID__c.field-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Payment_ID__c</fullName>
    <externalId>false</externalId>
    <label>QB Payment ID</label>
    <length>255</length>
    <required>false</required>
    <trackFeedHistory>false</trackFeedHistory>
    <trackHistory>false</trackHistory>
    <trackTrending>false</trackTrending>
    <type>Text</type>
    <unique>false</unique>
</CustomField>
EOF

# Create QB_Payment_Date__c field
cat > force-app/main/default/objects/Opportunity/fields/QB_Payment_Date__c.field-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Payment_Date__c</fullName>
    <externalId>false</externalId>
    <label>QB Payment Date</label>
    <required>false</required>
    <trackFeedHistory>false</trackFeedHistory>
    <trackHistory>false</trackHistory>
    <trackTrending>false</trackTrending>
    <type>Date</type>
</CustomField>
EOF

# Create QB_Payment_Method__c field
cat > force-app/main/default/objects/Opportunity/fields/QB_Payment_Method__c.field-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Payment_Method__c</fullName>
    <externalId>false</externalId>
    <label>QB Payment Method</label>
    <length>255</length>
    <required>false</required>
    <trackFeedHistory>false</trackFeedHistory>
    <trackHistory>false</trackHistory>
    <trackTrending>false</trackTrending>
    <type>Text</type>
    <unique>false</unique>
</CustomField>
EOF

# Create QB_Payment_Amount__c field
cat > force-app/main/default/objects/Opportunity/fields/QB_Payment_Amount__c.field-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Payment_Amount__c</fullName>
    <externalId>false</externalId>
    <label>QB Payment Amount</label>
    <precision>18</precision>
    <required>false</required>
    <scale>2</scale>
    <trackFeedHistory>false</trackFeedHistory>
    <trackHistory>false</trackHistory>
    <trackTrending>false</trackTrending>
    <type>Number</type>
    <unique>false</unique>
</CustomField>
EOF

echo "✓ Created Opportunity custom fields"

echo ""
echo "Opportunity fields created successfully!"
echo "Next: Run ./e-create-lwc-component.sh"
