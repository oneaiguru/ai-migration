# Deployment Specification - Production Ready

## Pre-Deployment Checklist

### Salesforce Validation
- [ ] All metadata files validated without errors
- [ ] Apex test coverage ≥75% achieved
- [ ] Custom objects and fields deployed successfully
- [ ] Remote site settings configured
- [ ] Permission sets assigned to integration user

### Middleware Preparation
- [ ] SSL certificate validated for sqint.atocomm.eu
- [ ] SSH access confirmed: roman@pve.atocomm.eu -p2323
- [ ] nginx reverse proxy configuration ready
- [ ] Environment variables prepared
- [ ] OAuth applications created (SF + QB)

### Infrastructure Verification
- [ ] VM resources sufficient (CPU, Memory, Disk)
- [ ] Port forwarding working (80→80, 443→443, 2323→22)
- [ ] nginx docker container operational
- [ ] SSL certificates properly installed

## Deployment Sequence

### Step 1: Salesforce Deployment (15 minutes)
```bash
# Navigate to deployment package
cd /Users/m/git/clients/qbsf/deployment-package-fixed

# Validate deployment (dry run)
sf project deploy validate --source-dir force-app --target-org olga.rybak@atocomm2023.eu

# If validation passes, deploy
sf project deploy start --source-dir force-app --target-org olga.rybak@atocomm2023.eu

# Run Apex tests
sf apex run test --target-org olga.rybak@atocomm2023.eu --code-coverage --result-format human

# Verify custom settings
sf data query --query "SELECT Id, Middleware_Endpoint__c FROM QB_Integration_Settings__c" --target-org olga.rybak@atocomm2023.eu
```

### Step 2: Middleware Deployment (20 minutes)
```bash
# SSH to production server
ssh roman@pve.atocomm.eu -p2323

# Create application directory
sudo mkdir -p /opt/qb-integration
sudo chown $USER:$USER /opt/qb-integration
cd /opt/qb-integration

# Clone/upload application code
# (Upload middleware files from local machine)

# Install Node.js dependencies
npm install --production

# Create environment file
cp .env.example .env
# Edit .env with production values

# Install PM2 globally (if not installed)
sudo npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

# Configure nginx reverse proxy
sudo nano /etc/nginx/sites-available/qb-integration
# Add proxy configuration
```

### Step 3: nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name sqint.atocomm.eu;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
    
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}

server {
    listen 80;
    server_name sqint.atocomm.eu;
    return 301 https://$server_name$request_uri;
}
```

### Step 4: OAuth Configuration (10 minutes)

#### Salesforce Connected App
1. Setup → App Manager → New Connected App
2. **Settings:**
   - Name: QB Integration Production
   - API Name: QB_Integration_Prod
   - Contact Email: admin@atocomm.eu
   - Enable OAuth: ✓
   - Callback URL: https://sqint.atocomm.eu/auth/salesforce/callback
   - Scopes: Full access (full), Refresh token (refresh_token)

#### QuickBooks App
1. https://developer.intuit.com/app/developer/qbo
2. **Settings:**
   - App Name: Salesforce Integration Prod
   - Redirect URI: https://sqint.atocomm.eu/auth/quickbooks/callback
   - Environment: Production
   - Scopes: Accounting

### Step 5: Environment Variables
```bash
# Production .env file
PORT=3000
NODE_ENV=production
MIDDLEWARE_BASE_URL=https://sqint.atocomm.eu

# Salesforce OAuth (from Connected App)
SF_CLIENT_ID=3MVG9...
SF_CLIENT_SECRET=ABC123...
SF_REDIRECT_URI=https://sqint.atocomm.eu/auth/salesforce/callback
SF_LOGIN_URL=https://login.salesforce.com

# QuickBooks OAuth (from QB App)
QB_CLIENT_ID=L1MNBR...
QB_CLIENT_SECRET=XYZ789...
QB_REDIRECT_URI=https://sqint.atocomm.eu/auth/quickbooks/callback
QB_ENVIRONMENT=production

