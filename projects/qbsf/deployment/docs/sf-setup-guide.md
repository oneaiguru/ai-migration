# Salesforce Setup Guide

This guide will walk you through setting up the Salesforce components needed for the QuickBooks integration.

## 1. Create Custom Fields on Opportunity Object

1. Log in to Salesforce with Admin access
2. Go to Setup (gear icon) → Object Manager
3. Search for and select "Opportunity"
4. Click "Fields & Relationships"
5. Click "New" to create each of these fields:

| Field Label | API Name | Data Type | Description |
|-------------|----------|-----------|-------------|
| QB Invoice ID | QB_Invoice_ID__c | Text(255) | Stores the QuickBooks Invoice ID |
| QB Payment Date | QB_Payment_Date__c | Date | Date payment was received |
| QB Payment Reference | QB_Payment_Reference__c | Text(255) | Reference number for payment |
| QB Payment Method | QB_Payment_Method__c | Text(255) | Method of payment (check, credit card, etc.) |
| QB Payment Amount | QB_Payment_Amount__c | Currency | Amount of payment received |

## 2. Create Custom Field on Product2 Object

1. In Object Manager, search for and select "Product2"
2. Click "Fields & Relationships"
3. Click "New" to create this field:

| Field Label | API Name | Data Type | Description |
|-------------|----------|-----------|-------------|
| QB Item ID | QB_Item_ID__c | Text(255) | QuickBooks Item ID |

## 3. Create Custom Setting for Integration Settings

1. Go to Setup → Custom Settings
2. Click "New" button
3. Enter the following:
   - Label: QB Integration Settings
   - Object Name: QB_Integration_Settings__c
   - Setting Type: Hierarchy
   - Description: Settings for the QuickBooks Online integration
4. Click "Save"
5. Under "Custom Fields" section, click "New" and create these fields:

| Field Label | API Name | Data Type | Description |
|-------------|----------|-----------|-------------|
| Middleware Endpoint | Middleware_Endpoint__c | Text(255) | URL of middleware service |
| API Key | API_Key__c | Text(255) | API key for middleware authentication |
| QB Realm ID | QB_Realm_ID__c | Text(255) | QuickBooks Company ID |

## 4. Create Custom Objects for Logging

### 4.1 Create QB Integration Log Object

1. Go to Setup → Object Manager
2. Click "Create" → "Custom Object"
3. Fill in details:
   - Label: QB Integration Log
   - Plural Label: QB Integration Logs
   - Object Name: QB_Integration_Log__c
   - Record Name: Log Number (Auto Number, format: QBL-{0000})
4. Click "Save"
5. Add these fields:

| Field Label | API Name | Data Type | Description |
|-------------|----------|-----------|-------------|
| Process Name | Process_Name__c | Text(255) | Name of integration process |
| Status | Status__c | Picklist (Success, Error, Warning) | Status of process |
| Message | Message__c | Long Text Area | Log message |
| Timestamp | Timestamp__c | Date/Time | When log was created |

### 4.2 Create QB Integration Error Log Object

1. Go to Setup → Object Manager
2. Click "Create" → "Custom Object"
3. Fill in details:
   - Label: QB Integration Error Log
   - Plural Label: QB Integration Error Logs
   - Object Name: QB_Integration_Error_Log__c
   - Record Name: Error Number (Auto Number, format: QBERR-{0000})
4. Click "Save"
5. Add these fields:

| Field Label | API Name | Data Type | Description |
|-------------|----------|-----------|-------------|
| Opportunity | Opportunity__c | Master-Detail (Opportunity) | Related opportunity |
| Error Message | Error_Message__c | Long Text Area | Error message |
| Timestamp | Timestamp__c | Date/Time | When error occurred |
| Resolved | Resolved__c | Checkbox | Whether error was resolved |
| Resolution Notes | Resolution_Notes__c | Long Text Area | Notes on resolution |

## 5. Deploy Apex Classes and Trigger

The easiest way to deploy the Apex code is using the Salesforce Developer Console:

### 5.1 Deploy Trigger

1. Go to Setup → Developer Console
2. Click File → New → Apex Trigger
3. Name it "OpportunityQuickBooksTrigger"
4. Copy-paste the code from `1000011/Salesforce/OpportunityQuickBooksTrigger.trigger`
5. Save the file

### 5.2 Deploy Classes

For each of these classes, create a new Apex Class:

1. QBInvoiceIntegrationQueueable
   - Click File → New → Apex Class
   - Name it "QBInvoiceIntegrationQueueable"
   - Copy-paste the code from `1000011/Salesforce/QBInvoiceIntegrationQueueable.cls`
   - Save the file

2. QBInvoiceIntegrationQueueableTest
   - Click File → New → Apex Class
   - Name it "QBInvoiceIntegrationQueueableTest"
   - Copy-paste the code from `1000011/Salesforce/QBInvoiceIntegrationQueueableTest.cls`
   - Save the file

3. QBPaymentStatusScheduler
   - Click File → New → Apex Class
   - Name it "QBPaymentStatusScheduler"
   - Copy-paste the code from `1000011/Salesforce/QBPaymentStatusScheduler.cls`
   - Save the file

4. QBPaymentStatusSchedulerTest
   - Click File → New → Apex Class
   - Name it "QBPaymentStatusSchedulerTest"
   - Copy-paste the code from `1000011/Salesforce/QBPaymentStatusSchedulerTest.cls`
   - Save the file

5. OpportunityQuickBooksTriggerTest
   - Click File → New → Apex Class
   - Name it "OpportunityQuickBooksTriggerTest"
   - Copy-paste the code from `1000011/Salesforce/OpportunityQuickBooksTriggerTest.cls`
   - Save the file

## 6. Schedule Payment Status Check

1. Open Salesforce Developer Console
2. Click Debug → Open Execute Anonymous Window
3. Enter the following code:
   ```apex
   QBPaymentStatusScheduler.scheduleNightly();
   ```
4. Click "Execute"

This schedules the payment status check to run nightly at 1:00 AM.

## 7. Configure Custom Settings

After setting up the middleware and authorizing the connections:

1. Go to Setup → Custom Settings
2. Click on "QB Integration Settings"
3. Click "Manage"
4. Click "New" at the Default Organization Level
5. Enter:
   - Middleware Endpoint: Your middleware URL (e.g., `https://your-middleware.com` or `http://localhost:3000` for testing)
   - API Key: The API key generated during middleware setup
   - QB Realm ID: Your QuickBooks company ID (visible in the `/auth/status` response)
6. Click "Save"
