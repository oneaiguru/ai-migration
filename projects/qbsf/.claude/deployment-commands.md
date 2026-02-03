# Deployment Commands

## Salesforce Deployment

### Validate Before Deploy
```bash
cd /Users/m/git/clients/qbsf/deployment-package-fixed
sf project deploy validate --source-dir force-app --target-org olga.rybak@atocomm2023.eu > validation.log 2>&1
echo "Exit code: $?"
```

### Deploy to Production
```bash
cd /Users/m/git/clients/qbsf/deployment-package-fixed
sf project deploy start --source-dir force-app --target-org olga.rybak@atocomm2023.eu
```

### Run Apex Tests
```bash
sf apex run test --target-org olga.rybak@atocomm2023.eu --code-coverage --result-format human
```

### Quick Health Check
```bash
sf data query --query "SELECT COUNT() FROM QB_Integration_Settings__c" --target-org olga.rybak@atocomm2023.eu
```

## Middleware Deployment

### SSH to Production
```bash
ssh roman@pve.atocomm.eu -p2323
```

### Application Management
```bash
# Navigate to app directory
cd /opt/qb-integration

# Install dependencies
npm install --production

# Start with PM2
pm2 start ecosystem.config.js --env production

# View logs
pm2 logs qb-integration

# Restart application
pm2 restart qb-integration

# Check status
pm2 status
```

### Health Monitoring
```bash
# Test health endpoint
curl -k https://sqint.atocomm.eu/api/health

# Test OAuth status
curl -k https://sqint.atocomm.eu/auth/status

# Monitor real-time logs
tail -f /opt/qb-integration/logs/application.log
```

## Testing Commands

### End-to-End Test
1. Create test opportunity in Salesforce
2. Set Account_Type__c = 'Поставщик' and Country__c = 'US'
3. Change opportunity stage to "Proposal and Agreement"
4. Monitor logs for QB invoice creation
5. Verify QB_Invoice_ID__c populated

### Integration Test Query
```sql
SELECT Id, Name, StageName, QB_Invoice_ID__c, QB_Last_Sync_Date__c,
       Supplier__r.Account_Type__c, Supplier__r.Country__c
FROM Opportunity 
WHERE StageName = 'Proposal and Agreement' 
AND QB_Invoice_ID__c != null
ORDER BY LastModifiedDate DESC
LIMIT 5
```

## Troubleshooting Commands

### Check Integration Logs
```sql
SELECT Id, Status__c, Message__c, Timestamp__c, Opportunity__c
FROM QB_Integration_Log__c
ORDER BY Timestamp__c DESC
LIMIT 10
```

### Check Error Logs
```sql
SELECT Id, Error_Type__c, Error_Message__c, Timestamp__c, Opportunity__c
FROM QB_Integration_Error_Log__c
ORDER BY Timestamp__c DESC
LIMIT 10
```

### System Resource Check
```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check running processes
ps aux | grep node

# Check nginx status
sudo systemctl status nginx
```

## Emergency Commands

### Stop Integration
```bash
# Stop middleware
pm2 stop qb-integration

# Deactivate Salesforce trigger (via Apex)
# OpportunityQuickBooksTrigger.trigger → Status: Inactive
```

### Restart Services
```bash
# Restart middleware
pm2 restart qb-integration

# Restart nginx (if needed)
sudo systemctl restart nginx

# Verify services
pm2 status
curl -k https://sqint.atocomm.eu/api/health
```

### Backup Commands
```bash
# Backup application
tar -czf qb-integration-backup-$(date +%Y%m%d).tar.gz /opt/qb-integration

# Backup logs
cp /opt/qb-integration/logs/* /backup/logs/

# Database export (if applicable)
# Not applicable - using Salesforce and QuickBooks cloud storage
```
