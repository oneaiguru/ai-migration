# 🔄 ALTERNATIVE DEPLOYMENT OPTIONS

Since SSH access is blocked, here are alternative ways to deploy the fix:

---

## 📋 OPTION 1: Remote Command Execution Script

**Give this URL to Roman's admin to run:**

```bash
# One-line remote fix (admin can run this)
curl -sSL https://raw.githubusercontent.com/[your-repo]/fix-qb.sh | bash
```

OR save and run locally:

```bash
wget https://example.com/fix-qb-integration.sh
chmod +x fix-qb-integration.sh
./fix-qb-integration.sh
```

---

## 📋 OPTION 2: Step-by-Step Manual Fix

**Roman can do this himself via any server panel:**

### Via cPanel/Plesk/Web Panel:
1. **File Manager** → Navigate to `/opt/qb-integration`
2. **Edit** `.env` file
3. **Find & Replace**:
   - Find: `olga-rybak-atocomm2023-eu`
   - Replace: `customer-inspiration-2543`
4. **Add line**: `SF_INSTANCE_URL=https://customer-inspiration-2543.my.salesforce.com`
5. **Terminal/Console** → Run:
   ```
   cd /opt/qb-integration
   npm install express
   pkill -f node
   node src/server.js
   ```

---

## 📋 OPTION 3: GitHub/Git Deployment

If the server has Git access:

```bash
# Admin runs these commands
cd /opt
mv qb-integration qb-integration.old
git clone https://github.com/[your-repo]/qb-integration.git
cd qb-integration
cp ../qb-integration.old/.env .
# Then apply fixes to .env as shown above
npm install
node src/server.js
```

---

## 📋 OPTION 4: Docker Deployment

If Docker is available:

```dockerfile
# Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

```bash
# Deploy with Docker
docker build -t qb-integration .
docker run -d -p 3000:3000 \
  --env-file /opt/qb-integration/.env \
  --name qb-integration \
  qb-integration
```

---

## 📋 OPTION 5: FTP Upload + Manual Commands

### Files to Upload via FTP:
1. Upload `qb-integration-deployment.tar.gz` to `/tmp/`
2. Connect via web terminal or panel console
3. Run:
   ```bash
   cd /opt/qb-integration
   tar -xzf /tmp/qb-integration-deployment.tar.gz
   # Fix .env as described
   npm install
   node src/server.js
   ```

---

## 📋 OPTION 6: Create System Service

**For permanent fix with auto-restart:**

Create `/etc/systemd/system/qb-integration.service`:

```ini
[Unit]
Description=QuickBooks Integration Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/qb-integration
ExecStart=/usr/bin/node src/server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then:
```bash
systemctl daemon-reload
systemctl enable qb-integration
systemctl start qb-integration
```

---

## 📋 OPTION 7: Email Instructions to Admin

**Email template for Roman to send to admin:**

```
Subject: Urgent: Fix QuickBooks Integration

Please run these commands on server pve.atocomm.eu:

1. cd /opt/qb-integration
2. pkill -f node
3. sed -i 's|olga-rybak-atocomm2023-eu|customer-inspiration-2543|g' .env
4. npm install express
5. node src/server.js

This fixes the integration errors. Should take 5 minutes.

Check it works:
curl https://sqint.atocomm.eu/api/health

Should return: {"success":true,"status":"healthy"}
```

---

## 📋 OPTION 8: Screen Share Session

Roman can:
1. Schedule screen share with admin
2. Guide them through the fix
3. Use MANUAL_FIX_INSTRUCTIONS.md as reference

---

## 🚨 FASTEST OPTION

**The absolute fastest fix (2 minutes):**

If Roman can access the server through ANY method (web panel, console, etc.):

```bash
cd /opt/qb-integration && pkill -f node && sed -i 's|olga-rybak-atocomm2023-eu|customer-inspiration-2543|g' .env && npm install express && node src/server.js
```

This one line fixes everything.

---

## 📞 MESSAGE FOR ROMAN

```
Roman,

Since SSH isn't working, please choose one option:

1. Have admin run the one-line fix above
2. Access server via web panel and edit .env file
3. Provide correct SSH password
4. Give admin the manual instructions

Any option will work. The fix takes only 5 minutes.

The integration is ready - we just need to apply the fix.
```

---

*All options will achieve the same result: fixing the integration*  
*Choose the most convenient method for your setup*