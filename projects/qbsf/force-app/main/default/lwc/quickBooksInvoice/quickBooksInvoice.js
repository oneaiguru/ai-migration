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
