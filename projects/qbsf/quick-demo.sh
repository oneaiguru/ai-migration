#!/bin/bash
# Quick Demo Script for Salesforce-QuickBooks Integration
# This script provides direct command execution without menus

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
API_KEY="quickbooks_salesforce_api_key_2025"
SERVER_URL="http://localhost:3000"
SF_INSTANCE="https://customer-inspiration-2543.my.salesforce.com"
QB_REALM="9341454378379755"
MIDDLEWARE_DIR="/Users/m/git/clients/qbsf/final-integration"
SAMPLE_OPP_ID="006QBjWnuEzXs5kUhL"  # Default sample opportunity

# Function to check if middleware is running
check_middleware() {
    echo -e "${YELLOW}Checking middleware...${NC}"
    if curl -s "$SERVER_URL/health" > /dev/null; then
        echo -e "${GREEN}✓ Middleware is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Middleware is not running!${NC}"
        return 1
    fi
}

# Function to start middleware
start_middleware() {
    echo -e "${YELLOW}Starting middleware...${NC}"
    
    # Check if a middleware process is already running
    if pgrep -f "node $MIDDLEWARE_DIR/src/server.js" > /dev/null; then
        echo -e "${YELLOW}Stopping existing middleware process...${NC}"
        pkill -f "node $MIDDLEWARE_DIR/src/server.js"
        sleep 2
    fi
    
    cd "$MIDDLEWARE_DIR" || {
        echo -e "${RED}✗ Failed to change directory to $MIDDLEWARE_DIR${NC}"
        exit 1
    }
    
    # Start the server in the background
    nohup npm start > /tmp/middleware.log 2>&1 &
    MIDDLEWARE_PID=$!
    echo $MIDDLEWARE_PID > /tmp/middleware.pid
    
    echo -e "${YELLOW}Waiting for server to start...${NC}"
    for i in {1..10}; do
        sleep 1
        if curl -s "$SERVER_URL/health" > /dev/null; then
            echo -e "${GREEN}✓ Middleware started (PID: $MIDDLEWARE_PID)${NC}"
            return 0
        fi
        echo -n "."
    done
    
    echo -e "\n${RED}✗ Failed to start middleware${NC}"
    exit 1
}

# Function to create invoice
create_invoice() {
    local opportunity_id=$1
    
    if [ -z "$opportunity_id" ]; then
        opportunity_id=$SAMPLE_OPP_ID
        echo -e "${YELLOW}Using sample opportunity ID: $opportunity_id${NC}"
    fi
    
    echo -e "${BLUE}Creating invoice for opportunity: $opportunity_id${NC}"
    
    RESPONSE=$(curl -s -X POST "$SERVER_URL/api/create-invoice" \
         -H "Content-Type: application/json" \
         -H "X-API-Key: $API_KEY" \
         -d "{
           \"opportunityId\": \"$opportunity_id\",
           \"salesforceInstance\": \"$SF_INSTANCE\",
           \"quickbooksRealm\": \"$QB_REALM\"
         }")
    
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" == "true" ]; then
        INVOICE_ID=$(echo "$RESPONSE" | jq -r '.invoiceId')
        echo -e "${GREEN}✓ Invoice created: $INVOICE_ID${NC}"
    else
        ERROR=$(echo "$RESPONSE" | jq -r '.error // "Unknown error"')
        echo -e "${RED}✗ Failed to create invoice: $ERROR${NC}"
    fi
}

# Function to check payment status
check_payment_status() {
    echo -e "${BLUE}Checking payment status...${NC}"
    
    RESPONSE=$(curl -s -X POST "$SERVER_URL/api/check-payment-status" \
         -H "Content-Type: application/json" \
         -H "X-API-Key: $API_KEY" \
         -d "{
           \"salesforceInstance\": \"$SF_INSTANCE\",
           \"quickbooksRealm\": \"$QB_REALM\"
         }")
    
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" == "true" ]; then
        PAID=$(echo "$RESPONSE" | jq -r '.paidInvoicesFound')
        UPDATED=$(echo "$RESPONSE" | jq -r '.invoicesUpdated')
        echo -e "${GREEN}✓ Payment status checked: Found $PAID paid invoices, Updated $UPDATED in Salesforce${NC}"
    else
        ERROR=$(echo "$RESPONSE" | jq -r '.error // "Unknown error"')
        echo -e "${RED}✗ Failed to check payment status: $ERROR${NC}"
    fi
}

# Function to cleanup on exit
cleanup() {
    if [ -f /tmp/middleware.pid ]; then
        PID=$(cat /tmp/middleware.pid)
        echo -e "${YELLOW}Cleaning up middleware (PID: $PID)...${NC}"
        kill $PID 2>/dev/null || true
        rm /tmp/middleware.pid
    fi
}

# Register cleanup function
trap cleanup EXIT

# Print usage
usage() {
    echo -e "${BOLD}Usage:${NC} $0 [options]"
    echo ""
    echo -e "${BOLD}Options:${NC}"
    echo "  start     Start the middleware server"
    echo "  create    Create a QuickBooks invoice from an opportunity"
    echo "  check     Check payment status in QuickBooks and update Salesforce"
    echo "  all       Run all steps in sequence (start, create, check)"
    echo ""
    echo -e "${BOLD}Examples:${NC}"
    echo "  $0 start"
    echo "  $0 create 006QBjWnuEzXs5kUhL"
    echo "  $0 check"
    echo "  $0 all"
    exit 1
}

# Main execution
if [ $# -eq 0 ]; then
    usage
fi

case "$1" in
    start)
        check_middleware || start_middleware
        ;;
    create)
        check_middleware || start_middleware
        create_invoice "$2"
        ;;
    check)
        check_middleware || start_middleware
        check_payment_status
        ;;
    all)
        check_middleware || start_middleware
        create_invoice "$2"
        check_payment_status
        ;;
    *)
        usage
        ;;
esac

echo -e "${GREEN}Done.${NC}"