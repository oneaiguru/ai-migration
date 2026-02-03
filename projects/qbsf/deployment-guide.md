# QuickBooks-Salesforce Integration Deployment Guide

## Current Status
- Test coverage: 53% (needs to reach 75%)
- Components deployed: LWC button, Apex classes
- Middleware: Running on ngrok

## Step 1: Fix Test Coverage

Run the corrected test script:
```bash
./fix_test_coverage_corrected.sh
```

### Correct SF Commands for Testing

1. **Deploy test class:**
   ```bash
   sf project deploy start --source-dir force-app --target-org myorg
   ```

2. **Run specific test with coverage:**
   ```bash
   sf apex run test --class-names QuickBooksComprehensiveTest --code-coverage --wait 10 --target-org myorg
   ```

3. **Run all tests with coverage:**
   ```bash
   sf apex run test --test-level RunLocalTests --code-coverage --wait 10 --target-org myorg
   ```

4. **Check org-wide coverage:**
   ```bash
   sf data query --query "SELECT PercentCovered FROM ApexOrgWideCoverage" --target-org myorg
   ```

## Step 2: Test the Button Integration

1. **Start your middleware:**
   ```bash
   cd final-integration
   npm start
   ```

2. **Ensure ngrok is running:**
   ```bash
   ngrok http 3000
   ```

3. **Update Salesforce settings with ngrok URL:**
   - Go to Setup → Custom Settings → QuickBooks Settings
   - Update Middleware_URL__c with your ngrok URL
   - Update API_Key__c with your API key

4. **Test the button:**
   ```bash
   ./test_button_integration.sh
   ```

## Step 3: Verify Everything Works

### In Salesforce:
1. Navigate to an Opportunity (preferably "Closed Won")
2. Click "Create QuickBooks Invoice" button
3. You should see:
   - Success message
   - QB_Invoice_ID__c field populated

### In Middleware Console:
- Look for logs showing:
  - Opportunity fetch
  - Customer creation/lookup
  - Invoice creation
  - Salesforce update

### In QuickBooks:
- Check for the new invoice
- Verify customer was created/found
- Check invoice details match opportunity

## Troubleshooting

### Test Coverage Issues:
- Error: "Test class not found"
  ```bash
  # List all test classes
  sf data query --query "SELECT Name FROM ApexTestClass" --target-org myorg
  ```

- Error: "Insufficient coverage"
  ```bash
  # Check specific class coverage
  sf data query --query "SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverage WHERE ApexClassOrTrigger.Name IN ('QuickBooksAPIService','QuickBooksInvoiceController')" --target-org myorg
  ```

### Button Issues:
- If button shows "localhost" error:
  1. Clear browser cache
  2. Clear Salesforce cache (Setup → System → Clear Cache)
  3. Verify Custom Settings have correct URL
  4. Check debug logs

### Common Fixes:
1. **Deployment failures:**
   ```bash
   # Deploy without tests first
   sf project deploy start --source-dir force-app --target-org myorg --test-level NoTestRun
   
   # Then run tests separately
   sf apex run test --class-names QuickBooksComprehensiveTest --code-coverage --target-org myorg
   ```

2. **View test results:**
   ```bash
   # Get detailed test results
   sf apex get test --test-run-id <TEST_RUN_ID> --target-org myorg
   ```

3. **Check deployment status:**
   ```bash
   sf project deploy report --target-org myorg
   ```

## Next Steps

Once test coverage is above 75%:
1. Deploy all components to production
2. Configure production OAuth settings
3. Update production middleware URL
4. Test in production environment

## Support

If you encounter issues:
1. Check debug logs in Salesforce
2. Monitor middleware console
3. Verify all credentials and URLs
4. Check network connectivity
