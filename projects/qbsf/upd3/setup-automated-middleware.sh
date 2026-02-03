#!/bin/bash
# Script to set up the automated Salesforce-QuickBooks integration middleware
# This script focuses on creating a headless solution that runs in the background

# Exit on any error
set -e

echo "Setting up Automated Salesforce-QuickBooks Integration Middleware..."

# Define base directories
BASE_DIR="/Users/m/git/clients/qbsf"
SOURCE_DIR="$BASE_DIR/upd3"
TARGET_DIR="$BASE_DIR/automated-integration"

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$TARGET_DIR/src/config"
mkdir -p "$TARGET_DIR/src/middleware"
mkdir -p "$TARGET_DIR/src/routes"
mkdir -p "$TARGET_DIR/src/services"
mkdir -p "$TARGET_DIR/src/utils"
mkdir -p "$TARGET_DIR/logs"
mkdir -p "$TARGET_DIR/logs/scheduler"
mkdir -p "$TARGET_DIR/data"

# Copy files with proper naming
echo "Copying core files..."
cp "$SOURCE_DIR/app.js.js" "$TARGET_DIR/src/app.js"
cp "$SOURCE_DIR/server.js.js" "$TARGET_DIR/src/server.js"
cp "$SOURCE_DIR/api.js.js" "$TARGET_DIR/src/routes/api.js"
cp "$SOURCE_DIR/webhook.js.js" "$TARGET_DIR/src/routes/webhook.js"
cp "$SOURCE_DIR/routes-scheduler.js.js" "$TARGET_DIR/src/routes/scheduler.js"
cp "$SOURCE_DIR/scheduler.js.js" "$TARGET_DIR/src/services/scheduler.js"
cp "$SOURCE_DIR/README.md.md" "$TARGET_DIR/README.md"

# Reuse existing files from the final-integration directory
echo "Copying additional required files..."
cp "$BASE_DIR/final-integration/src/config/index.js" "$TARGET_DIR/src/config/index.js"
cp "$BASE_DIR/final-integration/src/middleware/error-handler.js" "$TARGET_DIR/src/middleware/error-handler.js"
cp "$BASE_DIR/final-integration/src/utils/logger.js" "$TARGET_DIR/src/utils/logger.js"
cp "$BASE_DIR/final-integration/src/routes/auth.js" "$TARGET_DIR/src/routes/auth.js"

