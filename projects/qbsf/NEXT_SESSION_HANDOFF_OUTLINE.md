# NEXT SESSION HANDOFF OUTLINE
> **Purpose**: Dense outline for Haiku to expand into full handoff document
> **Critical**: Follow this EXACTLY - do not deviate, do not "improve", do not touch code unless explicitly instructed

---

## SECTION 1: PROJECT STATUS (EXPAND EACH BULLET)

### 1.1 What Works
- Invoice ID integration: FULLY WORKING
  - Trigger fires on Stage = "Proposal and Agreement"
  - Queueable calls middleware
  - Middleware creates QB invoice
  - Invoice ID returns to SF, populates QB_Invoice_ID__c
  - Test invoices created: 2427, 2428, 2429
  - Deployed class: QBInvoiceIntegrationQueueable.cls (27/27 tests passing)

### 1.2 What Doesn't Work
- Payment link (QB_Payment_Link__c) returns NULL
- Middleware logs show: "Payment link obtained: no"
- This is NOT a code bug - QB simply returns empty

### 1.3 Roman's Latest Feedback
- Russian: "ID счета пришло. а Link нет хотя payments добавлены в QB"
- Translation: "Invoice ID came through. But Link didn't, even though payments are added in QB"
- He CLAIMS QB Payments is enabled but link still empty

---

## SECTION 2: ROOT CAUSE ANALYSIS (EXPAND WITH TECHNICAL DETAIL)

