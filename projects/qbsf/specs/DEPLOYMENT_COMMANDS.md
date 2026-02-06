# 🚀 DEPLOYMENT COMMANDS - Copy/Paste Ready

## 📊 CHECK CURRENT STATUS
```bash
cd /Users/m/git/clients/qbsf
sf apex run test --code-coverage --synchronous -o sanboxsf
```

## 🔧 DEPLOY IMPROVED TEST CLASS
```bash
# After editing QBInvoiceIntegrationQueueableTest.cls
sf project deploy start --source-dir force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls -o sanboxsf

# Run tests to check new coverage
sf apex run test --code-coverage --synchronous -o sanboxsf
```

## 📦 DEPLOY ADDITIONAL TEST CLASS (if exists)
```bash
sf project deploy start --source-dir QuickBooksInvoiceControllerExtraTest.cls -o sanboxsf
```

## ✅ PRODUCTION VALIDATION
```bash
# This must pass before payment approval
sf project deploy validate --source-dir force-app/main/default/ --test-level RunLocalTests -o sanboxsf
```

## 🔍 VERIFY API CONNECTIVITY
```bash
# Should return {"success":true}
curl -H "X-API-Key: $API_KEY" https://sqint.atocomm.eu/api/health

# Test integration endpoint
curl -X POST https://sqint.atocomm.eu/api/opportunity-to-invoice \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"opportunityId":"test123","name":"Test Opportunity","amount":1000}'
```

## 📋 FINAL SUCCESS CHECK
```bash
# All these must pass:
echo "1. Check coverage ≥ 75%:"
sf apex run test --code-coverage --synchronous -o sanboxsf | grep "Org Wide Coverage"

echo "2. Validate deployment:"
sf project deploy validate --source-dir force-app/main/default/ --test-level RunLocalTests -o sanboxsf

echo "3. Test API:"
curl -H "X-API-Key: $API_KEY" https://sqint.atocomm.eu/api/health
```

## 🎉 WHEN ALL PASS → APPROVE PAYMENT
**Evidence needed**:
- Coverage output showing ≥75%
- Deployment validation SUCCESS
- API health check SUCCESS
- Test opportunity with QB_Invoice_ID__c populated