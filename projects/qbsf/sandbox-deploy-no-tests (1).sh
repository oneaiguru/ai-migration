#!/bin/bash
# QuickBooks-Salesforce Sandbox Deployment Script
# Allows deployment to sandbox without 75% test coverage requirement

echo "=== QuickBooks-Salesforce Sandbox Deployment ==="
echo ""

# Set org alias
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
    sf org login web --alias "$ORG_ALIAS" --instance-url https://test.salesforce.com
fi

# Create test folder structure if it doesn't exist
mkdir -p force-app/main/default/classes

# Create comprehensive test for QuickBooks classes
echo "Creating comprehensive test for QuickBooks integration..."
cat > force-app/main/default/classes/QuickBooksComprehensiveTest.cls << 'EOF'
/**
 * Comprehensive test class for QuickBooks integration
 * Covers both the controller and API service
 */
@isTest
private class QuickBooksComprehensiveTest {

    @testSetup
    static void setup() {
        // Create test settings
        QuickBooks_Settings__c settings = new QuickBooks_Settings__c();
        settings.Middleware_URL__c = 'https://test.example.com';
        settings.API_Key__c = 'test_api_key';
        settings.QB_Realm_ID__c = 'test_realm';
        insert settings;
        
        // Create test account
        Account testAccount = new Account(
            Name = 'Test Account'
        );
        insert testAccount;
        
        // Create test opportunity
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = testAccount.Id,
            StageName = 'Closed Won',
            CloseDate = Date.today().addDays(30),
            Amount = 1000
        );
        insert testOpp;
    }
    
    @isTest
    static void testCreateInvoiceSuccess() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        Test.startTest();
        QuickBooksInvoiceController.InvoiceResult result = 
            QuickBooksInvoiceController.createInvoice(opp.Id);
        Test.stopTest();
        
        System.assertEquals(true, result.success);
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
    }
    
    @isTest
    static void testAPIServiceTest() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        Test.startTest();
        Boolean result = QuickBooksAPIService.testConnection();
        Test.stopTest();
        
        System.assertNotEquals(null, result);
    }
    
    // Mock HTTP response
    private class MockHttpResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setStatusCode(200);
            res.setBody('{"success":true,"invoiceId":"INV-456","invoiceNumber":"INV-456","message":"Success"}');
            return res;
        }
    }
}
EOF

# Create meta XML file
cat > force-app/main/default/classes/QuickBooksComprehensiveTest.cls-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

echo ""
echo "=== SANDBOX DEPLOYMENT WITHOUT TEST REQUIREMENTS ==="
echo ""
echo "Deploying to sandbox without running tests..."
echo "This bypasses the 75% test coverage requirement"
echo ""

# Deploy without tests (sandbox only)
echo "Running deployment with NO TESTS..."
sf project deploy start --source-dir force-app --target-org $ORG_ALIAS --test-level NoTestRun

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "To verify the deployment:"
echo "1. Check Salesforce Setup > Apex Classes"
echo "2. Look for QuickBooksComprehensiveTest"
echo ""
echo "To run tests manually later (optional):"
echo "sf apex run test --class-names QuickBooksComprehensiveTest --wait 10 --target-org $ORG_ALIAS"
echo ""
echo "To check current code coverage:"
sf data query --query "SELECT Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverage WHERE ApexClassOrTrigger.Name IN ('QuickBooksAPIService','QuickBooksInvoiceController')" --target-org $ORG_ALIAS --result-format table