### 2.1 Code Path for Payment Link
1. `QBInvoiceIntegrationQueueable.execute()` calls middleware
2. Middleware endpoint: `POST /api/opportunity-to-invoice`
3. Middleware creates invoice via QB API
4. Middleware calls `qbApi.getInvoicePaymentLink(invoiceId)`
5. This queries: `GET /invoice/{id}?minorversion=65&include=invoiceLink`
6. QB returns invoice data - but `invoiceLink` field is empty/missing
7. Middleware returns `paymentLink: null` to SF
8. Apex correctly preserves existing link (doesn't overwrite with null) - THIS FIX IS DEPLOYED

### 2.2 Why QB Returns Empty Link
Possible reasons (next agent must investigate):
1. QB Payments "enabled" but not fully activated (needs bank verification, identity check)
2. QB Payments enabled but "Online invoice payments" not turned on in invoice settings
3. Customer record in QB missing email (BillEmail required for payment links)
4. Account type/region doesn't support payment links
5. New Payments setup has activation delay
6. Invoice needs specific flags: AllowOnlineCreditCardPayment, AllowOnlineACHPayment (we set these, but verify)

### 2.3 Evidence from Previous Testing
- Middleware logs showed invoices created successfully
- Same logs showed "Payment link obtained: no"
- Invoice IDs populated in SF correctly
- Only payment link is missing

---

## SECTION 3: CRITICAL WARNINGS (EXPAND INTO PROMINENT WARNINGS)

### 3.1 DO NOT TOUCH THESE FILES
- `force-app/main/default/objects/Opportunity/fields/QB_Payment_Link__c.field-meta.xml`
  - Has `<length>255</length>` which org rejects for URL type
  - Field ALREADY EXISTS in production and works
  - DO NOT try to redeploy this field
- `force-app/main/default/objects/Opportunity/fields/Supplier__c.field-meta.xml`
  - Has different `referenceTo` than org
  - Field ALREADY EXISTS in production
  - DO NOT try to redeploy this field

### 3.2 DO NOT MODIFY TEST CLASSES
- Tests pass (27/27) when deploying single class
- Tests fail when deploying full force-app due to field metadata conflicts
- This is NOT a test bug - it's a deployment scope issue
- Solution: Deploy classes individually, not full force-app

### 3.3 DO NOT REPEAT THESE MISTAKES
- Previous session (Haiku) went off track by:
  - Removing `<length>` attribute from QB_Payment_Link__c
  - Deleting and recreating Supplier__c.field-meta.xml
  - Editing multiple test classes to add Supplier__c
  - Trying to "fix" org configuration issues with code changes
- ALL OF THIS WAS WRONG
- Correct approach: Deploy single class file, investigate QB-side issue

---

## SECTION 4: EXACT NEXT STEPS (EXPAND WITH COMMANDS)

### 4.1 Verify Current Deployment
```bash
# Check middleware health
curl -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" https://sqint.atocomm.eu/api/health

# Expected: {"success":true,"status":"healthy"}
```

### 4.2 Check Middleware Logs (SSH)
```bash
# SSH to server
ssh -p 2323 roman@pve.atocomm.eu
# Password: 3Sd5R069jvuy[3u6yj

# Check logs
tail -100 /tmp/server.log | grep -i "payment\|link\|invoice"
```

### 4.3 Test with New Opportunity
```bash
# 1. Create opportunity
sf data create record --sobject Opportunity \
  --values "Name='Payment Link Test $(date +%H%M)' AccountId=0010600002DhZabAAF CloseDate=2025-12-31 Amount=500 Supplier__c=a0lSo000003QGVdIAO StageName=Prospecting Pricebook2Id=01s060000077i0vAAA" \
  --target-org myorg

# 2. Note the returned ID (006So...)

# 3. Add product (replace OPP_ID)
sf data create record --sobject OpportunityLineItem \
  --values "OpportunityId=OPP_ID PricebookEntryId=01u0600000beGIoAAM Quantity=1 TotalPrice=500" \
  --target-org myorg

# 4. Trigger integration
sf data update record --sobject Opportunity --record-id OPP_ID \
  --values "StageName='Proposal and Agreement'" --target-org myorg

# 5. Wait and check
sleep 60
sf data query --query "SELECT QB_Invoice_ID__c, QB_Payment_Link__c FROM Opportunity WHERE Id='OPP_ID'" --target-org myorg
```

### 4.4 If Payment Link Still Null
1. Check middleware logs for QB response
2. Look for `invoiceLink` in the raw QB API response
3. If QB returns no link, it's QB configuration issue
4. Send Roman the diagnostic message (Section 6)

---

## SECTION 5: DECISION TREE (EXPAND INTO FLOWCHART-STYLE TEXT)

```
START
│
├─ Is middleware healthy?
│  ├─ NO → Restart middleware (see Section 7)
│  └─ YES → Continue
│
├─ Create test opportunity, does QB_Invoice_ID__c populate?
│  ├─ NO → Check middleware logs for errors
│  └─ YES → Continue
│
├─ Does QB_Payment_Link__c populate?
│  ├─ YES → SUCCESS! Payment link working
│  └─ NO → Continue investigation
│
├─ Check middleware logs - what does QB return?
│  ├─ QB returns invoiceLink field with URL → Apex parsing issue (unlikely)
│  ├─ QB returns invoiceLink: null/empty → QB Payments config issue
│  └─ QB returns error → QB API issue
│
└─ If QB config issue → Send diagnostic to Roman (Section 6)
```

---

## SECTION 6: COMMUNICATION TEMPLATES FOR ROMAN (EXPAND EACH)

### 6.1 Diagnostic Request (Russian)
```
Роман, для диагностики нужно проверить настройки в QuickBooks:

1. Зайди в QuickBooks Online → Settings → Account and settings
2. Найди раздел "Payments"
3. Сделай скриншот этого раздела
4. Также зайди в Sales → Invoices → выбери любой счет → проверь есть ли кнопка "Get payment link" или "Send payment reminder"

Отправь скриншоты - это поможет понять почему ссылка не приходит.
```

### 6.2 QB Payments Setup Checklist (Russian)
```
Роман, проверь что в QuickBooks Payments настроено всё:

□ QuickBooks Payments активирован (не просто включен а именно активирован с банком)
□ В настройках счетов: "Online delivery" включено
□ В настройках счетов: "Online payments" включено для Card и Bank transfer
□ У клиента (Smith Company или другой) есть email в поле Bill Email

После проверки создай новый Opportunity и проверь.
```

### 6.3 Success Confirmation Request (Russian)
```
Роман, создай новую Opportunity:
1. Account: Smith Company
2. Amount: любая сумма
3. Добавь Product
4. Stage: "Proposal and Agreement"
5. Подожди 1-2 минуты
6. Проверь поля QB_Invoice_ID__c и QB_Payment_Link__c

Напиши что получилось.
```

---

## SECTION 7: EMERGENCY PROCEDURES (EXPAND WITH FULL COMMANDS)

### 7.1 Restart Middleware
```bash
ssh -p 2323 roman@pve.atocomm.eu
# Password: 3Sd5R069jvuy[3u6yj

cd /opt/qb-integration
pkill -f "node src/server.js"
sleep 2
node src/server.js > /tmp/server.log 2>&1 &
sleep 3

# Verify
curl -H "X-API-Key: UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM=" https://sqint.atocomm.eu/api/health
```

### 7.2 Check QB API Response Directly
```bash
# On middleware server, check what QB returns for an invoice
# Look in logs for the raw response
grep -A 20 "Invoice Response" /tmp/server.log | tail -30
```

### 7.3 Rollback Apex (if needed)
```bash
# Only if deployment breaks something
# The current deployed version is correct - this is for emergency only
git log --oneline force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls
# Find previous working commit
# git show <commit>:force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls > temp.cls
# Then deploy temp.cls
```

---

## SECTION 8: KEY FILE LOCATIONS (EXPAND WITH DESCRIPTIONS)

### 8.1 Local Repo
- Main class: `force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`
- Trigger: `force-app/main/default/triggers/OpportunityQuickBooksTrigger.trigger`
- Progress tracking: `PROGRESS.md`
- This handoff: `NEXT_SESSION_HANDOFF_OUTLINE.md`

### 8.2 Production Server (middleware)
- SSH: `roman@pve.atocomm.eu:2323` (password: `3Sd5R069jvuy[3u6yj`)
- Middleware path: `/opt/qb-integration/`
- API routes: `/opt/qb-integration/src/routes/api.js`
- QB service: `/opt/qb-integration/src/services/quickbooks-api.js`
- SF service: `/opt/qb-integration/src/services/salesforce-api.js`
- Logs: `/tmp/server.log`

### 8.3 Salesforce Org
- Alias: `myorg`
- User: `olga.rybak@atocomm2023.eu`
- URL: `https://customer-inspiration-2543.my.salesforce.com`

---

## SECTION 9: SUCCESS CRITERIA (EXPAND INTO CHECKLIST)

### 9.1 Project Complete When
- [ ] QB_Invoice_ID__c populates on new opportunities ✅ (ALREADY WORKING)
- [ ] QB_Payment_Link__c populates with valid URL (BLOCKED BY QB CONFIG)
- [ ] Roman confirms both fields work
- [ ] End-to-end test documented

### 9.2 This Session Complete When
- [ ] Diagnosed why QB returns empty payment link
- [ ] Communicated findings to Roman
- [ ] Got response/action from Roman on QB Payments config
- [ ] OR documented that we're blocked waiting for Roman

---

## SECTION 10: CONTEXT FOR HAIKU (CRITICAL)

### 10.1 Your Role
- You are expanding this outline into a full handoff document
- DO NOT execute any deployment commands
- DO NOT modify any code
- DO NOT try to "fix" anything
- ONLY expand this outline into comprehensive documentation

### 10.2 Expansion Instructions
- Each section header becomes a major section
- Each bullet point becomes a detailed paragraph
- Each code block stays as-is (copy exactly)
- Add explanatory text around code blocks
- Make warnings VERY prominent (use emoji, bold, boxes)
- Total output should be 3-5x longer than this outline

### 10.3 Tone
- Authoritative and precise
- Assume next agent is competent but unfamiliar with project
- Err on side of too much detail
- Never ambiguous - always specific

---

*END OF OUTLINE - Haiku: Expand each section thoroughly*
