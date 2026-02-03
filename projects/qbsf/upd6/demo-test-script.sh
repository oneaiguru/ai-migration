#!/bin/bash

# Demo script for Salesforce-QuickBooks Integration
# This simulates the button click and payment check

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration - Update these for your demo
API_URL="http://localhost:3000"
API_KEY="your-api-key-here"
OPPORTUNITY_ID="006XX000012345ABC"  # Your test opportunity ID
SF_INSTANCE="https://your-instance.my.salesforce.com"
QB_REALM="1234567890"  # Your QuickBooks realm ID

echo -e "${GREEN}=== Salesforce-QuickBooks Integration Demo ===${NC}"
echo ""

# Test API connectivity
echo -e "${YELLOW}1. Testing API connectivity...${NC}"
curl -s "${API_URL}/api/test" -H "X-API-Key: ${API_KEY}" | jq .
echo ""

# Create invoice (simulating button click)
echo -e "${YELLOW}2. Creating QuickBooks invoice from Salesforce opportunity...${NC}"
echo "   Opportunity ID: ${OPPORTUNITY_ID}"
echo ""

INVOICE_RESPONSE=$(curl -s -X POST "${API_URL}/api/create-invoice" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d "{
    \"opportunityId\": \"${OPPORTUNITY_ID}\",
    \"salesforceInstance\": \"${SF_INSTANCE}\",
    \"quickbooksRealm\": \"${QB_REALM}\"
  }")

echo "$INVOICE_RESPONSE" | jq .
INVOICE_ID=$(echo "$INVOICE_RESPONSE" | jq -r '.invoiceId')
echo ""

# Wait for user to confirm payment in QuickBooks
echo -e "${YELLOW}3. Please mark the invoice as paid in QuickBooks${NC}"
echo "   Invoice ID: ${INVOICE_ID}"
echo -e "${GREEN}   Press Enter when done...${NC}"
read

# Check payment status
echo -e "${YELLOW}4. Checking payment status...${NC}"
curl -s -X POST "${API_URL}/api/check-payment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d "{
    \"salesforceInstance\": \"${SF_INSTANCE}\",
    \"quickbooksRealm\": \"${QB_REALM}\"
  }" | jq .

echo ""
echo -e "${GREEN}=== Demo Complete ===${NC}"
echo ""
echo "Check your Salesforce opportunity to see:"
echo "1. QB_Invoice_ID__c field populated"
echo "2. Payment information updated (if invoice was marke