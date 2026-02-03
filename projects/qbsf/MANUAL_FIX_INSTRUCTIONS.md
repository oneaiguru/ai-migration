# 🔧 MANUAL FIX INSTRUCTIONS FOR ROMAN'S ADMIN

**ВАЖНО**: Эти инструкции для исправления интеграции QuickBooks-Salesforce  
**IMPORTANT**: These instructions fix the QuickBooks-Salesforce integration  

---

## 📋 QUICK FIX (5 MINUTES)

### Step 1: Connect to Server
```bash
ssh roman@pve.atocomm.eu -p2323
# OR use your normal connection method
```

### Step 2: Run These Commands
```bash
# 1. Go to integration directory
cd /opt/qb-integration

# 2. Backup current version
cp -r /opt/qb-integration /opt/qb-integration.backup

# 3. Stop current server
pkill -f node

# 4. Fix Salesforce URL (CRITICAL!)
sed -i 's|olga-rybak-atocomm2023-eu|customer-inspiration-2543|g' .env

# 5. Add missing URL
echo "SF_INSTANCE_URL=https://customer-inspiration-2543.my.salesforce.com" >> .env

# 6. Install missing module
npm install express
npm install

# 7. Start correct server
NODE_ENV=production node src/server.js
```

### Step 3: Verify It Works
```bash
# Check if running
curl https://sqint.atocomm.eu/api/health

# Should see: {"success":true,"status":"healthy"}
```

---

## 🚨 COMPLETE FIX SCRIPT

Save this as `fix-qb-integration.sh` and run it:

```bash
#!/bin/bash

echo "========================================="
echo "   QuickBooks Integration Fix Script"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to directory
cd /opt/qb-integration || { echo -e "${RED}Error: Directory not found${NC}"; exit 1; }

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
BACKUP_DIR="/opt/qb-integration.backup.$(date +%Y%m%d-%H%M%S)"
cp -r /opt/qb-integration "$BACKUP_DIR"
echo -e "${GREEN}Backup created at: $BACKUP_DIR${NC}"

# Stop current servers
echo -e "${YELLOW}Stopping current Node processes...${NC}"
pkill -f node
sleep 2

# Fix Salesforce URL
echo -e "${YELLOW}Fixing Salesforce URL...${NC}"
sed -i 's|olga-rybak-atocomm2023-eu|customer-inspiration-2543|g' .env
echo -e "${GREEN}✓ Salesforce URL fixed${NC}"

# Add missing SF_INSTANCE_URL
if ! grep -q "SF_INSTANCE_URL" .env; then
    echo -e "${YELLOW}Adding SF_INSTANCE_URL...${NC}"
    echo "SF_INSTANCE_URL=https://customer-inspiration-2543.my.salesforce.com" >> .env
    echo -e "${GREEN}✓ SF_INSTANCE_URL added${NC}"
fi

# Fix scheduler cron patterns
echo -e "${YELLOW}Setting 5-minute schedulers...${NC}"
sed -i 's|INVOICE_CREATION_CRON=.*|INVOICE_CREATION_CRON=*/5 * * * *|' .env
sed -i 's|PAYMENT_CHECK_CRON=.*|PAYMENT_CHECK_CRON=*/5 * * * *|' .env
echo -e "${GREEN}✓ Schedulers set to 5 minutes${NC}"

# Install missing dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install express axios dotenv node-cron winston cors helmet jsonwebtoken
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Display current configuration
echo -e "${YELLOW}Current configuration:${NC}"
echo "========================================="
grep -E "SF_LOGIN_URL|SF_INSTANCE_URL|QB_ENVIRONMENT|NODE_ENV|PORT" .env
echo "========================================="

# Start production server with PM2 if available
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Starting with PM2...${NC}"
    pm2 delete qb-integration 2>/dev/null
    pm2 start src/server.js --name qb-integration
    pm2 save
    echo -e "${GREEN}✓ Server started with PM2${NC}"
else
    echo -e "${YELLOW}Starting server (without PM2)...${NC}"
    NODE_ENV=production nohup node src/server.js > server.log 2>&1 &
    echo -e "${GREEN}✓ Server started in background${NC}"
fi

# Wait for server to start
sleep 5

# Test server
echo -e "${YELLOW}Testing server...${NC}"
if curl -s http://localhost:3000/api/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ Server is healthy!${NC}"
else
    echo -e "${RED}⚠ Server test failed - check logs${NC}"
fi

# Test external access
echo -e "${YELLOW}Testing external access...${NC}"
if curl -s https://sqint.atocomm.eu/api/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ External access working!${NC}"
else
    echo -e "${YELLOW}⚠ External access not confirmed - may need time to propagate${NC}"
fi

echo "========================================="
echo -e "${GREEN}   Fix script completed!${NC}"
echo "========================================="
echo "Logs location: /opt/qb-integration/server.log"
echo ""
echo "To check logs:"
echo "  tail -f /opt/qb-integration/server.log"
echo ""
echo "To check PM2 status:"
echo "  pm2 status"
echo "  pm2 logs qb-integration"
```

---

## ✅ WHAT THIS FIXES

1. ✅ **Wrong Salesforce URL** - Changes to correct domain
2. ✅ **Missing express module** - Installs all dependencies  
3. ✅ **Wrong server running** - Starts src/server.js
4. ✅ **Missing OAuth connection** - Prepares for OAuth setup
5. ✅ **Scheduler timing** - Sets to 5-minute intervals

---

## 🔍 VERIFY SUCCESS

After running the script, check:

```bash
# 1. Server is running
ps aux | grep node

# 2. API responds
curl https://sqint.atocomm.eu/api/health

# 3. Check logs for errors
tail -f /opt/qb-integration/server.log

# 4. Scheduler is working
grep "Scheduler started" /opt/qb-integration/server.log
```

---

## ⚠️ IF PROBLEMS OCCUR

### Rollback to backup:
```bash
pm2 stop qb-integration
cd /opt
rm -rf qb-integration
mv qb-integration.backup qb-integration
cd qb-integration
npm start
```

### Common issues:
- **Port 3000 in use**: `lsof -i :3000` then `kill -9 [PID]`
- **Permission denied**: Run as root or with sudo
- **npm not found**: Install Node.js first

---

## 📞 NEXT STEPS AFTER FIX

1. **Configure OAuth** - Need to set up Salesforce and QuickBooks credentials
2. **Test Integration** - Create test opportunity in Salesforce
3. **Monitor Logs** - Ensure scheduler is running every 5 minutes

---

**Роман, попросите вашего администратора выполнить эти команды.**  
**Roman, please ask your admin to run these commands.**

*If you need help, save all error messages and logs.*