# Troubleshooting Guide

## Common Issues and Solutions

### 🔴 Error: "Cannot find module 'express'"
**Symptom**: Server fails to start with module not found error

**Solution**:
```bash
cd /opt/qb-integration
npm install express
npm install  # Install all dependencies
```

### 🔴 Error: "Cannot run payment check: Missing connection to Salesforce or QuickBooks"
**Symptom**: Scheduler runs but cannot connect to external services

**Causes & Solutions**:

1. **Missing OAuth tokens**
   ```bash
   # Check if tokens exist
   ls -la /opt/qb-integration/tokens.json
   
   # If missing, need to authenticate
   # Visit: https://sqint.atocomm.eu/auth/salesforce
   # Visit: https://sqint.atocomm.eu/auth/quickbooks
   ```

2. **Expired tokens**
   ```bash
   # Check token expiry in logs
   grep "Token expired" /opt/qb-integration/server.log
   
   # Force refresh
   curl -X POST https://sqint.atocomm.eu/api/auth/refresh \
     -H "X-API-Key: qb-sf-integration-api-key-2024"
   ```

3. **Wrong OAuth credentials in .env**
   ```bash
   # Verify credentials are set
   grep -E "CLIENT_ID|CLIENT_SECRET" .env
   
   # Should not be placeholder values
   # Should not contain <TO_BE_CONFIGURED>
   ```

### 🔴 Error: "Name or service not known" for Salesforce
**Symptom**: Cannot connect to Salesforce org

**Solution**:
```bash
# Fix the URL in .env
sed -i 's|olga-rybak-atocomm2023-eu|customer-inspiration-2543|g' .env

# Verify correct URL
grep SF_LOGIN_URL .env
# Should show: SF_LOGIN_URL=https://customer-inspiration-2543.my.salesforce.com
```

### 🔴 Error: "ACCESS DENIED" in Salesforce
**Symptom**: API calls from Salesforce to middleware fail

**Solutions**:

1. **Update Remote Site Settings**
   - Login to Salesforce
   - Setup → Security → Remote Site Settings
   - Edit QuickBooksMiddleware
   - URL should be: https://sqint.atocomm.eu

2. **Check Custom Settings**
   - Setup → Custom Settings → QuickBooks_Settings__c
   - Verify Middleware_URL__c = https://sqint.atocomm.eu
   - Verify API_Key__c = qb-sf-integration-api-key-2024

3. **Update hardcoded URL in Apex**
   ```apex
   // In QuickBooksAPIServiceFixed.cls
   private static final String NGROK_URL = 'https://sqint.atocomm.eu';
   ```

### 🔴 Test Coverage Below 75%
**Symptom**: Cannot deploy to production due to test coverage

**Solutions**:

1. **Deploy without tests (temporary)**
   ```bash
   sf project deploy start --source-dir force-app --target-org roman-prod --test-level Default
   ```

2. **Run specific test classes**
   ```bash
   sf apex test run --class-names QuickBooksAPIServiceTest,QuickBooksInvoiceControllerTest --target-org roman-prod
   ```

3. **Check coverage report**
   ```bash
   sf apex test run --target-org roman-prod --test-level RunLocalTests --code-coverage --result-format human
   ```

### 🔴 Scheduler Not Running
**Symptom**: Invoices not created automatically, payments not synced

**Diagnosis**:
```bash
# Check if scheduler started
grep "Scheduler started" /opt/qb-integration/server.log

# Check cron jobs
grep "Running scheduled" /opt/qb-integration/server.log | tail -10
```

**Solutions**:

1. **Verify cron patterns in .env**
   ```bash
   grep CRON .env
   # Should show:
   # INVOICE_CREATION_CRON=*/5 * * * *
   # PAYMENT_CHECK_CRON=*/5 * * * *
   ```

2. **Restart server**
   ```bash
   pm2 restart qb-integration
   ```

### 🔴 QuickBooks "Invalid Grant" Error
**Symptom**: QuickBooks API returns authentication error

**Solution**:
1. Re-authenticate with QuickBooks
2. Ensure using production credentials if QB_ENVIRONMENT=production
3. Check QuickBooks app is approved for production

### 🔴 Memory/Performance Issues
**Symptom**: Server crashes or becomes unresponsive

**Diagnosis**:
```bash
# Check memory usage
free -h
pm2 monit

# Check Node memory
pm2 info qb-integration
```

**Solutions**:
```bash
# Increase Node memory limit
pm2 delete qb-integration
pm2 start src/server.js --name qb-integration --node-args="--max-old-space-size=2048"

# Setup log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
```

### 🔴 Invoice Not Created After Stage Change
**Symptom**: Opportunity stage changed but no invoice created

**Checklist**:
1. ✓ Is trigger deployed and active?
2. ✓ Is Account Type = "Поставщик" and Country = "US"?
3. ✓ Are there products on the Opportunity?
4. ✓ Is middleware running and accessible?
5. ✓ Check Apex debug logs for errors

**Debug Steps**:
```apex
// In Developer Console
System.debug('Trigger fired');
System.debug('Account Type: ' + opp.Account.Type__c);
System.debug('Account Country: ' + opp.Account.Country__c);
```

## Emergency Procedures

### Complete System Reset
```bash
# 1. Backup everything
cd /opt
tar -czf emergency-backup-$(date +%Y%m%d).tar.gz qb-integration/

# 2. Stop all processes
pm2 kill
pkill -f node

# 3. Clean install
cd /opt/qb-integration
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install

# 4. Restart with monitoring
pm2 start src/server.js --name qb-integration
pm2 logs qb-integration
```

### Rollback to Previous Version
```bash
# If you have a backup
cd /opt
mv qb-integration qb-integration.broken
tar -xzf qb-integration-backup-[date].tar.gz
cd qb-integration
pm2 start src/server.js --name qb-integration
```

## Contact for Help

If these solutions don't work:
1. Document the exact error message
2. Save recent logs: `pm2 logs qb-integration --lines 1000 > error-report.log`
3. Create ISSUES.md with details
4. Check server resources: `df -h`, `free -h`, `top`