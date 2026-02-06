#!/bin/bash
# Master script to make all other scripts executable

echo "=== Making all scripts executable ==="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Array of all scripts in order
scripts=(
    "a-create-project-structure.sh"
    "b-prepare-environment.sh"
    "c-create-custom-objects.sh"
    "d-create-opportunity-fields.sh"
    "e-create-lwc-component.sh"
    "f-create-apex-classes.sh"
    "g-deploy-to-salesforce.sh"
    "h-configure-settings.sh"
    "i-configure-lightning-page.sh"
    "j-test-integration.sh"
)

# Make each script executable
for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        chmod +x "$script"
        echo -e "${GREEN}✓${NC} Made $script executable"
    else
        echo -e "${RED}✗${NC} Warning: $script not found"
    fi
done

echo ""
echo -e "${GREEN}All scripts are now executable!${NC}"
echo ""
echo "To start the integration setup, run the scripts in alphabetical order:"
echo ""
echo "  ./a-create-project-structure.sh  - Create SFDX project"
echo "  ./b-prepare-environment.sh       - Prepare environment"
echo "  ./c-create-custom-objects.sh     - Create custom settings & remote sites"
echo "  ./d-create-opportunity-fields.sh - Add fields to Opportunity"
echo "  ./e-create-lwc-component.sh      - Create Lightning Web Component"
echo "  ./f-create-apex-classes.sh       - Create Apex classes"
echo "  ./g-deploy-to-salesforce.sh      - Deploy everything to Salesforce"
echo "  ./h-configure-settings.sh        - Configure QuickBooks settings"
echo "  ./i-configure-lightning-page.sh  - Manual Lightning page setup"
echo "  ./j-test-integration.sh          - Test the integration"
echo ""
echo "Start with: ./a-create-project-structure.sh"
