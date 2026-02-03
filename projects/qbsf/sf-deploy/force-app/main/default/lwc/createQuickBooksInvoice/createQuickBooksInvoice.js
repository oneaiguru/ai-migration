import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import createInvoice from '@salesforce/apex/QuickBooksInvoker.createInvoiceFromQuickAction';

const FIELDS = ['Opportunity.Name', 'Opportunity.Amount', 'Opportunity.QB_Invoice_ID__c'];

export default class CreateQuickBooksInvoice extends LightningElement {
    @api recordId;
    isLoading = false;
    
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    opportunity;
    
    get hasInvoice() {
        return this.opportunity.data?.fields?.QB_Invoice_ID__c?.value;
    }
    
    get opportunityName() {
        return this.opportunity.data?.fields?.Name?.value;
    }
    
    async handleCreateInvoice() {
        this.isLoading = true;
        
        try {
            const result = await createInvoice({ opportunityId: this.recordId });
            
            if (result.success) {
                // Show success message
                this.showToast('Success', result.message, 'success');
                
                // Refresh the record to show the new invoice ID
                await updateRecord({ fields: { Id: this.recordId } });
            } else {
                this.showToast('Error', result.message, 'error');
            }
        } catch (error) {
            this.showToast('Error', error.body?.message || 'Unknown error occurred', 'error');
        } finally {
            this.isLoading = false;
        }
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
