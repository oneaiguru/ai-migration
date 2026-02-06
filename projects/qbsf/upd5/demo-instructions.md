# Demo Setup Instructions

## Pre-Demo Setup

1. **Configure Environment:**
   ```bash
   cp .env.demo .env
   # Edit .env with actual credentials
   ```

2. **Start the Server:**
   ```bash
   npm install
   npm start
   ```

3. **Authenticate Services:**
   - Open browser: http://localhost:3000/auth/salesforce
   - Complete Salesforce OAuth
   - Open browser: http://localhost:3000/auth/quickbooks  
   - Complete QuickBooks OAuth

4. **Deploy Salesforce Components:**
   - Deploy `QuickBooksInvoiceCreator.cls`
   - Deploy `QuickBooksCallout.cls`
   - Add Remote Site Setting for middleware URL
   - Create Quick Action on Opportunity object
   - Add Quick Action to Opportunity page layout

5. **Test Connection:**
   ```bash
   ./test-demo.sh
   ```

## Demo Script

### Part 1: Create Invoice
1. Open Salesforce Opportunity
2. Click "Create QuickBooks Invoice" button
3. Show terminal logs displaying:
   - Customer creation/lookup
   - Invoice creation
   - Salesforce update
4. Show QuickBooks with new invoice

### Part 2: Process Payment
1. In QuickBooks, mark invoice as paid
2. In terminal, run payment check:
   ```bash
   curl -X POST http://localhost:3000/api/check-payment-status \
     -H "X-API-Key: demo_api_key_2024" \
     -H "Content-Type: application/json" \
     -d '{"invoiceId": "INVOICE_ID"}'
   ```
3. Show terminal logs displaying:
   - Payment detection
   - Opportunity update
4. Refresh Salesforce to show "Closed Won" status

## Key Demo Points
- Real-time invoice creation
- Immediate payment detection
- Full audit trail in logs
- Error handling (if needed)

## Troubleshooting
- Check logs: `tail -f logs/combined.log`
- Verify connections: GET /api/test-connection
- Manual payment check if webhook fails
