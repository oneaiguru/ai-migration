# Deployment Commands Reference

## Quick Server Fix Commands

### Connect and Assess
```bash
ssh roman@pve.atocomm.eu -p2323
# Password: 3Sd5R069jvuy[3u6yj
cd /opt/qb-integration
cat .env | grep -E "SF_|QB_"
ps aux | grep node
```

### Fix Configuration
```bash
# Stop wrong server
pkill -f node

# Fix Salesforce URL
sed -i 's|olga-rybak-atocomm2023-eu|customer-inspiration-2543|g' .env

# Add missing instance URL
grep -q "SF_INSTANCE_URL" .env || echo "SF_INSTANCE_URL=https://customer-inspiration-2543.my.salesforce.com" >> .env

# Install dependencies
npm install

# Start correct server
NODE_ENV=production node src/server.js
```

### Setup PM2 (Production)
```bash
npm install -g pm2
pm2 start src/server.js --name qb-integration
pm2 save
pm2 startup
pm2 logs qb-integration --lines 100
```

## Salesforce Deployment Commands

### Login to Org
```bash
sf org login web --alias roman-prod --instance-url https://customer-inspiration-2543.my.salesforce.com
```

### Deploy Components
```bash
# Full deployment with tests
sf project deploy start --source-dir force-app --target-org roman-prod --test-level RunLocalTests

# Quick deployment (if test coverage issues)
sf project deploy start --source-dir force-app --target-org roman-prod --test-level Default

# Deploy specific components
sf project deploy start --source-dir force-app/main/default/classes --target-org roman-prod
sf project deploy start --source-dir force-app/main/default/lwc --target-org roman-prod
sf project deploy start --source-dir force-app/main/default/triggers --target-org roman-prod
```

### Check Test Coverage
```bash
sf apex test run --target-org roman-prod --test-level RunLocalTests --code-coverage --result-format human --synchronous
```

## Testing Commands

### API Health Checks
```bash
# Basic health
curl https://sqint.atocomm.eu/api/health

# With API key
curl -H "X-API-Key: qb-sf-integration-api-key-2024" https://sqint.atocomm.eu/api/health

# Test Salesforce connection
curl -X POST https://sqint.atocomm.eu/api/test-salesforce \
  -H "X-API-Key: qb-sf-integration-api-key-2024"

# Test QuickBooks connection
curl -X POST https://sqint.atocomm.eu/api/test-quickbooks \
  -H "X-API-Key: qb-sf-integration-api-key-2024"
```

### Monitor Logs
```bash
# Follow server logs
tail -f /opt/qb-integration/server.log

# Check scheduler
tail -f /opt/qb-integration/server.log | grep -E "Scheduler|payment|invoice"

# Check errors
grep ERROR /opt/qb-integration/server.log | tail -20
```

## Backup and Restore

### Create Backup
```bash
cd /opt
tar -czf qb-integration-backup-$(date +%Y%m%d-%H%M%S).tar.gz qb-integration/
```

### Restore from Backup
```bash
cd /opt
mv qb-integration qb-integration.old
tar -xzf qb-integration-backup-[timestamp].tar.gz
cd qb-integration
npm install
pm2 restart qb-integration
```

## OAuth Configuration

### Get Salesforce OAuth URL
```bash
echo "https://customer-inspiration-2543.my.salesforce.com/services/oauth2/authorize?response_type=code&client_id=[SF_CLIENT_ID]&redirect_uri=https://sqint.atocomm.eu/auth/salesforce/callback"
```

### Get QuickBooks OAuth URL
```bash
echo "https://appcenter.intuit.com/connect/oauth2?client_id=[QB_CLIENT_ID]&scope=com.intuit.quickbooks.accounting&redirect_uri=https://sqint.atocomm.eu/auth/quickbooks/callback&response_type=code"
```

## Troubleshooting

### Check Node Processes
```bash
ps aux | grep node
lsof -i :3000
```

### Check Dependencies
```bash
npm list --depth=0
npm audit
```

### Clear PM2 Logs
```bash
pm2 flush
```

### Restart Everything
```bash
pm2 kill
cd /opt/qb-integration
npm install
pm2 start src/server.js --name qb-integration
pm2 logs
```