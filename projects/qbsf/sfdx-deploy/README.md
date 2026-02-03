# SFDX Deployment Instructions for QuickBooks Integration

This folder contains the Salesforce components needed for the QuickBooks integration.

## Components
- `QuickBooksInvoker.cls` - Apex class that calls the middleware to create QuickBooks invoices

## Deployment Instructions

1. **Set up SFDX CLI**:
   ```bash
   npm install -g sfdx-cli
   ```

2. **Authenticate to your Salesforce org**:
   ```bash
   sfdx auth:web:login -s -a YourOrgAlias
   ```

3. **Deploy the components**:
   ```bash
   sfdx force:source:deploy -p force-app/main/default
   ```

4. **Create Custom Fields**:
   - Add `QB_Invoice_ID__c` field to Opportunity object
   - Add `QB_Invoice_Status__c` field to Opportunity object

5. **Create Quick Action**:
   - From Setup, go to Object Manager > Opportunity > Buttons, Links, and Actions
   - Create a new Action named "Create QuickBooks Invoice"
   - Set the Action Type to "Lightning Component"
   - Set the Lightning Component to "c:createQuickBooksInvoice"
   - Add it to the Opportunity page layout

## Testing
After deployment, you should be able to:
1. Go to an Opportunity record
2. Click the "Create QuickBooks Invoice" action
3. The middleware will be called to create an invoice in QuickBooks
4. The Opportunity will be updated with the QuickBooks Invoice ID
