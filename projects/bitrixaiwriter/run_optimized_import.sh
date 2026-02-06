#!/bin/bash
# Script to run the optimized import process

echo "==================================================="
echo "OPTIMIZED TRANSACTION IMPORT SCRIPT"
echo "==================================================="
echo ""

# Check if file argument is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <csv_file>"
    echo "Example: $0 data/1.csv"
    exit 1
fi

CSV_FILE=$1

# Check if file exists
if [ ! -f "$CSV_FILE" ]; then
    echo "Error: File $CSV_FILE not found."
    exit 1
fi

echo "Starting optimized transaction import process..."
echo "Using CSV file: $CSV_FILE"
echo ""

# Step 1: Clean all existing transactions and reimport
echo "Step 1: Cleaning and reimporting transactions"
php clean_and_reimport.php "$CSV_FILE"
if [ $? -ne 0 ]; then
    echo "Error during clean and reimport process. Aborting."
    exit 1
fi

# Step 2: Run the optimized processing
echo ""
echo "Step 2: Running optimized processing"
php src/cli_fast.php --action=process --limit=100 --parallel-requests=4
if [ $? -ne 0 ]; then
    echo "Error during processing. Aborting."
    exit 1
fi

# Step 3: Generate statistics
echo ""
echo "Step 3: Generating statistics report"
php src/cli_fast.php --action=stats

echo ""
echo "==================================================="
echo "IMPORT PROCESS COMPLETED SUCCESSFULLY"
echo "==================================================="