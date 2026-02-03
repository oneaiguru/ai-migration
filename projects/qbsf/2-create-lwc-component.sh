#!/bin/bash
# Script 2: Create LWC Component for QuickBooks Invoice

echo "=== Creating Lightning Web Component ==="

# Create the LWC directory structure
LWC_DIR="force-app/main/default/lwc/quickBooksInvoice"
mkdir -p "$LWC_DIR"

# Create the HTML template
cat > "$LWC_DIR/quickBooksInvoice.html" << 'EOF'
<template>
    <lightning-quick-action-panel header="Create QuickBooks Invoice">
        <div class="slds-p-horizontal_medium">
            <!-- Loading State -->
            <template if:true={isLoading}>
                <div class="slds-align_absolute-center slds-m-vertical_medium">
                    <lightning-spinner alternative-text="Creating invoice..." size="medium"></lightning-spinner>
                    <p class="slds-m-top_medium">Creating QuickBooks invoice...</p>
                </div>
            </template>
            
            <!-- Success State -->
            <template if:true={isSuccess}>
                <div class="slds-box slds-theme_success">
                    <div class="slds-text-align_center">
                        <lightning-icon icon-name="utility:success" variant="success" size="large"></lightning-icon>
                        <h2 class="slds-text-heading_medium slds-m-top_medium">Invoice Created Successfully!</h2>
                        <p class="slds-m-top_small">Invoice ID: {invoiceId}</p>
                        <p>Invoice Number: {invoiceNumber}</p>
                    </div>
                </div>
            </template>
            
            <!-- Error State -->
            <template if:true={error}>
                <div class="slds-box slds-theme_error">
                    <div class="slds-text-align_center">
                        <lightning-icon icon-name="utility:error" variant="error" size="large"></lightning-icon>
                        <h2 class="slds-text-heading_medium slds-m-top_medium">Error Creating Invoice</h2>
                        <p class="slds-m-top_small">{error}</p>
                    </div>
                </div>
            </template>
            
            <!-- Initial State -->
            <template if:false={isLoading}>
                <template if:false={isSuccess}>
                    <template if:false={error}>
                        <div class="slds-text-align_center">
                            <lightning-icon icon-name="standard:invoice" size="large"></lightning-icon>
                            <h2 class="slds-text-heading_medium slds-m-top_medium">Create QuickBooks Invoice</h2>
                            <p class="slds-m-vertical_medium">This will create an invoice in QuickBooks for this opportunity.</p>
                            <div class="slds-box slds-theme_default slds-m-vertical_medium">
                                <dl class="slds-dl_horizontal">
                                    <dt class="slds-dl_horizontal__label">Opportunity:</dt>
                                    <dd class="slds-dl_horizontal__detail">{opportunityName}</dd>
                                    <dt class="slds-dl_horizontal__label">Amount:</dt>
                                    <dd class="slds-dl_horizontal__detail">
                                        <lightning-formatted-number value={opportunityAmount} format-style="currency" currency-code="USD"></lightning-formatted-number>
                                    </dd>
                                    <dt class="slds-dl_horizontal__label">Account:</dt>
                                    <dd class="slds-dl_horizontal__detail">{accountName}</dd>
                                </dl>
                            </div>
                            <div class="slds-button-group-row slds-m-top_medium">
                                <lightning-button 
                                    variant="neutral" 
                                    label="Cancel" 
                                    onclick={handleCancel}
                                    class="slds-m-right_small">
                                </lightning-button>
                                <lightning-button 
                                    variant="brand" 
                                    label="Create Invoice" 
                                    onclick={handleCreateInvoice} 
                                    disabled={isLoading}>
                                </lightning-button>
                            </div>
                        </div>
                    </template>
                </template>
            </template>
        </div>
    </lightning-quick-action-panel>
</template>
EOF

echo "✓ Created quickBooksInvoice.html"

# Create the JavaScript controller
cat > "$LWC_DIR/quickBooksInvoice.js" << 'EOF'
import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import createQuickBooksInvoice from '@salesforce/apex/QuickBooksInvoiceController.createInvoice';

// Fields to retrieve from the Opportunity
const OPPORTUNITY_FIELDS = [
    'Opportunity.Name',
    'Opportunity.Amount',
    'Opportunity.AccountId',
    'Opportunity.Account.Name',
    'Opportunity.QB_Invoice_ID__c'
];

export default class QuickBooksInvoice extends LightningElement {
    @api recordId;
    @api objectApiName;
    
    isLoading = false;
    isSuccess = false;
    error = null;
    invoiceId = null;
    invoiceNumber = null;
    
    opportunityName = '';
    opportunityAmount = 0;
    accountName = '';
    
    // Wire the opportunity record
    @wire(getRecord, { recordId: '$recordId', fields: OPPORTUNITY_FIELDS })
    wiredOpportunity({ error, data }) {
        if (data) {
            this.opportunityName = data.fields.Name.value;
            this.opportunityAmount = data.fields.Amount.value;
            this.accountName = data.fields.Account.value.fields.Name.value;
            
            // Check if invoice already exists
            const existingInvoiceId = data.fields.QB_Invoice_ID__c.value;
            if (existingInvoiceId) {
                this.error = `Invoice already exists with ID: ${existingInvoiceId}`;
            }
        } else if (error) {
            this.error = 'Error loading opportunity details';
            console.error('Error loading opportunity:', error);
        }
    }
    
    async handleCreateInvoice() {
        this.isLoading = true;
        this.error = null;
        
        try {
            // Call Apex to create the invoice
            const result = await createQuickBooksInvoice({ 
                opportunityId: this.recordId 
            });
            
            if (result.success) {
                this.isSuccess = true;
                this.invoiceId = result.invoiceId;
                this.invoiceNumber = result.invoiceNumber;
                
                // Show success toast
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: `Invoice ${result.invoiceNumber} created successfully`,
                    variant: 'success'
                }));
                
                // Close the action after a short delay
                setTimeout(() => {
                    this.dispatchEvent(new CloseActionScreenEvent());
                }, 2000);
            } else {
                this.error = result.message || 'Error creating invoice';
            }
        } catch (error) {
            this.error = error.body?.message || 'An unexpected error occurred';
            console.error('Error creating invoice:', error);
            
            // Show error toast
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: this.error,
                variant: 'error'
            }));
        } finally {
            this.isLoading = false;
        }
    }
    
    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}
EOF

echo "✓ Created quickBooksInvoice.js"

# Create the metadata configuration file
cat > "$LWC_DIR/quickBooksInvoice.js-meta.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>Create QuickBooks Invoice</masterLabel>
    <description>Create an invoice in QuickBooks from a Salesforce opportunity</description>
    <targets>
        <target>lightning__RecordAction</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__RecordAction">
            <actionType>ScreenAction</actionType>
            <objects>
                <object>Opportunity</object>
            </objects>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
EOF

echo "✓ Created quickBooksInvoice.js-meta.xml"

echo ""
echo "Lightning Web Component created successfully!"
echo "Location: $LWC_DIR"
echo ""
echo "Next step: Run ./3-create-apex-classes.sh"
