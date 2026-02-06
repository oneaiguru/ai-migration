# Deployment Specification

## 🎯 Objective
Deploy and fix the Salesforce-QuickBooks integration on Roman's production server to enable automated invoice creation and payment synchronization.

## 📋 Pre-Deployment Checklist
- [ ] SSH access verified: `roman@pve.atocomm.eu -p2323`
- [ ] Backup current `/opt/qb-integration` directory
- [ ] Document current .env configuration
- [ ] Verify Salesforce org access
- [ ] Confirm QuickBooks app credentials available

## 🚀 Deployment Phases

### Phase 1: Server Assessment (15 minutes)
```bash
# 1. Connect to server
ssh roman@pve.atocomm.eu -p2323
# Password: see SECRETS.local.md (gitignored, local only)

# 2. Check current state
cd /opt/qb-integration
ls -la
cat .env | grep -E "SF_|QB_|PORT|NODE_ENV"
ps aux | grep node
npm list --depth=0

# 3. Backup current state
cp -r /opt/qb-integration /opt/qb-integration.backup.$(date +%Y%m%d)
```

### Phase 2: Fix Configuration (20 minutes)
```bash
# 1. Stop current server
pkill -f node

# 2. Fix Salesforce URL
sed -i 's|olga-rybak-atocomm2023-eu|customer-inspiration-2543|g' .env

# 3. Add missing SF_INSTANCE_URL if not present
grep -q "SF_INSTANCE_URL" .env || echo "SF_INSTANCE_URL=https://customer-inspiration-2543.my.salesforce.com" >> .env

# 4. Install missing dependencies
npm install express axios dotenv node-cron winston cors helmet jsonwebtoken

# 5. Verify package.json dependencies
cat package.json
```

### Phase 3: Deploy Production Code (30 minutes)
```bash
# 1. Copy production code from local
# On local machine:
cd /Users/m/git/clients/qbsf/deployment/sf-qb-integration-final
tar -czf sf-qb-integration.tar.gz .
scp -P 2323 sf-qb-integration.tar.gz roman@pve.atocomm.eu:/tmp/

# 2. On server: Extract and update
cd /opt/qb-integration
tar -xzf /tmp/sf-qb-integration.tar.gz

# 3. Preserve .env configuration
cp /opt/qb-integration.backup.*/.env .env

# 4. Install dependencies
npm install

# 5. Start production server
NODE_ENV=production node src/server.js
```

### Phase 4: Configure OAuth (45 minutes)

#### Salesforce Connected App
1. Login: https://customer-inspiration-2543.my.salesforce.com
   - User: see SECRETS.local.md (gitignored, local only)
   - Password: see SECRETS.local.md (gitignored, local only)

2. Setup → Apps → App Manager → New Connected App
   ```
   Name: QB Integration Middleware
   API Name: QB_Integration_Middleware
   Contact Email: admin@atocomm.eu
   Enable OAuth: Yes
   Callback URL: https://sqint.atocomm.eu/auth/salesforce/callback
   Scopes: Full access (full), Perform requests (api), 
           Access refresh tokens (refresh_token)
   ```

3. Get Consumer Key & Secret → Update .env

#### QuickBooks App
1. Login to QuickBooks Developer
2. Select "Middleware" app (not SF Integration)
3. Complete compliance:
   - EULA URL: https://sqint.atocomm.eu/eula
   - Privacy URL: https://sqint.atocomm.eu/privacy
4. Get Production Keys → Update .env

### Phase 5: Deploy Salesforce Components (30 minutes)
```bash
# On local machine
cd /Users/m/git/clients/qbsf

# 1. Configure Salesforce CLI
sf org login web --alias roman-prod --instance-url https://customer-inspiration-2543.my.salesforce.com

# 2. Deploy with appropriate test level
sf project deploy start --source-dir force-app --target-org roman-prod --test-level Default

# 3. If errors, try specific components
sf project deploy start --source-dir force-app/main/default/classes --target-org roman-prod
sf project deploy start --source-dir force-app/main/default/lwc --target-org roman-prod
sf project deploy start --source-dir force-app/main/default/triggers --target-org roman-prod
```

### Phase 6: Testing (30 minutes)

#### API Health Checks
```bash
# 1. Basic health
curl https://sqint.atocomm.eu/api/health

# 2. Test with API key
curl -H "X-API-Key: <API_KEY from .env or SECRETS.local.md>" \
     https://sqint.atocomm.eu/api/health

# 3. Check OAuth status
curl https://sqint.atocomm.eu/api/oauth/status \
     -H "X-API-Key: <API_KEY from .env or SECRETS.local.md>"
```

#### End-to-End Test
1. Create test Opportunity in Salesforce
2. Add products/line items
3. Change stage to "Proposal and Agreement"
4. Verify invoice created in QuickBooks
5. Mark invoice as paid in QuickBooks
6. Verify Opportunity updated in Salesforce

### Phase 7: Production Monitoring (15 minutes)
```bash
# 1. Setup PM2 for process management
npm install -g pm2
pm2 start src/server.js --name qb-integration
pm2 save
pm2 startup

# 2. Setup log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# 3. Monitor logs
pm2 logs qb-integration --lines 100
```

## 🔍 Validation Criteria

### Success Indicators
- [ ] Server running without errors
- [ ] Correct Salesforce URL in configuration
- [ ] OAuth tokens successfully obtained
- [ ] Scheduler running (check logs for "Scheduler started")
- [ ] API health check returns 200 OK
- [ ] Test invoice created successfully
- [ ] Payment status synced back to Salesforce

### Performance Metrics
- API response time < 2 seconds
- Invoice creation < 5 seconds
- Payment sync within 5 minutes
- No memory leaks after 24 hours
- CPU usage < 50%

## 🚨 Rollback Plan

If deployment fails:
```bash
# 1. Stop current server
pm2 stop qb-integration

# 2. Restore backup
cd /opt
mv qb-integration qb-integration.failed
mv qb-integration.backup.* qb-integration

# 3. Restart old version
cd /opt/qb-integration
npm start
```

## 📊 Post-Deployment

### Documentation Updates
- [ ] Update COMPLETION_REPORT.md
- [ ] Document OAuth credentials location
- [ ] Create troubleshooting guide
- [ ] Record performance baselines

### Handover to Roman
- [ ] Demonstrate working integration
- [ ] Provide admin credentials
- [ ] Show monitoring dashboard
- [ ] Explain maintenance procedures
- [ ] Confirm payment of 30,000 RUB

## ⏱️ Timeline
- **Total Time**: ~3 hours
- **Critical Path**: OAuth configuration
- **Risk Areas**: Token permissions, test coverage
- **Completion Target**: Within 24 hours
