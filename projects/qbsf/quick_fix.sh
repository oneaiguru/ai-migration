#!/bin/bash
# Quick fix - create the missing component

echo "=== Creating quickBooksSimpleButton Component ==="

# Copy the existing component to the new name
if [ -d "force-app/main/default/lwc/quickBooksInvoice" ]; then
    echo "Copying quickBooksInvoice to quickBooksSimpleButton..."
    cp -r force-app/main/default/lwc/quickBooksInvoice force-app/main/default/lwc/quickBooksSimpleButton
    
    # Rename files in the new directory
    cd force-app/main/default/lwc/quickBooksSimpleButton
    mv quickBooksInvoice.html quickBooksSimpleButton.html
    mv quickBooksInvoice.js quickBooksSimpleButton.js
    mv quickBooksInvoice.js-meta.xml quickBooksSimpleButton.js-meta.xml
    
    # Update the class name in the JS file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's/export default class QuickBooksInvoice/export default class QuickBooksSimpleButton/g' quickBooksSimpleButton.js
    else
        # Linux
        sed -i 's/export default class QuickBooksInvoice/export default class QuickBooksSimpleButton/g' quickBooksSimpleButton.js
    fi
    
    echo "✓ Created quickBooksSimpleButton component"
    cd ../../../../..
    
    echo ""
    echo "Component created successfully!"
    echo "Now run: ./g_deploy_salesforce.sh"
else
    echo "Error: quickBooksInvoice component not found"
    echo "Make sure you've run ./e_create_lwc.sh first"
    exit 1
fi
