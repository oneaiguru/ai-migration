# Salesforce-QuickBooks Integration Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Salesforce Developer Account
- QuickBooks Developer Account
- Git

## Setup Steps

### 1. Project Setup

```bash
# Clone or create project directory
mkdir salesforce-quickbooks-integration
cd salesforce-quickbooks-integration

# Initialize npm project (if not already done)
npm init -y

# Install dependencies
npm install

# Create required directories
mkdir -p src/routes src/services src/middleware data

# Copy environment example
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file with your actual credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
MIDDLEWARE_BASE_URL=http://localhost:3000

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

# API Security
API_KEY=your_secure_api_key_here

# Demo Mode (set to false for production)
DEMO_MODE=true
```

### 3. Salesforce Setup

1. Go to Salesforce Setup > Apps > App Manager
2. Create a New Connected App:
   - Name: `QuickBooks Integration`
   - Enable OAuth Settings: Yes
   - Callback URL: `http://localhost:3000/auth/salesforce/callback`
   - Selected OAuth Scopes: `api`, `refresh_token`
3. Copy the Consumer Key and Consumer Secret to your `.env` file

### 4. QuickBooks Setup

1. Go to https://developer.intuit.com
2. Create a new app:
   - Select QuickBooks Online and Payments
   - Development or Production keys based on your needs
3. In the app settings:
   - Add Redirect URI: `http://localhost:3000/auth/quickbooks/callback`
4. Copy the Client ID and Client Secret to your `.env` file

### 5. Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 6. Authenticate Services

1. Visit `http://localhost:3000/auth/salesforce` to authenticate with Salesforce
2. Visit `http://localhost:3000/auth/quickbooks` to authenticate with QuickBooks
3. Check authentication status: `http://localhost:3000/auth/status`

### 7. Test the Integration

#### Create Invoice (Demo Mode)
```bash
curl -X POST http://localhost:3000/api/create-invoice \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "opportunityId": "006XX000012345ABC",
    "salesforceInstance": "https://yourinstance.salesforce.com",
    "quickbooksRealm": "1234567890"
  }'
```

#### Check Payment Status (Demo Mode)
```bash
curl -X POST http://localhost:3000/api/check-payment-status \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "salesforceInstance": "https://yourinstance.salesforce.com",
    "quickbooksRealm": "1234567890"
  }'
```

### 8. Next Steps

1. Set `DEMO_MODE=false` in `.env` to use real API connections
2. Implement the actual API integration logic in `src/routes/api.js`
3. Add error handling and logging
4. Set up monitoring and alerts
5. Deploy to production environment

## Troubleshooting

### Common Issues

1. **Authentication fails**
   - Check your OAuth credentials
   - Ensure redirect URIs match exactly
   - For Salesforce, make sure IP restrictions allow your server

2. **API key not working**
   - Ensure the `X-API-Key` header matches the value in `.env`
   - Check for trailing spaces in the API key

3. **Token storage issues**
   - Ensure the `data` directory has write permissions
   - Check if `tokens.json` is created properly

## Security Best Practices

1. Never commit `.env` file to version control
2. Use strong, unique API keys
3. Enable HTTPS in production
4. Implement rate limiting
5. Add request validation and sanitization
6. Use environment-specific configurations
7. Regularly rotate OAuth tokens