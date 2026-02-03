#!/bin/bash
# Script to find QuickAction related files in the project

echo "=== Finding QuickAction Files ==="

# Look for Salesforce QuickAction files
echo -e "\n--- Salesforce QuickAction Files ---"
find /Users/m/git/clients/qbsf -name "*.quickAction-meta.xml" -type f | grep -v "node_modules" | while read file; do
    echo -e "\nFile: $file"
    cat "$file" | grep -i "label\|target"
done

# Look for LWC components related to QuickBooks buttons
echo -e "\n--- Lightning Web Components (QuickBooks/Invoice) ---"
find /Users/m/git/clients/qbsf -name "*.js" -o -name "*.html" -type f | grep -v "node_modules" | xargs grep -l "quickbooks\|invoice\|create.*invoice" | while read file; do
    echo -e "\nFile: $file"
    head -n 20 "$file" | grep -i "component\|class\|button\|action\|quickbooks\|invoice"
done

# Look for Apex classes that might invoke QuickBooks
echo -e "\n--- Apex Classes (QuickBooks Integration) ---"
find /Users/m/git/clients/qbsf -name "*.cls" -type f | grep -v "node_modules" | xargs grep -l "quickbooks\|invoice\|httprequest" | while read file; do
    echo -e "\nFile: $file"
    head -n 20 "$file" | grep -i "class\|@rest\|callout\|quickbooks\|invoice"
done

# Look for files in the automated integration folder
echo -e "\n--- Checking automated-integration for Salesforce components ---"
find /Users/m/git/clients/qbsf/automated-integration -path "*salesforce*" -type f | while read file; do
    echo -e "\nFile: $file"
    head -n 10 "$file"
done