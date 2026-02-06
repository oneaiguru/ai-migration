# Middleware Server Setup

The middleware server acts as a bridge between Salesforce and QuickBooks, handling API communication and scheduling tasks.

## 1. Prepare Server Environment

You'll need a server with:
- Node.js v20+ installed (v14, v16, and v18 have reached end-of-life as of May 2025)
- HTTPS support recommended for production
- Publicly accessible URL

For testing, you can run locally on your Mac, but for production, consider hosting on Heroku, AWS, or similar services.

## 2. Setup Using Provided Script

The project includes a setup script that will handle most of the configuration:

```bash
# Navigate to your project directory
cd /path/to/1000011

# Make the setup script executable
chmod +x setup-script.sh

# Run the setup script
./setup-script.sh
```

The script will prompt you for:
- Salesforce OAuth credentials (Client ID, Secret, Redirect URI)
- QuickBooks OAuth credentials (Client ID, Secret, Redirect URI)
- Server configuration (port, environment)

## 3. Manual Setup (Alternative)

If the script doesn't work, you can set up manually:

```bash
# Navigate to middleware directory
cd /path/to/1000011

# Install dependencies
npm install

# Create .env file
touch .env
```

Edit the `.env` file with the following content:

```
PORT=3000
NODE_ENV=production

# Salesforce credentials
SF_CLIENT_ID=your_salesforce_client_id
SF_CLIENT_SECRET=your_salesforce_client_secret
SF_REDIRECT_URI=https://your-middleware.com/auth/salesforce/callback
SF_LOGIN_URL=https://login.salesforce.com

# QuickBooks credentials
QB_CLIENT_ID=your_quickbooks_client_id
QB_CLIENT_SECRET=your_quickbooks_client_secret
QB_REDIRECT_URI=https://your-middleware.com/auth/quickbooks/callback
QB_ENVIRONMENT=production

# Security
API_KEY=your_generated_api_key
TOKEN_ENCRYPTION_KEY=your_32_byte_encryption_key

# Scheduler
PAYMENT_CHECK_CRON=0 1 * * *

# Base URL (for production)
MIDDLEWARE_BASE_URL=https://your-middleware.com
```

Generate secure keys with:

```javascript
// Run in Node.js console
const crypto = require('crypto');
console.log('API Key:', crypto.randomBytes(24).toString('hex'));
console.log('Encryption Key:', crypto.randomBytes(32).toString('hex'));
```

## 4. Start the Middleware Server

For development/testing:

```bash
npm run dev
```

For production:

```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js
```

Verify the server is running:

```bash
# Check status
pm2 status

# View logs
pm2 logs sf-qb-integration
```

## 5. Verify Middleware Health

```bash
# Replace YOUR_API_KEY with the API key generated earlier
curl -H "X-API-Key: YOUR_API_KEY" http://localhost:3000/api/health

# Expected response:
# {
#   "success": true,
#   "status": "healthy",
#   "timestamp": "2025-05-08T12:00:00.000Z"
# }
```

## 6. Optional: Update Salesforce API Version

The integration uses Salesforce API v56.0, which is fully supported (Salesforce supports API versions 31.0 through 63.0). If you want to use the latest features, you can optionally update the API version:

1. Open `src/services/salesforce-api.js`
2. Change `this.apiVersion = 'v56.0'` to `this.apiVersion = 'v63.0'`

This is not required but can give you access to newer Salesforce API features if needed.
