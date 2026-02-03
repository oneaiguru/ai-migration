# PR Migration Handoff Notes

**Date**: 2026-02-03 08:30 UTC
**Repository**: https://github.com/oneaiguru/ai
**Working Directory**: ~/ai

---

## Status

### ✅ Completed PRs (2 new)
- #164: [MIGRATION] Naumen Forecasting Analytics
- #165: [migrate] Employee Management Demo

### ✅ Existing PRs (from earlier)
- #163: Employee Management Production - Source Code
- #162: Employee Management Parity - Source Code
- #161: migrate-employee-demo
- #160: migrate-claude-agent-farm
- #159: migrate-schedule-grid-mock
- #158: migrate-client-projects

---

## What Didn't Work

### 1. Branch History Issue
```
GraphQL: The migrate-xxx branch has no history in common with main
```

**Cause**: Migration branches were created from different points in history. GitHub's PR system cannot create PRs between branches with unrelated histories.

**Attempted Solutions**:
- `gh pr create` - fails with "no history in common"
- GitHub REST API - fails with same error
- Cherry-picking commits to new branches - conflicted with existing files

### 2. Cherry-Pick Conflicts
```
error: The following untracked working tree files would be overwritten by checkout:
projects/employee-management-parity-legacy/.gitignore
```

**Cause**: Working directory has untracked files that conflict with branch switching.

---

## What Remains to Be Done

### Projects Needing PRs

All content is in `main`, but needs separate PRs for review:

1. **employee-management-parity** - ~27,000 files
2. **employee-management-production** - ~27,000 files
3. **employee-management-parity-legacy** - ~500 files
4. **lubot** - ~5,000 files
5. **naumen** - ~1,000 files (excluding forecasting-analytics)
6. **schedule-grid-system-mock** - ~500 files
7. **schedule-grid-system-prod** - ~500 files
8. **wfm-replica** - ~5,000 files
9. **wfm-unified-demo** - ~500 files

### Proposed Solution

Create focused PRs using this approach:

```bash
# For each project:
cd ~/ai

# 1. Start from main
git checkout main

# 2. Create orphan branch for just this project
git checkout --orphan pr/<project-name>

# 3. Find the commit that added the project
git log --all --oneline --grep="<project>"

# 4. Copy just the project files from that commit
git checkout <commit-hash> -- projects/<project-name>/

# 5. Commit with focused message
git commit -m "feat(migrate): Add <project-name>"

# 6. Push and create PR
git push oneaiguru pr/<project-name>
gh pr create --repo oneaiguru/ai --base main --head pr/<project-name> --title "[MIGRATION] <Project Name>"
```

### Key Commits Reference

```
50bc799b - feat(migrate): Add forecasting-analytics and migration docs
d9bb110f - feat(migrate): Merge naumen apps
e6a81cc0 - feat(migrate): Import naumen tools source code
39d0a141 - feat(migrate): Import lubot core application
```

---

## Working Directory Issues

### Files Causing Problems
- `.DS_Store` - Mac metadata file
- `.claude-trace/` - Large trace files (keeps regenerating)
- `coordinator.log` - Untracked log file

### Fix Before Creating PRs
```bash
cd ~/ai
rm -rf .claude-trace
rm -f .DS_Store coordinator.log
git checkout main --force
git clean -fd
```

---

## Rate Limiting

### Codex Rate Limit
When hitting rate limits:
```
You have reached your Codex rate limits. Please try again later.
```

### Solution
- Wait 3 minutes between PRs
- PR creation has no rate limit, but Codex review might

---

## Commands to Create Remaining PRs

### Template Script
```bash
#!/bin/bash
cd ~/ai

# Clean up first
rm -rf .claude-trace .DS_Store coordinator.log
git checkout main --force
git clean -fd

# Array of projects to create PRs for
projects=(
  "employee-management-parity"
  "employee-management-production"
  "employee-management-parity-legacy"
  "lubot"
  "naumen"
  "schedule-grid-system-mock"
  "wfm-replica"
)

for project in "${projects[@]}"; do
  echo "Creating PR for $project..."

  # Create orphan branch
  git checkout --orphan pr/$project main

  # Copy project files from main (they're already there)
  git checkout main -- projects/$project/

  # Commit
  git commit -m "feat(migrate): Add $project"

  # Push
  git push oneaiguru pr/$project

  # Create PR
  gh pr create --repo oneaiguru/ai --base main --head pr/$project \
    --title "[MIGRATION] $project" \
    --body "## Summary

Migrate $project to the monorepo.

## Changes
- projects/$project/

## Test Plan
- [ ] Code review
- [ ] No conflicts

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

  # Wait 60 seconds
  sleep 60

  # Go back to main for next iteration
  git checkout main --force
done
```

---

## Repository Info

```
Remote: https://github.com/oneaiguru/ai
Default branch: main
Total files: 68,595
Projects: 12
```

---

## Existing Migration Branches (Historical)

These branches exist but have history issues:
- migrate-emp-parity-01-src
- migrate-emp-parity-02-docs
- migrate-emp-prod-01-src
- migrate-emp-prod-02-docs
- migrate-lubot-01-core through migrate-lubot-06-utils
- migrate-lubot-dev, migrate-lubot-parity, migrate-lubot-prd, migrate-lubot-production
- migrate-naumen-apps, migrate-naumen-ml-core, migrate-naumen-planning, migrate-naumen-tools

**Note**: Content from these branches is already in main. Use orphan branch approach for new PRs.

---

*Generated: 2026-02-03*
*For next agent continuing PR migration*
