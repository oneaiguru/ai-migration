#!/bin/bash
# Script to fix LWC component issues

echo "=== Fixing LWC Component Structure ==="

# First, check if the LWC directory exists
echo "Checking LWC directory structure..."
mkdir -p force-app/main/default/lwc

# Check if quickBooksInvoice exists
if [ ! -d "force-app/main/default/lwc/quickBooksInvoice" ]; then
    echo "Creating quickBooksInvoice component..."
    ./e_create_lwc.sh
fi

# Now create quickBooksSimpleButton properly
echo "Creating quickBooksSimpleButton component..."
mkdir -p force-app/main/default/lwc/quickBooksSimpleButton

# Create the HTML file
cat > force-app/main/default/lwc/quickBooksSimpleButton/quickBooksSimpleButton.html << 'EOF'
<template>
    <lightning-card title="QuickBooks Invoice">
        <div class="slds-p-horizontal_medium">
            <template if:true={isLoading}>
                <lightning-spinner alternative-text="Loading" size="medium"></lightning-spinner>
                <p class="slds-text-align_center slds-m-top_medium">Creating invoice...</p>
            </template>
            
            <template if:false={isLoading}>
                <lightning-button
                    variant="brand"
                    label="Create QuickBooks Invoice"
                    title="Create QuickBooks Invoice"
                    onclick={handleCreateInvoice}
                    class="slds-m-left_x-small">
                </lightning-button>
            </template>
            
            <template if:true={message}>
                <div class={messageClass}>
                    {message}
                </div>
            </template>
        </div>
    </lightning-card>
</template>
EOF

# Create the JS file
cat > force-app/main/default/lwc/quickBooksSimpleButton/quickBooksSimpleButton.js << 'EOF'
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createInvoice from '@salesforce/apex/QuickBooksInvoiceController.createInvoice';

export default class QuickBooksSimpleButton extends LightningElement {
    @api recordId;
    isLoading = false;
    message = '';
    messageClass = '';
    
    async handleCreateInvoice() {
        this.isLoading = true;
        this.message = '';
        
        try {
            const result = await createInvoice({ opportunityId: this.recordId });
            
            if (result.success) {
                this.showToast('Success', result.message, 'success');
                this.message = result.message;
                this.messageClass = 'slds-text-color_success slds-m-top_medium';
                
                // Refresh the page to show updated fields
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                this.showToast('Error', result.message, 'error');
                this.message = result.message;
                this.messageClass = 'slds-text-color_error slds-m-top_medium';
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            this.showToast('Error', error.body?.message || 'An unexpected error occurred', 'error');
            this.message = error.body?.message || 'An unexpected error occurred';
            this.messageClass = 'slds-text-color_error slds-m-top_medium';
        } finally {
            this.isLoading = false;
        }
    }
    
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}
EOF

# Create the meta.xml file
cat > force-app/main/default/lwc/quickBooksSimpleButton/quickBooksSimpleButton.js-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__RecordAction</target>
        <target>lightning__RecordPage</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__RecordAction">
            <actionType>ScreenAction</actionType>
        </targetConfig>
        <targetConfig targets="lightning__RecordPage">
            <objects>
                <object>Opportunity</object>
            </objects>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
EOF

echo "✓ Created quickBooksSimpleButton component"

# Update the package.xml to include both components
echo "Updating package.xml..."
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

echo ""
echo "=== Fix Complete ==="
echo ""
echo "Components created:"
echo "- quickBooksInvoice (if missing)"
echo "- quickBooksSimpleButton"
echo ""
echo "Now run: ./g_deploy_salesforce.sh"

# Check what's in the LWC directory
echo ""
echo "Current LWC directory contents:"
ls -la force-app/main/default/lwc/
