#!/bin/bash
# Main demo runner

echo "=== Salesforce-QuickBooks Integration Demo ==="
echo ""
echo "1. Make sure middleware is running"
echo "2. Create opportunities in Salesforce"
echo "3. Use this script to create invoices"
echo ""

# Check if middleware is running
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "Starting middleware..."
    cd /Users/m/git/clients/qbsf/final-integration
    npm start &
    sleep 3
fi

echo "Middleware is running!"
echo ""

# Display menu
echo "Available commands:"
echo "1. Query opportunities from Salesforce"
echo "2. Create an invoice from opportunity"
echo "3. Check payment status"
echo "4. Show demo opportunities (static sample data)"
echo "q. Quit"
echo ""

while true; do
    read -p "Enter command (1-4, q to quit): " cmd
    
    case $cmd in
        1)
            ./query-opportunities.sh
            ;;
        2)
            read -p "Enter Opportunity ID: " opp_id
            if [ -n "$opp_id" ]; then
                ./create-invoice-demo.sh $opp_id
            else
                echo "No Opportunity ID provided."
            fi
            ;;
        3)
            ./check-payment-status.sh
            ;;
        4)
            echo "Sample Opportunities for Demo:"
            echo "--------------------------------"
            echo "ID: 006QBjWnuEzXs5kUhL"
            echo "Name: Burlington Textiles Weaving Plant Generator"
            echo "Stage: Closed Won"
            echo "Amount: $235,000.00"
            echo "QB_Invoice_ID: null"
            echo ""
            echo "ID: 006QBjWnuEzXs5kUm3"
            echo "Name: Grand Hotels Kitchen Generator"
            echo "Stage: Closed Won"
            echo "Amount: $155,000.00"
            echo "QB_Invoice_ID: null"
            echo ""
            echo "ID: 006QBjWnuEzXs5kUn9"
            echo "Name: United Oil Office Supplies"
            echo "Stage: Negotiation/Review"
            echo "Amount: $75,000.00"
            echo "QB_Invoice_ID: null"
            ;;
        q|Q)
            echo "Exiting demo."
            exit 0
            ;;
        *)
            echo "Invalid command. Please try again."
            ;;
    esac
    
    echo ""
    echo "Available commands:"
    echo "1. Query opportunities from Salesforce"
    echo "2. Create an invoice from opportunity"
    echo "3. Check payment status"
    echo "4. Show demo opportunities (static sample data)"
    echo "q. Quit"
    echo ""
done