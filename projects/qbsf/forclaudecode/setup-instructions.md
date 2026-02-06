# Step-by-Step Salesforce-QuickBooks Integration Setup

## 1. File Organization

Your first issue is that files are in the wrong locations. Save this script as `setup.sh` in your project root and run it:

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Move `simple-oauth-manager.js` to `services/oauth-manager.js` (matching the import paths)
- Move `updated-quick-check.js` to `scripts/quick-check.js`
- Create a proper `.env` file with your QuickBooks credentials
- Create the `data` directory for token storage

## 2. Salesforce Connected App Setup

For Salesforce, you'll need to:

1. **Log in to Salesforce Developer Account** or your production org
2. **Navigate to Setup → App Manager**
3. **Click "New Connected App"**
4. Fill in the required fields:
   - **Connected App Name**: QuickBooks Integration
   - **API Name**: QuickBooks_Integration
   - **Contact Email**: Your email
   - **Enable OAuth Settings**: Check this box
   - **Callback URL**: `http://localhost:3000/auth/salesforce/callback`
   - **Selected OAuth Scopes**:
     - Manage user data via APIs (api)
     - Perform requests at any time (refresh_token, offline_access)
5. **Save** the connected app
6. **Copy the Consumer Key and Consumer Secret** to your `.env` file as:
   ```
   SF_CLIENT_ID=your_consumer_key
   SF_CLIENT_SECRET=your_consumer_secret
   ```

## 3. Testing the Connection

After setting up the project structure and configuring your credentials:

1. **Run the connection checker**:
   ```bash
   node scripts/quick-check.js
   ```

2. **Follow the QuickBooks authentication URL** displayed in the console:
   - Complete the authorization flow
   - You'll be redirected back to your callback URL

3. **Follow the Salesforce authentication URL** displayed in the console:
   - Log in to Salesforce
   - Authorize the app
   - You'll be redirected back to your callback URL

4. **Run the checker again** to verify both connections are established:
   ```bash
   node scripts/quick-check.js
   ```

## 4. Start the Server

Once both services are authenticated:

```bash
npm start
```

The server should start on port 3000 (or your configured PORT).

## 5. Create a Custom Field in Salesforce

To store QuickBooks invoice IDs in Salesforce:

1. **Navigate to Setup → Object Manager → Opportunity**
2. **Click "Fields & Relationships"**
3. **Click "New"**
4. **Select "Text" as the field type**
5. Set the field details:
   - **Field Label**: QuickBooks Invoice ID
   - **Length**: 20
   - **Field Name**: QB_Invoice_ID
6. **Save** the field

## 6. Testing the Integration

Now you can test creating an invoice:

1. **Find an opportunity ID** in your Salesforce org
2. **Find your QuickBooks realm ID** (from running the check script)
3. **Make a request to create an invoice**:

```bash
curl -X POST http://localhost:3000/api/create-invoice \
  -H "Content-Type: application/json" \
  -H "X-API-Key: quickbooks_salesforce_api_key_2025" \
  -d '{
    "opportunityId": "YOUR_SALESFORCE_OPPORTUNITY_ID",
    "quickbooksRealmId": "YOUR_QUICKBOOKS_REALM_ID"
  }'
```

If successful, this will:
- Fetch the opportunity details from Salesforce
- Create an invoice in QuickBooks
- Update the Salesforce opportunity with the QuickBooks invoice ID
