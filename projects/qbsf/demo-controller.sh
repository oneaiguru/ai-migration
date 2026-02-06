#!/bin/bash
# Salesforce-QuickBooks Integration Demo Controller
# A comprehensive demo script with error handling and color-coded output

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
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
    echo -e "\n${YELLOW}Checking if middleware is running...${NC}"
    if curl -s "$SERVER_URL/health" > /dev/null; then
        echo -e "${GREEN}✓ Middleware is running at $SERVER_URL${NC}"
        return 0
    else
        echo -e "${RED}✗ Middleware is not running!${NC}"
        return 1
    fi
}

# Function to start middleware if not running
start_middleware() {
    echo -e "\n${YELLOW}Starting middleware server...${NC}"
    
    # Check if a middleware process is already running
    if pgrep -f "node $MIDDLEWARE_DIR/src/server.js" > /dev/null; then
        echo -e "${YELLOW}Middleware process already exists. Stopping it first...${NC}"
        pkill -f "node $MIDDLEWARE_DIR/src/server.js"
        sleep 2
    fi
    
    cd "$MIDDLEWARE_DIR" || {
        echo -e "${RED}Failed to change directory to $MIDDLEWARE_DIR${NC}"
        return 1
    }
    
    # Start the server in the background
    echo -e "${BLUE}Starting server from $MIDDLEWARE_DIR${NC}"
    nohup npm start > /tmp/middleware.log 2>&1 &
    
    # Save PID for later cleanup
    MIDDLEWARE_PID=$!
    echo $MIDDLEWARE_PID > /tmp/middleware.pid
    
    # Wait for server to start
    echo -e "${YELLOW}Waiting for server to start...${NC}"
    for i in {1..10}; do
        sleep 1
        if curl -s "$SERVER_URL/health" > /dev/null; then
            echo -e "${GREEN}✓ Middleware successfully started with PID: $MIDDLEWARE_PID${NC}"
            return 0
        fi
        echo -n "."
    done
    
    echo -e "\n${RED}✗ Failed to start middleware after 10 seconds${NC}"
    return 1
}

# Function to query Salesforce for opportunities
query_opportunities() {
    echo -e "\n${BLUE}${BOLD}Querying Salesforce for opportunities...${NC}"
    
    # Get the access token from tokens.json
    ACCESS_TOKEN=$(cat "$MIDDLEWARE_DIR/data/tokens.json" | jq -r '.salesforce."https://customer-inspiration-2543.my.salesforce.com".accessToken')
    
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
        echo -e "${RED}✗ Error: Could not get access token from tokens.json${NC}"
        echo -e "${YELLOW}Showing sample opportunities instead...${NC}"
        show_sample_opportunities
        return 1
    fi
    
    echo -e "${CYAN}Fetching opportunities from Salesforce...${NC}"
    
    # Make the API call to Salesforce
    RESPONSE=$(curl -s -X GET "$SF_INSTANCE/services/data/v57.0/query?q=SELECT+Id,Name,StageName,Amount,QB_Invoice_ID__c+FROM+Opportunity+WHERE+Amount+%3E+0+ORDER+BY+CreatedDate+DESC+LIMIT+5" \
         -H "Authorization: Bearer $ACCESS_TOKEN" \
         -H "Content-Type: application/json")
    
    # Check if response has errors
    if echo "$RESPONSE" | jq -e '.error' > /dev/null; then
        ERROR=$(echo "$RESPONSE" | jq -r '.error')
        ERROR_DESC=$(echo "$RESPONSE" | jq -r '.error_description // "Unknown error"')
        echo -e "${RED}✗ Error querying Salesforce: $ERROR - $ERROR_DESC${NC}"
        echo -e "${YELLOW}Showing sample opportunities instead...${NC}"
        show_sample_opportunities
        return 1
    fi
    
    # Check if we have records
    RECORD_COUNT=$(echo "$RESPONSE" | jq -r '.records | length')
    if [ "$RECORD_COUNT" -eq 0 ]; then
        echo -e "${YELLOW}No opportunities found in Salesforce. Showing sample opportunities...${NC}"
        show_sample_opportunities
        return 0
    fi
    
    # Display the opportunities
    echo -e "\n${GREEN}${BOLD}Found $RECORD_COUNT opportunities:${NC}"
    echo -e "${CYAN}==================================================${NC}"
    
    echo "$RESPONSE" | jq -r '.records[] | "ID: \(.Id)\nName: \(.Name)\nStage: \(.StageName)\nAmount: \(if .Amount then "$" + (.Amount | tostring) else "N/A" end)\nQuickBooks Invoice: \(if .QB_Invoice_ID__c then .QB_Invoice_ID__c else "Not created yet" end)\n"'
    
    echo -e "${CYAN}==================================================${NC}"
    echo -e "${GREEN}✓ Query completed successfully${NC}"
    return 0
}

