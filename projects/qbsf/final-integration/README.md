# Salesforce-QuickBooks Integration

This is a middleware application that connects Salesforce and QuickBooks, automating the creation of invoices from Salesforce opportunities and updating payment statuses back to Salesforce.

## Features

- Automated invoice creation from Salesforce opportunities
- Payment status synchronization from QuickBooks to Salesforce
- Scheduler for periodic checks and updates
- Admin dashboard for monitoring and manual triggers
- Webhook support for real-time integrations
- Comprehensive error handling and logging

## Quick Start

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and update the values with your API credentials.

3. Start the server:
   ```
   npm start
   ```

4. Access the admin dashboard:
   ```
   http://localhost:3000/dashboard
   ```

## Testing

Run the test suite:

```
npm test
```

Run a specific test file:

```
npx jest tests/scheduler.test.js
```

## Documentation

For detailed instructions, see:
- [QUICK-START.md](./QUICK-START.md) - Getting started guide
- [INSTRUCTIONS.md](./INSTRUCTIONS.md) - Detailed instructions

## License

This project is proprietary and confidential.
