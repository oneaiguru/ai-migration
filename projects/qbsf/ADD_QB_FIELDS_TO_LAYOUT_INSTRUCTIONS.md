# 📋 Instructions to Add QB Payment Fields to Opportunity Layout

## 🎯 For Roman: Add QuickBooks Fields to Opportunity Page

These fields exist but are not visible on your Opportunity page. Follow these steps:

### Step 1: Navigate to Object Manager
1. Go to **Setup** (gear icon ⚙️ in top right)
2. Type "Object Manager" in Quick Find
3. Click **Object Manager**
4. Search for **Opportunity**
5. Click on **Opportunity**

### Step 2: Edit Page Layout
1. Click **Page Layouts** on the left menu
2. Find your main Opportunity layout (usually "Opportunity Layout")
3. Click the dropdown arrow ▼ next to it
4. Select **Edit**

### Step 3: Add QuickBooks Section
1. In the layout editor, find **Section** in the palette
2. Drag **Section** to where you want QB fields (recommend after Description)
3. Name it: **"QuickBooks Integration"**
4. Choose: **2-Column layout**
5. Click **OK**

### Step 4: Add the Fields
Find these fields in the field palette and drag them to the new section:

**Left Column:**
- 🔢 **QB Invoice ID** (qb_invoice_id__c)
- 💰 **QB Payment Amount** (qb_payment_amount__c)
- 📅 **QB Payment Date** (qb_payment_date__c)

**Right Column:**
- 💳 **QB Payment Method** (qb_payment_method__c)
- 📝 **QB Payment Reference** (qb_payment_reference__c)

### Step 5: Save
1. Click **Save** button
2. Click **Yes** to confirm

### Step 6: Verify
1. Go to any Opportunity record
2. You should now see the **QuickBooks Integration** section
3. Fields will populate when payment is received

---

## 🔍 What You Should See

After adding fields, your Opportunity page should show:

```
┌─────────────────────────────────────────┐
│      QuickBooks Integration             │
├─────────────────────────────────────────┤
│ QB Invoice ID: 2050                     │
│ QB Payment Amount: [empty until paid]   │
│ QB Payment Date: [empty until paid]     │
│                                          │
│ QB Payment Method: [empty until paid]   │
│ QB Payment Reference: [empty until paid]│
└─────────────────────────────────────────┘
```

---

## ✅ Quick Alternative: Use Lightning App Builder

If the above doesn't work, try Lightning App Builder:

1. Open any Opportunity record
2. Click ⚙️ → **Edit Page**
3. Find **Field Section** component
4. Drag it to the page
5. Configure it to show QB fields
6. Save and Activate

---

## 🚨 Important Notes

- These fields already exist in the system
- They just need to be added to the page layout
- Once added, they will show payment data when invoices are paid in QuickBooks
- The sync checks every 5 minutes for payment updates

---

## 📞 Testing After Adding Fields

1. Mark an invoice as **Paid** in QuickBooks
2. Wait 5 minutes (or trigger manual sync)
3. Check the Opportunity - fields should populate
4. Opportunity should change to **Closed Won**

---

*Created: August 25, 2025*
*For: Roman Kapralov*
*Purpose: Make QB payment fields visible on Opportunity page*