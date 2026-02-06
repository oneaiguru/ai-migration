# Validation Checklist Template

## For Scout Phase
**You're done when:**
- [ ] Discovery doc includes `## AI-Docs References` section with ≥3 file:line citations
- [ ] Every claimed pattern has code evidence (file:line)
- [ ] Unknowns are explicitly flagged with `[UNKNOWN]` tags
- [ ] SESSION_HANDOFF.md updated with discovery link
- [ ] **Automated check**: `npm run validate-discovery <discovery-file>` passes

## For Planner Phase  
**You're done when:**
- [ ] Plan references the scout's discovery doc in Metadata
- [ ] Every phase has explicit rollback commands
- [ ] Tests section includes exact command + expected output
- [ ] **Automated check**: `npm run validate-plan <plan-file>` passes
- [ ] Plan filename logged in PROGRESS.md

## For Executor Phase
**You're done when:**
- [ ] All commands from plan executed without errors
- [ ] `npm run build` passes
- [ ] Required tests pass (documented in plan)
- [ ] PROGRESS.md shows "✅ Complete" status
- [ ] SESSION_HANDOFF.md includes deployment URL
- [ ] **Automated check**: `git diff --name-only` matches plan's target files

## Automation Script Stub
```bash
#!/bin/bash
# docs/scripts/validate-discovery.sh
DISCOVERY_FILE=$1

# Check for required sections
grep -q "## AI-Docs References" "$DISCOVERY_FILE" || {
  echo "❌ Missing '## AI-Docs References' section"
  exit 1
}

# Check for file:line citations (basic regex)
grep -E "[a-zA-Z0-9/_-]+\.(tsx?|md):[0-9]+" "$DISCOVERY_FILE" || {
  echo "❌ No file:line citations found"
  exit 1
}

echo "✅ Discovery doc validation passed"
```
