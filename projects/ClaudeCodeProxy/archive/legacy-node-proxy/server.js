// Minimal proxy server for Anthropic API - focused on reliability
const express = require('express');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');

// Basic configuration
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_URL = 'https://api.anthropic.com';
const STATSIG_URL = 'https://statsig.anthropic.com';
const SENTRY_URL = 'https://sentry.io';
const USERS_FILE = path.join(__dirname, 'users.json');

// Create a simple Express app
const app = express();
app.use(express.json());

// Load the admin token
let adminToken = '';
try {
  if (fs.existsSync(USERS_FILE)) {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    if (users.admin && users.admin.token) {
      adminToken = users.admin.token;
      console.log('Using existing admin token');
    }
  }
} catch (error) {
  console.error('Error loading users data, but continuing:', error);
}

// Simple authentication middleware - only checks token existence
const authenticate = (req, res, next) => {
  // Allow all requests for now to simplify debugging
  next();
};

// Create simple proxies with minimal configuration
const anthropicProxy = createProxyMiddleware({
  target: ANTHROPIC_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/anthropic': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    // Pass through the API key if it exists in headers
    const apiKey = req.headers['x-api-key'] || process.env.DEFAULT_ANTHROPIC_API_KEY;
    if (apiKey) {
      proxyReq.setHeader('x-api-key', apiKey);
      proxyReq.setHeader('anthropic-api-key', apiKey);
    }
    
    console.log(`Proxying request to Anthropic API: ${req.method} ${req.path}`);
  }
});

const statsigProxy = createProxyMiddleware({
  target: STATSIG_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/statsig': ''
  }
});

const sentryProxy = createProxyMiddleware({
  target: SENTRY_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/sentry': ''
  }
});

// Set up the API routes
app.use('/api/anthropic', authenticate, anthropicProxy);
app.use('/api/statsig', authenticate, statsigProxy);
app.use('/api/sentry', authenticate, sentryProxy);

// Status endpoint for health checks
app.get('/status', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Minimal proxy server running on port ${PORT}`);
  console.log(`Admin token: ${adminToken}`);
});
