# Middleware Architecture Documentation

## Infrastructure Setup
- **Domain:** sqint.atocomm.eu
- **SSL:** Handled by nginx reverse proxy
- **Port Mapping:** 
  - External: 443 (HTTPS) → nginx → Internal: 3000 (HTTP)
  - SSH: 2323 → 22
- **Environment:** VM behind NAT with docker nginx proxy

## Node.js Application Structure

### Core Dependencies
```json
{
  "express": "^4.18.0",
  "axios": "^1.6.0", 
  "winston": "^3.8.0",
  "cors": "^2.8.5",
  "helmet": "^6.0.0",
  "dotenv": "^16.0.0"
}
```

### Environment Variables
```bash
# Server
PORT=3000
NODE_ENV=production
MIDDLEWARE_BASE_URL=https://sqint.atocomm.eu

# Salesforce OAuth
SF_CLIENT_ID=your_salesforce_client_id
SF_CLIENT_SECRET=your_salesforce_client_secret
SF_REDIRECT_URI=https://sqint.atocomm.eu/auth/salesforce/callback
SF_LOGIN_URL=https://login.salesforce.com

# QuickBooks OAuth  
QB_CLIENT_ID=your_quickbooks_client_id
QB_CLIENT_SECRET=your_quickbooks_client_secret
QB_REDIRECT_URI=https://sqint.atocomm.eu/auth/quickbooks/callback
QB_ENVIRONMENT=sandbox

# Security
API_KEY=secure_random_key_minimum_32_chars
TOKEN_ENCRYPTION_KEY=32_character_encryption_key_here
```

## API Endpoints

### Core Integration Endpoints
- `POST /api/opportunity-to-invoice` - Create QB invoice from SF opportunity
- `POST /api/check-payment-status` - Monitor payment status batch job
- `GET /api/health` - Health check endpoint

### Authentication Endpoints  
- `GET /auth/salesforce` - Initiate SF OAuth
- `GET /auth/salesforce/callback` - Handle SF OAuth callback
- `GET /auth/quickbooks` - Initiate QB OAuth  
- `GET /auth/quickbooks/callback` - Handle QB OAuth callback
- `GET /auth/status` - Check OAuth connection status

## Request/Response Formats

### Opportunity to Invoice Request
```json
{
  "opportunityId": "006XXXXXXXXXXXXXXX",
  "salesforceInstance": "https://domain.my.salesforce.com",
  "quickbooksRealm": "123456789"
}
```

### Success Response
```json
{
  "success": true,
  "qbInvoiceId": "145",
  "qbInvoiceNumber": "№\"0001\"",
  "message": "Invoice created successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Customer not found in QuickBooks",
  "code": "CUSTOMER_NOT_FOUND",
  "details": {
    "opportunityId": "006XXXXXXXXXXXXXXX",
    "customerName": "Test Customer"
  }
}
```

## Security Features

### API Key Authentication
```javascript
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};
```

### Token Encryption
- OAuth tokens encrypted at rest using AES-256-GCM
- Automatic token refresh with retry logic
- Secure token storage with rotation

## Error Handling

### Retry Logic
- 3 attempts with exponential backoff
- Circuit breaker pattern for external APIs
- Graceful degradation on service failures

### Logging Levels
- `ERROR` - Critical failures requiring immediate attention
- `WARN` - Non-critical issues that should be monitored  
- `INFO` - General operational information
- `DEBUG` - Detailed debugging information (dev only)

## Performance Optimizations

### Rate Limiting
- QB API: 500 requests/minute in production
- SF API: 5000 requests/24 hours per user
- Internal throttling: 10 requests/second

### Caching Strategy
- OAuth tokens cached for 2 hours
- Customer data cached for 1 hour
- No invoice data caching (real-time sync required)

## Monitoring & Health Checks

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-12-26T10:30:00Z",
  "services": {
    "salesforce": "connected",
    "quickbooks": "connected", 
    "database": "not_required"
  },
  "uptime": 86400
}
```

### Deployment Process
1. Pull latest code from repository
2. Install dependencies: `npm install`
3. Update environment variables
4. Restart application: `pm2 restart middleware`
5. Verify health endpoint
6. Test OAuth connections
