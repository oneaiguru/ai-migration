#!/bin/bash
# Script B: Prepare Environment

echo "=== Preparing Environment for Salesforce-QuickBooks Integration ==="

# Check if we're in a directory with sfdx-project.json
if [[ ! -f "sfdx-project.json" ]]; then
    echo "Error: sfdx-project.json not found."
    echo "Please run ./a-create-project-structure.sh first"
    exit 1
fi

# Check if final-integration directory exists in current path
FINAL_INTEGRATION_DIR="./final-integration"
if [[ ! -d "$FINAL_INTEGRATION_DIR" ]]; then
    echo "Warning: final-integration directory not found in current directory"
    echo "Looking for it in parent directories..."
    
    # Check parent directory
    if [[ -d "../final-integration" ]]; then
        FINAL_INTEGRATION_DIR="../final-integration"
        echo "Found final-integration in parent directory"
    elif [[ -d "../../final-integration" ]]; then
        FINAL_INTEGRATION_DIR="../../final-integration"
        echo "Found final-integration in grandparent directory"
    else
        echo "Error: Cannot find final-integration directory"
        echo "Please ensure the middleware project is available"
        exit 1
    fi
fi

# Check and backup environment file if it exists
if [[ -f "$FINAL_INTEGRATION_DIR/.env" ]]; then
    cp "$FINAL_INTEGRATION_DIR/.env" .env.backup
    echo "Environment file backed up to .env.backup"
    
    # Extract configuration from .env file if available
    if command -v grep &> /dev/null; then
        MIDDLEWARE_URL=$(grep MIDDLEWARE_BASE_URL "$FINAL_INTEGRATION_DIR/.env" | cut -d'=' -f2)
        API_KEY=$(grep API_KEY "$FINAL_INTEGRATION_DIR/.env" | cut -d'=' -f2)
        QB_REALM=$(grep QB_REALM "$FINAL_INTEGRATION_DIR/.env" | cut -d'=' -f2)
    fi
fi

# Set default values if not found
MIDDLEWARE_URL="${MIDDLEWARE_URL:-http://localhost:3000}"
API_KEY="${API_KEY:-quickbooks_salesforce_api_key_2025}"
QB_REALM="${QB_REALM:-9341454378379755}"

# Export for later scripts
export MIDDLEWARE_URL
export API_KEY
export QB_REALM

echo ""
echo "Configuration:"
echo "Middleware URL: $MIDDLEWARE_URL"
echo "API Key: ${API_KEY:0:10}..." # Show only first 10 chars for security
echo "QuickBooks Realm: $QB_REALM"

# Check if Salesforce CLI is installed
echo ""
echo "Checking Salesforce CLI..."
if command -v sf &> /dev/null; then
    echo "✓ Salesforce CLI (sf) is installed"
    sf --version
elif command -v sfdx &> /dev/null; then
    echo "⚠️  Old Salesforce CLI (sfdx) is installed"
    echo "Consider upgrading to the new CLI:"
    echo "npm install -g @salesforce/cli"
else
    echo "✗ Salesforce CLI not found"
    echo "Please install with: npm install -g @salesforce/cli"
    exit 1
fi

echo ""
echo "Environment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Run: ./c-create-custom-objects.sh"
echo "2. Run: ./d-create-opportunity-fields.sh"
echo "3. Run: ./e-create-lwc-component.sh"
echo "4. Run: ./f-create-apex-classes.sh"
echo "5. Run: ./g-deploy-to-salesforce.sh"
