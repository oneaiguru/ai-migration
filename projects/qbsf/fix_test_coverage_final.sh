#!/bin/bash
# Final test coverage fix script for QuickBooks-Salesforce integration
# Increases coverage from 53% to 75%+

echo "=== QuickBooks-Salesforce Integration Test Coverage Fix ==="
echo ""

# Set org alias - adjust if needed
ORG_ALIAS="myorg"

# Check if Salesforce CLI is installed
if ! command -v sf &> /dev/null; then
    echo "Error: Salesforce CLI (sf) is not installed"
    echo "Please install it from: https://developer.salesforce.com/tools/sfdxcli"
    exit 1
fi

# Check if authenticated to Salesforce
echo "Checking Salesforce authentication..."
if ! sf org display --target-org "$ORG_ALIAS" &> /dev/null; then
    echo "Not authenticated. Let's authenticate to Salesforce..."
    echo "This will open a browser window for authentication."
    sf org login web --alias "$ORG_ALIAS" --instance-url https://login.salesforce.com
fi

# Create test folder structure if it doesn't exist
mkdir -p force-app/main/default/classes

# Create comprehensive test for QuickBooksAPIService
echo "Creating comprehensive test for QuickBooksAPIService..."
cat > force-app/main/default/classes/QuickBooksComprehensiveTest.cls << 'EOF'
/**
 * Comprehensive test class for QuickBooks integration
 * Covers both the controller and API service
 */
@isTest
private class QuickBooksComprehensiveTest {
    
    @testSetup
    static void setup() {
        // Create test data
        Account testAccount = new Account(
            Name = 'Test Account',
            BillingStreet = '123 Test St',
            BillingCity = 'Test City',
            BillingState = 'TS',
            BillingPostalCode = '12345'
        );
        insert testAccount;
        
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            StageName = 'Closed Won',
            CloseDate = Date.today(),
            Amount = 1000
        );
        insert testOpp;
        
        // Create custom settings
        QuickBooks_Settings__c settings = new QuickBooks_Settings__c(
            Middleware_URL__c = 'http://localhost:3000',
            API_Key__c = 'test_api_key',
            QB_Realm_ID__c = '1234567890'
        );
        insert settings;
    }
    
    // --- QuickBooksInvoiceController Tests ---
    
    @isTest
    static void testCreateInvoiceSuccess() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new QuickBooksMockHttpResponse());
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
        
        Test.stopTest();
        
        System.assertEquals(true, result.success);
        System.assertNotEquals(null, result.invoiceId);
        System.assertNotEquals(null, result.invoiceNumber);
    }
    
    @isTest
    static void testCreateInvoiceAlreadyExists() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        opp.QB_Invoice_ID__c = 'INV-123';
        update opp;
        
        Test.startTest();
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
        
        Test.stopTest();
        
        System.assertEquals(false, result.success);
        System.assertEquals('Invoice already exists for this opportunity', result.message);
    }
    
    @isTest
    static void testCreateInvoiceMissingSettings() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        // Delete the settings to simulate missing configuration
        delete [SELECT Id FROM QuickBooks_Settings__c];
        
        Test.startTest();
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
        
        Test.stopTest();
        
        System.assertEquals(false, result.success);
        System.assertEquals('QuickBooks integration is not configured. Please contact your administrator.', result.message);
    }
    
    // --- QuickBooksAPIService Tests ---
    
    @isTest
    static void testAPIServiceCreateInvoiceSuccess() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new QuickBooksMockHttpResponse());
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksAPIService.createInvoice(
                opp.Id, 
                'https://test.salesforce.com', 
                '1234567890'
            );
        
        Test.stopTest();
        
        System.assertEquals(true, result.success);
        System.assertEquals('Invoice created successfully', result.message);
        System.assertEquals('INV-456', result.invoiceId);
        System.assertEquals('INV-456', result.invoiceNumber);
    }
    
    @isTest
    static void testAPIServiceCreateInvoiceError() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new QuickBooksMockErrorResponse());
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksAPIService.createInvoice(
                opp.Id, 
                'https://test.salesforce.com', 
                '1234567890'
            );
        
        Test.stopTest();
        
        System.assertEquals(false, result.success);
        System.assert(result.message.startsWith('API Error:'));
    }
    
    @isTest
    static void testAPIServiceCreateInvoiceException() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        
        // Delete the settings to cause an exception
        delete [SELECT Id FROM QuickBooks_Settings__c];
        
        Test.startTest();
        
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksAPIService.createInvoice(
                opp.Id, 
                'https://test.salesforce.com', 
                '1234567890'
            );
        
        Test.stopTest();
        
        System.assertEquals(false, result.success);
        System.assert(result.message.startsWith('Error calling API:'));
    }
    
    @isTest
    static void testAPIServiceTestConnectionSuccess() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new QuickBooksMockHttpResponse());
        
        Boolean result = QuickBooksAPIService.testConnection();
        
        Test.stopTest();
        
        System.assertEquals(true, result);
    }
    
    @isTest
    static void testAPIServiceTestConnectionFailure() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new QuickBooksMockErrorResponse());
        
        Boolean result = QuickBooksAPIService.testConnection();
        
        Test.stopTest();
        
        System.assertEquals(false, result);
    }
    
    @isTest
    static void testAPIServiceTestConnectionException() {
        // Delete the settings to cause an exception
        delete [SELECT Id FROM QuickBooks_Settings__c];
        
        Test.startTest();
        
        Boolean result = QuickBooksAPIService.testConnection();
        
        Test.stopTest();
        
        System.assertEquals(false, result);
    }
    
    // Mock HTTP responses for testing
    
    private class QuickBooksMockHttpResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setStatusCode(200);
            res.setBody('{"success":true,"invoiceId":"INV-456","invoiceNumber":"INV-456","message":"Invoice created successfully"}');
            return res;
        }
    }
    
    private class QuickBooksMockErrorResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setStatusCode(400);
            res.setBody('{"success":false,"message":"Invalid request"}');
            return res;
        }
    }
}
EOF

