# Salesforce-QuickBooks Integration Middleware

A fully automated middleware solution that seamlessly integrates Salesforce and QuickBooks Online. This middleware runs in the background, automatically synchronizing opportunities from Salesforce to invoices in QuickBooks and updating payment status back to Salesforce.

## Key Features

- **Fully Automated Integration**: Runs in the background without requiring user interfaces
- **Scheduled Synchronization**: Automatically processes eligible opportunities and checks payment status
- **Real-time Webhooks**: Optional support for real-time processing of events
- **Comprehensive Logging**: Detailed logs for troubleshooting and audit purposes
- **Secure Authentication**: OAuth 2.0 integration with both platforms
- **Resilient Processing**: Error handling and retry mechanisms to ensure reliability

## Technical Architecture

The integration is built as a Node.js application with the following components:

### Core Components

- **Express Server**: Provides API endpoints and webhook handlers
- **Scheduler**: Background service that runs synchronization jobs on schedule
- **OAuth Manager**: Handles authentication with Salesforce and QuickBooks
- **API Routes**: Implements the business logic for integration
- **Webhook Routes**: Processes real-time events from both systems

### Background Processes

- **Invoice Creation Job**: Runs every 2 hours by default, finding eligible Salesforce opportunities and creating corresponding QuickBooks invoices
- **Payment Status Job**: Runs daily at 1:00 AM by default, checking for payments in QuickBooks and updating Salesforce

## Setup and Configuration

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
   Create a `.env` file with the following variables:
   ```
   # Server Configuration
   PORT=3000
   NODE_ENV=production
   MIDDLEWARE_BASE_URL=https://your-middleware-domain.com

   # Salesforce Configuration
   SF_CLIENT_ID=your_salesforce_client_id
   SF_CLIENT_SECRET=your_salesforce_client_secret
   SF_REDIRECT_URI=https://your-middleware-domain.com/auth/salesforce/callback
   SF_LOGIN_URL=https://login.salesforce.com

   # QuickBooks Configuration
   QB_CLIENT_ID=your_quickbooks_client_id
   QB_CLIENT_SECRET=your_quickbooks_client_secret
   QB_REDIRECT_URI=https://your-middleware-domain.com/auth/quickbooks/callback
   QB_ENVIRONMENT=production

   # Security
   API_KEY=your_api_key
   TOKEN_ENCRYPTION_KEY=your_encryption_key

   # Scheduler Configuration
   INVOICE_CREATION_CRON=0 */2 * * *
   PAYMENT_CHECK_CRON=0 1 * * *
   ```

4. Start the server:
   ```
   npm start
   ```
   
   For production deployment, use a process manager like PM2:
   ```
   npm install -g pm2
   pm2 start src/server.js --name sf-qb-integration
   ```

### Initial Authorization

1. Navigate to the Salesforce OAuth URL displayed during server startup (or at `/auth/salesforce`)
2. Authorize the application with your Salesforce credentials
3. Navigate to the QuickBooks OAuth URL displayed during server startup (or at `/auth/quickbooks`)
4. Authorize the application with your QuickBooks credentials

Once both systems are authorized, the integration will run automatically according to the configured schedules.

## Customization

### Adjusting Synchronization Schedules

Modify the cron expressions in your `.env` file:

- `INVOICE_CREATION_CRON`: When to check for new Salesforce opportunities (default: every 2 hours)
- `PAYMENT_CHECK_CRON`: When to check for payments in QuickBooks (default: 1:00 AM daily)

### Customizing Business Logic

The core business logic is in the following files:

- `src/routes/api.js`: Contains the logic for processing opportunities and checking payments
- `src/routes/webhook.js`: Handles real-time events from both systems

Modify these files to adjust how data is transformed and processed between the systems.

## Monitoring and Maintenance

### Logs

- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Scheduler-specific logs: `logs/scheduler/*.log`

### Status and Diagnostics

The following endpoints are available for status checking:

- `GET /health`: Basic server health check
- `GET /scheduler/status`: Check status of scheduled jobs (requires API key)
- `POST /scheduler/invoice-creation`: Manually trigger invoice creation (requires API key)
- `POST /scheduler/payment-check`: Manually trigger payment check (requires API key)

Example:
```
curl -H "X-API-Key: your_api_key" https://your-middleware-domain.com/scheduler/status
```

## Development

For development:

1. Set `NODE_ENV=development` in your `.env` file
2. Start the server in development mode:
   ```
   npm run dev
   ```

## License

[MIT License](LICENSE)
