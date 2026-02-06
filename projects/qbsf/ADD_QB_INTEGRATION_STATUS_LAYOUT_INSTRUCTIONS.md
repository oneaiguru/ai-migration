# Instructions to Add QB Integration Status Fields to Opportunity Layout

Purpose
- Make Phase 1 observability fields visible on the Opportunity page.
- Add related lists for QB logs so errors are visible without server access.

Step 1: Open the Opportunity Layout
1. Go to Setup.
2. Open Object Manager.
3. Select Opportunity.
4. Click Page Layouts.
5. Edit the primary layout used by Roman (often "Opportunity Layout").

Step 2: Add a "QB Integration Status" Section
1. In the layout editor, select Section.
2. Drag it to the layout (recommended near Description).
3. Name it "QB Integration Status".
4. Choose a 2-column layout and save the section.

Step 3: Add the Fields
Add these fields to the new section:
- QB_Sync_Status__c
- QB_Last_Attempt__c
- QB_Invoice_ID__c
- QB_Payment_Link__c
- QB_Payment_Link_Status__c
- QB_Skip_Reason__c
- QB_Error_Code__c
- QB_Error_Message__c
- QB_Correlation_Id__c

Step 4: Add Related Lists (Logs)
1. In the Related Lists palette, add:
   - QB_Integration_Log__c
   - QB_Integration_Error_Log__c
2. Move them near other related lists and save.

Step 5: Verify
1. Open any Opportunity with Stage = "Proposal and Agreement".
2. Confirm the new fields are visible and populated after sync.
3. Confirm log related lists appear and show entries when errors occur.

Step 6: Create the "QB Integration Issues" List View
1. Go to the Opportunities tab.
2. Open List View Controls (gear icon) and select New.
3. Name the view "QB Integration Issues".
4. Filter: `QB_Sync_Status__c` equals `Error` OR `Warning`.
5. Save and share as needed.

Optional: Lightning App Builder
If Page Layout changes do not show in the Lightning record page:
1. Open an Opportunity record.
2. Click the gear icon and select Edit Page.
3. Add a Field Section component with the fields above.
4. Save and Activate.
