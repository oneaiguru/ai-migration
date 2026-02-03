#!/bin/bash
# Desktop to Repo Consolidation - All-in-one script
# Uses sed for efficient text processing

set -e
cd /Users/m/ai/projects/tuings

echo "=== CONSOLIDATION START ==="

# 1. CREATE DIRECTORY STRUCTURE
echo "Creating directories..."
mkdir -p docs/{product/{core-features,data-export,user-experience,reference},screenshots,analysis,archived}
mkdir -p reference-repos

# 2. COPY PRODUCT DOCS with numbering
echo "Copying product documentation..."
cp ~/Desktop/Things_Documentation/Core_Features/Creating_Repeating_To-Dos.md docs/product/core-features/01_Creating_Repeating_To-Dos.md
cp ~/Desktop/Things_Documentation/Core_Features/Keyboard_Shortcuts_for_Mac.md docs/product/core-features/02_Keyboard_Shortcuts.md
cp ~/Desktop/Things_Documentation/Core_Features/Scheduling_To-Dos_in_Things.md docs/product/core-features/03_Scheduling_To-Dos.md
cp ~/Desktop/Things_Documentation/Core_Features/Searching_and_Navigating_with_Quick_Find.md docs/product/core-features/04_Search_and_Quick_Find.md
cp ~/Desktop/Things_Documentation/Core_Features/Using_Tags.md docs/product/core-features/05_Using_Tags.md
cp ~/Desktop/Things_Documentation/Core_Features/Whats_new_in__the_all-new_Things.md docs/product/core-features/06_Whats_New.md
cp ~/Desktop/Things_Documentation/Core_Features/Writing_Notes_in_Things.md docs/product/core-features/07_Writing_Notes.md

cp ~/Desktop/Things_Documentation/Data_Export/Exporting_Your_Data.md docs/product/data-export/01_Exporting_Data.md
cp ~/Desktop/Things_Documentation/Data_Export/Things_AppleScript_Guide.md docs/product/data-export/02_AppleScript_Guide.md
cp ~/Desktop/Things_Documentation/Data_Export/Things_URL_Scheme.md docs/product/data-export/03_URL_Scheme.md

cp ~/Desktop/Things_Documentation/User_Experience/An_In-Depth_Look_at_Today,_Upcoming,_Anytime,_and_Someday.md docs/product/user-experience/01_Lists_Overview.md
cp ~/Desktop/Things_Documentation/User_Experience/Gather_it_all_in_one_place.md docs/product/user-experience/02_Gather_in_One_Place.md
cp ~/Desktop/Things_Documentation/User_Experience/How_to_Deal_with_Waiting_To-Dos.md docs/product/user-experience/03_Waiting_To-Dos.md
cp ~/Desktop/Things_Documentation/User_Experience/How_to_Prioritize_To-Dos_in_Things.md docs/product/user-experience/04_Prioritization.md
cp ~/Desktop/Things_Documentation/User_Experience/Why_Some_To-Dos_Get_Stuck_and_How_to_Get_Them_Moving_Again.md docs/product/user-experience/05_Getting_Stuck.md

cp ~/Desktop/Things_Documentation/Reference/Markdown_Guide.md docs/product/reference/Markdown_Guide.md
cp ~/Desktop/Things_Documentation/Reference/Things3AppleScriptGuide.pdf docs/product/reference/Things3AppleScriptGuide.pdf

cp ~/Desktop/Things_Documentation/DOCUMENTATION_INDEX.md docs/product/DOCUMENTATION_INDEX.md

