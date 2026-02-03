#!/bin/bash
# Master script to make all other scripts executable

echo "=== Making all scripts executable ==="

# Array of all scripts to make executable
scripts=(
    "0-create-sfdx-project.sh"
    "1-prepare-environment.sh"
    "2-create-lwc-component.sh"
    "3-create-apex-classes.sh"
    "4a-deploy-custom-object.sh"
    "4b-deploy-opportunity-fields.sh"
    "4-deploy-to-salesforce.sh"
    "5-configure-custom-settings.sh"
    "6-configure-lightning-app-builder.sh"
    "7-test-integration.sh"
    "check-cli-version.sh"
)

# Make each script executable
for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        chmod +x "$script"
        echo "✓ Made $script executable"
    else
        echo "✗ Warning: $script not found"
    fi
done

echo ""
echo "All scripts are now executable!"
echo ""
echo "To start the integration setup, run:"
echo "./1-prepare-environment.sh"
echo ""
echo "Follow the scripts in order (1 through 7) for complete setup."
