#!/bin/bash
# Comprehensive Salesforce Deployment Script for QuickBooks Integration
# This script handles both setup and deployment of all components

# Configuration - modify these variables as needed
SF_ORG_ALIAS="myOrgAlias"  # Your Salesforce org alias
MIDDLEWARE_URL="http://localhost:3000"  # Your middleware URL
API_KEY="quickbooks_salesforce_api_key_2025"  # API key from test-middleware.sh

# Color coding for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Salesforce QuickBooks Integration Deployment ===${NC}"
echo "This script will deploy QuickBooks integration components to Salesforce"
echo ""

# Check if Salesforce CLI is installed
if ! command -v sf &> /dev/null; then
    echo -e "${RED}ERROR: Salesforce CLI is not installed. Please install it first.${NC}"
    echo "Run: npm install -g @salesforce/cli"
    exit 1
fi

# Step 1: Set up the SFDX project structure
echo -e "${YELLOW}Step 1: Creating SFDX project structure...${NC}"
mkdir -p force-app/main/default/classes
mkdir -p force-app/main/default/lwc/createQuickBooksInvoice
mkdir -p force-app/main/default/objects/Opportunity/fields
mkdir -p force-app/main/default/quickActions

# Step 2: Copy and update components
echo -e "${YELLOW}Step 2: Copying components to SFDX structure...${NC}"

# First ensure we have the latest corrected Apex class
cat > force-app/main/default/classes/QuickBooksInvoker.cls << 'EOL'
/**
 * Apex class to invoke QuickBooks invoice creation from Salesforce
 * This integrates with your existing middleware at final-integration
 */
public with sharing class QuickBooksInvoker {
    // Custom metadata or settings for the middleware URL
    private static final String MIDDLEWARE_URL = 'http://localhost:3000'; // Local middleware URL
    private static final String API_KEY = 'quickbooks_salesforce_api_key_2025'; // Matches API key in .env
    
    /**
     * Invocable method to create QuickBooks invoice from Opportunity
     * This can be called from Process Builder, Flow, or Quick Action
     */
    @InvocableMethod(label='Create QuickBooks Invoice' description='Creates invoice in QuickBooks from Opportunity')
    public static List<InvoiceResult> createQuickBooksInvoice(List<Id> opportunityIds) {
        List<InvoiceResult> results = new List<InvoiceResult>();
        
        for (Id oppId : opportunityIds) {
            results.add(processOpportunity(oppId));
        }
        
        return results;
    }
    
    /**
     * Process a single opportunity
     */
    private static InvoiceResult processOpportunity(Id opportunityId) {
        InvoiceResult result = new InvoiceResult();
        result.opportunityId = opportunityId;
        
        try {
            // Get the current Salesforce instance URL
            String instanceUrl = URL.getOrgDomainUrl().toExternalForm();
            
            // Get the QuickBooks realm ID from custom settings or metadata
            String qbRealmId = getQuickBooksRealmId();
            
            // Call your existing API endpoint
            HttpRequest req = new HttpRequest();
            req.setEndpoint(MIDDLEWARE_URL + '/api/create-invoice');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', API_KEY);
            req.setTimeout(60000); // 60 seconds
            
            // Create request body - matches your existing API
            Map<String, Object> requestBody = new Map<String, Object>{
                'opportunityId' => opportunityId,
                'salesforceInstance' => instanceUrl,
                'quickbooksRealm' => qbRealmId
            };
            
            req.setBody(JSON.serialize(requestBody));
            
            // Make the callout
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            // Process response
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                result.success = (Boolean) responseBody.get('success');
                result.invoiceId = (String) responseBody.get('invoiceId');
                result.message = (String) responseBody.get('message');
            } else {
                result.success = false;
                result.message = 'Error: ' + res.getStatus() + ' - ' + res.getBody();
            }
            
        } catch (Exception e) {
            result.success = false;
            result.message = 'Exception: ' + e.getMessage();
        }
        
        return result;
    }
    
    /**
     * Get QuickBooks Realm ID from custom settings
     * You can hardcode this for demo or use Custom Settings/Metadata
     */
    private static String getQuickBooksRealmId() {
        // For demo, return your QuickBooks realm ID
        return '9341454378379755'; // Actual QuickBooks realm ID from tokens.json
    }
    
    /**
     * Result wrapper class
     */
    public class InvoiceResult {
        @InvocableVariable(label='Success' description='Whether the invoice was created successfully')
        public Boolean success;
        
        @InvocableVariable(label='Invoice ID' description='QuickBooks Invoice ID')
        public String invoiceId;
        
        @InvocableVariable(label='Message' description='Success or error message')
        public String message;
        
        @InvocableVariable(label='Opportunity ID' description='Source Opportunity ID')
        public String opportunityId;
    }
    
    /**
     * Method for Quick Action
     * This is called directly from the Quick Action
     */
    @AuraEnabled
    public static Map<String, Object> createInvoiceFromQuickAction(Id opportunityId) {
        List<Id> oppIds = new List<Id>{opportunityId};
        List<InvoiceResult> results = createQuickBooksInvoice(oppIds);
        
        if (!results.isEmpty()) {
            InvoiceResult result = results[0];
            return new Map<String, Object>{
                'success' => result.success,
                'message' => result.message,
                'invoiceId' => result.invoiceId
            };
        }
        
        return new Map<String, Object>{
            'success' => false,
            'message' => 'No result returned'
        };
    }
}
EOL

