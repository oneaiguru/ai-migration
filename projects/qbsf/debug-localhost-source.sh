#!/bin/bash

echo "=== Deep Debug: Finding the localhost source ==="
echo ""

# 1. Check what the LWC is actually calling
echo "1. Verifying what the LWC is calling:"
grep -n "@salesforce/apex" force-app/main/default/lwc/quickBooksInvoice/quickBooksInvoice.js

echo ""
echo "2. Check ALL classes for localhost (including test classes):"
grep -r "localhost\|3000" force-app/main/default/classes/ --include="*.cls"

echo ""
echo "3. Check if there are multiple versions of the classes:"
ls -la force-app/main/default/classes/QuickBooks*

echo ""
echo "4. Let's create a completely new controller that bypasses everything:"
cat > force-app/main/default/classes/QuickBooksDirectController.cls << 'EOF'
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
EOF

# Create metadata
cat > force-app/main/default/classes/QuickBooksDirectController.cls-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <status>Active</status>
</ApexClass>
EOF

echo ""
echo "5. Create a test LWC that calls the direct controller:"
mkdir -p force-app/main/default/lwc/quickBooksTest

cat > force-app/main/default/lwc/quickBooksTest/quickBooksTest.js << 'EOF'
import { LightningElement, api } from 'lwc';
import createInvoiceDirectly from '@salesforce/apex/QuickBooksDirectController.createInvoiceDirectly';

export default class QuickBooksTest extends LightningElement {
    @api recordId;
    
    async handleClick() {
        try {
            console.log('TEST: Calling direct controller');
            const result = await createInvoiceDirectly({ opportunityId: this.recordId });
            console.log('TEST: Result:', result);
            alert(JSON.stringify(result));
        } catch (error) {
            console.error('TEST: Error:', error);
            alert('Error: ' + error.body?.message || error.message);
        }
    }
}
EOF

cat > force-app/main/default/lwc/quickBooksTest/quickBooksTest.html << 'EOF'
<template>
    <lightning-card title="QuickBooks Direct Test">
        <div class="slds-p-horizontal_medium">
            <lightning-button 
                label="Test Direct Call" 
                onclick={handleClick}
                variant="brand">
            </lightning-button>
        </div>
    </lightning-card>
</template>
EOF

cat > force-app/main/default/lwc/quickBooksTest/quickBooksTest.js-meta.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>57.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__RecordPage</target>
    </targets>
</LightningComponentBundle>
EOF

echo ""
echo "6. Deploy everything:"
sf project deploy start -d force-app/main/default/classes -d force-app/main/default/lwc/quickBooksTest --target-org myorg

echo ""
echo "7. Enable debug logging properly:"
cat > enable_debug.apex << 'EOF'
// Delete existing trace flags
delete [SELECT Id FROM TraceFlag WHERE TracedEntityId = :UserInfo.getUserId()];

// Create new trace flag with FINEST logging
TraceFlag tf = new TraceFlag();
tf.TracedEntityId = UserInfo.getUserId();
tf.LogType = 'DEVELOPER_LOG';
tf.StartDate = DateTime.now();
tf.ExpirationDate = DateTime.now().addHours(1);
tf.DebugLevelId = [SELECT Id FROM DebugLevel WHERE DeveloperName = 'SFDC_DevConsole' LIMIT 1].Id;
insert tf;

System.debug('Debug logging enabled for: ' + UserInfo.getName());
EOF

sf apex run --file enable_debug.apex --target-org myorg
rm enable_debug.apex

echo ""
echo "=== Next Steps ==="
echo "1. Add the 'quickBooksTest' component to your Opportunity page"
echo "2. Click 'Test Direct Call' button"
echo "3. This will show exactly what happens with hardcoded URLs"
echo ""
echo "4. Also check the JavaScript console (F12) when clicking your original button"
echo "5. Look for any JavaScript errors or network calls to localhost"
echo ""
echo "The test component completely bypasses all settings and uses hardcoded values."
echo "If this works, we know the issue is in the original code path."
echo "If this fails with localhost error, then there's a deeper system issue."
