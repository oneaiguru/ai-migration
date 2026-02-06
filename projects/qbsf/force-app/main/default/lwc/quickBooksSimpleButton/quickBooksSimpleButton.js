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
