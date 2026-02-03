# Salesforce-QuickBooks Integration

This project provides a simple integration between Salesforce and QuickBooks, allowing you to create QuickBooks invoices from Salesforce opportunities.

## Setup Instructions

1. **Run the setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Update the `.env` file** with your Salesforce credentials:
   ```
   SF_CLIENT_ID=YOUR_SALESFORCE_CLIENT_ID
   SF_CLIENT_SECRET=YOUR_SALESFORCE_CLIENT_SECRET
   ```

3. **Run the OAuth connection checker** to get authentication URLs:
   ```bash
   node scripts/quick-check.js
   ```

4. **Complete authentication for both services**:
   - Open the QuickBooks authentication URL in your browser
   - Complete the QuickBooks login and authorization
   - Open the Salesforce authentication URL in your browser
   - Complete the Salesforce login and authorization

5. **Start the server**:
   ```bash
   npm start
   ```

## OAuth Flow

The integration uses OAuth 2.0 for authentication with both services:

### QuickBooks OAuth Flow:
1. User is redirected to QuickBooks auth page
2. User authorizes the application
3. QuickBooks redirects back with an authorization code and realmId
4. The code is exchanged for access and refresh tokens
5. Tokens are stored locally for future use

### Salesforce OAuth Flow:
1. User is redirected to Salesforce login page
2. User authorizes the application
3. Salesforce redirects back with an authorization code
4. The code is exchanged for access and refresh tokens
5. Tokens are stored locally for future use

## API Endpoints

### Authentication
- `GET /auth/quickbooks` - Start QuickBooks OAuth flow
- `GET /auth/salesforce` - Start Salesforce OAuth flow
- `GET /auth/status` - Check connection status for both services

### Integration
- `POST /api/create-invoice` - Create a QuickBooks invoice from a Salesforce opportunity

## Testing the Integration

To create an invoice from a Salesforce opportunity, use the following request:

```bash
curl -X POST http://localhost:3000/api/create-invoice \
  -H "Content-Type: application/json" \
  -H "X-API-Key: quickbooks_salesforce_api_key_2025" \
  -d '{
    "opportunityId": "YOUR_SALESFORCE_OPPORTUNITY_ID",
    "quickbooksRealmId": "YOUR_QUICKBOOKS_REALM_ID"
  }'
```

## Troubleshooting

- If the connection fails, check that your redirect URIs exactly match those configured in the QuickBooks and Salesforce developer portals
- Ensure that your Salesforce connected app has the required API permissions 
- For QuickBooks, verify that you're using the correct environment (sandbox vs. production)
