#!/bin/bash

echo "=== Targeted Fix for Quick Action localhost Issue ==="
echo ""

# 1. Find and examine the actual LWC being used
echo "1. Finding the Lightning Web Component for the Quick Action..."
find force-app/main/default/lwc -type f -name "*.js" | while read file; do
  if grep -l "invoice\|quickbooks\|QuickBooks" "$file" 2>/dev/null; then
    echo "Found potential LWC: $file"
    echo "Checking for hardcoded URLs..."
    grep -n "localhost\|3000\|http://" "$file" || echo "No hardcoded URLs found"
    echo "---"
  fi
done

# 2. Check if there's a default URL or fallback logic
echo ""
echo "2. Looking for default/fallback URL logic in Apex..."
cat > check_fallback_logic.apex << 'EOF'
// Check for any fallback logic in the API service
String serviceBody = [
    SELECT Body 
    FROM ApexClass 
    WHERE Name = 'QuickBooksAPIService' 
    LIMIT 1
].Body;

// Look for patterns like || 'localhost' or ?? 'localhost'
if (serviceBody.contains('localhost') || serviceBody.contains('3000')) {
    System.debug('FOUND LOCALHOST IN SERVICE: ' + serviceBody.substringBetween('localhost', '\n'));
}

// Check for any DEFAULT constants
if (serviceBody.contains('DEFAULT') && serviceBody.contains('URL')) {
    System.debug('Found DEFAULT URL constant');
}

// Check the controller too
String controllerBody = [
    SELECT Body 
    FROM ApexClass 
    WHERE Name = 'QuickBooksInvoiceController' 
    LIMIT 1
].Body;

if (controllerBody.contains('localhost') || controllerBody.contains('3000')) {
    System.debug('FOUND LOCALHOST IN CONTROLLER');
}
EOF

sf apex run --file check_fallback_logic.apex --target-org myorg
rm check_fallback_logic.apex

# 3. Create a JavaScript fix for any LWC that might be hardcoding the URL
echo ""
echo "3. Creating a fixed version of the LWC (if applicable)..."
cat > quickBooksInvoiceButtonFixed.js << 'EOF'
import { LightningElement, api } from 'lwc';
import createInvoice from '@salesforce/apex/QuickBooksInvoiceController.createInvoice';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QuickBooksInvoiceButtonFixed extends LightningElement {
    @api recordId;
    isLoading = false;

    handleCreateInvoice() {
        this.isLoading = true;
        
        // Force console logging to debug
        console.log('Creating invoice for opportunity:', this.recordId);
        
        createInvoice({ opportunityId: this.recordId })
            .then(result => {
                console.log('Invoice creation result:', result);
                if (result.success) {
                    this.showToast('Success', result.message, 'success');
                } else {
                    this.showToast('Error', result.message, 'error');
                }
            })
            .catch(error => {
                console.error('Invoice creation error:', error);
                this.showToast('Error', error.body?.message || 'Unknown error', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(event);
    }
}
EOF

# 4. Create the HTML template
cat > quickBooksInvoiceButtonFixed.html << 'EOF'
<template>
    <lightning-card title="Create QuickBooks Invoice">
        <div class="slds-p-horizontal_medium">
            <lightning-button
                variant="brand"
                label="Create Invoice"
                title="Create QuickBooks Invoice"
                onclick={handleCreateInvoice}
                disabled={isLoading}
                class="slds-m-left_x-small">
            </lightning-button>
            <template if:true={isLoading}>
                <lightning-spinner alternative-text="Loading" size="small"></lightning-spinner>
            </template>
        </div>
    </lightning-card>
</template>
EOF

# 5. Create the metadata
cat > quickBooksInvoiceButtonFixed.js-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>59.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__RecordAction</target>
        <target>lightning__RecordPage</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__RecordAction">
            <actionType>ScreenAction</actionType>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
EOF

echo ""
echo "6. Critical fix - Override any system-level defaults..."
cat > force_ngrok_url.apex << 'EOF'
// This ensures the ngrok URL is used everywhere
QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
settings.Middleware_URL__c = 'https://3a62-166-1-160-232.ngrok-free.app';
settings.API_Key__c = 'quickbooks_salesforce_api_key_2025';
update settings;

// Also check for user-specific settings that might override
List<QuickBooks_Settings__c> userSettings = [
    SELECT Id, SetupOwnerId, Middleware_URL__c 
    FROM QuickBooks_Settings__c 
    WHERE SetupOwnerId != :UserInfo.getOrganizationId()
];

for(QuickBooks_Settings__c us : userSettings) {
    if(us.Middleware_URL__c != null && us.Middleware_URL__c.contains('localhost')) {
        us.Middleware_URL__c = 'https://3a62-166-1-160-232.ngrok-free.app';
    }
}

if(!userSettings.isEmpty()) {
    update userSettings;
}

System.debug('Settings updated to use ngrok URL');
EOF

sf apex run --file force_ngrok_url.apex --target-org myorg
rm force_ngrok_url.apex

echo ""
echo "=== Final Steps Required ==="
echo ""
echo "1. Clear all caches:"
echo "   - Browser cache (Ctrl+Shift+Del)"
echo "   - Salesforce cache (Setup → System → Clear Cache)"
echo ""
echo "2. If the button still uses localhost, you need to:"
echo "   a. Go to Setup → Object Manager → Opportunity"
echo "   b. Find the Quick Action for QuickBooks Invoice"
echo "   c. Edit it to use the new fixed component or controller"
echo ""
echo "3. As a last resort, create a new Quick Action:"
echo "   a. Delete the existing Quick Action"
echo "   b. Create a new one with the fixed components"
echo ""
echo "4. Check debug logs:"
echo "   Setup → Debug Logs → New → User (your user) → Save"
echo "   Then click the button and review the logs"
