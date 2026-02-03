/**
 * Direct controller that hardcodes everything to bypass all issues
 */
public with sharing class QuickBooksDirectController {
    
    @AuraEnabled
    public static Map<String, Object> createInvoiceDirectly(Id opportunityId) {
        Map<String, Object> result = new Map<String, Object>();
        
        try {
            // Hardcode EVERYTHING
            String ngrokUrl = 'https://3a62-166-1-160-232.ngrok-free.app';
            String apiKey = 'quickbooks_salesforce_api_key_2025';
            String realmId = '4620816365337654250';
            
            System.debug('DIRECT: Using hardcoded ngrok URL: ' + ngrokUrl);
            
            // Get opportunity
            Opportunity opp = [SELECT Id, Name FROM Opportunity WHERE Id = :opportunityId LIMIT 1];
            
            // Create request directly
            HttpRequest req = new HttpRequest();
            String endpoint = ngrokUrl + '/api/create-invoice';
            req.setEndpoint(endpoint);
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', apiKey);
            req.setTimeout(60000);
            
            System.debug('DIRECT: Endpoint being used: ' + endpoint);
            
            // Request body
            Map<String, Object> requestBody = new Map<String, Object>{
                'opportunityId' => opportunityId,
                'salesforceInstance' => URL.getOrgDomainUrl().toExternalForm(),
                'quickbooksRealm' => realmId
            };
            
            req.setBody(JSON.serialize(requestBody));
            System.debug('DIRECT: Request body: ' + req.getBody());
            
            // Make callout
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            System.debug('DIRECT: Response status: ' + res.getStatusCode());
            System.debug('DIRECT: Response body: ' + res.getBody());
            
            result.put('success', res.getStatusCode() == 200);
            result.put('response', res.getBody());
            
        } catch (Exception e) {
            System.debug('DIRECT ERROR: ' + e.getMessage());
            System.debug('DIRECT STACK: ' + e.getStackTraceString());
            result.put('success', false);
            result.put('error', e.getMessage());
        }
        
        return result;
    }
}