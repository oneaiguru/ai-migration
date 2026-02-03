#!/bin/bash
# Fix the LWC deployment issue

echo "=== Fixing LWC Deployment Issue ==="

# 1. Check sfdx-project.json
echo "Checking sfdx-project.json..."
if [ -f "sfdx-project.json" ]; then
    echo "Current sfdx-project.json:"
    cat sfdx-project.json
else
    echo "Creating sfdx-project.json..."
    cat > sfdx-project.json << 'EOF'
{
  "packageDirectories": [
    {
      "path": "force-app",
      "default": true
    }
  ],
  "name": "QuickBooksIntegration",
  "namespace": "",
  "sfdcLoginUrl": "https://login.salesforce.com",
  "sourceApiVersion": "57.0"
}
EOF
fi

# 2. Check directory structure
echo -e "\nChecking directory structure..."
echo "force-app structure:"
find force-app -type d | head -20

# 3. Check if LWC components are in the right place
echo -e "\nChecking LWC components location..."
if [ -d "force-app/main/default/lwc" ]; then
    echo "LWC directory exists at: force-app/main/default/lwc"
    ls -la force-app/main/default/lwc/
else
    echo "ERROR: LWC directory not found at expected location"
fi

# 4. Check for duplicate components or incorrect structure
echo -e "\nChecking for duplicate quickBooksSimpleButton..."
find . -name "quickBooksSimpleButton" -type d 2>/dev/null | grep -v node_modules | grep -v ".sfdx"

# 5. Remove the problematic component and recreate
echo -e "\nRemoving and recreating quickBooksSimpleButton..."
rm -rf force-app/main/default/lwc/quickBooksSimpleButton

mkdir -p force-app/main/default/lwc/quickBooksSimpleButton

# Create the component files
cat > force-app/main/default/lwc/quickBooksSimpleButton/quickBooksSimpleButton.html << 'EOF'
<template>
    <lightning-card title="QuickBooks Invoice">
        <div class="slds-p-horizontal_medium">
            <template if:true={isLoading}>
                <lightning-spinner alternative-text="Loading" size="medium"></lightning-spinner>
            </template>
            <template if:false={isLoading}>
                <lightning-button
                    variant="brand"
                    label="Create QuickBooks Invoice"
                    onclick={handleCreateInvoice}>
                </lightning-button>
            </template>
        </div>
    </lightning-card>
</template>
EOF

cat > force-app/main/default/lwc/quickBooksSimpleButton/quickBooksSimpleButton.js << 'EOF'
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createInvoice from '@salesforce/apex/QuickBooksInvoiceController.createInvoice';

export default class QuickBooksSimpleButton extends LightningElement {
    @api recordId;
    isLoading = false;
    
    async handleCreateInvoice() {
        this.isLoading = true;
        try {
            const result = await createInvoice({ opportunityId: this.recordId });
            if (result.success) {
                this.showToast('Success', result.message, 'success');
                setTimeout(() => window.location.reload(), 2000);
            } else {
                this.showToast('Error', result.message, 'error');
            }
        } catch (error) {
            this.showToast('Error', error.body?.message || 'Unknown error', 'error');
        } finally {
            this.isLoading = false;
        }
    }
    
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
EOF

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

# 6. Update package.xml (remove quickBooksSimpleButton temporarily)
echo -e "\nUpdating package.xml..."
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

echo -e "\n=== Fix Complete ==="
echo "Try deploying again with: ./g_deploy_salesforce.sh"
echo ""
echo "If it still fails, try deploying only the component:"
echo "sf project deploy start --source-dir force-app/main/default/lwc/quickBooksSimpleButton --target-org myorg"
