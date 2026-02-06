#!/bin/bash

# iMessage Sender Launch Script
# This script sets up the environment and launches the iMessage Sender application

# Change to script directory
cd "$(dirname "$0")"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not found!"
    echo "Please install Python 3.7 or newer."
    exit 1
fi

# Check Python version
python_version=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
if [[ "$(echo -e "${python_version}\n3.7" | sort -V | head -n1)" != "3.7" ]]; then
    echo "Error: Python version must be 3.7 or newer!"
    echo "Current version: $python_version"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create virtual environment!"
        exit 1
    fi
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Error: Failed to install requirements!"
    exit 1
fi

# Create required directories
mkdir -p logs templates reports

# Check if Messages.app exists
if [ ! -d "/Applications/Messages.app" ]; then
    echo "Warning: Messages.app not found!"
    echo "The application requires Messages.app to send actual messages."
    echo "You can still use the mock mode for testing."
fi

# Create a simple GUI launcher
if [ -f "gui.py" ]; then
    echo "Launching GUI..."
    python3 gui.py
else
    echo "GUI not found. You can use the command-line tools for testing:"
    echo "- For mock testing: python3 test_files/send_test_message.py +11234567890 --mock"
    echo "- See iMessage_Sender_Documentation.md for more information"
fi