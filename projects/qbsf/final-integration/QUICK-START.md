# Salesforce-QuickBooks Integration - Instructions

This document provides instructions on how to set up, run, and test the Salesforce-QuickBooks integration.

## File Structure

The key files in this project are:

```
upd2/
│
├── src/
│   ├── config/
│   │   └── index.js            # Configuration settings
│   │
│   ├── middleware/
│   │   └── error-handler.js    # Error handling middleware
│   │
│   ├── routes/
│   │   ├── admin.js            # Admin dashboard routes
│   │   ├── scheduler.js        # Scheduler control routes
│   │   └── webhook.js          # Webhook routes for external integrations
│   │
│   └── utils/
│       └── logger.js           # Logging utility
│
├── public/
│   └── dashboard.html          # Admin dashboard UI
│
└── tests/
    ├── admin.test.js           # Tests for admin routes
    ├── config.test.js          # Tests for configuration
    ├── error-handler.test.js   # Tests for error handler
    ├── logger.test.js          # Tests for logger
    ├── scheduler.test.js       # Tests for scheduler
    └── webhook.test.js         # Tests for webhook routes
```

## Instructions for Claude Code (cc)

To run the code, follow these steps:

### 1. Setting Up the Environment

Claude Code can run all of this code. First, let's make sure the environment is set up properly:

```bash
# Create the upd2 directory if it doesn't exist
mkdir -p upd2/src/config upd2/src/middleware upd2/src/routes upd2/src/utils upd2/public upd2/tests

# Copy all files from this artifact to the appropriate directories
# (Files are in the artifacts I provided)

# Install required dependencies
cd upd2
npm install express winston cors helmet node-cron axios
npm install --save-dev jest supertest
```

### 2. Running the Tests

To run the tests with Claude Code, use the following commands:

```bash
# Change to the upd2 directory
cd upd2

# Run all tests
npx jest tests/

# Run a specific test file
npx jest tests/scheduler.test.js
```

### 3. Running the Server

To start the server:

```bash
# Change to the upd2 directory
cd upd2

# Start the server
node src/server.js
```

### 4. Using the Dashboard

Once the server is running, you can access the dashboard at:

```
http://localhost:3000/dashboard
```

The dashboard will prompt for your API key, which should match the one in your `.env` file.

## Testing Manually

Here are some commands to test the different endpoints manually:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test admin status (requires API key)
curl -H "X-API-Key: your-api-key" http://localhost:3000/admin/status

# Test scheduler status (requires API key)
curl -H "X-API-Key: your-api-key" http://localhost:3000/scheduler/status

# Trigger invoice creation job manually (requires API key)
curl -X POST -H "X-API-Key: your-api-key" http://localhost:3000/scheduler/invoice-creation

# Trigger payment check job manually (requires API key)
curl -X POST -H "X-API-Key: your-api-key" http://localhost:3000/scheduler/payment-check
```

## Troubleshooting

If you encounter issues:

1. **Authentication Issues**: Make sure your API key is correctly set in the `.env` file and that you're using the same key in your requests.

2. **Missing Dependencies**: If you get errors about missing modules, run `npm install` to install the required dependencies.

3. **Port Already in Use**: If the server fails to start because the port is already in use, you can change the port in the `.env` file or by setting the `PORT` environment variable.

4. **File Permissions**: If you get errors about not being able to write to log files, make sure the application has the necessary permissions to write to the logs directory.

5. **Integration Issues**: If the integration with Salesforce or QuickBooks is not working, check the authentication status and logs for more detailed error messages.

## Using Claude Code to Debug

Claude Code is excellent for debugging issues. Here are some commands you can use:

```bash
# Check logs for errors
cd upd2
cat logs/error.log

# Run a specific part of the code to debug
cd upd2
node -e "const scheduler = require('./src/services/scheduler'); scheduler.start();"
```

If you encounter specific issues with running the code, you can ask Claude Code to help troubleshoot by providing the error messages and relevant code snippets.