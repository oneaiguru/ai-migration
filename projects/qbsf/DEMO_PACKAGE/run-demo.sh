#!/bin/bash
# Demo script for Salesforce-QuickBooks Integration

# Configuration
PORT=3000
API_KEY="quickbooks_salesforce_api_key_2025"
SF_INSTANCE="https://customer-inspiration-2543.my.salesforce.com"
QB_REALM="9341454378379755"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Header
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Salesforce-QuickBooks Integration  ${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo -e "${YELLOW}Starting the middleware server...${NC}"

# Start the server
cd "$(dirname "$0")"
npm start