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
