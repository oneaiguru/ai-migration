#!/bin/bash
# verify_cleanup.sh
echo "=== Verifying Cleanup ==="

# Get org alias
echo "Enter your Salesforce org alias (or leave blank for default):"
read ORG_ALIAS
if [ -z "$ORG_ALIAS" ]; then
    ORG_ALIAS="myorg"
fi

# Check what's left
echo "Checking remaining QuickBooks components..."

# Retrieve current state
mkdir -p verify_temp
cat > verify_temp/package.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*QuickBook*</members>
        <name>ApexClass</name>
    </types>
    <types>
        <members>*quickBook*</members>
        <name>LightningComponentBundle</name>
    </types>
    <version>57.0</version>
</Package>
EOF

sf project retrieve start --manifest verify_temp/package.xml --target-org "$ORG_ALIAS" --output-dir verify_temp

echo ""
echo "=== Remaining QuickBooks Components ==="
echo ""
echo "Apex Classes:"
find verify_temp -name "*.cls" | grep -i quickbook || echo "None found"
echo ""
echo "Lightning Components:"
find verify_temp -path "*/lwc/*" -name "*.js" | grep -i quickbook || echo "None found"
echo ""

# Clean up
rm -rf verify_temp

echo ""
echo "✓ Verification complete!"
echo ""
echo "You should only see components with '2025' in the name."
echo "If you see any without '2025', run the removal script again."