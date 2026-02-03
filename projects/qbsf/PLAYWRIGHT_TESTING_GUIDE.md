# 🎯 PLAYWRIGHT BROWSER TESTING GUIDE
## Salesforce-QuickBooks Integration | Human-like Actions Only

**CRITICAL:** Only use human-like browser actions (click, type, wait). NO JavaScript execution.

---

## 🚀 STEP 1: CREATE SALESFORCE ACCOUNT

**URL:** https://atocomm2023-dev-ed.develop.my.salesforce.com/  
**Login:** olga.rybak@atocomm2023.eu

**Actions:**
1. Navigate to Accounts tab
2. Click "New" button
3. Fill fields:
   - Account Name: `TEST INTEGRATION COMPANY`
   - Email: `test@integration.ru`
   - Phone: `+7 555 123 4567`
   - Billing Street: `123 Test Street`
   - Billing City: `Moscow`
   - Billing State: `Moscow`
   - Billing Postal Code: `123456`
   - Billing Country: `Russia`
4. Click "Save"
5. Take screenshot of created Account

---

## 🔥 STEP 2: CREATE OPPORTUNITY & TRIGGER INTEGRATION

**Actions:**
1. Navigate to Opportunities tab
2. Click "New" button  
3. Fill required fields:
   - Opportunity Name: `TEST INVOICE INTEGRATION`
   - Account Name: Select `TEST INTEGRATION COMPANY`
   - Stage: `Prospecting` (IMPORTANT: NOT "Proposal and Agreement")
   - Close Date: Any future date (click date picker)
   - Amount: `50000`
4. Click "Save"
5. Click "Edit" button
6. Change Stage to: `Proposal and Agreement`
7. Click "Save"
8. Wait 60 seconds
9. Refresh page (F5 or refresh button)
10. Look for QB Invoice ID field (should be populated)
11. Take screenshot of Opportunity with QB Invoice ID

---

## 💰 STEP 3: VERIFY QUICKBOOKS INVOICE

**URL:** https://quickbooks.intuit.com/  
**Login:** Use QuickBooks credentials

**Actions:**
1. Navigate to Sales → Invoices
2. Look for invoice with customer `TEST INTEGRATION COMPANY`
3. Click on the invoice to open details
4. Verify:
   - Customer: TEST INTEGRATION COMPANY
   - Amount: 50,000
   - Status: Unpaid
5. Take screenshot of invoice details

---

## 💵 STEP 4: PROCESS PAYMENT IN QUICKBOOKS

**Actions:**
1. In the open invoice, click "Receive Payment" button
2. Fill payment form:
   - Payment Method: Select "Cash" from dropdown
   - Payment Amount: Leave as full amount
   - Payment Date: Click today's date
3. Click "Save and close"
4. Verify invoice now shows "Paid" status
5. Take screenshot of paid invoice

---

## 🔄 STEP 5: VERIFY SALESFORCE PAYMENT SYNC

**Actions:**
1. Return to Salesforce browser tab
2. Navigate back to the TEST INVOICE INTEGRATION opportunity
3. Wait 10 minutes (scheduled sync)
4. Refresh page every 2 minutes
5. Look for populated payment fields:
   - QB Payment Status
   - QB Payment Date
   - QB Payment Amount
6. Take screenshot when payment fields are populated

---

## ✅ SUCCESS VALIDATION

**Required Screenshots:**
1. Salesforce Account creation
2. Opportunity with QB Invoice ID
3. QuickBooks invoice details
4. QuickBooks paid invoice
5. Salesforce Opportunity with payment data

**Expected Timings:**
- Invoice creation: 30-60 seconds
- Payment sync: 5-15 minutes

---

## 🚨 HUMAN-LIKE BEHAVIOR RULES

- Use click() not evaluate()
- Use type() not fill()
- Use proper wait times between actions
- Take screenshots at each checkpoint
- Refresh pages manually, don't use JavaScript reload
- Navigate using visible UI elements only
- Wait for elements to be visible before interacting

**NO JavaScript execution - Pure human simulation only!**