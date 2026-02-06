#!/bin/bash
# Script for running Ozon bot in demo mode
# This script works on Mac and Linux environments

echo "==== Ozon Bot Demo Script ===="
echo "This script will run the demo version of the Ozon bot"
echo "IMPORTANT: The demo version DOES NOT place actual orders"

# Create screenshots directory if it doesn't exist
mkdir -p screenshots

# Check if config file exists
if [ ! -f "config.json" ]; then
    echo "Error: config.json not found!"
    echo "Creating a template config file, please edit it with your Ozon credentials"
    cp config-updated.json config.json
    echo "Config file created. Please edit config.json with your credentials and run this script again."
    exit 1
fi

# Run the bot demo
echo "Starting the Ozon bot demo..."
python ozon_bot_demo.py

echo "Demo execution completed. Check the log file and screenshots folder for results."
echo "Log file: ozon_bot_demo.log"
echo "Screenshots: screenshots/"

echo "==== Demo completed ===="