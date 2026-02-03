/**
 * Fixed controller that ensures ngrok URL is used
 */
public with sharing class QuickBooksInvoiceControllerFixed {
    
    @AuraEnabled
    public static InvoiceResult createInvoice(Id opportunityId) {
        InvoiceResult result = new InvoiceResult();
        
        try {
            // Validate the opportunity exists
            Opportunity opp = [
                SELECT Id, Name, Amount, AccountId, QB_Invoice_ID__c, Account.Name
                FROM Opportunity 
                WHERE Id = :opportunityId
                LIMIT 1
            ];
            
            // Check if invoice already exists
            if (String.isNotBlank(opp.QB_Invoice_ID__c)) {
                result.success = false;
                result.message = 'Invoice already exists for this opportunity';
                return result;
            }
            
            // Get custom settings
            QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
            
            // CRITICAL: Force ngrok URL here
            if (settings.Middleware_URL__c == null || settings.Middleware_URL__c.contains('localhost')) {
                settings.Middleware_URL__c = 'https://3a62-166-1-160-232.ngrok-free.app';
                update settings;
            }
            
            // Use the wrapper service
            result = QuickBooksAPIServiceWrapper.createInvoice(
                opportunityId,
                URL.getOrgDomainUrl().toExternalForm(),
                settings.QB_Realm_ID__c
            );
            
        } catch (Exception e) {
            result.success = false;
            result.message = 'Error: ' + e.getMessage();
            System.debug('Error creating invoice: ' + e.getMessage());
        }
        
        return result;
    }
    
    public class InvoiceResult {
        @AuraEnabled public Boolean success { get; set; }
        @AuraEnabled public String message { get; set; }
        @AuraEnabled public String invoiceId { get; set; }
        @AuraEnabled public String invoiceNumber { get; set; }
        
        public InvoiceResult() {
            this.success = false;
            this.message = '';
        }
    }
}
