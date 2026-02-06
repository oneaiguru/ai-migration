#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created."
fi

# Activate the virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Run pytest with coverage and verbose output
pytest

# Deactivate the virtual environment
deactivate

# Provide instructions to view the HTML coverage report
echo "Coverage report generated in 'htmlcov/index.html'. Open it in a browser to view detailed coverage."
