# QuickBooks-Salesforce Integration Test Coverage Guide

This guide helps you increase the test coverage for the QuickBooks-Salesforce integration from 53% to 75%+.

## Components Overview

The integration consists of:

1. **Apex Classes**:
   - `QuickBooksInvoiceController` - Main controller for invoice creation
   - `QuickBooksAPIService` - Service for API callouts to middleware
   - Support classes (may vary)

2. **LWC Components**:
   - `quickBooksInvoice` - Button component for creating invoices

3. **Middleware**:
   - Node.js application in the `final-integration` folder
   - Handles OAuth to QuickBooks and API communication

## Test Coverage Fix

The `fix_test_coverage_final.sh` script creates a comprehensive test class that covers both the controller and API service with various test scenarios:

- Successful invoice creation
- Invoice already exists case
- Missing settings case
- Various API service test scenarios
- Connection test cases

### How to Run the Fix

1. Make the script executable:
   ```
   chmod +x fix_test_coverage_final.sh
   ```

2. Run the script:
   ```
   ./fix_test_coverage_final.sh
   ```

3. Follow the prompts to deploy to your Salesforce org.

## Testing the Integration

After fixing the test coverage, use the `test-integration.sh` script to:

1. Start the middleware server
2. Create an ngrok tunnel
3. Test the full integration flow

### How to Test

1. Make the script executable:
   ```
   chmod +x test-integration.sh
   ```

2. Run the script:
   ```
   ./test-integration.sh
   ```

3. Update the middleware URL in Salesforce based on the ngrok URL shown
4. Test the "Create QuickBooks Invoice" button on an Opportunity record

## Important Notes

1. **API Key**: Make sure the API key in Salesforce matches the one in the middleware's `.env` file
2. **Middleware URL**: The URL must be updated in Salesforce whenever restarting the ngrok tunnel
3. **Test Coverage**: Run the coverage check to ensure you've reached 75%+ coverage:
   ```
   sf apex get coverage --class-names QuickBooksAPIService,QuickBooksInvoiceController --target-org myorg
   ```

## Troubleshooting

1. **Button Not Working**: Check the browser console for errors and ensure the middleware is running
2. **API Calls Failing**: Check the middleware logs for details
3. **Test Failing**: Ensure your test mocks match the actual API structure

## Additional Resources

- `DEMO_PACKAGE/salesforce/deploy` - Contains the original deployment files
- `force-app/main/default` - Contains the deployed Salesforce code
- `final-integration` - Contains the middleware application