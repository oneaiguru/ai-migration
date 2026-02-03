# Salesforce-QuickBooks Integration Setup Guide

## Overview
This guide provides step-by-step instructions to integrate QuickBooks invoice creation into Salesforce using Lightning App Builder. The integration allows users to create QuickBooks invoices directly from Salesforce Opportunity records.

## Prerequisites
✅ Salesforce org with Lightning Experience enabled
✅ QuickBooks sandbox account
✅ Working middleware from `/final-integration` folder
✅ SFDX CLI installed (`npm install -g @salesforce/cli`)
✅ Node.js and npm installed

## Quick Start

1. **Make scripts executable:**
   ```bash
   chmod +x make-scripts-executable.sh
   ./make-scripts-executable.sh
   ```

2. **Run setup scripts in order:**
   ```bash
   ./a-create-project-structure.sh
   ./b-prepare-environment.sh
   ./c-create-custom-objects.sh
   ./d-create-opportunity-fields.sh
   ./e-create-lwc-component.sh
   ./f-create-apex-classes.sh
   ./g-deploy-to-salesforce.sh
   ./h-configure-settings.sh
   ./i-configure-lightning-page.sh
   ./j-test-integration.sh
   ```

## Detailed Setup Steps

### Step A: Create Project Structure
Creates the SFDX project structure required for deployment.
```bash
./a-create-project-structure.sh
```
Creates:
- `sfdx-project.json`
- `.forceignore`
- Standard Salesforce directory structure

### Step B: Prepare Environment
Sets up the environment and checks prerequisites.
```bash
./b-prepare-environment.sh
```
- Checks for middleware directory
- Backs up existing configuration
- Verifies Salesforce CLI installation

### Step C: Create Custom Objects
Creates the QuickBooks Settings custom object and Remote Site Settings.
```bash
./c-create-custom-objects.sh
```
Creates:
- `QuickBooks_Settings__c` custom object
- Three custom fields for configuration
- Remote Site Settings for middleware

### Step D: Create Opportunity Fields
Adds QuickBooks-related fields to the Opportunity object.
```bash
./d-create-opportunity-fields.sh
```
Creates fields:
- `QB_Invoice_ID__c`
- `QB_Invoice_Number__c`
- `QB_Payment_ID__c`
- `QB_Payment_Date__c`
- `QB_Payment_Method__c`
- `QB_Payment_Amount__c`

### Step E: Create Lightning Web Component
Creates the UI component for the invoice creation action.
```bash
./e-create-lwc-component.sh
```
Creates:
- `quickBooksInvoice` LWC with:
  - HTML template
  - JavaScript controller
  - Metadata configuration

### Step F: Create Apex Classes
Creates the backend logic for API integration.
```bash
./f-create-apex-classes.sh
```
Creates:
- `QuickBooksInvoiceController.cls`
- `QuickBooksAPIService.cls`
- `QuickBooksInvoiceControllerTest.cls`

### Step G: Deploy to Salesforce
Deploys all components to your Salesforce org.
```bash
./g-deploy-to-salesforce.sh
```
Deploys:
- Custom objects and fields
- Remote Site Settings
- Apex classes
- Lightning Web Component

### Step H: Configure Settings
Configures the QuickBooks integration settings.
```bash
./h-configure-settings.sh
```
Sets:
- Middleware URL
- API Key
- QuickBooks Realm ID

### Step I: Configure Lightning Page
Provides manual instructions for Lightning App Builder configuration.
```bash
./i-configure-lightning-page.sh
```
You'll need to:
1. Enable Dynamic Actions on Highlights Panel
2. Add the "Create QuickBooks Invoice" action
3. Save and activate the page

### Step J: Test Integration
Tests the complete integration flow.
```bash
./j-test-integration.sh
```
Tests:
- Middleware connectivity
- API authentication
- Apex-to-middleware connection
- Full invoice creation flow

## Key Components

### Custom Settings
- **QuickBooks_Settings__c**: Stores middleware configuration
  - `Middleware_URL__c`: URL of the integration middleware
  - `API_Key__c`: API authentication key
  - `QB_Realm_ID__c`: QuickBooks company ID

### Opportunity Fields
- **QB_Invoice_ID__c**: Stores the QuickBooks invoice ID
- **QB_Invoice_Number__c**: Stores the invoice number
- **QB_Payment_***: Payment tracking fields

### Lightning Web Component
- **quickBooksInvoice**: UI component for invoice creation
  - Shows opportunity details
  - Handles invoice creation
  - Displays success/error messages

### Apex Classes
- **QuickBooksInvoiceController**: Main controller for LWC
- **QuickBooksAPIService**: Handles HTTP callouts
- **QuickBooksInvoiceControllerTest**: Test coverage

## Troubleshooting

### Button Not Appearing
1. Verify Dynamic Actions is enabled
2. Check deployment was successful
3. Clear browser cache
4. Verify correct Lightning Page is activated

### API Errors
1. Ensure middleware is running: `cd final-integration && npm start`
2. Check custom settings values
3. Verify Remote Site Settings is active
4. Check browser console for errors

### Deployment Errors
1. Run scripts in alphabetical order
2. Ensure authentication: `sf org login web`
3. Check for compilation errors in logs
4. Verify all dependencies exist

### Connection Issues
1. Test middleware: `curl http://localhost:3000/health`
2. Check API key configuration
3. Verify Remote Site Settings
4. Review middleware logs

## Environment Variables

The integration uses these environment variables:
```
MIDDLEWARE_URL=http://localhost:3000
API_KEY=quickbooks_salesforce_api_key_2025
QB_REALM=9341454378379755
```

## Security Considerations

1. **API Key**: Store securely in custom settings
2. **Remote Site**: Only allow trusted URLs
3. **Field Permissions**: Configure appropriate field-level security
4. **Profile Access**: Restrict button visibility as needed

## Next Steps

After successful setup:
1. Test with a real Opportunity record
2. Configure visibility rules for the button
3. Train users on the integration
4. Monitor logs for any issues

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review middleware logs: `tail -f final-integration/logs/combined.log`
3. Check Salesforce debug logs
4. Verify all configuration settings