# Create meta XML file for the test class
cat > force-app/main/default/classes/QuickBooksComprehensiveTest.cls-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

# Create package.xml for deployment
echo "Creating package.xml for deploying tests..."
cat > force-app/main/default/package.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>QuickBooksComprehensiveTest</members>
        <name>ApexClass</name>
    </types>
    <version>57.0</version>
</Package>
EOF

echo ""
echo "=== Deployment Options ==="
echo ""
echo "1. Deploy test class only:"
echo "sf project deploy start --source-dir force-app --target-org $ORG_ALIAS"
echo ""
echo "2. Run tests to verify coverage:"
echo "sf apex run test --test-level RunLocalTests --tests QuickBooksComprehensiveTest --code-coverage --target-org $ORG_ALIAS --result-format human"
echo ""
echo "3. Check specific code coverage:"
echo "sf apex get coverage --class-names QuickBooksAPIService,QuickBooksInvoiceController --target-org $ORG_ALIAS"
echo ""
echo "4. Test the middleware connection:"
echo "cd final-integration && npm start"
echo ""
echo "5. Test the button by clicking it in Salesforce"
echo ""

# Offer to execute the deployment
echo -e "\nWould you like to deploy the test class now? (y/n)"
read DEPLOY_NOW

if [[ $DEPLOY_NOW == "y" || $DEPLOY_NOW == "Y" ]]; then
    echo "Deploying test class..."
    sf project deploy start --source-dir force-app --target-org $ORG_ALIAS
    
    echo "Running tests to verify coverage..."
    sf apex run test --test-level RunLocalTests --tests QuickBooksComprehensiveTest --code-coverage --target-org $ORG_ALIAS --result-format human
    
    echo "Checking specific code coverage..."
    sf apex get coverage --class-names QuickBooksAPIService,QuickBooksInvoiceController --target-org $ORG_ALIAS
fi

echo ""
echo "=== Test Coverage Fix Complete ==="
echo "Verify the results in your Salesforce org"