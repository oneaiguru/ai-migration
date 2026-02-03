/**
 * Controller class for QuickBooks invoice creation from Salesforce
 * This class handles the API callout to the middleware service
 */
public with sharing class QuickBooksInvoiceController {
    
    /**
     * Create an invoice in QuickBooks for a given Opportunity
     * @param opportunityId The Salesforce Opportunity ID
     * @return InvoiceResult Result of the invoice creation attempt
     */
    @AuraEnabled
    public static InvoiceResult createInvoice(Id opportunityId) {
        InvoiceResult result = new InvoiceResult();
        
        try {
            // Validate the opportunity exists and has required fields
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
            
            // Get custom settings for middleware configuration
            QuickBooks_Settings__c settings = QuickBooks_Settings__c.getOrgDefaults();
            if (settings == null || String.isBlank(settings.Middleware_URL__c) || String.isBlank(settings.API_Key__c)) {
                result.success = false;
                result.message = 'QuickBooks integration is not configured. Please contact your administrator.';
                return result;
            }
            
            // Make the API callout
            result = QuickBooksAPIService.createInvoice(
                opportunityId,
                URL.getOrgDomainUrl().toExternalForm(),
                settings.QB_Realm_ID__c
            );
            
        } catch (Exception e) {
            result.success = false;
            result.message = 'Error: ' + e.getMessage();
            System.debug('Error creating invoice: ' + e.getMessage() + '\n' + e.getStackTraceString());
        }
        
        return result;
    }
    
    /**
     * Result wrapper class
     */
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
