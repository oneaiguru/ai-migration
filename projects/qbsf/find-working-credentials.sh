#!/bin/bash
# Script to find and test working credentials across the project

echo "=== Finding Working Credentials ==="
echo "Checking all .env files and tokens.json files..."

# Check all .env files with timestamps
echo -e "\n--- ENV Files ---"
find /Users/m/git/clients/qbsf -name ".env" -type f | grep -v "node_modules" | while read file; do
    echo -e "\nFile: $file"
    ls -la "$file"
    echo "API_KEY: $(grep API_KEY "$file" | grep -v "YOUR_" | head -1)"
    echo "SF_CLIENT_ID: $(grep SF_CLIENT_ID "$file" | grep -v "your_" | head -1)"
    echo "QB_CLIENT_ID: $(grep QB_CLIENT_ID "$file" | grep -v "your_" | head -1)"
done

# Check all tokens.json files
echo -e "\n--- Token Files ---"
find /Users/m/git/clients/qbsf -name "tokens.json" -type f | grep -v "node_modules" | while read file; do
    echo -e "\nFile: $file"
    ls -la "$file"
    if [ -f "$file" ]; then
        echo "Salesforce instances: $(cat "$file" | jq -r '.salesforce | keys[]' 2>/dev/null)"
        echo "QuickBooks realms: $(cat "$file" | jq -r '.quickbooks | keys[]' 2>/dev/null)"
    fi
done

# Based on the chat, the working credentials appear to be:
echo -e "\n--- Known Working Credentials (from chat) ---"
echo "API_KEY: quickbooks_salesforce_api_key_2025"
echo "SF_CLIENT_ID: 3MVG9_kZcLde7U5r7ykzu2c1PeyOueQqRgmwyqmPC4yLcImPruS_CxHVVLptVBa28pP76goj0p4YMLcLT7m9C"
echo "QB_CLIENT_ID: ABVtqmpIkUMT6Dcs9sZSyh9gCA5EsfUJFUvszgHZeLe6Fgo1jg"
echo "QB_REALM: 9341454378379755"
echo "SF_INSTANCE: https://customer-inspiration-2543.my.salesforce.com"