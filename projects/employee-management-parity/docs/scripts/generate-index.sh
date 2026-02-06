#!/bin/bash
set -euo pipefail
OUTPUT="docs/System/documentation-index.md"
DATE=$(date +"%Y-%m-%d")
{
  echo "# Documentation Index"
  echo
  echo "> Last updated: ${DATE}"
  echo
  echo "| Topic | Location |"
  echo "| --- | --- | --- |"
  echo "| Start Here | \`docs/START_HERE.md\` |"
  echo "| Status Dashboard | \`docs/STATUS_DASHBOARD.md\` |"
  echo "| SOPs | \`docs/SOP/standard-operating-procedures.md\` |"
  echo "| UAT Master Workflow | \`docs/SOP/uat/master-uat-workflow.md\` |"
  echo "| Troubleshooting | \`docs/TROUBLESHOOTING.md\` |"
  echo "| Parity plan & status | \`docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md\` |"
  echo "| Reports index | \`docs/System/DEMO_PARITY_INDEX.md\` |"
} > "$OUTPUT"
echo "✅ Index regenerated: $OUTPUT"
