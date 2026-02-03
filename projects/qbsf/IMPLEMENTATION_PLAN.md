     Roman's QB-SF Integration Fix - Implementation Plan
    
     Overview
    
     Goal: Fix broken QB invoice integration + Add payment link field for Roman's client
    
     Current Status:
     - Test files in deployment-package-fixed/ are correct and ready
     - Need to add QB_Payment_Link__c field
     - Need to enhance middleware to fetch payment link from QB API
     - Need to update Salesforce parsing to store payment link
    
     Key Discovery: deployment-package-fixed/ already has correct Account fields (Account_Type__c, Country__c)
     and test setup. This is the source of truth to deploy from.
    
     ---
     Phase 0: Pre-Flight Checks (5 min)
    
     Verify Prerequisites
    
     # 1. Check SF auth
     sf org display --target-org sanboxsf
    
     # 2. Check middleware health
     curl -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" https://sqint.atocomm.eu/api/health
    
     # 3. Get baseline test coverage
     sf apex run test --code-coverage --synchronous -o sanboxsf
    
     Success: All 3 checks pass, coverage ≥75%
    
     ---
     Phase 1: Fix Broken Integration (15 min)
    
     Task 1.1: Deploy Correct Salesforce Code
    
     Deploy from deployment-package-fixed/ which already has:
     - ✅ Account_Type__c and Country__c fields defined
     - ✅ Test files with correct Account setup
    
     cd /Users/m/ai/projects/qbsf
    
     # Deploy Account fields + classes from deployment-package-fixed
     sf project deploy start \
       --source-dir deployment-package-fixed/force-app/main/default/objects/Account/fields/ \
       --source-dir deployment-package-fixed/force-app/main/default/classes/ \
       --test-level RunLocalTests \
       -o sanboxsf
    
     Success:
     - Deployment succeeds
     - Tests pass with ≥75% coverage
     - Account_Type__c and Country__c visible in Salesforce
    
     Task 1.2: Verify Invoice ID Now Returns
    
     Run specific test to confirm invoice ID is no longer null:
    
     sf apex run test --tests QBInvoiceIntegrationQueueableTest \
       --result-format human \
       -o sanboxsf
    
     Success: Test passes, debug log shows qbInvoiceId != null
    
     ---
     Phase 2: Add Payment Link Field (45 min)
    
     Task 2.1: Create QB_Payment_Link__c Field
    
     File: deployment-package-fixed/force-app/main/default/objects/Opportunity/fields/QB_Payment_Link__c.field-
     meta.xml
    
     Create new file with:
     <?xml version="1.0" encoding="UTF-8"?>
     <CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
         <fullName>QB_Payment_Link__c</fullName>
         <externalId>false</externalId>
         <label>QB Payment Link</label>
         <required>false</required>
         <trackTrending>false</trackTrending>
         <type>Url</type>
     </CustomField>
    
     Deploy:
     sf project deploy start \
       --source-dir deployment-package-fixed/force-app/main/default/objects/Opportunity/fields/QB_Payment_Link_
     _c.field-meta.xml \
       -o sanboxsf
    
     Success: Field visible on Opportunity object in Salesforce
    
     Task 2.2: Enhance Middleware - Add BillEmail to Invoice
    
     File: deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js
    
     Add after existing invoice fields (around line 20-30):
     // Add BillEmail if available (required for payment link)
     if (account && account.Email__c) {
       invoice.BillEmail = {
         Address: account.Email__c
       };
     } else if (opportunity.Owner && opportunity.Owner.Email) {
       // Fallback to opportunity owner email
       invoice.BillEmail = {
         Address: opportunity.Owner.Email
       };
     }
    
     Success: BillEmail added to invoice transformation
    
     Task 2.3: Enhance Middleware - Add getInvoicePaymentLink Method
    
     File: deployment/sf-qb-integration-final/src/services/quickbooks-api.js
    
     Add new method after createInvoice:
     /**
      * Get payment link for a QB invoice
      * Requires: BillEmail set, credit cards enabled in QB account
      */
     async getInvoicePaymentLink(invoiceId) {
       try {
         const response = await this.request(
           'get',
           `invoice/${invoiceId}`,
           null,
           { minorversion: 65, include: 'invoiceLink' }
         );
    
         return response.Invoice?.InvoiceLink || null;
       } catch (error) {
         console.warn(`No payment link for invoice ${invoiceId}:`, error.message);
         return null; // Optional field - don't break integration
       }
     }
    
     Export the new method:
     module.exports = {
       createInvoice,
       getInvoicePaymentLink // Add this export
     };
    
     Success: Method added and exported
    
     Task 2.4: Enhance Middleware API - Return Payment Link
    
     File: deployment/sf-qb-integration-final/src/routes/api.js
    
     Find the response section (around line 106-110) and enhance:
     // After creating invoice, fetch payment link
     let paymentLink = null;
     try {
       paymentLink = await qbApi.getInvoicePaymentLink(qbInvoiceId);
     } catch (error) {
       console.warn('Could not retrieve payment link:', error.message);
     }
    
     res.json({
       success: true,
       qbInvoiceId: qbInvoiceId,
       paymentLink: paymentLink, // NEW FIELD
       message: 'Invoice created successfully in QuickBooks'
     });
    
     Success: API response includes paymentLink field
    
     Task 2.5: Update Salesforce - Parse and Store Payment Link
    
     File: deployment-package-fixed/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls
    
     Find response parsing section (around line 45-50) and enhance:
     Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
     String qbInvoiceId = (String) responseBody.get('qbInvoiceId');
     String paymentLink = (String) responseBody.get('paymentLink'); // NEW
    
     // Update opportunity with QB data
     opp.QB_Invoice_ID__c = qbInvoiceId;
     opp.QB_Payment_Link__c = paymentLink; // NEW
     opp.QB_Last_Sync_Date__c = System.now();
     update opp;
    
     Success: Code parses and stores payment link
    
     Task 2.6: Update Tests - Add Payment Link Assertions
    
     File: deployment-package-fixed/force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls
    
     Find HTTP mock response (around line 58) and enhance:
     res.setBody('{"success":true,"qbInvoiceId":"12345","paymentLink":"https://quickbooks.intuit.com/pay/12345"
     ,"message":"Invoice created"}');
    
     Find test assertions (around line 75) and add:
     System.assertNotEquals(null, opp.QB_Payment_Link__c, 'Payment link should be populated');
     System.assert(opp.QB_Payment_Link__c.contains('quickbooks.intuit.com'), 'Payment link should be QB URL');
    
     Success: Tests updated with payment link assertions
    
     ---
     Phase 3: Deploy & Test (30 min)
    
     Task 3.1: Deploy Salesforce Changes
    
     cd /Users/m/ai/projects/qbsf
    
     # Deploy all changes from deployment-package-fixed
     sf project deploy start \
       --source-dir deployment-package-fixed/force-app/main/default/ \
       --test-level RunLocalTests \
       -o sanboxsf
    
     Success:
     - Deployment succeeds
     - Tests pass with ≥75% coverage
     - 0 test failures
    
     Task 3.2: Deploy Middleware Changes
    
     # SSH to Roman's server
     ssh roman@pve.atocomm.eu -p2323
    
     # Backup current middleware
     cd /opt/qb-integration
     cp -r src src.backup.$(date +%Y%m%d_%H%M%S)
    
     # From local machine, copy updated files:
     scp -P 2323 deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js \
       roman@pve.atocomm.eu:/opt/qb-integration/src/transforms/
    
     scp -P 2323 deployment/sf-qb-integration-final/src/services/quickbooks-api.js \
       roman@pve.atocomm.eu:/opt/qb-integration/src/services/
    
     scp -P 2323 deployment/sf-qb-integration-final/src/routes/api.js \
       roman@pve.atocomm.eu:/opt/qb-integration/src/routes/
    
     # Back on server, restart middleware
     pm2 restart qb-integration
    
     Success:
     - Files uploaded
     - Middleware restarted
     - Health check passes
    
     Task 3.3: End-to-End Integration Test
    
     In Salesforce Sandbox:
    
     1. Create test Account:
       - Name: "E2E Test Supplier"
       - Account_Type__c: "Поставщик"
       - Country__c: "US"
       - Email__c: "test@example.com"
     2. Create test Opportunity:
       - Name: "E2E Payment Link Test"
       - Account: E2E Test Supplier
       - Stage: "Prospecting"
       - Amount: $100
     3. Change Stage to "Proposal and Agreement" and save
     4. Wait 1-2 minutes, then check Opportunity fields:
     SELECT QB_Invoice_ID__c, QB_Payment_Link__c, QB_Last_Sync_Date__c
     FROM Opportunity
     WHERE Name = 'E2E Payment Link Test'
    
     Success:
     - ✅ QB_Invoice_ID__c populated
     - ✅ QB_Payment_Link__c populated (or null with reason logged)
     - ✅ QB_Last_Sync_Date__c = current timestamp
     - ✅ Invoice visible in QuickBooks
     - ✅ No errors in SF debug logs
     - ✅ No errors in middleware logs
    
     ---
     Critical Files to Modify
    
     Salesforce Files (deploy from deployment-package-fixed/)
    
     1. NEW: objects/Opportunity/fields/QB_Payment_Link__c.field-meta.xml
     2. MODIFY: classes/QBInvoiceIntegrationQueueable.cls (lines ~45-50: parse payment link)
     3. MODIFY: classes/QBInvoiceIntegrationQueueableTest.cls (lines ~58, ~75: update mock + assertions)
    
     Middleware Files (in deployment/sf-qb-integration-final/)
    
     4. MODIFY: src/transforms/opportunity-to-invoice.js (add BillEmail logic)
     5. MODIFY: src/services/quickbooks-api.js (add getInvoicePaymentLink method)
     6. MODIFY: src/routes/api.js (fetch payment link, include in response)
    
     ---
     Rollback Plan
    
     If Salesforce deployment fails:
     # Check specific error
     sf project deploy report --job-id <deploymentId>
    
     # Fix issue and redeploy
    
     If middleware breaks:
     ssh roman@pve.atocomm.eu -p2323
     cd /opt/qb-integration
     rm -rf src/
     mv src.backup.* src/
     pm2 restart qb-integration
    
     If E2E test fails:
     - Check middleware logs: /opt/qb-integration/logs/
     - Check SF debug logs in Developer Console
     - Verify QB OAuth tokens not expired
     - Check if "Accept Credit Cards" enabled in QB account
    
     ---
     Edge Cases
    
     Payment Link is Null
    
     Normal scenario when:
     - BillEmail not set on invoice
     - QB account doesn't have credit card processing enabled
     - QB API returns invoice without InvoiceLink field
    
     Handling: Integration continues successfully, QB_Payment_Link__c stays null
    
     QB OAuth Expired
    
     Symptom: 401 errors from QB API
    
     Fix:
     curl https://sqint.atocomm.eu/auth/quickbooks
     # Follow OAuth flow to refresh tokens
    
     ---
     Success Criteria
    
     - All tests pass (0 failures)
     - Test coverage ≥75%
     - Invoice ID populated on Opportunity
     - Payment link populated on Opportunity (or null with logged reason)
     - E2E test successful in sandbox
     - No errors in Salesforce debug logs
     - No errors in middleware logs
     - Ready for Roman's approval
    
     Estimated Time: 90 minutes total