# Function to show sample opportunities for demo
show_sample_opportunities() {
    echo -e "\n${CYAN}${BOLD}Sample Opportunities for Demo:${NC}"
    echo -e "${CYAN}==================================================${NC}"
    
    echo -e "ID: ${BOLD}006QBjWnuEzXs5kUhL${NC}"
    echo -e "Name: Burlington Textiles Weaving Plant Generator"
    echo -e "Stage: Closed Won"
    echo -e "Amount: $235,000.00"
    echo -e "QuickBooks Invoice: Not created yet"
    echo -e ""
    
    echo -e "ID: ${BOLD}006QBjWnuEzXs5kUm3${NC}"
    echo -e "Name: Grand Hotels Kitchen Generator"
    echo -e "Stage: Closed Won"
    echo -e "Amount: $155,000.00"
    echo -e "QuickBooks Invoice: Not created yet"
    echo -e ""
    
    echo -e "ID: ${BOLD}006QBjWnuEzXs5kUn9${NC}"
    echo -e "Name: United Oil Office Supplies"
    echo -e "Stage: Negotiation/Review"
    echo -e "Amount: $75,000.00"
    echo -e "QuickBooks Invoice: Not created yet"
    echo -e "${CYAN}==================================================${NC}"
}

# Function to create invoice
create_invoice() {
    local opportunity_id=$1
    
    # If no opportunity ID provided, ask for one
    if [ -z "$opportunity_id" ]; then
        echo -e "\n${YELLOW}No Opportunity ID provided.${NC}"
        read -p "Enter Opportunity ID (or press Enter for sample ID): " opportunity_id
        
        # If still empty, use sample
        if [ -z "$opportunity_id" ]; then
            opportunity_id=$SAMPLE_OPP_ID
            echo -e "${YELLOW}Using sample opportunity ID: $opportunity_id${NC}"
        fi
    fi
    
    echo -e "\n${BLUE}${BOLD}Creating QuickBooks Invoice from Opportunity: $opportunity_id${NC}"
    
    # Check if middleware is running
    if ! check_middleware; then
        echo -e "${YELLOW}Attempting to start middleware...${NC}"
        if ! start_middleware; then
            echo -e "${RED}✗ Failed to start middleware. Cannot create invoice.${NC}"
            return 1
        fi
    fi
    
    # Make API request
    echo -e "${CYAN}Sending request to create invoice...${NC}"
    RESPONSE=$(curl -s -X POST "$SERVER_URL/api/create-invoice" \
         -H "Content-Type: application/json" \
         -H "X-API-Key: $API_KEY" \
         -d "{
           \"opportunityId\": \"$opportunity_id\",
           \"salesforceInstance\": \"$SF_INSTANCE\",
           \"quickbooksRealm\": \"$QB_REALM\"
         }")
    
    # Check if response has errors
    if echo "$RESPONSE" | jq -e '.error' > /dev/null; then
        ERROR=$(echo "$RESPONSE" | jq -r '.error')
        echo -e "${RED}✗ Error creating invoice: $ERROR${NC}"
        return 1
    fi
    
    # Display success message with formatted output
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" == "true" ]; then
        INVOICE_ID=$(echo "$RESPONSE" | jq -r '.invoiceId')
        MESSAGE=$(echo "$RESPONSE" | jq -r '.message')
        
        echo -e "\n${GREEN}${BOLD}✓ Invoice created successfully!${NC}"
        echo -e "${CYAN}==================================================${NC}"
        echo -e "Opportunity ID: $opportunity_id"
        echo -e "Invoice ID: ${BOLD}$INVOICE_ID${NC}"
        echo -e "Status: ${GREEN}Success${NC}"
        echo -e "Message: $MESSAGE"
        echo -e "${CYAN}==================================================${NC}"
    else
        MESSAGE=$(echo "$RESPONSE" | jq -r '.message // "Unknown error"')
        echo -e "${RED}✗ Failed to create invoice: $MESSAGE${NC}"
        return 1
    fi
    
    return 0
}