# Create oauth-manager service
echo "Creating OAuth manager service..."
cat > "$TARGET_DIR/src/services/oauth-manager.js" << 'EOL'
/**
 * OAuth Manager for handling authentication with Salesforce and QuickBooks
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');

class OAuthManager {
  constructor() {
    this.tokenFile = path.join(__dirname, '../../data/tokens.json');
    this.tokens = this.initializeTokenStorage();
  }

  /**
   * Initialize token storage file
   */
  initializeTokenStorage() {
    try {
      // Ensure the data directory exists
      const dataDir = path.dirname(this.tokenFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Create token file if it doesn't exist
      if (!fs.existsSync(this.tokenFile)) {
        const initialTokens = {
          salesforce: {},
          quickbooks: {}
        };
        fs.writeFileSync(this.tokenFile, JSON.stringify(initialTokens, null, 2));
        return initialTokens;
      }

      // Read existing tokens
      const tokensData = fs.readFileSync(this.tokenFile, 'utf8');
      return JSON.parse(tokensData);
    } catch (error) {
      logger.error('Error initializing token storage:', error);
      return { salesforce: {}, quickbooks: {} };
    }
  }

  /**
   * Save tokens to storage
   */
  saveTokens(tokens) {
    try {
      fs.writeFileSync(this.tokenFile, JSON.stringify(tokens, null, 2));
    } catch (error) {
      logger.error('Error saving tokens:', error);
    }
  }

  /**
   * Check if Salesforce token is valid and refresh if needed
   */
  async getSalesforceAccessToken(instanceUrl) {
    const tokens = this.initializeTokenStorage();
    
    if (!tokens.salesforce[instanceUrl]) {
      throw new Error(`No Salesforce tokens found for instance ${instanceUrl}`);
    }

    const sfTokens = tokens.salesforce[instanceUrl];
    
    // Check if token is expired
    if (Date.now() >= sfTokens.expiresAt) {
      // Token is expired, refresh it
      try {
        logger.info(`Refreshing Salesforce token for instance ${instanceUrl}`);
        
        const response = await axios({
          method: 'post',
          url: `${config.salesforce.loginUrl}/services/oauth2/token`,
          params: {
            grant_type: 'refresh_token',
            client_id: config.salesforce.clientId,
            client_secret: config.salesforce.clientSecret,
            refresh_token: sfTokens.refreshToken
          }
        });

        // Update tokens
        sfTokens.accessToken = response.data.access_token;
        sfTokens.expiresAt = Date.now() + (response.data.expires_in * 1000);
        
        // Save updated tokens
        tokens.salesforce[instanceUrl] = sfTokens;
        this.saveTokens(tokens);
        
        logger.info(`Salesforce token refreshed for instance ${instanceUrl}`);
      } catch (error) {
        logger.error(`Error refreshing Salesforce token for instance ${instanceUrl}:`, error);
        throw new Error(`Failed to refresh Salesforce token: ${error.message}`);
      }
    }

    return sfTokens.accessToken;
  }

  /**
   * Check if QuickBooks token is valid and refresh if needed
   */
  async getQuickBooksAccessToken(realmId) {
    const tokens = this.initializeTokenStorage();
    
    if (!tokens.quickbooks[realmId]) {
      throw new Error(`No QuickBooks tokens found for realm ${realmId}`);
    }

    const qbTokens = tokens.quickbooks[realmId];
    
    // Check if token is expired
    if (Date.now() >= qbTokens.expiresAt) {
      // Token is expired, refresh it
      try {
        logger.info(`Refreshing QuickBooks token for realm ${realmId}`);
        
        const tokenUrl = config.quickbooks.environment === 'sandbox' 
          ? 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
          : 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
        
        const response = await axios({
          method: 'post',
          url: tokenUrl,
          data: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: qbTokens.refreshToken
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${config.quickbooks.clientId}:${config.quickbooks.clientSecret}`).toString('base64')}`
          }
        });

        // Update tokens
        qbTokens.accessToken = response.data.access_token;
        qbTokens.refreshToken = response.data.refresh_token;
        qbTokens.expiresAt = Date.now() + (response.data.expires_in * 1000);
        
        // Save updated tokens
        tokens.quickbooks[realmId] = qbTokens;
        this.saveTokens(tokens);
        
        logger.info(`QuickBooks token refreshed for realm ${realmId}`);
      } catch (error) {
        logger.error(`Error refreshing QuickBooks token for realm ${realmId}:`, error);
        throw new Error(`Failed to refresh QuickBooks token: ${error.message}`);
      }
    }

    return qbTokens.accessToken;
  }

  /**
   * Get Salesforce authorization URL
   */
  getSalesforceAuthUrl() {
    const authUrl = `${config.salesforce.loginUrl}/services/oauth2/authorize`;
    return `${authUrl}?response_type=code&client_id=${config.salesforce.clientId}&redirect_uri=${encodeURIComponent(config.salesforce.redirectUri)}`;
  }

  /**
   * Get QuickBooks authorization URL
   */
  getQuickBooksAuthUrl() {
    const scopes = 'com.intuit.quickbooks.accounting';
    const authUrl = config.quickbooks.environment === 'sandbox'
      ? 'https://appcenter.intuit.com/connect/oauth2'
      : 'https://appcenter.intuit.com/connect/oauth2';
    
    return `${authUrl}?client_id=${config.quickbooks.clientId}&response_type=code&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(config.quickbooks.redirectUri)}&state=csrfToken`;
  }
}

// Create singleton
const oauthManager = new OAuthManager();

module.exports = oauthManager;
EOL

# Create package.json
echo "Creating package.json..."
cat > "$TARGET_DIR/package.json" << 'EOL'
{
  "name": "salesforce-quickbooks-integration",
  "version": "1.0.0",
  "description": "Automated middleware for integrating Salesforce and QuickBooks",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "axios": "^1.6.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "jsforce": "^1.11.1",
    "node-cron": "^3.0.3",
    "node-quickbooks": "^2.0.39",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.1",
    "supertest": "^6.3.3"
  }
}
EOL

# Create .env file
echo "Creating .env file..."
cat > "$TARGET_DIR/.env" << 'EOL'
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

# Security
API_KEY=test_api_key_123
TOKEN_ENCRYPTION_KEY=your_encryption_key_at_least_32_chars

# Scheduler Configuration
INVOICE_CREATION_CRON=0 */2 * * *
PAYMENT_CHECK_CRON=0 1 * * *
EOL

