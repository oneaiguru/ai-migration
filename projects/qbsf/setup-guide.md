# Salesforce-QuickBooks Integration Setup Guide

## Overview
This guide provides step-by-step instructions to integrate QuickBooks invoice creation into Salesforce using Lightning App Builder, specifically for the Opportunity Record Page - Three Column layout.

## Prerequisites
- Salesforce org with Lightning Experience enabled
- QuickBooks sandbox account
- Working middleware from `/final-integration` folder
- SFDX CLI installed
- Node.js and npm installed

## Setup Scripts
Run these scripts in order:

### 1. Prepare Environment
```bash
./make-scripts-executable.sh
./1-prepare-environment.sh
```
This script:
- Checks environment setup
- Creates necessary directories
- Backs up configuration files

### 2. Create Lightning Web Component
```bash
./2-create-lwc-component.sh
```
This creates:
- `quickBooksInvoice.html` - UI template
- `quickBooksInvoice.js` - Component logic
- `quickBooksInvoice.js-meta.xml` - Configuration for Lightning App Builder

### 3. Create Apex Classes
```bash
./3-create-apex-classes.sh
```
This creates:
- `QuickBooksInvoiceController.cls` - Main controller
- `QuickBooksAPIService.cls` - API service layer
- `QuickBooksInvoiceControllerTest.cls` - Test coverage

### 4. Deploy to Salesforce
```bash
./4-deploy-to-salesforce.sh
```
This script:
- Authenticates to your Salesforce org
- Deploys LWC and Apex classes
- Shows deployment results

### 5. Configure Custom Settings
```bash
./5-configure-custom-settings.sh
```
This script:
- Creates custom settings object
- Configures middleware URL and API key
- Sets QuickBooks realm ID

### 6. Configure Lightning App Builder
```bash
./6-configure-lightning-app-builder.sh
```
Follow the on-screen instructions to:
- Enable Dynamic Actions
- Add the QuickBooks Invoice button
- Configure visibility rules

### 7. Test Integration
```bash
./7-test-integration.sh
```
This script:
- Starts the middleware
- Tests API connectivity
- Monitors logs for button clicks

## Manual Configuration Steps

### Lightning App Builder Configuration
1. Go to Setup → Object Manager → Opportunity
2. Click Lightning Record Pages
3. Edit "Opportunity Record Page - Three Column"
4. Find and click the Highlights Panel component
5. Enable Dynamic Actions
6. Click "Add Action"
7. Add "Create QuickBooks Invoice"
8. Save and Activate

### Remote Site Settings
1. Setup → Security → Remote Site Settings
2. New Remote Site
   - Remote Site Name: `QuickBooksMiddleware`
   - URL: `http://localhost:3000`
   - Active: Checked
3. Save

## Troubleshooting

### Button Not Appearing
- Verify Dynamic Actions is enabled
- Check deployment was successful
- Clear browser cache
- Verify correct Lightning Page is activated

### API Errors
- Ensure middleware is running: `cd final-integration && npm start`
- Check custom settings values
- Verify Remote Site Settings
- Check browser console for errors

### Integration Issues
- Monitor logs: `tail -f final-integration/logs/combined.log`
- Test API directly: `curl http://localhost:3000/health`
- Verify OAuth tokens are valid

## Key Files Created

### Lightning Web Component
- `/force-app/main/default/lwc/quickBooksInvoice/`
  - `quickBooksInvoice.js` - Component logic
  - `quickBooksInvoice.html` - UI template
  - `quickBooksInvoice.js-meta.xml` - Configuration

### Apex Classes
- `/force-app/main/default/classes/`
  - `QuickBooksInvoiceController.cls` - Main controller
  - `QuickBooksAPIService.cls` - API service
  - `QuickBooksInvoiceControllerTest.cls` - Tests

### Custom Settings
- `QuickBooks_Settings__c` - Stores middleware configuration

## Demo Workflow
1. Navigate to an Opportunity record
2. Click "Create QuickBooks Invoice" button
3. Confirm invoice creation
4. Invoice is created in QuickBooks
5. Opportunity is updated with invoice ID

## Next Steps
- Configure additional visibility rules
- Add more error handling
- Implement webhook notifications
- Create scheduled payment checks
