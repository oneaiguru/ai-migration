# Salesforce API Reference for QuickBooks Integration

## Core Objects and Fields

### Opportunity
- **Integration Fields:**
  - `Id` - unique identifier
  - `Name` - opportunity name
  - `AccountId` - related account
  - `Amount` - opportunity amount
  - `StageName` - opportunity stage
  - `CloseDate` - close date
  - `Supplier__c` - supplier (Lookup to Account)
  - `QB_Invoice_ID__c` - QuickBooks invoice ID
  - `QB_Last_Sync_Date__c` - last sync date
  - `QB_Last_Payment_Check__c` - last payment check date

### Account  
- **Filtering Fields:**
  - `Account_Type__c` - account type (Клиент, Поставщик, Наша компания)
  - `Country__c` - country (US, EU, RU, Other)
  - `Email__c` - email for QuickBooks

### QB_Invoice__c (Custom Object)
- **Core Fields:**
  - `Amount__c` - invoice amount
  - `Status__c` - invoice status
  - `Invoice_Date__c` - invoice date
  - `Due_Date__c` - due date
  - `QB_Invoice_ID__c` - QuickBooks ID
  - `Opportunity__c` - related opportunity

## Triggers and Logic

### OpportunityQuickBooksTrigger
- **Trigger Condition:** StageName = "Proposal and Agreement"
- **Supplier Filter:** Account.Account_Type__c = 'Поставщик' AND Account.Country__c = 'US'
- **Action:** Enqueues QBInvoiceIntegrationQueueable

## SOQL Queries

### Get US Suppliers for Integration
```sql
SELECT Id, Name, Account_Type__c, Country__c, Email__c,
       BillingStreet, BillingCity, BillingState, 
       BillingPostalCode, BillingCountry, Phone
FROM Account
WHERE Account_Type__c = 'Поставщик' 
AND Country__c = 'US'
```

### Get Opportunities Ready for QB Sync
```sql
SELECT Id, Name, AccountId, Amount, StageName, CloseDate,
       Supplier__c, QB_Invoice_ID__c, QB_Last_Sync_Date__c
FROM Opportunity
WHERE StageName = 'Proposal and Agreement'
AND QB_Invoice_ID__c = null
AND Supplier__c IN (SELECT Id FROM Account WHERE Account_Type__c = 'Поставщик' AND Country__c = 'US')
```

## Custom Settings

### QB_Integration_Settings__c
- `Middleware_Endpoint__c` - middleware URL (https://sqint.atocomm.eu)
- `API_Key__c` - authentication key
- `QB_Realm_ID__c` - QuickBooks company ID

## Error Handling Objects

### QB_Integration_Log__c
- `Status__c` - Success/Error/Warning
- `Message__c` - log message
- `Opportunity__c` - related record
- `QB_Invoice_ID__c` - QuickBooks reference
- `Records_Processed__c` - batch size
- `Timestamp__c` - log time

### QB_Integration_Error_Log__c  
- `Error_Type__c` - Integration Error, API Error, etc.
- `Error_Message__c` - detailed error message
- `Opportunity__c` - failed record
- `Timestamp__c` - error time
