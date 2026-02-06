// server.js - Proxy server for Anthropic API
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_URL = 'https://api.anthropic.com';
const STATSIG_URL = 'https://statsig.anthropic.com';
const SENTRY_URL = 'https://sentry.io';
const USERS_FILE = path.join(__dirname, 'users.json');
const USAGE_LOG_DIR = path.join(__dirname, 'usage_logs');

// Ensure log directory exists
if (!fs.existsSync(USAGE_LOG_DIR)) {
  fs.mkdirSync(USAGE_LOG_DIR, { recursive: true });
}

// Load users data
let users = {};
try {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } else {
    // Create default admin user if file doesn't exist
    const adminToken = uuidv4();
    users = {
      admin: {
        token: adminToken,
        anthropicApiKey: process.env.DEFAULT_ANTHROPIC_API_KEY || '',
        isAdmin: true,
        usage: { requests: 0, tokens: 0 }
      }
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log(`Created admin user with token: ${adminToken}`);
  }
} catch (error) {
  console.error('Error loading users data:', error);
  process.exit(1);
}

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  // Find user by token
  const user = Object.values(users).find(u => u.token === token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }

  // Add user info to request
  req.user = user;
  req.username = Object.keys(users).find(key => users[key] === user);
  next();
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Usage tracking middleware
const trackUsage = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Try to parse the response to count tokens
    try {
      const body = JSON.parse(data);
      const usageData = body.usage || {};
      const inputTokens = usageData.input_tokens || 0;
      const outputTokens = usageData.output_tokens || 0;
      const totalTokens = inputTokens + outputTokens;
      
      // Update user's usage stats
      if (req.user) {
        req.user.usage.requests = (req.user.usage.requests || 0) + 1;
        req.user.usage.tokens = (req.user.usage.tokens || 0) + totalTokens;
        
        // Log usage to file
        const timestamp = new Date().toISOString();
        const logEntry = {
          timestamp,
          username: req.username,
          endpoint: req.originalUrl,
          inputTokens,
          outputTokens,
          totalTokens
        };
        
        const logFile = path.join(USAGE_LOG_DIR, `${req.username}_${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
        
        // Save updated user data
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      }
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Proxy middleware for Anthropic API
const anthropicProxy = createProxyMiddleware({
  target: ANTHROPIC_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/anthropic': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    // Replace the auth header with the user's API key
    if (req.user && req.user.anthropicApiKey) {
      proxyReq.setHeader('x-api-key', req.user.anthropicApiKey);
      proxyReq.setHeader('anthropic-api-key', req.user.anthropicApiKey);
    }
    
    // Log request info
    console.log(`Proxying request to Anthropic API: ${req.method} ${req.path}`);
  }
});

// Proxy middleware for Statsig
const statsigProxy = createProxyMiddleware({
  target: STATSIG_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/statsig': ''
  }
});

// Proxy middleware for Sentry
const sentryProxy = createProxyMiddleware({
  target: SENTRY_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/sentry': ''
  }
});

// Routes
app.use('/api/anthropic', authenticate, trackUsage, anthropicProxy);
app.use('/api/statsig', authenticate, statsigProxy);
app.use('/api/sentry', authenticate, sentryProxy);

// User management endpoints (admin only)
app.get('/admin/users', authenticate, requireAdmin, (req, res) => {
  // Return users without tokens for security
  const safeUsers = {};
  for (const [username, user] of Object.entries(users)) {
    safeUsers[username] = {
      isAdmin: user.isAdmin,
      usage: user.usage,
      hasApiKey: !!user.anthropicApiKey
    };
  }
  res.json(safeUsers);
});

app.post('/admin/users', authenticate, requireAdmin, (req, res) => {
  const { username, isAdmin = false, anthropicApiKey = '' } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  if (users[username]) {
    return res.status(409).json({ error: 'User already exists' });
  }
  
  const token = uuidv4();
  users[username] = {
    token,
    anthropicApiKey,
    isAdmin,
    usage: { requests: 0, tokens: 0 }
  };
  
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  res.status(201).json({ 
    username, 
    token, 
    message: 'User created successfully' 
  });
});

app.put('/admin/users/:username', authenticate, requireAdmin, (req, res) => {
  const { username } = req.params;
  const { isAdmin, anthropicApiKey, resetToken } = req.body;
  
  if (!users[username]) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (isAdmin !== undefined) {
    users[username].isAdmin = isAdmin;
  }
  
  if (anthropicApiKey !== undefined) {
    users[username].anthropicApiKey = anthropicApiKey;
  }
  
  if (resetToken) {
    users[username].token = uuidv4();
  }
  
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  res.json({ 
    username, 
    token: resetToken ? users[username].token : undefined,
    message: 'User updated successfully' 
  });
});

app.delete('/admin/users/:username', authenticate, requireAdmin, (req, res) => {
  const { username } = req.params;
  
  if (!users[username]) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  delete users[username];
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  res.json({ message: 'User deleted successfully' });
});

// Usage reports
app.get('/admin/usage', authenticate, requireAdmin, (req, res) => {
  const { startDate, endDate, username } = req.query;
  
  // Create usage report based on logs
  try {
    const usageData = {};
    
    // Read log files
    const logFiles = fs.readdirSync(USAGE_LOG_DIR);
    
    for (const file of logFiles) {
      if (!file.endsWith('.log')) continue;
      
      // If username filter is specified, skip files for other users
      if (username && !file.startsWith(username + '_')) continue;
      
      // Extract date from filename
      const fileDate = file.split('_')[1].split('.')[0];
      
      // Apply date filters
      if (startDate && fileDate < startDate) continue;
      if (endDate && fileDate > endDate) continue;
      
      const logs = fs.readFileSync(path.join(USAGE_LOG_DIR, file), 'utf8')
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line));
      
      for (const log of logs) {
        const user = log.username;
        
        if (!usageData[user]) {
          usageData[user] = {
            requests: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0
          };
        }
        
        usageData[user].requests++;
        usageData[user].inputTokens += log.inputTokens || 0;
        usageData[user].outputTokens += log.outputTokens || 0;
        usageData[user].totalTokens += log.totalTokens || 0;
      }
    }
    
    res.json(usageData);
  } catch (error) {
    console.error('Error generating usage report:', error);
    res.status(500).json({ error: 'Error generating usage report' });
  }
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Token validation endpoint
app.post('/validate-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ valid: false, error: 'Token is required' });
  }
  
  const user = Object.entries(users).find(([_, u]) => u.token === token);
  
  if (!user) {
    return res.json({ valid: false });
  }
  
  res.json({ 
    valid: true, 
    username: user[0],
    isAdmin: user[1].isAdmin 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
  console.log(`Proxying Anthropic API requests to ${ANTHROPIC_API_URL}`);
});