# Copy the LWC component files
cp lwc/createQuickBooksInvoice/createQuickBooksInvoice.html force-app/main/default/lwc/createQuickBooksInvoice/
cp lwc/createQuickBooksInvoice/createQuickBooksInvoice.js force-app/main/default/lwc/createQuickBooksInvoice/

# Step 3: Create all metadata files
echo -e "${YELLOW}Step 3: Creating metadata files...${NC}"

# Apex Class Meta File
cat > force-app/main/default/classes/QuickBooksInvoker.cls-meta.xml << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOL

# LWC Meta File
cat > force-app/main/default/lwc/createQuickBooksInvoice/createQuickBooksInvoice.js-meta.xml << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>Create QuickBooks Invoice</masterLabel>
    <description>Create QuickBooks invoice from Opportunity</description>
    <targets>
        <target>lightning__RecordAction</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__RecordAction">
            <actionType>ScreenAction</actionType>
            <objects>
                <object>Opportunity</object>
            </objects>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
EOL

# Create custom field metadata
cat > force-app/main/default/objects/Opportunity/fields/QB_Invoice_ID__c.field-meta.xml << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>QB_Invoice_ID__c</fullName>
    <description>QuickBooks Invoice ID</description>
    <externalId>false</externalId>
    <label>QuickBooks Invoice ID</label>
    <length>100</length>
    <required>false</required>
    <trackHistory>false</trackHistory>
    <type>Text</type>
    <unique>false</unique>
</CustomField>
EOL

# Quick Action Meta File
cat > force-app/main/default/quickActions/CreateQuickBooksInvoice.quickAction-meta.xml << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<QuickAction xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Create QuickBooks Invoice</label>
    <optionsCreateFeedItem>false</optionsCreateFeedItem>
    <successMessage>QuickBooks invoice creation initiated! Check the opportunity in a few seconds for the invoice ID.</successMessage>
    <targetObject>Opportunity</targetObject>
    <type>Create</type>
    <lightningWebComponent>createQuickBooksInvoice</lightningWebComponent>
</QuickAction>
EOL

# Step 4: Verify file structure
echo -e "${YELLOW}Step 4: Verifying file structure...${NC}"
find force-app -type f | sort

# Step 5: Authenticate and deploy
echo -e "${YELLOW}Step 5: Authentication and Deployment...${NC}"
echo -e "${GREEN}First, authenticate with your Salesforce org:${NC}"
echo "sf org login web -a $SF_ORG_ALIAS"
echo ""

# Ask if user wants to deploy now
read -p "Do you want to deploy components now? (y/n): " deploy_now

if [[ $deploy_now == [Yy]* ]]; then
    echo "Authenticating with Salesforce..."
    sf org login web -a $SF_ORG_ALIAS
    
    echo -e "${GREEN}Deploying components individually...${NC}"
    
    echo "1. Deploying Custom Field..."
    sf project deploy start -d force-app/main/default/objects -o $SF_ORG_ALIAS --wait 10
    
    echo "2. Deploying Apex class..."
    sf project deploy start -d force-app/main/default/classes -o $SF_ORG_ALIAS --wait 10
    
    echo "3. Deploying LWC component..."
    sf project deploy start -d force-app/main/default/lwc -o $SF_ORG_ALIAS --wait 10
    
    echo "4. Deploying Quick Action..."
    sf project deploy start -d force-app/main/default/quickActions -o $SF_ORG_ALIAS --wait 10
else
    echo -e "${GREEN}To deploy components later, run:${NC}"
    echo "1. sf org login web -a $SF_ORG_ALIAS"
    echo "2. sf project deploy start -d force-app/main/default/objects -o $SF_ORG_ALIAS --wait 10"
    echo "3. sf project deploy start -d force-app/main/default/classes -o $SF_ORG_ALIAS --wait 10"
    echo "4. sf project deploy start -d force-app/main/default/lwc -o $SF_ORG_ALIAS --wait 10"
    echo "5. sf project deploy start -d force-app/main/default/quickActions -o $SF_ORG_ALIAS --wait 10"
fi

# Step 6: Final instructions
echo ""
echo -e "${BLUE}=== Post-Deployment Steps ===${NC}"
echo -e "${GREEN}After deployment, don't forget:${NC}"
echo "1. Add the Remote Site Setting in Salesforce:"
echo "   - Go to Setup → Remote Site Settings"
echo "   - Click 'New Remote Site'"
echo "   - Remote Site Name: QuickBooksMiddleware"
echo "   - Remote Site URL: $MIDDLEWARE_URL"
echo "   - Active: ✓ Checked"
echo "   - Save"
echo ""
echo "2. Add the Quick Action to the Opportunity page layout:"
echo "   - Go to Setup → Object Manager → Opportunity → Page Layouts"
echo "   - Edit the page layout you want to modify"
echo "   - Go to the Mobile & Lightning Actions section"
echo "   - Drag the 'Create QuickBooks Invoice' quick action to the layout"
echo "   - Save"
echo ""
echo "3. Ensure the middleware is running at $MIDDLEWARE_URL with API key: $API_KEY"
echo "   - cd /Users/m/git/clients/qbsf/final-integration"
echo "   - npm start"
echo ""
echo -e "${BLUE}=== Deployment Complete ===${NC}"