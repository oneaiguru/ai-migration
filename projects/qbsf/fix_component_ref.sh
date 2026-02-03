#!/bin/bash
# Script to fix component reference issue

echo "=== Fixing Component Reference Issue ==="

# Get org alias
echo "Enter your Salesforce org alias (or leave blank for default):"
read ORG_ALIAS
if [ -z "$ORG_ALIAS" ]; then
    ORG_ALIAS="myorg"
fi

# Option 1: Check what's referencing quickBooksSimpleButton
echo "Checking for references to quickBooksSimpleButton..."

# Create a temporary directory
mkdir -p temp_check
cd temp_check

# Create package.xml to retrieve all metadata
cat > package.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*</members>
        <name>QuickAction</name>
    </types>
    <types>
        <members>*</members>
        <name>ApexClass</name>
    </types>
    <types>
        <members>*</members>
        <name>FlexiPage</name>
    </types>
    <version>57.0</version>
</Package>
EOF

echo "Retrieving metadata to find references..."
sf project retrieve start --manifest package.xml --target-org "$ORG_ALIAS" --output-dir .

# Search for references to quickBooksSimpleButton
echo ""
echo "=== Searching for quickBooksSimpleButton references ==="
grep -r "quickBooksSimpleButton" . 2>/dev/null || echo "No references found"

cd ..

# Option 2: Create the missing component as a copy of quickBooksInvoice
echo ""
echo "Creating quickBooksSimpleButton as a copy of quickBooksInvoice..."

# Copy the existing component
if [ -d "force-app/main/default/lwc/quickBooksInvoice" ]; then
    cp -r force-app/main/default/lwc/quickBooksInvoice force-app/main/default/lwc/quickBooksSimpleButton
    
    # Update the component name in the files
    cd force-app/main/default/lwc/quickBooksSimpleButton
    
    # Rename files
    mv quickBooksInvoice.html quickBooksSimpleButton.html
    mv quickBooksInvoice.js quickBooksSimpleButton.js
    mv quickBooksInvoice.js-meta.xml quickBooksSimpleButton.js-meta.xml
    
    # Update class name in JS file
    sed -i '' 's/export default class QuickBooksInvoice/export default class QuickBooksSimpleButton/g' quickBooksSimpleButton.js 2>/dev/null || \
    sed -i 's/export default class QuickBooksInvoice/export default class QuickBooksSimpleButton/g' quickBooksSimpleButton.js
    
    echo "✓ Created quickBooksSimpleButton component"
    cd ../../../../..
else
    echo "Error: quickBooksInvoice component not found"
    exit 1
fi

# Option 3: Fix the Quick Action reference (if that's the issue)
echo ""
echo "Checking Quick Action configuration..."

# Create a check script
cat > checkQuickAction.apex << 'EOF'
List<QuickAction> qActions = [
    SELECT Id, DeveloperName, SourceEntity, Type, 
           OptionsCreateFeedItem, Label, StandardLabel, 
           TargetObject, TargetRecordTypeId
    FROM QuickAction 
    WHERE SourceEntity = 'Opportunity' 
    AND DeveloperName LIKE '%QuickBook%'
];

for(QuickAction qa : qActions) {
    System.debug('Quick Action: ' + qa.DeveloperName);
    System.debug('Label: ' + qa.Label);
    System.debug('Type: ' + qa.Type);
}
EOF

sf apex run --file checkQuickAction.apex --target-org "$ORG_ALIAS"
rm checkQuickAction.apex

echo ""
echo "=== Fix Complete ==="
echo ""
echo "Now try deploying again with ./g_deploy_salesforce.sh"
echo ""
echo "If the issue persists, we may need to:"
echo "1. Create/update a Quick Action"
echo "2. Fix any Apex references"
echo "3. Update the Lightning page configuration"

# Clean up
rm -rf temp_check