# Security (generate secure keys)
API_KEY=prod_secure_api_key_32_characters_min
TOKEN_ENCRYPTION_KEY=encryption_key_exactly_32_chars_123

# Logging
LOG_LEVEL=info
LOG_FILE=/opt/qb-integration/logs/application.log
```

## Testing Protocol

### Step 6: Deployment Verification (15 minutes)

#### Health Check Tests
```bash
# Test middleware health
curl -k https://sqint.atocomm.eu/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-12-26T10:30:00Z",
  "services": {
    "salesforce": "disconnected",
    "quickbooks": "disconnected"
  }
}
```

#### OAuth Setup Tests
```bash
# Initialize Salesforce OAuth
curl -k https://sqint.atocomm.eu/auth/salesforce
# Follow browser redirect and authorize

# Initialize QuickBooks OAuth  
curl -k https://sqint.atocomm.eu/auth/quickbooks
# Follow browser redirect and authorize

# Verify connections
curl -k https://sqint.atocomm.eu/auth/status
```

#### Integration Flow Test
1. **Create Test Opportunity:**
   - Account: US Supplier (Account_Type__c = 'Поставщик', Country__c = 'US')
   - Name: "Production Test Opportunity"
   - Amount: $100.00
   - Stage: "Qualification"

2. **Trigger Integration:**
   - Change Stage to "Proposal and Agreement"
   - Monitor logs: `pm2 logs qb-integration`

3. **Verify Results:**
   - SF Invoice created in QB_Invoice__c
   - QB Invoice created (check QuickBooks)
   - Opportunity.QB_Invoice_ID__c populated

## Monitoring Setup

### Log Monitoring
```bash
# Real-time logs
pm2 logs qb-integration --follow

# Log file monitoring
tail -f /opt/qb-integration/logs/application.log

# Error tracking
grep "ERROR" /opt/qb-integration/logs/application.log
```

### System Monitoring
```bash
# Application status
pm2 status

# Resource usage
pm2 monit

# Restart if needed
pm2 restart qb-integration
```

### Health Check Automation
```bash
# Add to crontab for health monitoring
*/5 * * * * curl -f https://sqint.atocomm.eu/api/health || echo "QB Integration health check failed" | mail -s "Alert: QB Integration Down" admin@atocomm.eu
```

## Rollback Plan

### Emergency Rollback Steps
1. **Stop Middleware:** `pm2 stop qb-integration`
2. **Deactivate SF Triggers:** Set OpportunityQuickBooksTrigger to Inactive
3. **Restore Previous Version:** Deploy previous middleware version
4. **Verify Systems:** Run health checks
5. **Notify Stakeholders:** Report rollback completion

### Rollback Commands
```bash
# Stop current application
pm2 stop qb-integration

# Restore from backup
cp -r /opt/qb-integration-backup/* /opt/qb-integration/

# Restart with previous version
pm2 start qb-integration

# Verify rollback
curl -k https://sqint.atocomm.eu/api/health
```

## Success Criteria

### Deployment Success Indicators
- [ ] Health endpoint returns 200 OK
- [ ] OAuth connections established (SF + QB)
- [ ] Test opportunity triggers invoice creation
- [ ] SF invoice created in QB_Invoice__c object
- [ ] QB invoice created in QuickBooks Online
- [ ] No errors in application logs
- [ ] PM2 shows application running stable

### Performance Benchmarks
- Response time < 2 seconds for API calls
- Memory usage < 512MB
- CPU usage < 50% under normal load
- Zero uncaught exceptions in logs

## Post-Deployment Actions

### Final Configuration
1. Update QB_Integration_Settings__c with production values
2. Schedule QBPaymentMonitor for payment monitoring
3. Configure log rotation and cleanup
4. Setup monitoring alerts
5. Document production credentials securely

### Client Handover
1. Provide production access credentials
2. Deliver technical documentation
3. Conduct system walkthrough
4. Transfer monitoring responsibilities
5. Complete final payment processing
