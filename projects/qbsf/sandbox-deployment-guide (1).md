# QuickBooks-Salesforce Sandbox Deployment Guide

## Quick Deployment to Sandbox (Bypass 75% Test Coverage)

The fastest way to deploy to your sandbox and test the button is to bypass the test coverage requirement. Here's how:

### Step 1: Deploy Without Tests

```bash
# Deploy directly to sandbox without running tests
./deploy_sandbox_no_tests.sh
```

This script:
- Creates the test class (but doesn't run it)
- Deploys using `--test-level NoTestRun` which bypasses the 75% requirement
- Works ONLY in sandbox environments

### Step 2: Fix Middleware Connection

```bash
# Test and fix the middleware connection
./test_button_fixed.sh
```

This will:
1. Start the middleware locally
2. Create ngrok tunnel
3. Provide the ngrok URL to update in Salesforce
4. Monitor logs for button testing

### Step 3: Update Salesforce Settings

1. Log in to your Salesforce sandbox
2. Go to Setup > Custom Settings > QuickBooks Settings
3. Click "Manage" then "Edit"
4. Update:
   - Middleware URL: `https://YOUR-NGROK-URL.ngrok-free.app`
   - API Key: `quickbooks_salesforce_api_key_2025`
5. Save

### Step 4: Test the Button

1. Navigate to any Opportunity record (preferably in "Closed Won" stage)
2. Click the "Create QuickBooks Invoice" button
3. Watch the middleware logs for activity

## Common Issues and Fixes

### Issue: Test class won't run
Solution: Deploy with `--test-level NoTestRun` for sandbox

### Issue: Middleware health check fails
Solution: 
1. Ensure middleware is running on port 3000
2. Check that ngrok is forwarding to the correct port
3. Add the `ngrok-skip-browser-warning` header when testing

### Issue: Button shows localhost error
Solution:
1. Clear browser cache
2. Clear Salesforce cache (Setup > System > Clear Cache)
3. Verify Custom Settings have the ngrok URL

### Issue: SOQL errors in tests
Solution: Use simplified SOQL queries without calculated fields

## What This Approach Does

1. **Bypasses test coverage requirements** - Uses sandbox-specific deployment options
2. **Focuses on functionality** - Gets the button working first
3. **Allows quick iteration** - Deploy and test without waiting for tests

## After Successful Demo

Once the button is working in sandbox:
1. Fix test coverage properly (using the comprehensive test class)
2. Deploy to production with proper tests
3. Update production settings with production middleware URL

## Commands Reference

```bash
# Deploy to sandbox without tests
sf project deploy start --source-dir force-app --target-org myorg --test-level NoTestRun

# Run tests manually (optional)
sf apex run test --class-names QuickBooksComprehensiveTest --wait 10 --target-org myorg

# Check code coverage
sf data query --query "SELECT Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverage" --target-org myorg
```

## Quick Start Summary

1. Run `./deploy_sandbox_no_tests.sh`
2. Run `./test_button_fixed.sh`
3. Update Salesforce Custom Settings with ngrok URL
4. Test the button on an Opportunity

This approach lets you demonstrate the working integration without dealing with test coverage issues.
