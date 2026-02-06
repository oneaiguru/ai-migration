// Basic proxy server for Anthropic API - compatible with Node.js 12
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
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
        usage: { requests: 0, tokens: 0, balance: 100 }
      }
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log('Created admin user with token: ' + adminToken);
  }
} catch (error) {
  console.error('Error loading users data:', error);
  process.exit(1);
}

// Save users data
function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users data:', error);
  }
}

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
function authenticate(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  // Find user by token
  let foundUser = null;
  let foundUsername = null;
  
  Object.keys(users).forEach(function(username) {
    if (users[username].token === token) {
      foundUser = users[username];
      foundUsername = username;
    }
  });
  
  if (!foundUser) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }

  // Add user info to request
  req.user = foundUser;
  req.username = foundUsername;
  next();
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Proxy middleware for Anthropic API
const anthropicProxy = createProxyMiddleware({
  target: ANTHROPIC_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/anthropic': ''
  },
  onProxyReq: function(proxyReq, req, res) {
    // Replace the auth header with the user's API key
    if (req.user && req.user.anthropicApiKey) {
      proxyReq.setHeader('x-api-key', req.user.anthropicApiKey);
      proxyReq.setHeader('anthropic-api-key', req.user.anthropicApiKey);
    }
    
    // Log request info
    console.log('Proxying request to Anthropic API: ' + req.method + ' ' + req.path);
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
app.use('/api/anthropic', authenticate, anthropicProxy);
app.use('/api/statsig', authenticate, statsigProxy);
app.use('/api/sentry', authenticate, sentryProxy);

// Make admin script available for download
app.get('/admin.sh', function(req, res) {
  res.download(path.join(__dirname, 'admin.sh'));
});

// Make client setup script available for download
app.get('/client-setup.sh', function(req, res) {
  res.download(path.join(__dirname, 'client-setup.sh'));
});

// Status endpoint
app.get('/status', function(req, res) {
  res.json({ status: 'ok', version: '1.0.0' });
});

// User management endpoints (admin only)
app.get('/admin/users', authenticate, requireAdmin, function(req, res) {
  // Return users without tokens for security
  const safeUsers = {};
  Object.keys(users).forEach(function(username) {
    safeUsers[username] = {
      isAdmin: users[username].isAdmin,
      usage: users[username].usage,
      hasApiKey: !!users[username].anthropicApiKey
    };
  });
  res.json(safeUsers);
});

// Token validation endpoint
app.post('/validate-token', function(req, res) {
  const token = req.body.token;
  
  if (!token) {
    return res.status(400).json({ valid: false, error: 'Token is required' });
  }
  
  let foundUser = null;
  let foundUsername = null;
  
  Object.keys(users).forEach(function(username) {
    if (users[username].token === token) {
      foundUser = users[username];
      foundUsername = username;
    }
  });
  
  if (!foundUser) {
    return res.json({ valid: false });
  }
  
  res.json({ 
    valid: true, 
    username: foundUsername,
    isAdmin: foundUser.isAdmin,
    balance: foundUser.usage.balance || 0
  });
});

// Simple home page
app.get('/', function(req, res) {
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
curl -O ${req.protocol}://${req.get('host')}/client-setup.sh
chmod +x client-setup.sh

# Run the setup script with your token
./client-setup.sh
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
                resultEl.textContent = 'Validating...';
                
                const response = await fetch('/validate-token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ token })
                });
                
                const data = await response.json();
                
                if (data.valid) {
                  resultEl.innerHTML = 
                    '<p class="success">✅ Valid token for user: ' + data.username + '</p>' +
                    '<p>Current balance: $' + data.balance.toFixed(2) + '</p>' +
                    (data.isAdmin ? '<p><strong>Admin privileges</strong></p>' : '');
                } else {
                  resultEl.innerHTML = '<p class="error">❌ Invalid token</p>';
                }
              } catch (error) {
                resultEl.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
              }
            }
          </script>
        </div>
        
        <div class="card">
          <h2>Download Admin Script</h2>
          <p>If you're an administrator, you can download the admin script:</p>
          <a href="/admin.sh" class="button">Download Admin Script</a>
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
app.listen(PORT, function() {
  console.log('Proxy server listening on port ' + PORT);
  console.log('Proxying Anthropic API requests to ' + ANTHROPIC_API_URL);
});
