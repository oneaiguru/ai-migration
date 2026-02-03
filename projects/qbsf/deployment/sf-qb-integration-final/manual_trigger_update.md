# Manual Trigger Update Instructions

Since we couldn't deploy the trigger through the CLI, please follow these steps to manually update the trigger in the Salesforce UI:

1. Log into your Salesforce org
2. Go to Setup > Platform Tools > Custom Code > Apex Triggers
3. Find and click on "OpportunityQuickBooksTrigger"
4. In the trigger code, find this line:
   ```apex
   final String INVOICE_STAGE = 'Closed Won';
   ```
5. Change it to:
   ```apex
   final String INVOICE_STAGE = 'Proposal and Agreement';
   ```
6. Click "Save"

## Testing the Integration

After updating the trigger, test the integration:

1. Create a new Opportunity or find an existing one
2. Change its Stage to "Proposal and Agreement"
3. Save the Opportunity
4. The trigger should fire and send a request to the middleware
5. Check the middleware logs for the API request
6. Verify that a QuickBooks invoice is created

## Logging

To monitor the integration:

- Middleware logs: Check the console where the Node.js server is running
- Salesforce logs: Setup > Platform Tools > Logs > Debug Logs
- Check the Opportunity record for the QuickBooks Invoice ID field to be populated

If you encounter any issues, please check both the Salesforce and middleware logs for error messages.