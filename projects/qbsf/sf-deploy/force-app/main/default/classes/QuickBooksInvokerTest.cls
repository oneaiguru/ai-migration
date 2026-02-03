/**
 * Test class for QuickBooksInvoker
 * This provides basic test coverage to allow deployment
 */
@isTest
private class QuickBooksInvokerTest {
    
    @isTest
    static void testCreateInvoiceFromQuickAction() {
        // Create test opportunity
        Opportunity opp = new Opportunity(
            Name = 'Test Opportunity',
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            Amount = 1000.00
        );
        insert opp;
        
        // Call the method in a test context - we can't actually make callouts in tests
        Test.startTest();
        
        // Set mock callout response
        Test.setMock(HttpCalloutMock.class, new QuickBooksInvokerMock());
        
        // Call the method - test will use the mock
        Map<String, Object> result = QuickBooksInvoker.createInvoiceFromQuickAction(opp.Id);
        
        Test.stopTest();
        
        // Verify results
        System.assertEquals(true, result.get('success'));
        System.assertNotEquals(null, result.get('invoiceId'));
        System.assertNotEquals(null, result.get('message'));
    }
    
    // Mock implementation of HTTP callout
    private class QuickBooksInvokerMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            response.setStatusCode(200);
            response.setBody('{"success": true, "invoiceId": "INV-TEST-1234", "message": "Invoice created successfully"}');
            return response;
        }
    }
}