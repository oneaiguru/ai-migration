#!/bin/bash

echo "=== Finding the localhost hardcoded URL issue ==="
echo ""

# 1. Search for all LWC files that might contain hardcoded URLs
echo "1. Searching for Lightning Web Components with hardcoded URLs..."
echo ""

# Search in force-app directory
echo "Searching in force-app directory..."
grep -r "localhost:3000" force-app/main/default/lwc/ || echo "No localhost found in force-app LWCs"
grep -r "http://localhost" force-app/main/default/lwc/ || echo ""

# Search in DEMO_PACKAGE directory if it exists
if [ -d "DEMO_PACKAGE" ]; then
  echo ""
  echo "Searching in DEMO_PACKAGE directory..."
  grep -r "localhost:3000" DEMO_PACKAGE/ || echo "No localhost found in DEMO_PACKAGE"
  grep -r "http://localhost" DEMO_PACKAGE/ || echo ""
fi

# Search for all possible Apex classes that might have hardcoded URLs
echo ""
echo "2. Searching for Apex classes with hardcoded URLs..."
grep -r "localhost:3000" force-app/main/default/classes/ || echo "No localhost found in Apex classes"
grep -r "http://localhost" force-app/main/default/classes/ || echo ""

# Search for custom labels or custom metadata
echo ""
echo "3. Searching for custom labels or metadata with hardcoded URLs..."
grep -r "localhost:3000" force-app/main/default/labels/ || echo "No localhost found in labels"
grep -r "localhost:3000" force-app/main/default/customMetadata/ || echo "No localhost found in custom metadata"

# Search Quick Actions
echo ""
echo "4. Searching Quick Actions for hardcoded URLs..."
grep -r "localhost:3000" force-app/main/default/quickActions/ || echo "No localhost found in Quick Actions"

# Search Lightning Pages
echo ""
echo "5. Searching Lightning Pages for hardcoded URLs..."
grep -r "localhost:3000" force-app/main/default/flexipages/ || echo "No localhost found in Lightning Pages"

# Check the actual Quick Action button configuration
echo ""
echo "6. Checking Quick Action configuration..."
ls -la force-app/main/default/quickActions/ 2>/dev/null || echo "No Quick Actions directory found"

# Check if there's a Lightning Web Component for the invoice creation
echo ""
echo "7. Looking for the actual LWC used in the Quick Action..."
echo "Searching for any LWC with 'invoice' or 'quickbooks' in the name..."
find force-app/main/default/lwc -name "*invoice*" -o -name "*quickbooks*" 2>/dev/null | while read file; do
  echo "Found: $file"
  echo "Content:"
  head -20 "$file"
  echo "---"
done

# Test the actual API service being used
echo ""
echo "8. Testing the QuickBooksAPIService again to confirm it's using the right URL..."
cat > test_service.apex << 'EOF'
// Check what the service is actually using
QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
System.debug('Settings URL: ' + settings.Middleware_URL__c);

// Check if there's any hardcoded localhost in the API service
String serviceCode = [
    SELECT Body 
    FROM ApexClass 
    WHERE Name = 'QuickBooksAPIService' 
    LIMIT 1
].Body;

System.debug('Service contains localhost: ' + serviceCode.contains('localhost'));
System.debug('Service contains hardcoded URL: ' + serviceCode.contains('http://'));

// Also check the controller
String controllerCode = [
    SELECT Body 
    FROM ApexClass 
    WHERE Name = 'QuickBooksInvoiceController' 
    LIMIT 1
].Body;

System.debug('Controller contains localhost: ' + controllerCode.contains('localhost'));
System.debug('Controller contains hardcoded URL: ' + controllerCode.contains('http://'));
EOF

sf apex run --file test_service.apex --target-org myorg
rm test_service.apex

# Look for any static resources that might contain hardcoded URLs
echo ""
echo "9. Checking static resources..."
find force-app/main/default/staticresources -name "*.js" -o -name "*.json" -o -name "*.xml" 2>/dev/null | while read file; do
  if grep -l "localhost" "$file" 2>/dev/null; then
    echo "Found localhost in: $file"
  fi
done

# Check for environment-specific variables
echo ""
echo "10. Looking for environment or configuration files..."
find . -name "*.env*" -o -name "*config*.js" -o -name "*settings*.js" 2>/dev/null | while read file; do
  if grep -l "localhost" "$file" 2>/dev/null; then
    echo "Found localhost in config file: $file"
  fi
done

echo ""
echo "=== Analysis Complete ==="
echo ""
echo "Based on the error message showing 'http://localhost:3000/api/create-invoice',"
echo "there must be a hardcoded URL somewhere that's overriding the custom settings."
echo ""
echo "Most likely locations to check manually:"
echo "1. Lightning Web Component JS files"
echo "2. Apex class with hardcoded fallback URL"
echo "3. Quick Action definition"
echo "4. Custom metadata or labels"
echo ""
echo "If no hardcoded URLs were found above, the issue might be:"
echo "- A cached version of the code"
echo "- A managed package component"
echo "- A workflow or process that's overriding the settings"
