#!/bin/bash
# Script to find all files needed for Salesforce Quick Action demo

echo "=== Finding Files for Quick Action Demo ==="
echo ""
echo "1. Finding Apex classes for Quick Action..."
find /Users/m/git/clients/qbsf -name "*QuickBooks*" -name "*.cls" -o -name "*.apex" | grep -v node_modules

echo ""
echo "2. Finding Quick Action metadata files..."
find /Users/m/git/clients/qbsf -name "*.quickAction*" -o -name "*quick-action*" | grep -v node_modules

echo ""
echo "3. Finding LWC components..."
find /Users/m/git/clients/qbsf -name "lwc-*" -o -name "*quickbooks*.js" -o -name "*quickbooks*.html" | grep -v node_modules

echo ""
echo "4. Finding demo scripts..."
find /Users/m/git/clients/qbsf -name "*demo*.sh" -o -name "*demo*.js" | grep -v node_modules | sort

echo ""
echo "5. Finding working API endpoint files..."
find /Users/m/git/clients/qbsf -path "*/routes/api.js" -o -path "*/routes/api-demo.js" | grep -v node_modules

echo ""
echo "6. Checking final-integration for needed files..."
ls -la /Users/m/git/clients/qbsf/final-integration/src/routes/
ls -la /Users/m/git/clients/qbsf/final-integration/src/services/

echo ""
echo "7. Looking for invoice creation logic..."
grep -r "createInvoice" /Users/m/git/clients/qbsf/final-integration/src/ --include="*.js" | head -5

echo ""
echo "8. Finding files modified in the last 3 hours..."
find /Users/m/git/clients/qbsf -type f -mmin -180 | grep -v "node_modules\|.git" | sort