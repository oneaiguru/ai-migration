#!/usr/bin/env bash
set -euo pipefail

DEMO=${1:-}
if [[ -z "$DEMO" ]]; then
  echo "Usage: $0 <manager|analytics|employee|forecasting>" >&2
  exit 2
fi

base="docs/Workspace/Coordinator"
case "$DEMO" in
  manager)      dir="$base/manager-portal"; label="Manager Portal";;
  analytics)    dir="$base/analytics-dashboard"; label="Analytics Dashboard";;
  employee)     dir="$base/employee-portal"; label="WFM Employee Portal";;
  forecasting)  dir="$base/forecasting-analytics"; label="Forecasting & Analytics";;
  *) echo "Unknown demo: $DEMO" >&2; exit 2;;
esac

echo "Auto‑review: $label"

code_map_ok=false
findings_ok=false
handoff_ok=false
tracker_ok=false
checklist_ok=false

[[ -f "$dir/CodeMap.md" ]] && code_map_ok=true || echo "Missing CodeMap.md in $dir"

findings_file=$(ls "$dir"/UAT_Findings_* 2>/dev/null | head -n1 || true)
if [[ -n "${findings_file:-}" ]]; then
  if rg -n "\|\s*ID\s*\|" "$findings_file" >/dev/null; then
    findings_ok=true
  else
    echo "Findings file present but table header not found: $findings_file"
  fi
else
  echo "Missing UAT_Findings_* in $dir"
fi

if rg -n "$label" docs/SESSION_HANDOFF.md >/dev/null; then
  handoff_ok=true
else
  echo "Handoff entry mentioning $label not found"
fi

if rg -n "$label|${DEMO^^}|${DEMO^}" docs/Tasks/post-phase9-demo-execution.md >/dev/null; then
  tracker_ok=true
else
  echo "Tracker row not found for $label"
fi

if [[ -f docs/Reports/PARITY_MVP_CHECKLISTS.md ]]; then
  checklist_ok=true
else
  echo "Canonical checklist missing: docs/Reports/PARITY_MVP_CHECKLISTS.md"
fi

echo "Summary: CodeMap=$code_map_ok Findings=$findings_ok Handoff=$handoff_ok Tracker=$tracker_ok Checklist=$checklist_ok"
if $code_map_ok && $findings_ok && $handoff_ok && $tracker_ok && $checklist_ok; then
  exit 0
else
  exit 1
fi

