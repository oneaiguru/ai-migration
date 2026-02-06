import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QuickBooksTest extends LightningElement {
    @api recordId;
    @track result;
    @track error;
    @track isLoading = false;
    
    get prettyResult() {
        return this.result ? JSON.stringify(this.result, null, 2) : '';
    }
    
    async handleClick() {
        this.isLoading = true;
        this.result = null;
        this.error = null;
        
        try {
            console.log('DEBUG TEST: Opening browser console');
            
            // Instead of calling the Apex class, just manually test the settings
            const testInfo = {
                recordId: this.recordId,
                ngrokUrl: 'https://3a62-166-1-160-232.ngrok-free.app',
                note: 'Check your browser console (F12) to see all API calls'
            };
            
            console.log('DEBUG TEST: Test info:', testInfo);
            
            this.result = testInfo;
            
            this.dispatchEvent(new ShowToastEvent({
                title: 'Test started',
                message: 'Check browser console with F12',
                variant: 'success'
            }));
            
        } catch (error) {
            console.error('DEBUG TEST: Error caught:', error);
            
            if (error.body) {
                console.error('DEBUG TEST: Error body:', JSON.stringify(error.body));
                this.error = error.body.message || JSON.stringify(error.body);
            } else {
                this.error = error.message || 'Unknown error';
            }
        } finally {
            this.isLoading = false;
        }
    }
}