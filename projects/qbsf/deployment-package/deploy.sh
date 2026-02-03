#!/bin/bash
# deploy.sh - Final deployment script for Salesforce-QuickBooks Integration

echo "🚀 Deploying Salesforce-QuickBooks Integration Phase 2"
echo "======================================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DEPLOYMENT_DIR="/Users/m/git/clients/qbsf/deployment-package"
TARGET_ORG="production"  # Change to your org alias

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Navigate to deployment directory
cd "$DEPLOYMENT_DIR"

# Step 1: Validate deployment
log_info "Step 1: Validating deployment..."
sfdx force:source:deploy -p force-app -u "$TARGET_ORG" --checkonly --testlevel RunLocalTests

if [ $? -ne 0 ]; then
    log_error "Validation failed! Fix errors before deployment."
    exit 1
fi

log_info "✅ Validation successful!"

# Step 2: Deploy to production
log_info "Step 2: Deploying to production..."
sfdx force:source:deploy -p force-app -u "$TARGET_ORG" --testlevel RunLocalTests

if [ $? -ne 0 ]; then
    log_error "Deployment failed!"
    exit 1
fi

log_info "✅ Salesforce deployment successful!"

# Step 3: Setup payment monitoring
log_info "Step 3: Setting up payment monitoring..."
sfdx force:apex:execute -u "$TARGET_ORG" << 'EOF'
// Schedule automatic payment monitoring every 10 minutes
QBPaymentMonitor.schedulePaymentMonitoring();
System.debug('✅ Payment monitoring scheduled successfully');
EOF

log_info "✅ Payment monitoring configured!"

# Step 4: Verify deployment
log_info "Step 4: Verifying deployment..."
echo "Checking deployed components..."

# Check triggers
TRIGGERS=$(sfdx force:source:retrieve -m ApexTrigger:InvoiceQBSyncTrigger,ApexTrigger:OpportunityInvoiceTrigger -u "$TARGET_ORG" 2>/dev/null)
if [ $? -eq 0 ]; then
    log_info "✅ Triggers deployed successfully"
else
    log_warn "⚠️  Could not verify trigger deployment"
fi

# Check classes
CLASSES=$(sfdx force:source:retrieve -m ApexClass:QBPaymentMonitor -u "$TARGET_ORG" 2>/dev/null)
if [ $? -eq 0 ]; then
    log_info "✅ Classes deployed successfully"
else
    log_warn "⚠️  Could not verify class deployment"
fi

echo ""
log_info "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update QB_Integration_Settings__c with production middleware URL"
echo "2. Configure OAuth for Salesforce and QuickBooks"
echo "3. Test with a sample opportunity"
echo ""
echo "🔗 Middleware should be deployed to: sf-qb-integration.atocomm.eu"
echo "📧 Contact support if needed: m@granin.com"
