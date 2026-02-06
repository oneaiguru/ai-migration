// server.js - Enhanced Proxy Server for Anthropic API with Billing
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
const TOKEN_PRICING_FACTOR = 2.0; // 2x markup
const MIN_PAYMENT = 50; // $50 minimum payment
const LOW_BALANCE_THRESHOLD = 30; // $30 warning threshold

// Approximate token pricing (tokens per $0.01)
const PRICING = {
  'claude-3-opus-20240229': { input: 2000, output: 600 },
  'claude-3-sonnet-20240229': { input: 6000, output: 1800 },
  'claude-3-haiku-20240307': { input: 15000, output: 4500 },
  'claude-3-5-sonnet-20240620': { input: 10000, output: 3000 },
  'claude-3-7-sonnet-20250219': { input: 10000, output: 3000 }
};

// Default model if not specified
const DEFAULT_MODEL = 'claude-3-sonnet-20240229';

// Ensure log directory exists
if (!fs.existsSync(USAGE_LOG_DIR)) {
  fs.mkdirSync(USAGE_LOG_DIR, { recursive: true });
}

// Load users data
let users = {};
try {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    // Ensure all users have a balance field
    Object.keys(users).forEach(username => {
      if (!users[username].usage.hasOwnProperty('balance')) {
        users[username].usage.balance = 0;
      }
    });
  } else {
    // Create default admin user if file doesn't exist
    const adminToken = uuidv4();
    users = {
      admin: {
        token: adminToken,
        anthropicApiKey: process.env.DEFAULT_ANTHROPIC_API_KEY || '',
        isAdmin: true,
        usage: { requests: 0, tokens: 0, balance: 100 }
      }
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log(`Created admin user with token: ${adminToken}`);
  }
} catch (error) {
  console.error('Error loading users data:', error);
  process.exit(1);
}

// Save users data
const saveUsers = () => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users data:', error);
  }
};

// Calculate cost in USD cents for tokens
const calculateCost = (inputTokens, outputTokens, modelName) => {
  const model = PRICING[modelName] || PRICING[DEFAULT_MODEL];
  
  const inputCost = (inputTokens / model.input) * 1; // $0.01 per X input tokens
  const outputCost = (outputTokens / model.output) * 1; // $0.01 per Y output tokens
  
  // Return cost in cents
  return (inputCost + outputCost) * TOKEN_PRICING_FACTOR;
};

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

