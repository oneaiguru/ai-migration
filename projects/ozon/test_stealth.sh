#!/bin/bash
# Quick test script for the enhanced stealth Ozon bot

echo "==== Testing Enhanced Stealth Mode ===="
echo "Running stealth bot with minimal dependencies check..."

# Create screenshots directory
mkdir -p screenshots

# Check for required Python packages
echo "Checking required packages..."
python -c "import selenium, webdriver_manager" 2>/dev/null || {
    echo "Installing required packages..."
    pip install selenium webdriver-manager
}

# Run the bot
echo "Starting stealth mode test..."
python ozon_bot_demo_stealth.py

echo "Test completed. Check screenshots directory for results."
echo "==== Test Finished ===="