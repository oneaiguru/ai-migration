# Salesforce-QuickBooks Integration Project Structure

## Required Folder Structure

```
salesforce-quickbooks-integration/
├── src/
│   ├── config/
│   │   └── index.js
│   ├── middleware/
│   │   └── error-handler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── api.js
│   │   ├── webhook.js
│   │   ├── admin.js
│   │   └── scheduler.js
│   ├── services/
│   │   ├── oauth-manager.js
│   │   ├── scheduler.js
│   │   ├── salesforce-api.js
│   │   └── quickbooks-api.js
│   ├── utils/
│   │   └── logger.js
│   ├── app.js
│   └── server.js
├── data/
│   └── tokens.json
├── logs/
│   ├── combined.log
│   ├── error.log
│   └── scheduler/
│       ├── invoice-creation.log
│       └── payment-check.log
├── public/
│   └── dashboard.html
├── scripts/
│   └── setup.sh
├── tests/
│   └── connection-test.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Folders and Files NOT Needed

Based on the code analysis, you should ignore or remove these folders/files:

### Folders to Ignore:
- `/automated-integration/` - This is the old implementation 
- `/deployment/` - Contains documentation, not needed
- `/final-integration/` - Duplicate implementation
- `/PKCE/` - Contains draft code
- `/internal_tools/` - Monitoring dashboards (optional)

### Files to Ignore:
- All scheduler-related files (we're implementing webhook-based processing)
- Authentication setup files (we already have working auth)
- Dashboard and monitoring files (optional)
- Legacy webhook implementations

### Keep These Working Files:
- OAuth manager from the existing implementation
- Webhook route that contains working integration logic
- Config files that have production credentials
- Existing database/token storage

The new implementation will use webhooks for real-time processing instead of scheduled tasks, making it more efficient and immediate.

## Environment Variables Required

Create a `.env` file with these variables:

```
# Salesforce Configuration
SF_CLIENT_ID=your_salesforce_client_id
SF_CLIENT_SECRET=your_salesforce_client_secret
SF_REDIRECT_URI=http://localhost:3000/auth/salesforce/callback
SF_LOGIN_URL=https://login.salesforce.com

# QuickBooks Configuration
QB_CLIENT_ID=your_quickbooks_client_id
QB_CLIENT_SECRET=your_quickbooks_client_secret
QB_REDIRECT_URI=http://localhost:3000/auth/quickbooks/callback
QB_ENVIRONMENT=sandbox

# Security
API_KEY=your_api_key_here
TOKEN_ENCRYPTION_KEY=32_character_key_for_encryption

# Server
PORT=3000
NODE_ENV=development
MIDDLEWARE_BASE_URL=http://localhost:3000