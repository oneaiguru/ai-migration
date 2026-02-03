# 🔐 Salesforce CLI Authentication Cheat Sheet

## Quick Authentication for Roman's Project

### Credentials
- **Sandbox**: `olga.rybak@atocomm2023.eu.sanboxsf` / `oYfNMU2N`
- **Production**: `olga.rybak@atocomm2023.eu` / `0mj3DqPv28Dp2`
- **Domain**: `customer-inspiration-2543`

### Method 1: Check Existing Connections (FASTEST)
```bash
# Check if already authenticated
sf org list

# Look for:
# myorg - production (olga.rybak@atocomm2023.eu)
# sanboxsf - sandbox (olga.rybak@atocomm2023.eu.sanboxsf)
```

### Method 2: Device Authentication (RECOMMENDED)
```bash
# Sandbox
sf org login device --alias roman-sandbox --instance-url https://customer-inspiration-2543--sanboxsf.sandbox.my.salesforce.com

# Production  
sf org login device --alias roman-prod --instance-url https://customer-inspiration-2543.my.salesforce.com
```

### Method 3: Web Authentication (IF NEEDED)
```bash
# Sandbox
sf org login web --alias roman-sandbox --instance-url https://customer-inspiration-2543--sanboxsf.sandbox.my.salesforce.com

# Production
sf org login web --alias roman-prod --instance-url https://customer-inspiration-2543.my.salesforce.com
```

## Common Commands After Authentication

### Essential Analysis Commands
```bash
# Run tests with coverage
sf apex run test --code-coverage --result-format json --target-org sanboxsf

# Get coverage by class
sf data query --query "SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered, Coverage FROM ApexCodeCoverage ORDER BY Coverage ASC" --target-org sanboxsf

# Get org-wide coverage
sf data query --query "SELECT PercentCovered FROM ApexOrgWideCoverage" --target-org sanboxsf

# Retrieve all code
sf project retrieve start -m ApexClass --target-org sanboxsf
sf project retrieve start -m ApexTrigger --target-org sanboxsf
```

### Troubleshooting
- **Browser hanging**: Use device method instead
- **Invalid domain error**: Ensure correct URL format (.sandbox.my.salesforce.com for sandboxes)
- **Already authenticated**: Check `sf org list` first

### Quick Reference
- Sandbox alias: `sanboxsf` or `roman-sandbox`
- Production alias: `myorg` or `roman-prod`  
- Always use `--target-org` flag to specify which org