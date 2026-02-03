# QuickBooks Developer Setup

This guide will walk you through setting up your QuickBooks developer account and app for the integration.

## 1. Create a QuickBooks Developer Account

1. Go to [QuickBooks Developer Portal](https://developer.intuit.com/)
2. Click "Sign In" in the upper right corner
3. Create an account or sign in with your existing QuickBooks credentials

## 2. Create a QuickBooks App

1. Navigate to the Dashboard
2. Click "Create an app"
3. Select "API" as the app type
4. Fill in the required details:
   - App Name: "Salesforce Integration"
   - Company: Your company name
   - Email: Your email address
   - App Description: "Integration between Salesforce and QuickBooks"
5. For APIs, select "QuickBooks Online API" (Make sure it's checked)
6. For Development type, select "Development" initially (you can change this to Production later)

## 3. Configure OAuth Settings

1. After creating the app, go to the "Keys & OAuth" tab
2. In the "Redirect URIs" section, add your middleware callback URL:
   - Format: `https://your-middleware-domain.com/auth/quickbooks/callback`
   - For local testing: `http://localhost:3000/auth/quickbooks/callback`
3. Make sure "Authorization code" grant type is selected
4. Under scopes, ensure "Accounting" is selected

## 4. Note Down Credentials

Note down these values from the "Keys & OAuth" tab - you'll need them for middleware setup:
- Client ID
- Client Secret

## 5. Identify QuickBooks Items

For each product in Salesforce that will be used in invoices:

1. Log in to QuickBooks Online
2. Go to "Sales" → "Products and Services"
3. For each item, note down the Item ID:
   - When viewing an item, the ID is in the URL as `itemId=XX`
   - Example: `https://qbo.intuit.com/app/products-and-services/product?itemId=8`
   - In this example, the ID is "8"

These Item IDs will need to be added to your Salesforce products in the `QB_Item_ID__c` field for proper mapping.
