#!/bin/bash
# remove_incorrect_integration.sh
echo "=== Removing Incorrect QuickBooks Integration ==="

# Get org alias
echo "Enter your Salesforce org alias (or leave blank for default):"
read ORG_ALIAS
if [ -z "$ORG_ALIAS" ]; then
    ORG_ALIAS="myorg"
fi

# Step 1: Retrieve all metadata to find components
echo "Retrieving metadata to identify components..."
mkdir -p temp_metadata
cat > temp_metadata/package.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*</members>
        <name>ApexClass</name>
    </types>
    <types>
        <members>*</members>
        <name>LightningComponentBundle</name>
    </types>
    <types>
        <members>*</members>
        <name>QuickAction</name>
    </types>
    <version>57.0</version>
</Package>
EOF

sf project retrieve start --manifest temp_metadata/package.xml --target-org "$ORG_ALIAS" --output-dir temp_metadata

# Find components from the incorrect integration
echo ""
echo "=== Components found (looking for non-2025 versions) ==="
echo ""
echo "Apex Classes:"
find temp_metadata -name "*.cls" | grep -i quickbook | grep -v 2025 || echo "None found"
echo ""
echo "Lightning Components:"
find temp_metadata -path "*/lwc/*" -name "*.js" | grep -i quickbook | grep -v 2025 || echo "None found"
echo ""
echo "Quick Actions:"
find temp_metadata -name "*.quickAction-meta.xml" | grep -i quickbook | grep -v 2025 || echo "None found"

# Create destructive changes for incorrect components
mkdir -p destructive_changes

# Prepare list of components to delete
echo "Preparing components for deletion..."

# Create destructive changes XML
cat > destructive_changes/destructiveChanges.xml << 'EOF'
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
        <members>CreateQuickBooksInvoice</members>
        <members>Create_QuickBooks_Invoice</members>
        <name>QuickAction</name>
    </types>
    <version>57.0</version>
</Package>
EOF

cat > destructive_changes/package.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <version>57.0</version>
</Package>
EOF

echo ""
echo "Ready to delete the following components:"
echo "- Apex: QuickBooksInvoiceController, QuickBooksAPIService"
echo "- LWC: quickBooksInvoice"
echo "- Actions: CreateQuickBooksInvoice"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Deploy destructive changes
echo "Removing components..."
sf project deploy start --manifest destructive_changes/destructiveChanges.xml --pre-destructive-changes destructive_changes/destructiveChanges.xml --target-org "$ORG_ALIAS"

# Clean up
rm -rf temp_metadata destructive_changes

echo ""
echo "✓ Component removal complete!"