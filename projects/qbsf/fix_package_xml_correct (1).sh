#!/bin/bash
# Fix package.xml by directly writing the correct content with proper name tags

echo "=== Fixing package.xml ==="

cat > force-app/main/default/package.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>QuickBooks_Settings__c</members>
        <name>CustomObject</name>
    </types>
    <types>
        <members>QuickBooks_Settings__c.Middleware_URL__c</members>
        <members>QuickBooks_Settings__c.API_Key__c</members>
        <members>QuickBooks_Settings__c.QB_Realm_ID__c</members>
        <members>Opportunity.QB_Invoice_ID__c</members>
        <members>Opportunity.QB_Invoice_Number__c</members>
        <members>Opportunity.QB_Payment_ID__c</members>
        <members>Opportunity.QB_Payment_Date__c</members>
        <members>Opportunity.QB_Payment_Method__c</members>
        <members>Opportunity.QB_Payment_Amount__c</members>
        <name>CustomField</name>
    </types>
    <types>
        <members>QuickBooksMiddleware</members>
        <name>RemoteSiteSetting</name>
    </types>
    <types>
        <members>QuickBooksInvoiceController</members>
        <members>QuickBooksAPIService</members>
        <members>QuickBooksInvoiceControllerTest</members>
        <name>ApexClass</name>
    </types>
    <types>
        <members>quickBooksInvoice</members>
        <members>quickBooksSimpleButton</members>
        <name>LightningComponentBundle</name>
    </types>
    <version>57.0</version>
</Package>
EOF

echo "✓ Fixed package.xml with correct 'name' tags"
