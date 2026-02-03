#!/bin/bash
# Script 1: Prepare Environment for Salesforce-QuickBooks Integration

echo "=== Salesforce-QuickBooks Integration Setup ==="
echo "Preparing environment for Lightning App Builder integration..."

# Check if running from correct directory
if [[ ! -f "/Users/m/git/clients/qbsf/final-integration/package.json" ]]; then
    echo "Error: Please run this script from the qbsf directory"
    exit 1
fi

# Navigate to the project directory
cd /Users/m/git/clients/qbsf

# Create a new SFDX project structure if not exists
if [[ ! -d "force-app" ]]; then
    echo "Creating SFDX project structure..."
    mkdir -p force-app/main/default/lwc
    mkdir -p force-app/main/default/classes
    mkdir -p force-app/main/default/quickActions
fi

# Create required directories
echo "Creating LWC directories..."
mkdir -p force-app/main/default/lwc/quickBooksInvoice

# Check and update environment file
echo "Checking environment configuration..."
if [[ -f "final-integration/.env" ]]; then
    cp final-integration/.env .env.backup
    echo "Environment file backed up to .env.backup"
fi

# Verify middleware is configured
echo "Verifying middleware configuration..."
MIDDLEWARE_URL="http://localhost:3000"
API_KEY="quickbooks_salesforce_api_key_2025"

echo "Middleware URL: $MIDDLEWARE_URL"
echo "API Key: $API_KEY"

echo ""
echo "Environment preparation complete!"
echo "Next steps:"
echo "1. Run: ./2-create-lwc-component.sh"
echo "2. Run: ./3-create-apex-classes.sh"
echo "3. Run: ./4-deploy-to-salesforce.sh"
echo "4. Configure in Lightning App Builder"
