#!/bin/bash
# Debug script to check Salesforce CLI version and available commands

echo "=== Salesforce CLI Verification ==="
echo ""

# Check which CLI version is installed
echo "Checking CLI version..."
if command -v sf &> /dev/null; then
    echo "✓ New CLI (sf) is installed:"
    sf --version
elif command -v sfdx &> /dev/null; then
    echo "⚠️  Old CLI (sfdx) is installed:"
    sfdx --version
    echo ""
    echo "You should upgrade to the new CLI:"
    echo "npm install -g @salesforce/cli"
else
    echo "✗ No Salesforce CLI found!"
    echo "Install with: npm install -g @salesforce/cli"
fi

echo ""
echo "Available deployment commands:"
if command -v sf &> /dev/null; then
    echo "✓ sf project deploy start (NEW)"
    echo "✓ sf org login web (NEW)"
    echo "✓ sf org display (NEW)"
else
    echo "⚠️  Using old commands - please upgrade"
fi

echo ""
echo "To upgrade from old CLI to new CLI:"
echo "1. npm uninstall -g sfdx-cli"
echo "2. npm install -g @salesforce/cli"
