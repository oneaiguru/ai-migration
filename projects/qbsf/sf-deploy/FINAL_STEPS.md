# Final Steps to Complete the Integration

## ✅ Deployed Components
1. Custom Field: QB_Invoice_ID__c
2. Apex Class: QuickBooksInvoker (with test)
3. Lightning Web Component: createQuickBooksInvoice

## 📋 Manual Steps Required

### 1. Create the Quick Action in Salesforce
1. Go to Setup → Object Manager → Opportunity
2. Click "Buttons, Links, and Actions"
3. Click "New Action"
4. Fill in:
   - Action Type: Lightning Web Component
   - Lightning Web Component: c:createQuickBooksInvoice
   - Height: 250 px
   - Label: Create QuickBooks Invoice
   - Name: Create_QuickBooks_Invoice
5. Click Save

### 2. Add Quick Action to Page Layout
1. Go to Setup → Object Manager → Opportunity → Page Layouts
2. Edit your layout
3. From "Mobile & Lightning Experience Actions" in the palette
4. Drag "Create QuickBooks Invoice" to the actions section
5. Save

### 3. Create Remote Site Setting
1. Go to Setup → Remote Site Settings
2. Click "New Remote Site"
3. Enter:
   - Remote Site Name: QuickBooksMiddleware
   - Remote Site URL: http://localhost:3000
   - Active: ✓
4. Save

### 4. Test the Integration
1. Start middleware:
   cd /Users/m/git/clients/qbsf/final-integration
   npm start
2. Go to any Opportunity
3. Click "Create QuickBooks Invoice" button
4. Verify invoice is created in QuickBooks
EOF < /dev/null