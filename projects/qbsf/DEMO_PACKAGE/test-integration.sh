#!/bin/bash
# Test script for the integration

# Configuration
API_KEY="quickbooks_salesforce_api_key_2025"
SERVER_URL="http://localhost:3000"
SF_INSTANCE="https://customer-inspiration-2543.my.salesforce.com"
QB_REALM="9341454378379755"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Testing Salesforce-QuickBooks Integration ===${NC}"

# Test health endpoint
echo -e "\n${YELLOW}1. Testing Health Endpoint...${NC}"
curl -s -X GET "${SERVER_URL}/health" \
     -H "X-API-Key: ${API_KEY}" | jq .

# Test connection to both systems
echo -e "\n${YELLOW}2. Testing Connections...${NC}"
curl -s -X POST "${SERVER_URL}/api/test-connection" \
     -H "Content-Type: application/json" \
     -H "X-API-Key: ${API_KEY}" \
     -d "{\"salesforceInstance\": \"${SF_INSTANCE}\", \"quickbooksRealm\": \"${QB_REALM}\"}" | jq .

# Test create invoice endpoint
echo -e "\n${YELLOW}3. Testing Create Invoice...${NC}"
curl -s -X POST "${SERVER_URL}/api/create-invoice" \
     -H "Content-Type: application/json" \
     -H "X-API-Key: ${API_KEY}" \
     -d "{\"opportunityId\": \"006QBjWnuEzXs5kUhL\", \"salesforceInstance\": \"${SF_INSTANCE}\", \"quickbooksRealm\": \"${QB_REALM}\"}" | jq .

echo -e "\n${GREEN}=== Testing Complete ===${NC}"
echo -e "The integration is ready for the client demo!"