#!/bin/bash

echo "🔍 Quick Validation: Salesforce-QuickBooks Integration"
echo "====================================================="

cd /Users/m/git/clients/qbsf/deployment-package-fixed

echo "Running validation only (no deployment)..."

sf project deploy validate --source-dir force-app --target-org olga.rybak@atocomm2023.eu

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo "✅ Validation PASSED! Ready for deployment."
else
    echo "❌ Validation FAILED. Check output above."
fi

exit $exit_code
