#\!/bin/bash
# Script to query opportunities from Salesforce for the demo

# Get the access token from tokens.json
ACCESS_TOKEN=$(cat final-integration/data/tokens.json | jq -r '.salesforce."https://customer-inspiration-2543.my.salesforce.com".accessToken')
SF_INSTANCE="https://customer-inspiration-2543.my.salesforce.com"

if [ -z "$ACCESS_TOKEN" ]; then
    echo "Error: Could not get access token from tokens.json"
    exit 1
fi

echo "Querying opportunities from Salesforce..."

# Query opportunities
RESPONSE=$(curl -s -X GET "$SF_INSTANCE/services/data/v57.0/query?q=SELECT+Id,Name,StageName,Amount,QB_Invoice_ID__c+FROM+Opportunity+WHERE+Amount+%3E+0+LIMIT+5" \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Content-Type: application/json")

# First print the raw response for debugging
echo "Raw response from Salesforce:"
echo "$RESPONSE"
echo ""

# Then try to parse it with jq
echo "Processed opportunities:"
echo "$RESPONSE" | jq -r '
    if has("records") then
        .records[] | {
            "ID": .Id,
            "Name": .Name,
            "Stage": .StageName,
            "Amount": .Amount,
            "QB_Invoice_ID": .QB_Invoice_ID__c
        }
    else
        {
            "Error": "Could not retrieve opportunities. Check your authentication."
        }
    end
'
