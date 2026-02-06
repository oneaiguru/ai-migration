# ClaudeCodeProxy - API Proxy Server Memory

## Quick Start
- **Purpose**: Proxy server for Anthropic APIs with multi-user authentication, usage tracking, and cost management
- **Type**: Node.js web server / API gateway
- **Language**: Node.js 18+

## Installation
```bash
# Navigate to ClaudeCodeProxy directory
cd /path/to/ClaudeCodeProxy/server-latest/

# Install dependencies
npm install

# Set API key
export DEFAULT_ANTHROPIC_API_KEY=your_anthropic_key

# Start server
npm start
# Note the admin token from startup logs
```

## Common Usage
```bash
# Docker deployment (recommended)
docker-compose up -d
docker-compose logs  # Get admin token

# Manual server start
export DEFAULT_ANTHROPIC_API_KEY=your_key
node server.js

# Admin operations
./admin.sh list                    # List users
./admin.sh add username [api_key]  # Add user  
./admin.sh balance username 100    # Add $100 balance
./admin.sh usage username          # Check usage stats
```

## Architecture
| Component | Lines | Role |
|-----------|-------|------|
| `server.js` | 1-314 | Main proxy server and web interface |
| `admin.sh` | 1-100 | Command-line user management |
| `client-setup.sh` | 1-50 | Client configuration automation |
| `docker-compose.yml` | 1-30 | Container orchestration |
| `users.json` | - | User database and balances |

## How It Works
1. **Request auth** - `server.js:64-88` validates user tokens
2. **Proxy requests** - `server.js:100-116` forwards to Anthropic API
3. **API key injection** - `server.js:106-111` replaces auth headers
4. **Usage tracking** - Built into proxy middleware
5. **Balance management** - Automatic deduction with 2x markup
6. **Admin interface** - `server.js:157-168` user management endpoints

## Configuration
- Environment vars:
  - `DEFAULT_ANTHROPIC_API_KEY`: Master API key for default users
  - `PORT`: Server port (default: 3000)
- Files:
  - `users.json`: User database with tokens, keys, balances
  - `usage_logs/`: Directory for request/usage logging
- Endpoints:
  - `/api/anthropic/*`: Proxied Anthropic API
  - `/api/statsig/*`: Proxied Statsig analytics
  - `/api/sentry/*`: Proxied Sentry error tracking

## API/Library Usage
```javascript
// Client configuration (after setup)
process.env.ANTHROPIC_API_KEY = 'your_proxy_token';
process.env.ANTHROPIC_API_BASE = 'https://your-proxy-server.com/api/anthropic';

// Use Claude Code normally
const { exec } = require('child_process');
exec('claude -p "Hello Claude!"', (error, stdout) => {
  console.log(stdout);
});
```

## Integration Points
- **Input sources**: Anthropic API, Statsig, Sentry
- **Output formats**: Proxied API responses, usage logs, web interface
- **Authentication**: UUID v4 tokens, API key management per user
- **Can chain with**: Claude Code CLI, custom applications, monitoring systems

## Performance
- **Throughput**: Handles concurrent requests (limited by Anthropic API)
- **Latency**: <100ms proxy overhead, depends on upstream APIs
- **Memory**: ~50MB base, scales with active connections
- **Scaling**: Single instance, can be load balanced

## User Management Features
| Feature | Lines | Purpose |
|---------|-------|---------|
| Token auth | `server.js:64-88` | UUID-based user authentication |
| API key injection | `server.js:106-111` | Secure API key management |
| Balance tracking | `server.js:36-37` | Prepaid balance system |
| Admin endpoints | `server.js:157-168` | User management API |
| Token validation | `server.js:171-198` | Client token verification |

## Debugging  
- **Log location**: Console output, `usage_logs/` directory
- **Debug mode**: Set `NODE_ENV=development`
- **Common errors**:
  - Missing API key: Set `DEFAULT_ANTHROPIC_API_KEY` 
  - Port conflicts: Change `PORT` environment variable
  - User not found: Check token in `users.json`
  - Balance insufficient: Add funds via admin script

## Examples
```bash
# Example 1: Server setup and first user
export DEFAULT_ANTHROPIC_API_KEY=sk-ant-...
node server.js
# Copy admin token from logs

./admin.sh add john sk-ant-john-key  
./admin.sh balance john 50
# User 'john' created with $50 balance

# Example 2: Client setup
./client-setup.sh -u https://proxy.example.com -t user_token_here
source ~/.claude_proxy_config
claude -p "Test message"

# Example 3: Usage monitoring
./admin.sh usage john
# Shows: requests: 45, tokens: 12500, balance: $37.50

# Example 4: Docker deployment  
cat > .env << 'EOF'
DEFAULT_ANTHROPIC_API_KEY=sk-ant-your-key
PORT=3000
EOF

docker-compose up -d
docker-compose logs proxy | grep "admin token"
```

## Web Interface Features
The server provides a web interface at `/`:

1. **Token Validation**: Test if tokens are valid
2. **Balance Display**: Show current account balance  
3. **Setup Instructions**: Client configuration guide
4. **Admin Downloads**: Access to admin and setup scripts

## Pricing Model
- **Markup**: 2x Anthropic's base pricing
- **Minimum balance**: $50 required for new accounts
- **Warning threshold**: $30 remaining balance
- **Service cutoff**: $0 balance disables API access
- **Balance tracking**: Real-time deduction per API call

## Security Considerations
- **HTTPS**: All communication encrypted
- **Token generation**: UUID v4 for unpredictable tokens
- **API key isolation**: Client never sees actual Anthropic keys
- **Admin access**: Token-based admin authentication
- **Usage logs**: Audit trail for all API requests

## Advanced Configuration
```javascript
// Custom proxy middleware
const customProxy = createProxyMiddleware({
  target: 'https://api.anthropic.com',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Custom request modification
    proxyReq.setHeader('x-custom-header', 'value');
    
    // Usage tracking
    logUsage(req.user, req.path, req.body);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Custom response modification
    proxyRes.headers['x-proxy-version'] = '1.0.0';
  }
});

// Custom authentication
function customAuth(req, res, next) {
  const token = req.headers['x-auth-token'];
  
  // Validate against external service
  validateTokenExternal(token)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
      res.status(401).json({ error: 'Invalid token' });
    });
}
```

## Production Deployment
```bash
# Docker with custom configuration
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'
services:
  proxy:
    build: .
    ports:
      - "443:3000"
    environment:
      - DEFAULT_ANTHROPIC_API_KEY=${ANTHROPIC_KEY}
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./users.json:/app/users.json
      - ./usage_logs:/app/usage_logs
      - ./ssl:/app/ssl
    restart: unless-stopped
EOF

# HTTPS with Let's Encrypt
# Add SSL certificate configuration
# Set up reverse proxy (nginx/apache)
# Configure firewall rules
```

## Load Balancing
```javascript
// Multiple proxy instances
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Start server instance
  require('./server.js');
}
```

## Monitoring and Analytics
```bash
# Usage statistics
./admin.sh usage                    # All users
./admin.sh usage --format json     # JSON output
./admin.sh usage --date 2024-01    # Monthly stats

# Server health
curl https://proxy.example.com/status
# Response: {"status": "ok", "version": "1.0.0"}

# Real-time monitoring
tail -f usage_logs/proxy.log | grep ERROR
```