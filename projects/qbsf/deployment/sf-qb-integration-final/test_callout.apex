Http http = new Http();
HttpRequest req = new HttpRequest();
req.setEndpoint('https://9e14-166-1-160-232.ngrok-free.app/api/health');
req.setMethod('GET');
req.setHeader('X-API-Key', 'quickbooks_salesforce_api_key_2025');

try {
    HttpResponse res = http.send(req);
    System.debug('SUCCESS! Status: ' + res.getStatusCode());
    System.debug('Body: ' + res.getBody());
} catch (Exception e) {
    System.debug('ERROR: ' + e.getMessage());
}