# Function to check payment status
check_payment_status() {
    echo -e "\n${BLUE}${BOLD}Checking payment status in QuickBooks...${NC}"
    
    # Check if middleware is running
    if ! check_middleware; then
        echo -e "${YELLOW}Attempting to start middleware...${NC}"
        if ! start_middleware; then
            echo -e "${RED}✗ Failed to start middleware. Cannot check payment status.${NC}"
            return 1
        fi
    fi
    
    # Make API request
    echo -e "${CYAN}Sending request to check payment status...${NC}"
    RESPONSE=$(curl -s -X POST "$SERVER_URL/api/check-payment-status" \
         -H "Content-Type: application/json" \
         -H "X-API-Key: $API_KEY" \
         -d "{
           \"salesforceInstance\": \"$SF_INSTANCE\",
           \"quickbooksRealm\": \"$QB_REALM\"
         }")
    
    # Check if response has errors
    if echo "$RESPONSE" | jq -e '.error' > /dev/null; then
        ERROR=$(echo "$RESPONSE" | jq -r '.error')
        echo -e "${RED}✗ Error checking payment status: $ERROR${NC}"
        return 1
    fi
    
    # Display success message with formatted output
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" == "true" ]; then
        INVOICES_PROCESSED=$(echo "$RESPONSE" | jq -r '.invoicesProcessed')
        PAID_INVOICES=$(echo "$RESPONSE" | jq -r '.paidInvoicesFound')
        INVOICES_UPDATED=$(echo "$RESPONSE" | jq -r '.invoicesUpdated')
        MESSAGE=$(echo "$RESPONSE" | jq -r '.message')
        
        echo -e "\n${GREEN}${BOLD}✓ Payment status check completed!${NC}"
        echo -e "${CYAN}==================================================${NC}"
        echo -e "Invoices Processed: $INVOICES_PROCESSED"
        echo -e "Paid Invoices Found: ${BOLD}$PAID_INVOICES${NC}"
        echo -e "Invoices Updated in Salesforce: ${BOLD}$INVOICES_UPDATED${NC}"
        echo -e "Status: ${GREEN}Success${NC}"
        echo -e "Message: $MESSAGE"
        echo -e "${CYAN}==================================================${NC}"
    else
        MESSAGE=$(echo "$RESPONSE" | jq -r '.message // "Unknown error"')
        echo -e "${RED}✗ Failed to check payment status: $MESSAGE${NC}"
        return 1
    fi
    
    return 0
}

# Function to run a test connection to both systems
test_connection() {
    echo -e "\n${BLUE}${BOLD}Testing connection to Salesforce and QuickBooks...${NC}"
    
    # Check if middleware is running
    if ! check_middleware; then
        echo -e "${YELLOW}Attempting to start middleware...${NC}"
        if ! start_middleware; then
            echo -e "${RED}✗ Failed to start middleware. Cannot test connections.${NC}"
            return 1
        fi
    fi
    
    # Make API request
    echo -e "${CYAN}Sending request to test connections...${NC}"
    RESPONSE=$(curl -s -X POST "$SERVER_URL/api/test-connection" \
         -H "Content-Type: application/json" \
         -H "X-API-Key: $API_KEY" \
         -d "{
           \"salesforceInstance\": \"$SF_INSTANCE\",
           \"quickbooksRealm\": \"$QB_REALM\"
         }")
    
    # Check if response has errors
    if echo "$RESPONSE" | jq -e '.error' > /dev/null; then
        ERROR=$(echo "$RESPONSE" | jq -r '.error')
        echo -e "${RED}✗ Error testing connections: $ERROR${NC}"
        return 1
    fi
    
    # Display success message with formatted output
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" == "true" ]; then
        SF_CONNECTED=$(echo "$RESPONSE" | jq -r '.salesforce.connected')
        SF_INSTANCE=$(echo "$RESPONSE" | jq -r '.salesforce.instance')
        QB_CONNECTED=$(echo "$RESPONSE" | jq -r '.quickbooks.connected')
        QB_REALM=$(echo "$RESPONSE" | jq -r '.quickbooks.realm')
        
        echo -e "\n${GREEN}${BOLD}✓ Connection test completed!${NC}"
        echo -e "${CYAN}==================================================${NC}"
        echo -e "Salesforce Connection: $([ "$SF_CONNECTED" == "true" ] && echo "${GREEN}Connected${NC}" || echo "${RED}Disconnected${NC}")"
        echo -e "Salesforce Instance: $SF_INSTANCE"
        echo -e "QuickBooks Connection: $([ "$QB_CONNECTED" == "true" ] && echo "${GREEN}Connected${NC}" || echo "${RED}Disconnected${NC}")"
        echo -e "QuickBooks Realm: $QB_REALM"
        echo -e "${CYAN}==================================================${NC}"
    else
        MESSAGE=$(echo "$RESPONSE" | jq -r '.message // "Unknown error"')
        echo -e "${RED}✗ Connection test failed: $MESSAGE${NC}"
        return 1
    fi
    
    return 0
}

