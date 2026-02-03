#!/bin/bash
# validate-deployment.sh - Quick validation before deployment

echo "🔍 Validating Deployment Package"
echo "================================"

cd /Users/m/git/clients/qbsf/deployment-package

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

validate() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

echo "Checking file structure..."

# Check critical files
files_to_check=(
    "force-app/main/default/objects/Account/fields/Type.field-meta.xml"
    "force-app/main/default/objects/Account/fields/Country__c.field-meta.xml"
    "force-app/main/default/objects/Opportunity/fields/Supplier__c.field-meta.xml"
    "force-app/main/default/triggers/InvoiceQBSyncTrigger.trigger"
    "force-app/main/default/classes/QBPaymentMonitor.cls"
    "manifest/package.xml"
)

all_files_exist=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file (MISSING)"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = true ]; then
    echo -e "\n${GREEN}🎉 All files present and ready for deployment!${NC}"
    echo -e "\n📋 Deployment command:"
    echo -e "${YELLOW}chmod +x final-deploy.sh && ./final-deploy.sh${NC}"
    echo -e "\n⏱️  Estimated deployment time: 15 minutes"
else
    echo -e "\n${RED}❌ Some files are missing. Please check the above list.${NC}"
    exit 1
fi

# Count components
apex_classes=$(find force-app/main/default/classes -name "*.cls" | wc -l)
triggers=$(find force-app/main/default/triggers -name "*.trigger" | wc -l)
fields=$(find force-app/main/default/objects -name "*.field-meta.xml" | wc -l)

echo -e "\n📊 Component Summary:"
echo -e "   Apex Classes: $apex_classes"
echo -e "   Triggers: $triggers" 
echo -e "   Custom Fields: $fields"

echo -e "\n🚀 Ready to deploy!"
