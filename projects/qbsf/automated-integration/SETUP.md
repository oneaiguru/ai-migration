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