# Function to run the full demo flow
run_full_demo() {
    echo -e "\n${MAGENTA}${BOLD}=== Running Full Salesforce-QuickBooks Integration Demo ===${NC}"
    
    # Step 1: Start middleware if needed
    if ! check_middleware; then
        echo -e "\n${YELLOW}Step 1: Starting middleware...${NC}"
        if ! start_middleware; then
            echo -e "${RED}✗ Demo stopped. Could not start middleware.${NC}"
            return 1
        fi
    else
        echo -e "\n${GREEN}Step 1: Middleware is already running.${NC}"
    fi
    
    # Step 2: Test connection
    echo -e "\n${YELLOW}Step 2: Testing connection to both systems...${NC}"
    test_connection
    
    # Step 3: Query opportunities
    echo -e "\n${YELLOW}Step 3: Querying opportunities from Salesforce...${NC}"
    query_opportunities
    
    # Step 4: Ask which opportunity to use
    echo -e "\n${YELLOW}Step 4: Creating an invoice...${NC}"
    read -p "Enter Opportunity ID to create invoice (or press Enter for sample ID): " opportunity_id
    if [ -z "$opportunity_id" ]; then
        opportunity_id=$SAMPLE_OPP_ID
        echo -e "${YELLOW}Using sample opportunity ID: $opportunity_id${NC}"
    fi
    
    create_invoice "$opportunity_id"
    
    # Step 5: Check payment status
    echo -e "\n${YELLOW}Step 5: Checking payment status...${NC}"
    check_payment_status
    
    echo -e "\n${MAGENTA}${BOLD}=== Demo Completed Successfully ===${NC}"
    return 0
}

# Function to show menu
show_menu() {
    echo -e "\n${MAGENTA}${BOLD}=== Salesforce-QuickBooks Integration Demo ===${NC}"
    echo -e "${CYAN}---------------------------------------------${NC}"
    echo -e "${YELLOW}1. Start/Check Middleware${NC}"
    echo -e "${YELLOW}2. Test Connection to Salesforce and QuickBooks${NC}"
    echo -e "${YELLOW}3. Query Opportunities from Salesforce${NC}"
    echo -e "${YELLOW}4. Create QuickBooks Invoice from Opportunity${NC}"
    echo -e "${YELLOW}5. Check Payment Status and Update Salesforce${NC}"
    echo -e "${YELLOW}6. Run Full Demo Flow${NC}"
    echo -e "${YELLOW}q. Quit Demo${NC}"
    echo -e "${CYAN}---------------------------------------------${NC}"
}

# Function to cleanup on exit
cleanup() {
    if [ -f /tmp/middleware.pid ]; then
        PID=$(cat /tmp/middleware.pid)
        echo -e "\n${YELLOW}Cleaning up middleware process (PID: $PID)...${NC}"
        kill $PID 2>/dev/null || true
        rm /tmp/middleware.pid
    fi
    echo -e "${GREEN}Cleanup complete. Goodbye!${NC}"
}

# Register cleanup function to run on exit
trap cleanup EXIT

# Main execution
echo -e "${MAGENTA}${BOLD}====================================================${NC}"
echo -e "${MAGENTA}${BOLD}=== Salesforce-QuickBooks Integration Demo Tool ===${NC}"
echo -e "${MAGENTA}${BOLD}====================================================${NC}"
echo -e "${BLUE}This tool demonstrates the integration between Salesforce and QuickBooks,${NC}"
echo -e "${BLUE}allowing for invoice creation and payment status tracking.${NC}"

# Initial middleware check
check_middleware || {
    echo -e "${YELLOW}Would you like to start the middleware server? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        start_middleware || {
            echo -e "${RED}Failed to start middleware. Some demo features may not work.${NC}"
        }
    else
        echo -e "${YELLOW}Middleware not started. Some demo features may not work.${NC}"
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice: " choice
    
    case $choice in
        1)
            check_middleware || start_middleware
            ;;
        2)
            test_connection
            ;;
        3)
            query_opportunities
            ;;
        4)
            echo -e "\n${CYAN}This will create a QuickBooks invoice from a Salesforce opportunity.${NC}"
            read -p "Enter Opportunity ID (or press Enter for sample ID): " opportunity_id
            create_invoice "$opportunity_id"
            ;;
        5)
            check_payment_status
            ;;
        6)
            run_full_demo
            ;;
        q|Q)
            echo -e "\n${GREEN}Exiting demo.${NC}"
            exit 0
            ;;
        *)
            echo -e "\n${RED}Invalid choice. Please try again.${NC}"
            ;;
    esac
    
    echo -e "\n${YELLOW}Press Enter to continue...${NC}"
    read -r
done