// Balance check middleware
const checkBalance = (req, res, next) => {
  if (req.user.isAdmin) {
    // Admins bypass balance check
    return next();
  }
  
  const balance = req.user.usage.balance || 0;
  
  if (balance <= 0) {
    return res.status(402).json({ 
      error: 'Insufficient balance', 
      message: 'Please contact an administrator to add funds to your account.'
    });
  }
  
  if (balance < LOW_BALANCE_THRESHOLD) {
    // Add a warning header but continue
    res.set('X-Low-Balance-Warning', 'true');
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
      
      // Extract model name from request if available
      let modelName = DEFAULT_MODEL;
      try {
        const requestBody = JSON.parse(req.body);
        modelName = requestBody.model || DEFAULT_MODEL;
      } catch (e) {
        // If can't parse, use default
      }
      
      // Calculate cost in cents
      const costCents = calculateCost(inputTokens, outputTokens, modelName);
      const costDollars = costCents / 100;
      
      // Update user's usage stats
      if (req.user) {
        req.user.usage.requests = (req.user.usage.requests || 0) + 1;
        req.user.usage.tokens = (req.user.usage.tokens || 0) + totalTokens;
        
        // Deduct from balance (unless admin)
        if (!req.user.isAdmin && req.user.usage.balance) {
          req.user.usage.balance = Math.max(0, (req.user.usage.balance || 0) - costDollars);
        }
        
        // Log usage to file
        const timestamp = new Date().toISOString();
        const logEntry = {
          timestamp,
          username: req.username,
          endpoint: req.originalUrl,
          model: modelName,
          inputTokens,
          outputTokens,
          totalTokens,
          costCents,
          balance: req.user.usage.balance
        };
        
        const logFile = path.join(USAGE_LOG_DIR, `${req.username}_${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
        
        // Save updated user data
        saveUsers();
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
app.use('/api/anthropic', authenticate, checkBalance, trackUsage, anthropicProxy);
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
  const { username, isAdmin = false, anthropicApiKey = '', initialBalance = 0 } = req.body;
  
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
    usage: { requests: 0, tokens: 0, balance: initialBalance }
  };
  
  saveUsers();
  
  res.status(201).json({ 
    username, 
    token, 
    message: 'User created successfully' 
  });
});

app.put('/admin/users/:username', authenticate, requireAdmin, (req, res) => {
  const { username } = req.params;
  const { isAdmin, anthropicApiKey, resetToken, addBalance } = req.body;
  
  if (!users[username]) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (isAdmin !== undefined) {
    users[username].isAdmin = isAdmin;
  }
  
  if (anthropicApiKey !== undefined) {
    users[username].anthropicApiKey = anthropicApiKey;
  }
  
  if (addBalance && !isNaN(parseFloat(addBalance))) {
    const amount = parseFloat(addBalance);
    users[username].usage.balance = (users[username].usage.balance || 0) + amount;
  }
  
  if (resetToken) {
    users[username].token = uuidv4();
  }
  
  saveUsers();
  
  res.json({ 
    username, 
    token: resetToken ? users[username].token : undefined,
    message: 'User updated successfully',
    currentBalance: users[username].usage.balance
  });
});

app.delete('/admin/users/:username', authenticate, requireAdmin, (req, res) => {
  const { username } = req.params;
  
  if (!users[username]) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  delete users[username];
  saveUsers();
  
  res.json({ message: 'User deleted successfully' });
});

// Balance management
app.post('/admin/balance/:username', authenticate, requireAdmin, (req, res) => {
  const { username } = req.params;
  const { amount } = req.body;
  
  if (!users[username]) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (!amount || isNaN(parseFloat(amount))) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }
  
  const amountFloat = parseFloat(amount);
  
  // Enforce minimum payment for adding funds
  if (amountFloat > 0 && amountFloat < MIN_PAYMENT) {
    return res.status(400).json({ 
      error: `Minimum payment is $${MIN_PAYMENT}`,
      minimumPayment: MIN_PAYMENT
    });
  }
  
  users[username].usage.balance = (users[username].usage.balance || 0) + amountFloat;
  
  // Log the transaction
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    username,
    type: 'balance_update',
    amount: amountFloat,
    newBalance: users[username].usage.balance,
    updatedBy: req.username
  };
  
  const logFile = path.join(USAGE_LOG_DIR, `balance_${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  saveUsers();
  
  res.json({ 
    username,
    previousBalance: users[username].usage.balance - amountFloat,
    currentBalance: users[username].usage.balance,
    message: 'Balance updated successfully' 
  });
});

// User balance check (for users to check their own balance)
app.get('/user/balance', authenticate, (req, res) => {
  res.json({
    username: req.username,
    balance: req.user.usage.balance || 0,
    lowBalanceWarning: (req.user.usage.balance || 0) < LOW_BALANCE_THRESHOLD
  });
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
      const fileDate = file.split('_')[1]?.split('.')[0];
      if (!fileDate) continue;
      
      // Apply date filters
      if (startDate && fileDate < startDate) continue;
      if (endDate && fileDate > endDate) continue;
      
      const logs = fs.readFileSync(path.join(USAGE_LOG_DIR, file), 'utf8')
        .split('\n')
        .filter(Boolean)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
      
      for (const log of logs) {
        const user = log.username;
        if (!user) continue;
        
        if (!usageData[user]) {
          usageData[user] = {
            requests: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            costDollars: 0,
            currentBalance: users[user]?.usage?.balance || 0
          };
        }
        
        usageData[user].requests++;
        usageData[user].inputTokens += log.inputTokens || 0;
        usageData[user].outputTokens += log.outputTokens || 0;
        usageData[user].totalTokens += log.totalTokens || 0;
        usageData[user].costDollars += (log.costCents || 0) / 100;
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
    isAdmin: user[1].isAdmin,
    balance: user[1].usage.balance || 0
  });
});

// Simple web interface for user management
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Claude Code Proxy</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        .card { border: 1px solid #ddd; border-radius: 4px; padding: 20px; margin-bottom: 20px; }
        .info { background-color: #f0f7ff; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
        .button:hover { background: #45a049; }
        input, select { padding: 8px; margin: 5px 0; width: 100%; box-sizing: border-box; }
        .error { color: red; }
        .success { color: green; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Claude Code Proxy</h1>
        
        <div class="card info">
          <h2>Getting Started</h2>
          <p>To use this proxy with Claude Code, you need to:</p>
          <ol>
            <li>Contact an administrator to create an account and add balance</li>
            <li>Set up your local environment to use this proxy server</li>
          </ol>
          
          <h3>Setup Instructions</h3>
          <pre>
# Download the client setup script
curl -O https://code.aai.guru/client-setup.sh
chmod +x client-setup.sh

# Run the setup script with your token
./client-setup.sh -u https://code.aai.guru -t YOUR_TOKEN_HERE
          </pre>
        </div>
        
        <div class="card">
          <h2>Validate Token</h2>
          <p>Check if your token is valid:</p>
          
          <div id="token-form">
            <input type="text" id="token" placeholder="Enter your token">
            <button class="button" onclick="validateToken()">Validate</button>
            <div id="token-result" style="margin-top: 10px;"></div>
          </div>
          
          <script>
            async function validateToken() {
              const token = document.getElementById('token').value;
              const resultEl = document.getElementById('token-result');
              
              if (!token) {
                resultEl.innerHTML = '<p class="error">Please enter a token</p>';
                return;
              }
              
              try {
                const response = await fetch('/validate-token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ token })
                });
                
                const data = await response.json();
                
                if (data.valid) {
                  resultEl.innerHTML = \`
                    <p class="success">✅ Valid token for user: \${data.username}</p>
                    <p>Current balance: $\${data.balance.toFixed(2)}</p>
                    \${data.isAdmin ? '<p><strong>Admin privileges</strong></p>' : ''}
                  \`;
                } else {
                  resultEl.innerHTML = '<p class="error">❌ Invalid token</p>';
                }
              } catch (error) {
                resultEl.innerHTML = \`<p class="error">Error: \${error.message}</p>\`;
              }
            }
          </script>
        </div>
        
        <div class="card">
          <h2>Need Help?</h2>
          <p>If you're experiencing issues or need to add funds to your account, please contact your administrator.</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
  console.log(`Proxying Anthropic API requests to ${ANTHROPIC_API_URL}`);
});
