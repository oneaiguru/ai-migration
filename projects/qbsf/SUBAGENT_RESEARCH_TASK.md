# COMPREHENSIVE SYSTEM AUDIT AND TESTING PLAN

## OBJECTIVE
Research and validate the complete Salesforce-QuickBooks integration to ensure production readiness. The system should work automatically without manual intervention except for OAuth renewal every 3 months.

## CURRENT STATE SUMMARY

### Fixed Issues
1. **Nginx proxy** - Was stripping X-API-Key header (fixed in Docker container config)
2. **Tokens.json corruption** - Encryption was writing raw encrypted data instead of JSON (temporarily disabled encryption)
3. **QuickBooks SQL query error** - Complex payment query failing, replaced with simpler invoice balance check
4. **OAuth token persistence** - Tokens weren't saving properly

### Modified Files
1. `/opt/qb-integration/src/services/oauth-manager.js` - Lines 127, 153 (disabled encryption)
2. `/opt/qb-integration/src/services/quickbooks-api.js` - Lines 431-460 (simplified payment detection)
3. `/root/ci/proxy/config/nginx.conf` - Added proxy_set_header X-API-Key
4. `/opt/qb-integration/data/tokens.json` - Recreated with proper JSON structure

## RESEARCH TASKS

### 1. INVOICE CREATION FLOW (SF → QB)
**Files to examine:**
- `/opt/qb-integration/src/services/scheduler.js`
- `/opt/qb-integration/src/transforms/opportunity-to-invoice.js`
- `/opt/qb-integration/src/services/salesforce-api.js` (getUnpaidOpportunities method)
- `/opt/qb-integration/src/services/quickbooks-api.js` (createInvoice method)
- `force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger`
- `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`

**Research questions:**
- What triggers invoice creation? (Stage change to "Proposal and Agreement"?)
- Why might invoice creation fail silently?
- Are there any filters preventing certain opportunities from creating invoices?
- Check the scheduler cron expression and verify it's running

### 2. PAYMENT SYNC FLOW (QB → SF)
**Files to examine:**
- `/opt/qb-integration/src/routes/api.js` (check-payment-status endpoint)
- `/opt/qb-integration/src/services/quickbooks-api.js` (checkInvoicePaymentStatus, batchCheckPaymentStatus)
- `/opt/qb-integration/src/services/salesforce-api.js` (updateOpportunityPayment method)
- `force-app/main/default/classes/QBPaymentStatusScheduler.cls`

**Research questions:**
- How does the system detect paid invoices? (Balance = 0 logic correct?)
- What fields are updated in Salesforce when payment is detected?
- Does the Stage automatically change to "Closed Won"?
- Are there any conditions preventing updates?

### 3. ERROR HANDLING & LOGGING
**Files to examine:**
- `/opt/qb-integration/src/middleware/error-handler.js`
- `/opt/qb-integration/src/utils/logger.js`
- `/opt/qb-integration/server.log`

**Research questions:**
- Are errors being logged properly?
- Are there any silent failures?
- Check for patterns in error logs

### 4. OAUTH & AUTHENTICATION
**Files to examine:**
- `/opt/qb-integration/src/services/oauth-manager.js` (all token management functions)
- `/opt/qb-integration/src/routes/auth.js`
- `/opt/qb-integration/.env`

**Research questions:**
- Why was encryption causing token corruption?
- Is the temporary fix (disabled encryption) secure enough?
- Are refresh tokens working properly?
- Check token expiry handling

### 5. CONFIGURATION & ENVIRONMENT
**Files to examine:**
- `/opt/qb-integration/.env`
- `/opt/qb-integration/src/config/index.js`
- Salesforce Custom Settings (QB_Integration_Settings__c)
- Salesforce Remote Site Settings

**Research questions:**
- Are all URLs correct? (SF instance, QB realm ID)
- Are API keys consistent across systems?
- Check scheduler intervals (5 minutes for testing vs production)

## END-TO-END TEST SCENARIOS

### Test 1: Complete Invoice Creation Flow
1. Create new Opportunity in Salesforce
2. Set Stage to "Proposal and Agreement"
3. Verify QB Invoice created within 5 minutes
4. Check QB_Invoice_ID__c field populated
5. Verify invoice details match opportunity

### Test 2: Payment Sync Flow
1. Mark invoice as Paid in QuickBooks
2. Wait 5 minutes (or trigger API manually)
3. Verify Opportunity Stage changes to "Closed Won"
4. Verify QB_Payment_Date__c populated
5. Verify QB_Payment_Amount__c matches invoice
6. Verify QB_Payment_Method__c populated
7. Verify QB_Payment_Reference__c populated

