#!/bin/bash
# Script for running Ozon bot 
# This script works on Mac and Linux environments

echo "==== Ozon Bot Run Script ===="
echo "This script will run the Ozon bot for product reservation"

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

# Run the bot with command-line argument "run"
echo "Starting the Ozon bot..."
python ozon_bot_updated.py run

echo "Bot execution completed. Check the log file and screenshots folder for results."
echo "Log file: ozon_bot.log"
echo "Screenshots: screenshots/"

echo "==== Execution completed ===="