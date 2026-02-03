#!/bin/bash

# Groq Whisperer Startup Script
# This script sets up the environment and starts the Groq Whisperer

# Set the working directory to the repo root (relative to this script)
cd "$(cd "$(dirname "$0")" && pwd)"

# Source the user's shell profile to get environment variables
if [ -f ~/.zshrc ]; then
    source ~/.zshrc
fi

# Ensure GROQ_API_KEY is set (update this with your actual key)
if [ -z "$GROQ_API_KEY" ]; then
    echo "Error: GROQ_API_KEY not set. Please add it to your ~/.zshrc or update this script."
    exit 1
fi

# Activate the virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo "Error: virtual environment not found. Create one with 'python -m venv venv' (or .venv) from the repo root."
    exit 1
fi

# Start the Groq Whisperer
exec python main_improved.py
