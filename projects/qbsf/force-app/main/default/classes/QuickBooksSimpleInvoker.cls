public with sharing class QuickBooksSimpleInvoker {
    @AuraEnabled
    public static Map<String,Object> createInvoice(Id opportunityId) {
        HttpRequest req = new HttpRequest();
        // HARDCODE the ngrok URL
        req.setEndpoint('https://3a62-166-1-160-232.ngrok-free.app/api/create-invoice');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('X-API-Key', 'quickbooks_salesforce_api_key_2025');
        
        Map<String,Object> body = new Map<String,Object>{
            'opportunityId' => opportunityId,
            'salesforceInstance' => URL.getOrgDomainUrl().toExternalForm(),
            'quickbooksRealm' => '1234567890'
        };
        
        req.setBody(JSON.serialize(body));
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        Map<String,Object> result = new Map<String,Object>();
        result.put('success', res.getStatusCode() == 200);
        result.put('message', res.getBody());
        
        return result;
    }
}
