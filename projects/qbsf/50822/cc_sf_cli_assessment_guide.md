# 🎯 SF CLI SYSTEMATIC ASSESSMENT GUIDE FOR CC

## 📋 ASSUMPTION: Roman's work may be unprofessional - verify everything

## 🔧 PHASE 1: SETUP & ACCESS

### 1. Connect to Sandbox
```bash
sf org login web --alias roman-sandbox
# Use browser to login:
# URL: https://customer-inspiration-2543--sanboxsf.sandbox.lightning.force.com
# User: olga.rybak@atocomm2023.eu.sanboxsf
# Password: oYfNMU2N
```

### 2. Verify Connection
```bash
sf org list
sf org display --target-org roman-sandbox
```

## 🔍 PHASE 2: COMPLETE METADATA ASSESSMENT

### 3. Pull ALL Apex Code
```bash
sf project retrieve start -m ApexClass,ApexTrigger -o roman-sandbox
```

### 4. List Everything Roman Has
```bash
# List all classes
sf project list metadata -m ApexClass -o roman-sandbox

# List all triggers  
sf project list metadata -m ApexTrigger -o roman-sandbox

# List custom objects
sf project list metadata -m CustomObject -o roman-sandbox
```

## 📊 PHASE 3: COVERAGE ANALYSIS

### 5. Run All Tests with Coverage
```bash
sf apex run test --code-coverage --result-format human -o roman-sandbox
```

### 6. Get Detailed Coverage Data
```bash
# Query coverage by class
sf data query --query "SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered, Coverage FROM ApexCodeCoverage ORDER BY Coverage ASC" -o roman-sandbox

# Get org-wide coverage
sf data query --query "SELECT PercentCovered FROM ApexOrgWideCoverage" -o roman-sandbox
```

## 🔍 PHASE 4: INTEGRATION COMPONENT AUDIT

### 7. Check for QB Integration Components
```bash
# Look for QB-related classes
sf data query --query "SELECT Name, Body FROM ApexClass WHERE Name LIKE '%QB%' OR Name LIKE '%QuickBooks%'" -o roman-sandbox

# Check for opportunity-related triggers
sf data query --query "SELECT Name, Body FROM ApexTrigger WHERE TableEnumOrId = 'Opportunity'" -o roman-sandbox

# Check custom fields on Opportunity
sf data query --query "SELECT QualifiedApiName FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = 'Opportunity' AND QualifiedApiName LIKE '%QB%'" -o roman-sandbox
```

## 🎯 PHASE 5: ASSESS WHAT'S USEFUL

### 8. Analyze Each Component
For each class/trigger found:
```bash
# Get class details
sf data query --query "SELECT Name, Body, CreatedDate, LastModifiedDate FROM ApexClass WHERE Name = 'ClassName'" -o roman-sandbox

# Check if class has tests
sf data query --query "SELECT Name FROM ApexClass WHERE Name LIKE '%ClassName%Test%'" -o roman-sandbox
```

## 📋 PHASE 6: PRODUCTION COMPARISON

### 9. Connect to Production  
```bash
sf org login web --alias roman-prod
# User: olga.rybak@atocomm2023.eu
# Password: 0mj3DqPv28Dp2
```

### 10. Compare Production State
```bash
# Production coverage
sf apex run test --code-coverage --result-format human -o roman-prod

# Production QB components (if any)
sf data query --query "SELECT Name FROM ApexClass WHERE Name LIKE '%QB%'" -o roman-prod
```

## 📊 DELIVERABLES TO CREATE

### Create These Files:
1. **ROMAN_CODE_AUDIT.md** - Complete list of what he built
2. **COVERAGE_GAP_ANALYSIS.md** - Exact lines needed for 75%
3. **USEFUL_VS_BROKEN.md** - What can be salvaged vs rebuilt
4. **PRODUCTION_DEPLOYMENT_PLAN.md** - Change set strategy

## 🚨 CRITICAL ASSESSMENT CRITERIA

### Consider Roman's work BROKEN unless proven otherwise:
- Does the code compile?
- Do tests exist and pass?
- Is coverage >1% for triggers, reasonable for classes?
- Does logic match integration requirements?
- Are field references correct?

### Trust only what you can verify through CLI commands

## 🎯 OUTPUT FORMAT

For each component found, document:
```
COMPONENT: [Name]
TYPE: [Class/Trigger/Object]
STATUS: [Useful/Broken/Partial]
COVERAGE: [X%]
ISSUES: [List problems]
RECOMMENDATION: [Keep/Fix/Rebuild]
```

## 🚀 START SYSTEMATIC ASSESSMENT

Begin with Phase 1 and work through methodically. Assume nothing about quality - verify everything with CLI tools.