# Create sample tokens.json
echo "Creating sample tokens.json..."
mkdir -p "$TARGET_DIR/data"
cat > "$TARGET_DIR/data/tokens.json" << 'EOL'
{
  "salesforce": {
    "https://example-instance.my.salesforce.com": {
      "accessToken": "sample_access_token",
      "refreshToken": "sample_refresh_token",
      "instanceUrl": "https://example-instance.my.salesforce.com",
      "expiresAt": 4102444799000
    }
  },
  "quickbooks": {
    "123456789": {
      "accessToken": "sample_access_token",
      "refreshToken": "sample_refresh_token",
      "realmId": "123456789",
      "expiresAt": 4102444799000
    }
  }
}
EOL

# Create detailed instruction and setup guide
echo "Creating instruction guide..."
cat > "$TARGET_DIR/SETUP.md" << 'EOL'
# Automated Salesforce-QuickBooks Integration Setup Guide

This guide explains how to set up and run the automated middleware for integrating Salesforce and QuickBooks without requiring any user interfaces.

## 1. Prerequisites

- Node.js v16+ and npm
- Salesforce Developer Account with Connected App configured
- QuickBooks Developer Account with App configured
- Server with network access to both Salesforce and QuickBooks APIs

## 2. Initial Setup

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Edit the `.env` file with your actual credentials:

```
# Fill in your actual Salesforce and QuickBooks credentials
SF_CLIENT_ID=your_actual_salesforce_client_id
SF_CLIENT_SECRET=your_actual_salesforce_client_secret
QB_CLIENT_ID=your_actual_quickbooks_client_id
QB_CLIENT_SECRET=your_actual_quickbooks_client_secret

# Set a secure API key
API_KEY=your_secure_api_key_here

# Set a secure encryption key (at least 32 characters)
TOKEN_ENCRYPTION_KEY=your_secure_encryption_key_at_least_32_characters_long
```

### Initial OAuth Setup (One-time only)

For the first-time setup only, you'll need to authenticate with both systems:

1. Start the server in development mode:
   ```bash
   npm run dev
   ```

2. In your browser, visit the Salesforce authorization URL:
   ```
   http://localhost:3000/auth/salesforce
   ```
   Complete the authorization process.

3. In your browser, visit the QuickBooks authorization URL:
   ```
   http://localhost:3000/auth/quickbooks
   ```
   Complete the authorization process.

4. Verify that both systems are connected:
   ```bash
   curl -H "X-API-Key: your_api_key" http://localhost:3000/auth/status
   ```

Once this initial setup is complete, the middleware can run completely in the background without any UI interactions.

## 3. Running in Production

### As a Systemd Service (Linux)

Create a systemd service file `/etc/systemd/system/sf-qb-integration.service`:

```
[Unit]
Description=Salesforce-QuickBooks Integration Middleware
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/automated-integration
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable sf-qb-integration
sudo systemctl start sf-qb-integration
```

### Using PM2 (Cross-platform)

Install PM2 globally:

```bash
npm install -g pm2
```

Start the application with PM2:

```bash
pm2 start src/server.js --name sf-qb-integration
```

Save the PM2 configuration:

```bash
pm2 save
```

Set PM2 to start on system boot:

```bash
pm2 startup
```

## 4. Monitoring and Maintenance

### Logs

Monitor logs in the `logs` directory:

```bash
tail -f logs/combined.log    # All logs
tail -f logs/error.log       # Error logs only
```

### Status Checks

Check the scheduler status:

```bash
curl -H "X-API-Key: your_api_key" http://localhost:3000/scheduler/status
```

### Manual Triggers

Manually trigger processes if needed:

```bash
# Trigger invoice creation
curl -X POST -H "X-API-Key: your_api_key" http://localhost:3000/scheduler/invoice-creation

# Trigger payment check
curl -X POST -H "X-API-Key: your_api_key" http://localhost:3000/scheduler/payment-check
```

## 5. Customization and Configuration

### Scheduling

Adjust the scheduling in the `.env` file:

```
# Run invoice creation every hour instead of every 2 hours
INVOICE_CREATION_CRON=0 * * * *

# Run payment check twice daily instead of once
PAYMENT_CHECK_CRON=0 */12 * * *
```

### Business Logic

Modify the following files to customize the integration logic:

- `src/routes/api.js` - Core integration logic
- `src/routes/webhook.js` - Real-time event handling
- `src/services/scheduler.js` - Automated job timing and execution

## 6. Security Considerations

- Store the middleware on a secure server with proper firewalls
- Use strong, unique values for `API_KEY` and `TOKEN_ENCRYPTION_KEY`
- Consider implementing IP restrictions for the API endpoints
- Regularly rotate OAuth credentials for both services
- Implement proper monitoring for failed authentication attempts
EOL

echo "Script completed successfully!"
echo "Your automated middleware is now set up in: $TARGET_DIR"
echo "To start the server, run: cd $TARGET_DIR && npm install && npm start"