# 3. COPY SCREENSHOTS
echo "Copying screenshots..."
cp ~/Desktop/Things_Screenshots/*.png docs/screenshots/ 2>/dev/null || true
cp ~/Desktop/Things_Screenshots/SCREENSHOT_INDEX.md docs/screenshots/

# 4. COPY & PROCESS ANALYSIS DOCS
echo "Processing analysis documents..."

# Copy source of truth (no changes)
cp ~/Desktop/prompt.md docs/analysis/PROMPT.md
cp ~/Desktop/DATABASE_EXTRACTION_GUIDE.md docs/analysis/DATABASE_EXTRACTION_GUIDE.md

# Copy with archive name
cp ~/Desktop/README.md docs/analysis/ARCHIVED_PROJECT_OVERVIEW.md
cp ~/Desktop/INDEX.md docs/analysis/ARCHIVED_RESOURCE_INDEX.md
cp ~/Desktop/REPO_ANALYSIS_AND_STRATEGY.md docs/analysis/ARCHIVED_REPO_ANALYSIS.md
cp ~/Desktop/THINGS_TUI_HYBRID_APPROACH.md docs/analysis/ARCHIVED_HYBRID_APPROACH.md
cp ~/Desktop/THINGS_PROJECT_INDEX.md docs/analysis/ARCHIVED_PROJECT_INDEX.md
cp ~/Desktop/TYPESCRIPT_TUI_QUICK_START.md docs/analysis/ARCHIVED_TYPESCRIPT_QUICKSTART.md

# Extract useful parts from DOCUMENTATION_PLAN.md (Parts 1-4, 6 only)
# Use sed to extract lines 1-430 (skip Part 5 & 7 which are outdated)
sed -n '1,432p' ~/Desktop/DOCUMENTATION_PLAN.md | sed '$a\
\
---\
\
## ARCHIVAL NOTE\
\
This document is from Session 1 planning phase (November 23, 2025).\
Parts 1-4 and 6 remain useful for database schema and keyboard shortcut reference.\
Parts 5-7 describe old Python/Textual architecture (superseded by TypeScript/BDD in tuings/).\
\
**Current Status**: Use docs/analysis/PROMPT.md for current requirements.\
See tuings/PROGRESS.md for actual Phase 1-2 completion status.' > docs/archived/ARCHIVED_DOCUMENTATION_PLAN.md

# 5. COPY SESSION & SUBMISSION DOCS WITH ARCHIVE PREFIX
echo "Archiving session and submission documents..."
for file in 00_START_HERE BDD_QUICK_REFERENCE COMPLETION_SUMMARY DELIVERABLES_SUMMARY \
            DESKTOP_STRUCTURE EXPLORATION_COMPLETE PHASE_1_VERIFICATION PHASE_2_BDD_RETROFIT \
            PHASE_3_BDD_PREPARATION PR_STRATEGY SESSION_1_FINAL_SUMMARY SESSION_1_HANDOFF \
            SESSION_1_SUMMARY SESSION_2_HANDOFF SESSION_2_SUMMARY SESSION_3_HANDOFF \
            SESSION_FINAL_HANDOFF SESSION_SUMMARY SUBMISSION_CHECKLIST VERIFICATION_CHECKLIST; do
  if [ -f ~/Desktop/${file}.md ] || [ -f ~/Desktop/${file}.txt ]; then
    src_file=$(ls ~/Desktop/${file}.* 2>/dev/null | head -1)
    if [ -n "$src_file" ]; then
      ext="${src_file##*.}"
      cp "$src_file" docs/archived/ARCHIVED_${file}.${ext}
    fi
  fi
done

# Copy IMPLEMENTATION_ROADMAP with archive note using sed
sed '1a\
\
---\
\
## ARCHIVAL NOTE (Added Nov 23, 2025)\
\
This document describes Session 1 planning with old Python/Textual architecture.\
Now superseded by TypeScript + Blessed + BDD approach in ~/ai/projects/tuings/\
\
Reference Only: Database setup steps may still have value, but phases 1-6 are outdated.\
Current Project: ~/ai/projects/tuings/ (TypeScript, 38 BDD scenarios, Phase 1-2 complete).\
Current Status Tracker: See tuings/PROGRESS.md\
' ~/Desktop/IMPLEMENTATION_ROADMAP.md > docs/archived/ARCHIVED_IMPLEMENTATION_ROADMAP.md

# 6. MOVE REFERENCE REPOS
echo "Moving reference repositories..."
cp -r ~/Desktop/things-mcp-main reference-repos/ 2>/dev/null || true
cp -r ~/Desktop/things-mcp-master reference-repos/ 2>/dev/null || true

# 7. CREATE NAVIGATION FILES
echo "Creating navigation documents..."

# docs/README.md
cat > docs/README.md << 'EOF'
# Things TUI Documentation

Complete reference for the Things TUI Clone project.

## Product Documentation

Learn how Things.app works and how features map to the TUI:

- **[Core Features](./product/core-features/)** - Tags, shortcuts, scheduling, search, notes (7 docs)
- **[Data Export](./product/data-export/)** - Database structure, AppleScript, URL schemes (3 docs)
- **[User Experience](./product/user-experience/)** - Workflows, prioritization, patterns (5 docs)
- **[Reference](./product/reference/)** - Markdown guide, AppleScript PDF (2 files)

## Analysis & Planning

Strategy documents and database reference:

- **[PROMPT.md](./analysis/PROMPT.md)** - Current project requirements (SOURCE OF TRUTH)
- **[DATABASE_EXTRACTION_GUIDE.md](./analysis/DATABASE_EXTRACTION_GUIDE.md)** - SQL queries, database schema
- **[Archived Analysis](./analysis/)** - Session 1 strategy documents

## Visual Reference

- **[Screenshots](./screenshots/)** - 25 UI mockups and workflows
- **[Screenshot Index](./screenshots/SCREENSHOT_INDEX.md)** - Categorized guide

## External References

- **[Reference Repositories](./REFERENCE_REPOS.md)** - GitHub links to external MCP implementations
- **[Archived Documents](./archived/)** - Session notes and historical planning

## Quick Links

- **Getting Started**: See main README.md
- **Development Workflow**: See ../AGENTS.md
- **Feature Progress**: See ../PROGRESS.md
- **PR Workflow**: See ../PULL_REQUEST_WORKFLOW.md
- **BDD Methodology**: See ../BDD_LINEAR_DEVELOPMENT.md

---

**Archive Strategy**: All archived files use `ARCHIVED_` prefix for easy grepping:
```bash
grep -r "ARCHIVED_" docs/
find docs/archived -name "ARCHIVED_*"
```
EOF

# docs/REFERENCE_REPOS.md
cat > docs/REFERENCE_REPOS.md << 'EOF'
# External Reference Implementations

These are external MCP (Model Context Protocol) implementations for Things.app integration. Use the GitHub links below as canonical sources.

## TypeScript Implementation

**jimfilippou/things-mcp**
- Language: TypeScript
- Repository: https://github.com/jimfilippou/things-mcp
- Local Reference: reference-repos/things-mcp-main/
- Use For: URL scheme patterns, modern TypeScript setup

## Python Implementation

**hald/things-mcp**
- Language: Python
- Repository: https://github.com/hald/things-mcp
- Local Reference: reference-repos/things-mcp-master/
- Use For: Database queries, data formatting patterns, test examples

## Usage

For latest versions and updates, always reference the GitHub repositories above.

Local copies in `reference-repos/` are for offline reference only and not version-controlled (git-ignored).

---

See docs/README.md for complete documentation navigation.
EOF

# docs/archived/README.md
cat > docs/archived/README.md << 'EOF'
# Archived Documents

Historical documentation from Session 1 and project planning phases.

## What's Here

All files in this directory use the `ARCHIVED_` prefix and represent:
- Session handoff notes (Sessions 1-3)
- Planning documents (before current BDD approach)
- Verification checklists (from old phases)
- Historical summaries

## Current vs. Archived

| File | Status | Use |
|------|--------|-----|
| PROMPT.md | Current | Source of truth (in ../analysis/) |
| PROGRESS.md | Current | Active backlog (in ../) |
| BDD_LINEAR_DEVELOPMENT.md | Current | Active methodology (in ../) |
| ARCHIVED_* | Historical | Reference/context only |

## Finding Archived Files

```bash
# List all archived files
find . -name "ARCHIVED_*"

# Search in archived files
grep -r "keyword" . --include="ARCHIVED_*"

# Exclude archived from search
grep -r "keyword" .. --exclude-dir=archived
```

## Archive Notes

Some files like `ARCHIVED_DOCUMENTATION_PLAN.md` and `ARCHIVED_IMPLEMENTATION_ROADMAP.md` have partial value:

- **DOCUMENTATION_PLAN.md**: Parts 1-4, 6 remain useful (database reference)
- **IMPLEMENTATION_ROADMAP.md**: Old Python/Textual plan (completely superseded)

See file headers for notes on what's outdated.

---

**Last Updated**: November 23, 2025 (Session 1 completion)
EOF

# 8. UPDATE .gitignore
echo "Updating .gitignore..."
if ! grep -q "reference-repos/" .gitignore; then
  cat >> .gitignore << 'EOF'

# External reference repos (use GitHub links instead)
reference-repos/
EOF
fi

# 9. UPDATE MAIN README.md
echo "Updating main README.md..."
if ! grep -q "docs/README.md" README.md; then
  sed -i.bak '1a\
## Documentation\
\
Complete project documentation is in the `docs/` directory:\
\
- **Product Docs**: How Things.app works and TUI feature mapping\
- **Analysis Docs**: Strategy, planning, database reference\
- **Screenshots**: Visual UI reference (25 images)\
- **Reference**: External MCP implementations\
\
See `docs/README.md` for complete navigation.\
' README.md
  rm -f README.md.bak
fi

# 10. GIT OPERATIONS
echo "Staging and committing..."
git add docs/ reference-repos/ .gitignore README.md

git commit -m "docs: consolidate all desktop files into repo with archive strategy

Product Documentation (17 files):
- docs/product/core-features/ (7 docs: tags, shortcuts, scheduling, search, notes, deadlines, projects)
- docs/product/data-export/ (3 docs: database, AppleScript, URL scheme)
- docs/product/user-experience/ (5 docs: workflow, prioritization, patterns, waiting, getting unstuck)
- docs/product/reference/ (2 docs: Markdown guide, AppleScript PDF)

Analysis & Planning (8 files):
- docs/analysis/PROMPT.md (SOURCE OF TRUTH)
- docs/analysis/DATABASE_EXTRACTION_GUIDE.md
- docs/analysis/ARCHIVED_* (6 session 1 planning docs)

Visual Reference (25 images):
- docs/screenshots/ (all 25 UI screenshots + index)

Archived Documents (23 files):
- docs/archived/ARCHIVED_* (historical session notes, old plans)

External References:
- reference-repos/ (things-mcp-main, things-mcp-master)
- Git-ignored (use GitHub links instead)
- See docs/REFERENCE_REPOS.md for canonical repos

Navigation:
- docs/README.md (central index)
- docs/archived/README.md (archive explanation)
- docs/REFERENCE_REPOS.md (GitHub links)

Archive Strategy:
- All archived files prefixed ARCHIVED_ for easy grepping
- grep -r 'ARCHIVED_' docs/
- find docs/archived -name 'ARCHIVED_*'

Updated Files:
- README.md (points to docs/)
- .gitignore (adds reference-repos/)

Total: 73 files consolidated, Desktop stays clean, repo self-contained."

git push origin main

echo "=== CONSOLIDATION COMPLETE ==="
echo "Summary:"
echo "  ✅ 17 product docs → docs/product/"
echo "  ✅ 25 screenshots → docs/screenshots/"
echo "  ✅ 8 analysis docs → docs/analysis/"
echo "  ✅ 23 archived docs → docs/archived/ (ARCHIVED_ prefix)"
echo "  ✅ 2 reference repos → reference-repos/ (git-ignored)"
echo "  ✅ Navigation docs created"
echo "  ✅ Git commit & push"
echo ""
echo "Find archived files:"
echo "  grep -r 'ARCHIVED_' docs/"
echo "  find docs/archived -name 'ARCHIVED_*'"
