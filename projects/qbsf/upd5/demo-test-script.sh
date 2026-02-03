#!/bin/bash

# Demo Test Script for Salesforce-QuickBooks Integration
# This script tests the complete demo flow

# Configuration
BASE_URL="http://localhost:3000"
API_KEY="your_api_key_here"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "SALESFORCE-QUICKBOOKS DEMO TEST"
echo "========================================="

# 1. Test Connection
echo -e "\n${YELLOW}Step 1: Testing Connection...${NC}"
curl -s -X GET "${BASE_URL}/api/test-connection" \
  -H "X-API-Key: ${API_KEY}" | jq .

read -p "Press enter to continue..."

# 2. Create Invoice
echo -e "\n${YELLOW}Step 2: Creating Invoice from Opportunity...${NC}"
echo "Enter Salesforce Opportunity ID:"
read OPPORTUNITY_ID

INVOICE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/create-invoice" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d "{\"opportunityId\": \"${OPPORTUNITY_ID}\"}")

echo $INVOICE_RESPONSE | jq .

# Extract invoice ID from response
INVOICE_ID=$(echo $INVOICE_RESPONSE | jq -r '.invoiceId')
echo -e "${GREEN}Created Invoice: ${INVOICE_ID}${NC}"

read -p "Press enter to continue..."

# 3. Check Payment Status
echo -e "\n${YELLOW}Step 3: Mark invoice as paid in QuickBooks, then press enter${NC}"
read -p "Press enter after marking invoice as paid..."

echo -e "\n${YELLOW}Step 4: Checking Payment Status...${NC}"
curl -s -X POST "${BASE_URL}/api/check-payment-status" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d "{\"invoiceId\": \"${INVOICE_ID}\"}" | jq .

echo -e "\n${GREEN}Demo completed! Check Salesforce to verify the opportunity is now 'Closed Won'${NC}"
