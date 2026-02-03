#!/bin/bash
# Script 4: Deploy to Salesforce

echo "=== Deploying to Salesforce ==="

# Check if Salesforce CLI is installed (sf command)
if ! command -v sf &> /dev/null; then
    echo "Error: Salesforce CLI (sf) is not installed"
    echo "Please install it from: https://developer.salesforce.com/tools/sfdxcli"
    exit 1
fi

# Prompt for Salesforce org alias
echo "Enter your Salesforce org alias (or leave blank to use default):"
read ORG_ALIAS

if [ -z "$ORG_ALIAS" ]; then
    ORG_ALIAS="myorg"
fi

# Check if already authenticated
echo "Checking Salesforce authentication..."
if ! sf org display --target-org "$ORG_ALIAS" &> /dev/null; then
    echo "Not authenticated. Let's authenticate to Salesforce..."
    echo "This will open a browser window for authentication."
    sf org login web --alias "$ORG_ALIAS" --instance-url https://login.salesforce.com
fi

# Create a deployment package.xml
echo "Creating deployment package.xml..."
mkdir -p force-app/main/default
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
    <version>57.0</version>
</Package>
EOF

# Deploy to Salesforce
echo "Deploying to Salesforce org: $ORG_ALIAS"
echo "This may take a few minutes..."

if sf project deploy start --source-dir force-app --target-org "$ORG_ALIAS" --wait 10; then
    echo ""
    echo "✓ Deployment successful!"
    echo ""
    echo "Components deployed:"
    echo "- LWC: quickBooksInvoice"
    echo "- Apex: QuickBooksInvoiceController"
    echo "- Apex: QuickBooksAPIService"
    echo "- Test: QuickBooksInvoiceControllerTest"
    echo ""
    echo "Next step: Run ./5-configure-custom-settings.sh"
else
    echo ""
    echo "✗ Deployment failed!"
    echo "Please check the error messages above."
    echo ""
    echo "Common issues:"
    echo "1. Not authenticated - run: sf org login web"
    echo "2. API version mismatch - update package.xml version"
    echo "3. Code compilation errors - check Apex syntax"
    exit 1
fi
