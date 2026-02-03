# Salesforce-QuickBooks Integration: Salesforce Components

This directory contains the Salesforce components required for the QuickBooks integration.

## Overview

The integration allows you to create QuickBooks invoices directly from Salesforce Opportunities using a Lightning Web Component (LWC) Quick Action button.

## Components

1. **QuickBooksInvoker.cls**: Apex class that handles the API callout to the middleware
2. **createQuickBooksInvoice LWC**: Lightning Web Component that provides the UI for creating invoices
3. **QB_Invoice_ID__c**: Custom field for storing the QuickBooks invoice ID on Opportunity
4. **CreateQuickBooksInvoice.quickAction-meta.xml**: Quick Action definition

## Prerequisites

1. Salesforce CLI installed (`sf` command available)
2. Access to a Salesforce org with API access enabled
3. The middleware server running at http://localhost:3000 (or configured URL)

## Deployment Instructions

### Option 1: Automated Deployment

We've created a comprehensive deployment script that handles everything:

```bash
cd /Users/m/git/clients/qbsf/sf-deploy
./salesforce-deployment-script.sh
```

This script will:
1. Set up the SFDX project structure
2. Copy and update all components
3. Create required metadata files
4. Authenticate with your Salesforce org
5. Deploy components individually
6. Guide you through post-deployment steps

### Option 2: Manual Deployment

If you prefer to deploy manually:

1. Ensure your SFDX project is set up:
```bash
cd /Users/m/git/clients/qbsf/sf-deploy
mkdir -p force-app/main/default/classes
mkdir -p force-app/main/default/lwc
mkdir -p force-app/main/default/objects/Opportunity/fields
mkdir -p force-app/main/default/quickActions
```

2. Create metadata files and copy components using the `fix-deployment.sh` script:
```bash
./fix-deployment.sh
```

3. Authenticate with your Salesforce org:
```bash
sf org login web -a YourOrgAlias
```

4. Deploy components:
```bash
sf project deploy start -d force-app -o YourOrgAlias
```

## Post-Deployment Setup

After successful deployment:

1. **Create a Remote Site Setting in Salesforce**:
   - Go to Setup → Remote Site Settings
   - Click 'New Remote Site'
   - Remote Site Name: QuickBooksMiddleware
   - Remote Site URL: http://localhost:3000 (or your middleware URL)
   - Active: ✓ Checked
   - Save

2. **Add the Quick Action to the Opportunity page layout**:
   - Go to Setup → Object Manager → Opportunity → Page Layouts
   - Edit the desired page layout
   - Go to the Mobile & Lightning Actions section
   - Drag the 'Create QuickBooks Invoice' quick action to the layout
   - Save

## Testing the Integration

1. Start the middleware server:
```bash
cd /Users/m/git/clients/qbsf/final-integration
npm start
```

2. In Salesforce, navigate to an Opportunity
3. Click the "Create QuickBooks Invoice" quick action
4. Click the "Create QuickBooks Invoice" button in the component
5. You should see a success message and the QB_Invoice_ID__c field will be populated

## Middleware API Information

- **URL**: http://localhost:3000/api/create-invoice
- **Method**: POST
- **Headers**: 
  - Content-Type: application/json
  - X-API-Key: quickbooks_salesforce_api_key_2025
- **Body**:
```json
{
  "opportunityId": "YOUR_OPPORTUNITY_ID",
  "salesforceInstance": "YOUR_SALESFORCE_URL",
  "quickbooksRealm": "YOUR_QUICKBOOKS_REALM_ID"
}
```

## Troubleshooting

- **Remote Site Setting**: If you see callout errors, ensure your Remote Site Setting is properly configured
- **API Key**: Verify the API key in QuickBooksInvoker.cls matches your middleware configuration
- **Middleware Running**: Ensure the middleware server is running
- **Logs**: Check both Salesforce Debug Logs and the middleware logs for error details