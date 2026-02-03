# Salesforce-QuickBooks Integration Demo Guide

This guide provides comprehensive instructions for running the Salesforce-QuickBooks Integration demonstration for clients.

## 🔍 Overview

The Salesforce-QuickBooks Integration automates business processes by connecting two critical systems:

- **Create Invoices**: Generates QuickBooks invoices from Salesforce opportunities
- **Track Payments**: Updates Salesforce when payments are received in QuickBooks
- **Real-time Sync**: Maintains data consistency across both platforms

## 🚀 Quick Start

For a fast demo with minimal setup:

```bash
# Start everything with one command
./quick-demo.sh all

# Or run step-by-step
./quick-demo.sh start     # Start middleware
./quick-demo.sh create    # Create invoice 
./quick-demo.sh check     # Check payment status
```

## 🛠️ Demo Setup

### Prerequisites

- Working middleware in `/Users/m/git/clients/qbsf/final-integration`
- Valid OAuth tokens in `data/tokens.json`
- Salesforce organization with opportunity records
- QuickBooks Online account with proper authentication

### Verified Configuration

The following settings have been tested and confirmed working:

| Setting | Value |
|---------|-------|
| API Key | `quickbooks_salesforce_api_key_2025` |
| Salesforce Instance | `https://customer-inspiration-2543.my.salesforce.com` |
| QuickBooks Realm | `9341454378379755` |

### Setup Steps

1. **Run the setup script**:
   ```bash
   cd /Users/m/git/clients/qbsf
   ./setup-demo-solution.sh
   ```

2. **Verify credentials**:
   ```bash
   ./find-working-credentials.sh
   ```

3. **Start the server**:
   ```bash
   cd final-integration
   npm start
   ```

## 🎮 Interactive Demo Controller

Run the comprehensive interactive demo tool:

```bash
./demo-controller.sh
```

This provides a full-featured interface with:

- Color-coded outputs for better visibility
- Error handling and recovery
- Sample data when live data is unavailable
- Multiple demo flows

### Menu Options

1. **Start/Check Middleware**: Ensure the integration server is running
2. **Test Connection**: Verify connectivity to both Salesforce and QuickBooks
3. **Query Opportunities**: Retrieve Salesforce opportunity data
4. **Create QuickBooks Invoice**: Generate invoice from an opportunity
5. **Check Payment Status**: Update Salesforce with payment information
6. **Run Full Demo Flow**: Execute all steps in sequence

## 📊 Demo Scenarios

### Scenario 1: Create Invoice from Opportunity

```bash
# Interactive mode
./demo-controller.sh
# Then select option 4

# OR Direct command
./quick-demo.sh create 006QBjWnuEzXs5kUhL
```

**Expected Result**:
- QuickBooks invoice created with opportunity data
- Invoice ID returned and displayed
- Success message shown

### Scenario 2: Check Payment Status

```bash
# Interactive mode
./demo-controller.sh
# Then select option 5

# OR Direct command
./quick-demo.sh check
```

**Expected Result**:
- System checks QuickBooks for paid invoices
- Updates matching Salesforce opportunities
- Displays count of processed and updated records

### Scenario 3: Full Integration Flow

```bash
# Interactive mode
./demo-controller.sh
# Then select option 6

# OR Direct command
./quick-demo.sh all
```

## 🔧 API Reference

| Endpoint | Purpose | Parameters |
|----------|---------|------------|
| `/api/create-invoice` | Create QuickBooks invoice | `opportunityId`, `salesforceInstance`, `quickbooksRealm` |
| `/api/check-payment-status` | Update payment info | `salesforceInstance`, `quickbooksRealm` |
| `/api/test-connection` | Test connectivity | `salesforceInstance`, `quickbooksRealm` |
| `/api/process-eligible-opportunities` | Batch process | `salesforceInstance`, `quickbooksRealm`, `stage`, `days`, `limit` |

## 📝 Sample Data

If live data isn't available, use these sample opportunity IDs:

| Opportunity ID | Name | Amount |
|----------------|------|--------|
| `006QBjWnuEzXs5kUhL` | Burlington Textiles Weaving Plant Generator | $235,000.00 |
| `006QBjWnuEzXs5kUm3` | Grand Hotels Kitchen Generator | $155,000.00 |
| `006QBjWnuEzXs5kUn9` | United Oil Office Supplies | $75,000.00 |

## ❓ Troubleshooting

### Common Issues

1. **Middleware Not Starting**
   - Check Node.js version: `node --version` (should be 16+)
   - Verify port 3000 is available: `lsof -i :3000`
   - Check logs: `tail -f /tmp/middleware.log`

2. **Authentication Failures**
   - Verify tokens.json has valid data
   - Check token expiration and refresh if needed
   - Ensure correct API key is being used

3. **Invoice Creation Errors**
   - Verify opportunity exists in Salesforce
   - Check opportunity has required fields (Amount, Name)
   - Ensure QuickBooks has necessary customer records

### Recovery Steps

1. **Reset Integration**
   ```bash
   pkill -f "node.*server.js"
   cd final-integration
   npm start
   ```

2. **Refresh Tokens**
   ```bash
   cd final-integration
   node test-oauth.js
   ```

3. **Verify API Connectivity**
   ```bash
   cd final-integration
   node test-api.js quickbooks_salesforce_api_key_2025
   ```

## 📈 Admin Dashboard

Access the admin dashboard at http://localhost:3000/dashboard

This provides:
- System status information
- Recent activity logs
- Manual controls for integration processes

---

**Last Updated**: May 12, 2025  
**Demo Version**: 2.1.0