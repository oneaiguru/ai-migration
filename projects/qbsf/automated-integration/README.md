# Salesforce-QuickBooks Automated Integration Middleware

A fully automated middleware solution that seamlessly integrates Salesforce and QuickBooks without requiring user interfaces. This middleware runs in the background, automatically synchronizing opportunities from Salesforce to invoices in QuickBooks and updating payment status back to Salesforce.

## 🌟 Key Features

- **Fully Automated Integration**: Runs in the background without requiring user interaction
- **Scheduled Synchronization**: Automatically processes new opportunities and checks payment status
- **Real-time Webhooks**: Optional support for immediate processing of Salesforce and QuickBooks events
- **Secure Authentication**: OAuth 2.0 integration with both platforms
- **Comprehensive Logging**: Detailed logs for troubleshooting and audit purposes
- **Error Handling**: Robust recovery mechanisms to ensure reliable operation

## 🔄 Business Workflow

This middleware automates the following workflow:

1. 📋 **Monitor Salesforce Opportunities**: Automatically detects when an opportunity status changes to "Closed Won"
2. 📝 **Create QuickBooks Invoice**: Creates an invoice in QuickBooks with line items from the Salesforce opportunity
3. 💰 **Monitor QuickBooks Payments**: Checks for payment status of invoices in QuickBooks
4. 🔄 **Update Salesforce**: Updates the Salesforce opportunity with payment information when an invoice is paid

All of this happens automatically in the background without requiring user intervention.

## 🛠️ Technical Architecture

The integration is built as a Node.js Express application with the following components:

- **Scheduler Service**: Runs background jobs on configurable schedules
- **OAuth Manager**: Handles authentication with Salesforce and QuickBooks
- **API Routes**: Implements the core business logic for integration
- **Webhook Routes**: Processes real-time events from both systems

## 🚀 Setup and Configuration

### Prerequisites

- Node.js v16+ and npm
- Salesforce organization with API access
- QuickBooks Online account with API access
- Server environment for hosting the middleware

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sf-qb-integration.git
   ```

2. Install dependencies:
   ```
   cd sf-qb-integration
   npm install
   ```

3. Configure environment variables:
   Update the `.env` file with your API credentials. The most important settings are:
   
   ```
   # API Keys
   SF_CLIENT_ID=your_salesforce_client_id
   SF_CLIENT_SECRET=your_salesforce_client_secret
   QB_CLIENT_ID=your_quickbooks_client_id
   QB_CLIENT_SECRET=your_quickbooks_client_secret
   
   # Security 
   API_KEY=your_api_key
   
   # Scheduling
   INVOICE_CREATION_CRON=0 */2 * * *  # Every 2 hours
   PAYMENT_CHECK_CRON=0 1 * * *       # 1:00 AM daily
   ```

4. Start the server:
   ```
   npm start
   ```

### Initial OAuth Setup (One-time)

The first time you run the middleware, you'll need to authenticate with Salesforce and QuickBooks:

1. Visit the Salesforce authorization URL:
   ```
   http://localhost:3000/auth/salesforce
   ```

2. Visit the QuickBooks authorization URL:
   ```
   http://localhost:3000/auth/quickbooks
   ```

After this initial setup, the middleware will run autonomously.

## 📋 Monitoring and Management

While the middleware runs automatically, you may want to check its status or manually trigger actions:

### Status Endpoints

- **Status Check**: `GET /scheduler/status` - Check status of scheduled jobs
- **Health Check**: `GET /health` - Basic server health check

### Manual Trigger Endpoints

- **Process Opportunities**: `POST /scheduler/invoice-creation` - Manually trigger invoice creation
- **Check Payments**: `POST /scheduler/payment-check` - Manually trigger payment status check

Example (using curl):
```bash
curl -X POST -H "X-API-Key: your_api_key" http://localhost:3000/scheduler/invoice-creation
```

### Logs

Logs are stored in the `logs` directory:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- `logs/scheduler/*.log` - Scheduler-specific logs

## ⚙️ Customization

### Schedule Configuration

You can customize the scheduling in the `.env` file:

```
# Run invoice creation more frequently (every hour)
INVOICE_CREATION_CRON=0 * * * *

# Run payment check twice daily
PAYMENT_CHECK_CRON=0 */12 * * *
```

### Business Logic Customization

The core business logic is in the following files:

- `src/routes/api.js` - Contains the logic for processing opportunities and checking payments
- `src/routes/webhook.js` - Handles real-time events from both systems

## 🔒 Security Considerations

- The API key protects all endpoints - keep it secret and strong
- OAuth tokens are stored in the `data/tokens.json` file - secure this file
- Consider implementing IP restrictions for the API endpoints
- Use HTTPS in production to encrypt all traffic

## 🚀 Production Deployment

For production, use a process manager like PM2:

```bash
npm install -g pm2
pm2 start src/server.js --name sf-qb-integration
pm2 save
pm2 startup
```

## 🔄 Demo Mode

For testing purposes, the middleware includes a demo mode that simulates the integration. In demo mode:

- Salesforce and QuickBooks API calls are simulated
- Sample data is returned to demonstrate the workflow
- Logs show the expected flow of operations

Demo mode is active when `NODE_ENV=development` in your `.env` file.

## 📝 License

[MIT License](LICENSE)