### Test 3: Multiple Opportunities
1. Create 3 opportunities simultaneously
2. Change all to "Proposal and Agreement"
3. Verify all 3 create invoices
4. Mark 2 as paid in QB
5. Verify only 2 update in SF

### Test 4: Error Recovery
1. Stop QB integration server
2. Create opportunity
3. Restart server
4. Verify invoice eventually created
5. Test with expired OAuth token
6. Verify appropriate error messages

### Test 5: Edge Cases
1. $0 invoice handling
2. Opportunity with no line items
3. Duplicate invoice prevention
4. Partial payment handling
5. Currency conversion (EUR vs USD)

## VALIDATION CHECKLIST

### Salesforce Components
- [ ] OpportunityQuickBooksTrigger active and deployed
- [ ] QBInvoiceIntegrationQueueable has test coverage > 75%
- [ ] QBPaymentStatusScheduler scheduled and running
- [ ] Custom fields visible on Opportunity page layout
- [ ] Remote Site Settings configured for middleware URL
- [ ] Custom Settings have correct API key and endpoints

### Middleware Server
- [ ] Server running continuously (systemd service?)
- [ ] Logs rotating properly
- [ ] Database/tokens.json backed up
- [ ] Error monitoring in place
- [ ] Health check endpoint working
- [ ] Both schedulers running (invoice creation + payment check)

### QuickBooks Integration
- [ ] OAuth tokens valid and refreshing
- [ ] Correct QuickBooks realm ID
- [ ] Production vs Sandbox environment
- [ ] Invoice creation permissions
- [ ] Payment query permissions

### Network & Infrastructure
- [ ] Nginx proxy configured correctly
- [ ] SSL certificates valid
- [ ] Domain DNS pointing correctly
- [ ] Firewall rules allow traffic
- [ ] Docker containers stable

## PRODUCTION READINESS CRITERIA

1. **Automatic Operation**: System runs without manual intervention
2. **Error Recovery**: Gracefully handles and recovers from failures
3. **Monitoring**: Clear logs and alerts for issues
4. **Performance**: Processes payments within 5 minutes
5. **Security**: OAuth tokens encrypted, API keys secure
6. **Documentation**: Clear troubleshooting guide
7. **Testing**: All scenarios pass consistently

## DELIVERABLES NEEDED

1. **Fixed oauth-manager.js** with proper encryption
2. **Fixed quickbooks-api.js** with robust payment detection
3. **Systemd service** for automatic server startup
4. **Monitoring script** to alert on failures
5. **Complete test results** document
6. **Troubleshooting guide** for Roman
7. **90-day OAuth renewal reminder** system

## CRITICAL QUESTIONS TO ANSWER

1. Why does Roman see invoice created but payment not syncing?
2. Are there timing issues with the 5-minute scheduler?
3. Is the Stage change to "Closed Won" automatic or manual?
4. What happens if QB and SF have different invoice amounts?
5. How to handle multiple payments for one invoice?
6. What if OAuth expires during critical operation?

## FILES TO READ COMPLETELY

Priority files for deep analysis:
1. `/opt/qb-integration/src/services/scheduler.js` - Understand timing
2. `/opt/qb-integration/src/services/salesforce-api.js` - All methods
3. `/opt/qb-integration/src/services/quickbooks-api.js` - All methods
4. `/opt/qb-integration/src/routes/api.js` - All endpoints
5. `/opt/qb-integration/server.log` - Last 500 lines for patterns

## TESTING COMMANDS

```bash
# Check server status
ps aux | grep node
tail -f /opt/qb-integration/server.log

# Test invoice creation
curl -X POST https://sqint.atocomm.eu/api/create-invoices \
  -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" \
  -H "Content-Type: application/json" \
  -d '{"salesforceInstance":"https://customer-inspiration-2543.my.salesforce.com"}'

# Test payment sync
curl -X POST https://sqint.atocomm.eu/api/check-payment-status \
  -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" \
  -H "Content-Type: application/json" \
  -d '{"salesforceInstance":"https://customer-inspiration-2543.my.salesforce.com","quickbooksRealm":"9130354519120066"}'

# Check OAuth status
curl https://sqint.atocomm.eu/auth/status
```

## SUCCESS METRICS

The system is production-ready when:
1. 10 consecutive opportunities create invoices automatically
2. 10 consecutive paid invoices update Salesforce automatically
3. No manual intervention needed for 24 hours of operation
4. All error scenarios recover gracefully
5. Roman can operate system without technical support

---

**INSTRUCTION TO SUBAGENT**: Research all listed files, answer all questions, run all tests, and provide a comprehensive report with specific line numbers and code changes needed to achieve full production readiness. Focus on making the system completely automatic except for quarterly OAuth renewal.