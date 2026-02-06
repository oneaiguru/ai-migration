#!/bin/bash
# Main Demo Runner with Enhanced Features

# demo-controller.sh
cat > demo-controller.sh << 'EOF'
#!/bin/bash
# Enhanced Demo Controller for Salesforce-QuickBooks Integration

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_KEY="quickbooks_salesforce_api_key_2025"
SERVER_URL="http://localhost:3000"
SF_INSTANCE="https://customer-inspiration-2543.my.salesforce.com"
QB_REALM="9341454378379755"

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if middleware is running
check_middleware() {
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        print_color $GREEN "✓ Middleware is running"
        return 0
    else
        print_color $RED "✗ Middleware is not running"
        return 1
    fi
}

# Function to start middleware
start_middleware() {
    print_color $YELLOW "Starting middleware..."
    cd /Users/m/git/clients/qbsf/final-integration
    npm start > /tmp/middleware.log 2>&1 &
    MIDDLEWARE_PID=$!
    echo $MIDDLEWARE_PID > /tmp/middleware.pid
    sleep 5
    
    if check_middleware; then
        print_color $GREEN "✓ Middleware started successfully (PID: $MIDDLEWARE_PID)"
    else
        print_color $RED "✗ Failed to start middleware"
        cat /tmp/middleware.log
        exit 1
    fi
}

# Function to create invoice
create_invoice() {
    local opp_id=$1
    
    if [ -z "$opp_id" ]; then
        print_color $RED "Error: No opportunity ID provided"
        return 1
    fi
    
    print_color $YELLOW "Creating invoice for opportunity: $opp_id"
    
    response=$(curl -s -X POST "$SERVER_URL/api/create-invoice" \
         -H "Content-Type: application/json" \
         -H "X-API-Key: $API_KEY" \
         -d "{
           \"opportunityId\": \"$opp_id\",
           \"salesforceInstance\": \"$SF_INSTANCE\",
           \"quickbooksRealm\": \"$QB_REALM\"
         }")
    
    success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" = "true" ]; then
        invoice_id=$(echo "$response" | jq -r '.invoiceId')
        print_color $GREEN "✓ Invoice created successfully!"
        print_color $BLUE "  Invoice ID: $invoice_id"
        print_color $BLUE "  Opportunity ID: $opp_id"
    else
        print_color $RED "✗ Failed to create invoice"
        echo "$response" | jq
    fi
}

# Function to check payment status
check_payment_status() {
    print_color $YELLOW "Checking payment status..."
    
    response=$(curl -s -X POST "$SERVER_URL/api/check-payment-status" \
         -H "Content-Type: application/json" \
         -H "X-API-Key: $API_KEY" \
         -d "{
           \"salesforceInstance\": \"$SF_INSTANCE\",
           \"quickbooksRealm\": \"$QB_REALM\"
         }")
    
    success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" = "true" ]; then
        print_color $GREEN "✓ Payment status check completed"
        echo "$response" | jq
    else
        print_color $RED "✗ Failed to check payment status"
        echo "$response" | jq
    fi
}

# Function to display sample opportunities
show_sample_opportunities() {
    print_color $BLUE "=== Sample Opportunities for Demo ==="
    echo ""
    print_color $GREEN "1. Opportunity: as"
    echo "   ID: ${YOUR_NEW_OPP_ID:-006QBjWnuEzXs5kUhL}"
    echo "   Stage: Proposal and Agreement"
    echo "   Amount: EUR 5,000.00"
    echo ""
    print_color $GREEN "2. Opportunity: Burlington Textiles"
    echo "   ID: 006QBjWnuEzXs5kUm1"
    echo "   Stage: Closed Won"
    echo "   Amount: $235,000.00"
    echo ""
    print_color $GREEN "3. Opportunity: Grand Hotels"
    echo "   ID: 006QBjWnuEzXs5kUm2"
    echo "   Stage: Negotiation/Review"
    echo "   Amount: $155,000.00"
    echo ""
}

# Main menu
main_menu() {
    while true; do
        echo ""
        print_color $BLUE "=== Salesforce-QuickBooks Integration Demo ==="
        echo "1. Check middleware status"
        echo "2. Start middleware (if not running)"
        echo "3. Show sample opportunities"
        echo "4. Create invoice from opportunity"
        echo "5. Check payment status"
        echo "6. Run complete demo flow"
        echo "q. Quit"
        echo ""
        
        read -p "Select option: " choice
        
        case $choice in
            1)
                check_middleware
                ;;
            2)
                start_middleware
                ;;
            3)
                show_sample_opportunities
                ;;
            4)
                read -p "Enter Opportunity ID: " opp_id
                create_invoice "$opp_id"
                ;;
            5)
                check_payment_status
                ;;
            6)
                run_complete_demo
                ;;
            q|Q)
                print_color $YELLOW "Exiting demo..."
                exit 0
                ;;
            *)
                print_color $RED "Invalid option. Please try again."
                ;;
        esac
    done
}

