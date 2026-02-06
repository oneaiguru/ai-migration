#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Get the current directory
CURRENT_DIR=$(pwd)

# Generate tree.txt in the current directory
echo "Generating tree.txt..."
python folder_structure_generator.py "$CURRENT_DIR" --output "./tree.txt"

# Check if tree.txt was created
if [ ! -f "./tree.txt" ]; then
    echo "Error: Failed to create tree.txt."
    exit 1
fi

echo "tree.txt generated successfully."

# Launch interactive file selection
echo "Launching select_files.py for interactive file selection..."
python select_files.py "$CURRENT_DIR"

echo "Process completed successfully."