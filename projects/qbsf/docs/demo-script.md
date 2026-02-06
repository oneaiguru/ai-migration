# Demo Script: Salesforce-QuickBooks Integration

## Preparation Checklist

- [ ] Ensure middleware server is running and accessible
- [ ] Verify both Salesforce and QuickBooks authentications are working
- [ ] Create at least one test opportunity in Salesforce marked as "Closed Won"
- [ ] Have the dashboard open in a browser tab
- [ ] Have Salesforce open in another browser tab
- [ ] Have QuickBooks open in a third browser tab
- [ ] Test all manual controls before the demo

## 1. Introduction (2 minutes)

**Goal:** Provide an overview of the integration and its benefits.

* "Today, I'll demonstrate our Salesforce-QuickBooks integration that we've developed based on your requirements."
* "This integration automates the process of creating invoices in QuickBooks whenever an opportunity is marked as 'Closed Won' in Salesforce."
* "It also tracks payment status in QuickBooks and updates the corresponding opportunity in Salesforce when payment is received."
* "The benefits include reduced manual data entry, fewer errors, and better cash flow visibility."

## 2. Architecture Overview (3 minutes)

**Goal:** Briefly explain how the system is designed.

* "The integration consists of three main components:"
  1. "Salesforce components - custom fields and trigger on the Opportunity object"
  2. "QuickBooks connection - API integration with your QuickBooks Online account"
  3. "Middleware server - the bridge between Salesforce and QuickBooks that handles authentication, data transformation, and scheduled jobs"

* "The middleware server is built with Node.js and can be deployed on-premises or in the cloud based on your preference."

## 3. Dashboard Demonstration (5 minutes)

**Goal:** Show the admin dashboard and monitoring capabilities.

* Navigate to the dashboard URL
* Point out key features:
  * "Here we can see the current connection status with both systems"
  * "Recent activity shows the latest transactions processed by the integration"
  * "System logs provide detailed information for troubleshooting"
  * "Manual controls allow you to trigger processes on demand"

* "This dashboard gives you full visibility into the integration status and operation."

## 4. End-to-End Flow Demonstration (10 minutes)

**Goal:** Show the complete process from Salesforce opportunity to QuickBooks invoice and payment.

### 4.1 Opportunity to Invoice Flow

* "Now I'll demonstrate how an opportunity in Salesforce gets converted to an invoice in QuickBooks."
* Open Salesforce and navigate to the test opportunity
* "Here's our test opportunity. Notice that it's marked as 'Closed Won' and has line items with products and pricing."
* Point out the custom field "QB Invoice ID" which is currently empty
* "I'll now trigger the invoice creation process from our dashboard."
* Go to dashboard and click the "Process Eligible Opportunities" button
* "The system is now retrieving the opportunity data from Salesforce, creating a customer in QuickBooks if needed, and generating an invoice."
* "Let's refresh the opportunity in Salesforce..." (refresh the page)
* "As you can see, the QB Invoice ID field is now populated with the QuickBooks invoice ID."
* Open QuickBooks and navigate to the Sales > Invoices section
* "Now let's look at QuickBooks... Here's the newly created invoice with all the line items from our Salesforce opportunity."

### 4.2 Payment Status Update Flow

* "Next, let's see how payment status is tracked and updated."
* In QuickBooks, mark the invoice as paid
* "I've just recorded a payment for this invoice in QuickBooks. Now I'll trigger the payment status check."
* Go to dashboard and click the "Check Payment Status" button
* "The system is now checking QuickBooks for any payments on invoices that were previously created."
* "Let's refresh the opportunity in Salesforce again..." (refresh the page)
* "Now you can see that the payment information has been updated in Salesforce, including the payment date, amount, and reference number."

## 5. Automated Scheduling (3 minutes)

**Goal:** Explain how the automated processes work.

* "While I've been manually triggering these processes for demonstration purposes, in production, they run automatically on a schedule."
* "Invoice creation runs every 2 hours by default, checking for any new 'Closed Won' opportunities."
* "Payment status checking runs once daily, typically overnight, to update Salesforce with any payments received in QuickBooks."
* "These schedules are configurable based on your business needs."

## 6. Error Handling and Notifications (2 minutes)

**Goal:** Show how the system handles errors and notifications.

* "The integration includes comprehensive error handling to ensure reliability."
* "If any issues occur, they're logged in the system and visible on the dashboard."
* "Critical errors can trigger email notifications to designated administrators."
* "In case of authentication issues, the system will attempt to refresh tokens automatically."

## 7. Q&A and Next Steps (5 minutes)

**Goal:** Address any questions and outline next steps.

* Open the floor for questions
* Cover next steps:
  * "Based on your feedback today, we'll make any necessary adjustments."
  * "We can deploy this to production following your approval."
  * "We recommend a brief training session for your accounting team."
  * "We provide ongoing support and maintenance for the integration."

## Fallback Options

If any issues arise during the demo, use these fallback options:

1. **If invoice creation fails:**
   * "Let me show you a previously created invoice that demonstrates the same functionality."
   * Navigate to a pre-created example in both Salesforce and QuickBooks.

2. **If payment status update fails:**
   * "I have a pre-configured example that shows how payment information appears in Salesforce."
   * Navigate to a completed example in Salesforce.

3. **If dashboard isn't accessible:**
   * "We can still demonstrate the core functionality through the API directly."
   * Use the API testing script to trigger processes.

## Follow-up Items

* Provide documentation package to the client
* Schedule training session for accounting team
* Discuss production deployment timeline
* Review any customization requests from the demo
