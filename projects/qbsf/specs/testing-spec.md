# Testing Specification

## 🎯 Testing Objectives
Validate complete end-to-end integration between Salesforce and QuickBooks including invoice creation, payment synchronization, and error handling.

## 📋 Test Environment Setup

### Prerequisites
- [ ] Middleware running on https://sqint.atocomm.eu
- [ ] Salesforce org accessible
- [ ] QuickBooks company connected
- [ ] Test data prepared

### Test Data Requirements
```javascript
// Test Account
{
  "Name": "Test Company ABC",
  "Type__c": "Поставщик",
  "Country__c": "US",
  "BillingStreet": "123 Test St",
  "BillingCity": "Test City",
  "BillingState": "CA",
  "BillingPostalCode": "12345",
  "Phone": "555-0100",
  "Email__c": "test@company.com"
}

// Test Opportunity
{
  "Name": "Test Integration Opportunity",
  "StageName": "Prospecting",
  "CloseDate": "2025-09-01",
  "Amount": 1000.00,
  "Description": "Test opportunity for QB integration"
}

// Test Products
[
  {
    "Name": "Test Product 1",
    "Quantity": 2,
    "UnitPrice": 250.00
  },
  {
    "Name": "Test Product 2",
    "Quantity": 1,
    "UnitPrice": 500.00
  }
]
```

## 🧪 Test Cases

### TC001: API Health Check
**Objective**: Verify middleware is running and accessible
```bash
curl https://sqint.atocomm.eu/api/health
```
**Expected**: HTTP 200, `{"success": true, "status": "healthy"}`

### TC002: API Key Authentication
**Objective**: Verify API key protection
```bash
# Without API key - should fail
curl -X POST https://sqint.atocomm.eu/api/opportunity-to-invoice

# With API key - should succeed
curl -X POST https://sqint.atocomm.eu/api/opportunity-to-invoice \
  -H "X-API-Key: qb-sf-integration-api-key-2024"
```
**Expected**: 401 without key, 400 with key (missing parameters)

### TC003: Manual Invoice Creation (Button)
**Steps**:
1. Navigate to Opportunity in Salesforce
2. Click "Create QuickBooks Invoice" button
3. Verify success message
4. Check QB_Invoice_ID__c populated

**Validation**:
- [ ] Button visible on Opportunity
- [ ] Loading spinner shows during creation
- [ ] Success toast message appears
- [ ] QB_Invoice_ID__c field populated
- [ ] Invoice exists in QuickBooks

### TC004: Automated Invoice Creation (Trigger)
**Steps**:
1. Create new Opportunity
2. Add products/line items
3. Change stage to "Proposal and Agreement"
4. Wait for trigger execution

**Validation**:
- [ ] Trigger fires on stage change
- [ ] Invoice created within 30 seconds
- [ ] QB_Invoice_ID__c auto-populated
- [ ] Correct data mapped to QB invoice

### TC005: US Supplier Filtering
**Steps**:
1. Create Opportunity with non-US supplier
2. Change stage to "Proposal and Agreement"
3. Verify no QB invoice created
4. Create Opportunity with US supplier
5. Change stage to "Proposal and Agreement"
6. Verify QB invoice created

**Validation**:
- [ ] Non-US: No QB invoice, only SF Invoice
- [ ] US: Both SF and QB invoices created

### TC006: Payment Status Synchronization
**Steps**:
1. Create invoice via integration
2. Mark invoice as paid in QuickBooks
3. Wait for scheduler (5 minutes)
4. Check Opportunity in Salesforce

**Validation**:
- [ ] QB_Payment_Status__c = "Paid"
- [ ] QB_Payment_Date__c populated
- [ ] QB_Payment_Amount__c matches payment
- [ ] Opportunity Stage = "Closed Won"

### TC007: Error Handling - Invalid Data
**Test Cases**:
1. Missing Account on Opportunity
2. No products on Opportunity
3. Invalid QuickBooks realm ID
4. Expired OAuth token

**Expected Behavior**:
- [ ] Appropriate error logged
- [ ] User-friendly error message
- [ ] System remains stable
- [ ] Retry mechanism triggered

### TC008: Scheduler Functionality
**Steps**:
1. Check scheduler logs
2. Verify cron jobs running
3. Monitor for 30 minutes

**Validation**:
```bash
tail -f /opt/qb-integration/server.log | grep -E "Scheduler|payment check|invoice creation"
```
- [ ] "Running scheduled payment status check" every 5 min
- [ ] "Running scheduled invoice creation" every 5 min
- [ ] No errors in scheduler execution

### TC009: OAuth Token Refresh
**Steps**:
1. Wait for token to near expiry
2. Make API call
3. Verify automatic refresh

**Validation**:
- [ ] Token refreshed automatically
- [ ] No interruption in service
- [ ] New token stored securely

### TC010: Concurrent Request Handling
**Steps**:
1. Create 5 Opportunities simultaneously
2. Change all to "Proposal and Agreement"
3. Monitor invoice creation

**Validation**:
- [ ] All invoices created successfully
- [ ] No race conditions
- [ ] Proper queue handling
- [ ] Response time < 5 seconds each

## 🔄 Integration Test Scenarios

### Scenario 1: Complete Sales Cycle
1. Create Opportunity (Prospecting)
2. Add products
3. Move to "Proposal and Agreement"
4. Verify QB invoice created
5. Customer pays in QuickBooks
6. Verify Opportunity closed

**Success Criteria**:
- [ ] < 2 minutes for invoice creation
- [ ] < 5 minutes for payment sync
- [ ] All fields correctly mapped
- [ ] Audit trail complete

### Scenario 2: Bulk Operations
1. Create 10 Opportunities
2. Bulk update to trigger stage
3. Monitor system performance

**Success Criteria**:
- [ ] All invoices created
- [ ] No timeout errors
- [ ] CPU usage < 80%
- [ ] Memory stable

### Scenario 3: Error Recovery
1. Disconnect QuickBooks
2. Attempt invoice creation
3. Reconnect QuickBooks
4. Verify retry succeeds

**Success Criteria**:
- [ ] Error logged appropriately
- [ ] Retry queue populated
- [ ] Successful on reconnection
- [ ] User notified of issues

## 📊 Performance Testing

### Load Testing
```bash
# Using Apache Bench
ab -n 100 -c 10 -H "X-API-Key: qb-sf-integration-api-key-2024" \
   https://sqint.atocomm.eu/api/health
```

### Expected Performance Metrics
- **API Response Time**: < 2 seconds (95th percentile)
- **Invoice Creation**: < 5 seconds
- **Payment Sync**: < 1 minute
- **Concurrent Users**: Support 10+
- **Requests/Second**: 10+

## ✅ Test Completion Checklist

### Functional Testing
- [ ] All test cases passed
- [ ] Integration scenarios validated
- [ ] Error handling confirmed
- [ ] Performance acceptable

### Security Testing
- [ ] API key authentication working
- [ ] OAuth tokens secure
- [ ] No sensitive data in logs
- [ ] HTTPS enforced

### User Acceptance
- [ ] Roman tested key workflows
- [ ] Business requirements met
- [ ] Documentation complete
- [ ] Training provided

## 📝 Test Report Template

```markdown
# Test Execution Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: Production

## Summary
- Total Test Cases: 10
- Passed: [X]
- Failed: [X]
- Blocked: [X]

## Failed Tests
[List any failures with details]

## Issues Found
[List bugs/issues discovered]

## Recommendations
[Suggestions for improvement]

## Sign-off
- [ ] Technical testing complete
- [ ] Business testing complete
- [ ] Ready for production use
```