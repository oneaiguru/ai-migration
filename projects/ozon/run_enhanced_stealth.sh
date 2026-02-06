#!/bin/bash
# Script for running Ozon bot in enhanced stealth mode
# This script works on Mac and Linux environments

echo "==== Ozon Bot Enhanced Stealth Mode ===="
echo "This script will run the Ozon bot with advanced anti-detection features"
echo "The enhanced version includes:"
echo "- Hardware-based fingerprinting protection"
echo "- Canvas and audio fingerprint modification"
echo "- Advanced mouse movement physics"
echo "- Human-like behavior simulation"
echo "- Temporary Firefox profile"

# Create screenshots directory if it doesn't exist
mkdir -p screenshots

# Check if Firefox is installed
if ! command -v firefox &> /dev/null; then
    echo "Firefox is not installed. Please install Firefox browser first."
    exit 1
fi

# Check if config file exists
if [ ! -f "config.json" ]; then
    echo "Error: config.json not found!"
    echo "Creating a template config file, please edit it with your Ozon credentials"
    cp config-updated.json config.json
    echo "Config file created. Please edit config.json with your credentials and run this script again."
    exit 1
fi

# Installing required packages
echo "Installing required packages..."
pip install selenium webdriver-manager python-telegram-bot schedule

# Run the bot with command-line argument "run"
echo "Starting the Ozon bot in enhanced stealth mode..."
python ozon_bot_demo_stealth.py

echo "Bot execution completed. Check the log file and screenshots folder for results."
echo "Log file: ozon_bot_demo.log"
echo "Screenshots: screenshots/"

echo "==== Execution completed ===="