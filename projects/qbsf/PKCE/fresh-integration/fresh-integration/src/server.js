const express = require('express');
const path = require('path');
const config = require('./config');
const routes = require('./routes');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform
    }
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`QuickBooks Auth URL: http://localhost:${PORT}/auth/quickbooks`);
  console.log(`Salesforce Auth URL: http://localhost:${PORT}/auth/salesforce`);
  console.log(`Status Check: curl -H "X-API-Key: ${config.security.apiKey}" http://localhost:${PORT}/auth/status`);
});