# Function to run complete demo
run_complete_demo() {
    print_color $BLUE "=== Running Complete Demo Flow ==="
    echo ""
    
    # Step 1: Check middleware
    print_color $YELLOW "Step 1: Checking middleware..."
    if ! check_middleware; then
        start_middleware
    fi
    echo ""
    
    # Step 2: Show opportunities
    print_color $YELLOW "Step 2: Available opportunities..."
    show_sample_opportunities
    echo ""
    
    # Step 3: Create invoice
    print_color $YELLOW "Step 3: Creating invoice..."
    read -p "Enter Opportunity ID: " opp_id
    create_invoice "$opp_id"
    echo ""
    
    # Step 4: Simulate QuickBooks payment
    print_color $YELLOW "Step 4: Mark invoice as paid in QuickBooks"
    print_color $BLUE "  (Manual step: Go to QuickBooks and mark invoice as paid)"
    read -p "Press Enter when invoice is marked as paid in QuickBooks..."
    echo ""
    
    # Step 5: Check payment status
    print_color $YELLOW "Step 5: Checking payment status and updating Salesforce..."
    check_payment_status
    echo ""
    
    print_color $GREEN "✓ Demo flow completed!"
}

# Start the demo
if ! check_middleware; then
    print_color $YELLOW "Middleware is not running. Starting it now..."
    start_middleware
fi

main_menu
EOF

chmod +x demo-controller.sh

# Quick demo runner for specific steps
cat > quick-demo.sh << 'EOF'
#!/bin/bash
# Quick Demo Script for Fast Testing

# Configuration
API_KEY="quickbooks_salesforce_api_key_2025"
SERVER_URL="http://localhost:3000"
SF_INSTANCE="https://customer-inspiration-2543.my.salesforce.com"
QB_REALM="9341454378379755"

# Check if command is provided
if [ -z "$1" ]; then
    echo "Usage: ./quick-demo.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  create <opportunity_id>  - Create invoice"
    echo "  check                   - Check payment status"
    echo "  health                  - Check middleware health"
    echo ""
    exit 1
fi

case $1 in
    create)
        if [ -z "$2" ]; then
            echo "Error: Please provide opportunity ID"
            exit 1
        fi
        
        echo "Creating invoice for opportunity: $2"
        curl -X POST "$SERVER_URL/api/create-invoice" \
             -H "Content-Type: application/json" \
             -H "X-API-Key: $API_KEY" \
             -d "{
               \"opportunityId\": \"$2\",
               \"salesforceInstance\": \"$SF_INSTANCE\",
               \"quickbooksRealm\": \"$QB_REALM\"
             }" | jq
        ;;
        
    check)
        echo "Checking payment status..."
        curl -X POST "$SERVER_URL/api/check-payment-status" \
             -H "Content-Type: application/json" \
             -H "X-API-Key: $API_KEY" \
             -d "{
               \"salesforceInstance\": \"$SF_INSTANCE\",
               \"quickbooksRealm\": \"$QB_REALM\"
             }" | jq
        ;;
        
    health)
        echo "Checking middleware health..."
        curl "$SERVER_URL/health" -H "X-API-Key: $API_KEY" | jq
        ;;
        
    *)
        echo "Unknown command: $1"
        exit 1
        ;;
esac
EOF

chmod +x quick-demo.sh

# Demo cheat sheet
cat > DEMO_CHEAT_SHEET.md << 'EOF'
# Salesforce-QuickBooks Integration Demo Cheat Sheet

## Quick Start
```bash
# Start the enhanced demo
./demo-controller.sh

# Or use quick commands
./quick-demo.sh health
./quick-demo.sh create <OPPORTUNITY_ID>
./quick-demo.sh check
```

## Demo Flow for Client

### 1. Preparation
- Make sure middleware is running
- Have Salesforce and QuickBooks tabs open
- Know your opportunity IDs

### 2. Demo Script
1. Show opportunity in Salesforce (without invoice)
2. Run create invoice command
3. Show invoice created in QuickBooks
4. Mark invoice as paid in QuickBooks
5. Run check payment command
6. Show opportunity updated to "Closed Won" in Salesforce

### 3. Command Examples
```bash
# Create invoice for opportunity
./quick-demo.sh create 006QBjWnuEzXs5kUhL

# Check payment status
./quick-demo.sh check
```

### 4. Troubleshooting
- If middleware not running: `npm start` in final-integration folder
- If auth fails: Check tokens.json file
- If API fails: Check middleware logs

## Key Points for Demo
1. Real-time integration
2. Bi-directional sync
3. Automatic status updates
4. No manual data entry
EOF
