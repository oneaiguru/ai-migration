# Desktop to Repo Consolidation - Final Plan

**Status:** READY TO EXECUTE  
**Created:** Nov 23, 2025  
**Location:** Save in ~/ai/projects/tuings/ only (not ~/)  
**Scope:** Consolidate 41 Desktop files + 2 dirs into repo with archive strategy

---

## 📊 COMPLETE DESKTOP INVENTORY (VERIFIED)

### Root Files (41 total)

#### Handoff & Workflow (3 files)
- `00_START_HERE.md` → ARCHIVE
- `AGENTS.md` → Already in repo (skip)
- `AGENTS.md` (Desktop version) → differs from repo, analyze later

#### Product/Strategy Docs (5 files) - KEEP
- `prompt.md` → `docs/analysis/PROMPT.md` (SOURCE OF TRUTH)
- `THINGS_TUI_HYBRID_APPROACH.md` → `docs/archived/ARCHIVED_HYBRID_APPROACH.md`
- `THINGS_PROJECT_INDEX.md` → `docs/archived/ARCHIVED_PROJECT_INDEX.md`
- `REPO_ANALYSIS_AND_STRATEGY.md` → `docs/analysis/ARCHIVED_REPO_ANALYSIS.md`
- `INDEX.md` → `docs/analysis/ARCHIVED_RESOURCE_INDEX.md`

#### Implementation Guides (2 files) - KEEP
- `TYPESCRIPT_TUI_QUICK_START.md` → `docs/analysis/ARCHIVED_TYPESCRIPT_QUICKSTART.md`
- `DATABASE_EXTRACTION_GUIDE.md` → `docs/analysis/DATABASE_EXTRACTION_GUIDE.md`

#### Planning/Analysis Docs (6 files) - ARCHIVE
- `DOCUMENTATION_PLAN.md` → `docs/archived/ARCHIVED_DOCUMENTATION_PLAN.md`
- `IMPLEMENTATION_ROADMAP.md` → `docs/archived/ARCHIVED_IMPLEMENTATION_ROADMAP.md`
- `README.md` → `docs/analysis/ARCHIVED_PROJECT_OVERVIEW.md`
- `DESKTOP_STRUCTURE.md` → `docs/archived/ARCHIVED_DESKTOP_STRUCTURE.md`
- `BDD_QUICK_REFERENCE.md` → `docs/archived/ARCHIVED_BDD_QUICKREFERENCE.md`
- `EXPLORATION_COMPLETE.md` → `docs/archived/ARCHIVED_EXPLORATION_COMPLETE.md`

#### Session/Summary Docs (9 files) - ARCHIVE
- `SESSION_1_HANDOFF.md` → `docs/archived/ARCHIVED_SESSION_1_HANDOFF.md`
- `SESSION_1_SUMMARY.txt` → `docs/archived/ARCHIVED_SESSION_1_SUMMARY.txt`
- `SESSION_1_FINAL_SUMMARY.md` → `docs/archived/ARCHIVED_SESSION_1_FINAL.md`
- `SESSION_2_HANDOFF.md` → `docs/archived/ARCHIVED_SESSION_2_HANDOFF.md`
- `SESSION_2_SUMMARY.txt` → `docs/archived/ARCHIVED_SESSION_2_SUMMARY.txt`
- `SESSION_3_HANDOFF.md` → `docs/archived/ARCHIVED_SESSION_3_HANDOFF.md`
- `SESSION_FINAL_HANDOFF.md` → `docs/archived/ARCHIVED_SESSION_FINAL_HANDOFF.md`
- `SESSION_SUMMARY.md` → `docs/archived/ARCHIVED_SESSION_SUMMARY.md`
- `COMPLETION_SUMMARY.txt` → `docs/archived/ARCHIVED_COMPLETION_SUMMARY.txt`

#### Submission/Verification Docs (6 files) - ARCHIVE
- `DELIVERABLES_SUMMARY.md` → `docs/archived/ARCHIVED_DELIVERABLES_SUMMARY.md`
- `SUBMISSION_CHECKLIST.md` → `docs/archived/ARCHIVED_SUBMISSION_CHECKLIST.md`
- `VERIFICATION_CHECKLIST.md` → `docs/archived/ARCHIVED_VERIFICATION_CHECKLIST.md`
- `COMPLETION_SUMMARY.txt` → `docs/archived/ARCHIVED_COMPLETION_SUMMARY.txt`
- `PR_STRATEGY.md` → `docs/archived/ARCHIVED_PR_STRATEGY.md`
- `PHASE_1_VERIFICATION.md` → `docs/archived/ARCHIVED_PHASE_1_VERIFICATION.md`
- `PHASE_2_BDD_RETROFIT.md` → `docs/archived/ARCHIVED_PHASE_2_BDD_RETROFIT.md`
- `PHASE_3_BDD_PREPARATION.md` → `docs/archived/ARCHIVED_PHASE_3_PREPARATION.md`

#### Utility (2 files) - SKIP
- `organize_documentation.sh` → Skip (old script)
- `MANIFEST.txt` → Skip (old listing)

#### System (2 items) - SKIP
- `.DS_Store` → Skip
- `.localized` → Skip
- `.claude-trace/` → Skip
- `.mypy_cache/` → Skip

### Subdirectories (2)

#### Things_Documentation/ (4 subdirs + index)
```
Core_Features/ (7 files):
  ✅ Creating_Repeating_To-Dos.md
  ✅ Keyboard_Shortcuts_for_Mac.md
  ✅ Scheduling_To-Dos_in_Things.md
  ✅ Searching_and_Navigating_with_Quick_Find.md
  ✅ Using_Tags.md
  ✅ Whats_new_in__the_all-new_Things.md
  ✅ Writing_Notes_in_Things.md

Data_Export/ (3 files):
  ✅ Exporting_Your_Data.md
  ✅ Things_AppleScript_Guide.md
  ✅ Things_URL_Scheme.md

User_Experience/ (5 files):
  ✅ An_In-Depth_Look_at_Today,_Upcoming,_Anytime,_and_Someday.md
  ✅ Gather_it_all_in_one_place.md
  ✅ How_to_Deal_with_Waiting_To-Dos.md
  ✅ How_to_Prioritize_To-Dos_in_Things.md
  ✅ Why_Some_To-Dos_Get_Stuck_and_How_to_Get_Them_Moving_Again.md

Reference/ (2 files):
  ✅ Markdown_Guide.md
  ✅ Things3AppleScriptGuide.pdf

Index:
  ✅ DOCUMENTATION_INDEX.md
```

#### Things_Screenshots/ (25 images + index)
```
✅ 01-inbox-overview.png
✅ 02-today-list-main.png
✅ 03-today-evening-section.png
✅ 04-upcoming-week-view.png
✅ 05-anytime-active-tasks.png
✅ 06-someday-ideas.png
✅ 07-tag-manager-panel.png
✅ 08-tag-shortcuts-config.png
✅ 09-tag-filtering-ui.png
✅ 10-quick-entry-dialog.png
✅ 11-quick-find-search.png
✅ 12-keyboard-shortcuts-help.png
✅ 13-task-detail-editing.png
✅ 14-note-editing-markdown.png
✅ 15-checklist-items.png
✅ 16-project-creation.png
✅ 17-area-management.png
✅ 18-tag-hierarchy.png
✅ 19-date-picker-when.png
✅ 20-deadline-assignment.png
✅ 21-reminder-settings.png
✅ 22-sidebar-navigation.png
✅ 23-multi-select-tasks.png
✅ 24-drag-drop-reorder.png
✅ 25-search-results-tags.png
✅ SCREENSHOT_INDEX.md
```

### Reference Repos (2 directories)
- `things-mcp-main/` → Move to `reference-repos/things-mcp-main/` (git-ignore)
- `things-mcp-master/` → Move to `reference-repos/things-mcp-master/` (git-ignore)

---

## 🎯 TARGET REPO STRUCTURE

```
/Users/m/ai/projects/tuings/
├── docs/
│   ├── README.md (NEW)
│   ├── REFERENCE_REPOS.md (NEW)
│   │
│   ├── product/
│   │   ├── DOCUMENTATION_INDEX.md
│   │   ├── core-features/
│   │   │   ├── 01_Creating_Repeating_To-Dos.md
│   │   │   ├── 02_Keyboard_Shortcuts.md
│   │   │   ├── 03_Scheduling_To-Dos.md
│   │   │   ├── 04_Search_and_Quick_Find.md
│   │   │   ├── 05_Using_Tags.md
│   │   │   ├── 06_Whats_New.md
│   │   │   └── 07_Writing_Notes.md
│   │   ├── data-export/
│   │   │   ├── 01_Exporting_Data.md
│   │   │   ├── 02_AppleScript_Guide.md
│   │   │   └── 03_URL_Scheme.md
│   │   ├── user-experience/
│   │   │   ├── 01_Lists_Overview.md
│   │   │   ├── 02_Gather_in_One_Place.md
│   │   │   ├── 03_Waiting_To-Dos.md
│   │   │   ├── 04_Prioritization.md
│   │   │   └── 05_Getting_Stuck.md
│   │   └── reference/
│   │       ├── Markdown_Guide.md
│   │       └── Things3AppleScriptGuide.pdf
│   │
│   ├── screenshots/
│   │   ├── SCREENSHOT_INDEX.md
│   │   └── *.png (all 25 images)
│   │
│   ├── analysis/
│   │   ├── PROMPT.md (SOURCE OF TRUTH)
│   │   ├── DATABASE_EXTRACTION_GUIDE.md
│   │   ├── ARCHIVED_PROJECT_OVERVIEW.md
│   │   ├── ARCHIVED_RESOURCE_INDEX.md
│   │   ├── ARCHIVED_REPO_ANALYSIS.md
│   │   ├── ARCHIVED_HYBRID_APPROACH.md
│   │   ├── ARCHIVED_PROJECT_INDEX.md
│   │   └── ARCHIVED_TYPESCRIPT_QUICKSTART.md
│   │
│   └── archived/
│       ├── ARCHIVED_00_START_HERE.md
│       ├── ARCHIVED_BDD_QUICKREFERENCE.md
│       ├── ARCHIVED_COMPLETION_SUMMARY.txt
│       ├── ARCHIVED_DELIVERABLES_SUMMARY.md
│       ├── ARCHIVED_DESKTOP_STRUCTURE.md
│       ├── ARCHIVED_DOCUMENTATION_PLAN.md
│       ├── ARCHIVED_EXPLORATION_COMPLETE.md
│       ├── ARCHIVED_IMPLEMENTATION_ROADMAP.md
│       ├── ARCHIVED_PHASE_1_VERIFICATION.md
│       ├── ARCHIVED_PHASE_2_BDD_RETROFIT.md
│       ├── ARCHIVED_PHASE_3_PREPARATION.md
│       ├── ARCHIVED_PR_STRATEGY.md
│       ├── ARCHIVED_SESSION_1_FINAL.md
│       ├── ARCHIVED_SESSION_1_HANDOFF.md
│       ├── ARCHIVED_SESSION_1_SUMMARY.txt
│       ├── ARCHIVED_SESSION_2_HANDOFF.md
│       ├── ARCHIVED_SESSION_2_SUMMARY.txt
│       ├── ARCHIVED_SESSION_3_HANDOFF.md
│       ├── ARCHIVED_SESSION_FINAL_HANDOFF.md
│       ├── ARCHIVED_SESSION_SUMMARY.md
│       ├── ARCHIVED_SUBMISSION_CHECKLIST.md
│       ├── ARCHIVED_VERIFICATION_CHECKLIST.md
│       └── README.md (NEW - explains archive)
│
├── reference-repos/
│   ├── things-mcp-main/ (git-ignored)
│   └── things-mcp-master/ (git-ignored)
│
├── .gitignore (UPDATED)
├── README.md (UPDATED)
├── src/
├── features/
└── ... (existing files)
```

---

## 🔄 EXECUTION STEPS (12 tasks)

### Step 1: Create Directory Structure
```bash
mkdir -p docs/{product/{core-features,data-export,user-experience,reference},screenshots,analysis,archived}
mkdir -p reference-repos
```

### Step 2: Copy Product Docs (17 files)
```bash
# Core Features (7 files with numbering)
cp Desktop/Things_Documentation/Core_Features/Creating_Repeating_To-Dos.md \
   docs/product/core-features/01_Creating_Repeating_To-Dos.md
cp Desktop/Things_Documentation/Core_Features/Keyboard_Shortcuts_for_Mac.md \
   docs/product/core-features/02_Keyboard_Shortcuts.md
cp Desktop/Things_Documentation/Core_Features/Scheduling_To-Dos_in_Things.md \
   docs/product/core-features/03_Scheduling_To-Dos.md
cp Desktop/Things_Documentation/Core_Features/Searching_and_Navigating_with_Quick_Find.md \
   docs/product/core-features/04_Search_and_Quick_Find.md
cp Desktop/Things_Documentation/Core_Features/Using_Tags.md \
   docs/product/core-features/05_Using_Tags.md
cp Desktop/Things_Documentation/Core_Features/Whats_new_in__the_all-new_Things.md \
   docs/product/core-features/06_Whats_New.md
cp Desktop/Things_Documentation/Core_Features/Writing_Notes_in_Things.md \
   docs/product/core-features/07_Writing_Notes.md

# Data Export (3 files with numbering)
cp Desktop/Things_Documentation/Data_Export/Exporting_Your_Data.md \
   docs/product/data-export/01_Exporting_Data.md
cp Desktop/Things_Documentation/Data_Export/Things_AppleScript_Guide.md \
   docs/product/data-export/02_AppleScript_Guide.md
cp Desktop/Things_Documentation/Data_Export/Things_URL_Scheme.md \
   docs/product/data-export/03_URL_Scheme.md

# User Experience (5 files with numbering)
cp Desktop/Things_Documentation/User_Experience/An_In-Depth_Look_at_Today,_Upcoming,_Anytime,_and_Someday.md \
   docs/product/user-experience/01_Lists_Overview.md
cp Desktop/Things_Documentation/User_Experience/Gather_it_all_in_one_place.md \
   docs/product/user-experience/02_Gather_in_One_Place.md
cp Desktop/Things_Documentation/User_Experience/How_to_Deal_with_Waiting_To-Dos.md \
   docs/product/user-experience/03_Waiting_To-Dos.md
cp Desktop/Things_Documentation/User_Experience/How_to_Prioritize_To-Dos_in_Things.md \
   docs/product/user-experience/04_Prioritization.md
cp Desktop/Things_Documentation/User_Experience/Why_Some_To-Dos_Get_Stuck_and_How_to_Get_Them_Moving_Again.md \
   docs/product/user-experience/05_Getting_Stuck.md

# Reference (2 files)
cp Desktop/Things_Documentation/Reference/Markdown_Guide.md \
   docs/product/reference/Markdown_Guide.md
cp Desktop/Things_Documentation/Reference/Things3AppleScriptGuide.pdf \
   docs/product/reference/Things3AppleScriptGuide.pdf

# Index
cp Desktop/Things_Documentation/DOCUMENTATION_INDEX.md \
   docs/product/DOCUMENTATION_INDEX.md
```

### Step 3: Copy Screenshots (26 files)
```bash
cp Desktop/Things_Screenshots/*.png docs/screenshots/
cp Desktop/Things_Screenshots/SCREENSHOT_INDEX.md docs/screenshots/
```

### Step 4: Copy Analysis Docs (8 files)
```bash
# Source of truth (keep original name)
cp Desktop/prompt.md docs/analysis/PROMPT.md

# Database guide (keep original name)
cp Desktop/DATABASE_EXTRACTION_GUIDE.md docs/analysis/DATABASE_EXTRACTION_GUIDE.md

# Archive with ARCHIVED_ prefix
cp Desktop/README.md docs/analysis/ARCHIVED_PROJECT_OVERVIEW.md
cp Desktop/INDEX.md docs/analysis/ARCHIVED_RESOURCE_INDEX.md
cp Desktop/REPO_ANALYSIS_AND_STRATEGY.md docs/analysis/ARCHIVED_REPO_ANALYSIS.md
cp Desktop/THINGS_TUI_HYBRID_APPROACH.md docs/analysis/ARCHIVED_HYBRID_APPROACH.md
cp Desktop/THINGS_PROJECT_INDEX.md docs/analysis/ARCHIVED_PROJECT_INDEX.md
cp Desktop/TYPESCRIPT_TUI_QUICK_START.md docs/analysis/ARCHIVED_TYPESCRIPT_QUICKSTART.md
```

### Step 5: Copy Archived Docs (23 files - all with ARCHIVED_ prefix)
```bash
cp Desktop/00_START_HERE.md docs/archived/ARCHIVED_00_START_HERE.md
cp Desktop/BDD_QUICK_REFERENCE.md docs/archived/ARCHIVED_BDD_QUICKREFERENCE.md
cp Desktop/COMPLETION_SUMMARY.txt docs/archived/ARCHIVED_COMPLETION_SUMMARY.txt
cp Desktop/DELIVERABLES_SUMMARY.md docs/archived/ARCHIVED_DELIVERABLES_SUMMARY.md
cp Desktop/DESKTOP_STRUCTURE.md docs/archived/ARCHIVED_DESKTOP_STRUCTURE.md
cp Desktop/DOCUMENTATION_PLAN.md docs/archived/ARCHIVED_DOCUMENTATION_PLAN.md
cp Desktop/EXPLORATION_COMPLETE.md docs/archived/ARCHIVED_EXPLORATION_COMPLETE.md
cp Desktop/IMPLEMENTATION_ROADMAP.md docs/archived/ARCHIVED_IMPLEMENTATION_ROADMAP.md
cp Desktop/PHASE_1_VERIFICATION.md docs/archived/ARCHIVED_PHASE_1_VERIFICATION.md
cp Desktop/PHASE_2_BDD_RETROFIT.md docs/archived/ARCHIVED_PHASE_2_BDD_RETROFIT.md
cp Desktop/PHASE_3_BDD_PREPARATION.md docs/archived/ARCHIVED_PHASE_3_PREPARATION.md
cp Desktop/PR_STRATEGY.md docs/archived/ARCHIVED_PR_STRATEGY.md
cp Desktop/SESSION_1_FINAL_SUMMARY.md docs/archived/ARCHIVED_SESSION_1_FINAL.md
cp Desktop/SESSION_1_HANDOFF.md docs/archived/ARCHIVED_SESSION_1_HANDOFF.md
cp Desktop/SESSION_1_SUMMARY.txt docs/archived/ARCHIVED_SESSION_1_SUMMARY.txt
cp Desktop/SESSION_2_HANDOFF.md docs/archived/ARCHIVED_SESSION_2_HANDOFF.md
cp Desktop/SESSION_2_SUMMARY.txt docs/archived/ARCHIVED_SESSION_2_SUMMARY.txt
cp Desktop/SESSION_3_HANDOFF.md docs/archived/ARCHIVED_SESSION_3_HANDOFF.md
cp Desktop/SESSION_FINAL_HANDOFF.md docs/archived/ARCHIVED_SESSION_FINAL_HANDOFF.md
cp Desktop/SESSION_SUMMARY.md docs/archived/ARCHIVED_SESSION_SUMMARY.md
cp Desktop/SUBMISSION_CHECKLIST.md docs/archived/ARCHIVED_SUBMISSION_CHECKLIST.md
cp Desktop/VERIFICATION_CHECKLIST.md docs/archived/ARCHIVED_VERIFICATION_CHECKLIST.md
```

### Step 6: Move Reference Repos
```bash
cp -r Desktop/things-mcp-main reference-repos/
cp -r Desktop/things-mcp-master reference-repos/
```

### Step 7: Update .gitignore
```bash
# Add to end of .gitignore:
echo "" >> .gitignore
echo "# External reference repos (use GitHub links instead)" >> .gitignore
echo "reference-repos/" >> .gitignore
```

### Step 8: Create docs/README.md
Create navigation file pointing to all doc sections.

### Step 9: Create docs/REFERENCE_REPOS.md
```markdown
# External Reference Implementations

- **jimfilippou/things-mcp** (TypeScript)
  https://github.com/jimfilippou/things-mcp
  
- **hald/things-mcp** (Python)
  https://github.com/hald/things-mcp
```

### Step 10: Create docs/archived/README.md
Explain archive strategy with grep examples.

### Step 11: Update main README.md
Add pointer to `docs/README.md`.

### Step 12: Git Commit & PR
```bash
git add docs/ reference-repos/ .gitignore README.md
git commit -m "docs: consolidate desktop files into repo with archive strategy

- Moved 17 product docs to docs/product/{core-features,data-export,user-experience,reference}
- Moved 25 screenshots to docs/screenshots/
- Moved 8 analysis docs to docs/analysis/
- Archived 23 historical docs in docs/archived/ with ARCHIVED_ prefix
- Moved reference repos to reference-repos/ (git-ignored)
- Created navigation docs (docs/README.md, docs/REFERENCE_REPOS.md)

All archived files use ARCHIVED_ prefix for easy grepping:
  grep -r 'ARCHIVED_' docs/
  find docs/archived -name 'ARCHIVED_*'

See docs/README.md for navigation guide."

git push origin main
```

---

## 📋 FILE COUNTS

| Category | Count | Location |
|----------|-------|----------|
| Product Docs | 17 | docs/product/ |
| Screenshots | 25 | docs/screenshots/ |
| Analysis Docs | 8 | docs/analysis/ |
| Archived Docs | 23 | docs/archived/ |
| Reference Repos | 2 dirs | reference-repos/ |
| **Total** | **74** | **All consolidated** |

---

## ✅ SUCCESS CRITERIA

- [ ] All 17 product docs copied to docs/product/
- [ ] All 25 screenshots copied to docs/screenshots/
- [ ] All analysis docs copied to docs/analysis/ (PROMPT.md + DATABASE_EXTRACTION_GUIDE.md)
- [ ] All 23 archived docs in docs/archived/ with ARCHIVED_ prefix
- [ ] Reference repos moved to reference-repos/ and git-ignored
- [ ] docs/README.md created (navigation)
- [ ] docs/REFERENCE_REPOS.md created (GitHub links)
- [ ] docs/archived/README.md created (archive explanation)
- [ ] Main README.md updated (points to docs/)
- [ ] .gitignore updated (reference-repos/)
- [ ] PR opened and merged

---

## 🔍 GREP USAGE (Archive Strategy)

**Find all archived files:**
```bash
grep -r "ARCHIVED_" docs/
find docs/archived -name "ARCHIVED_*"
```

**Exclude archived files from search:**
```bash
grep -r "keyword" docs/ --exclude-dir=archived
grep -r "keyword" docs/ --not -path "*/archived/*"
```

**Find specific archived file:**
```bash
find docs/archived -name "ARCHIVED_SESSION*"
find docs/archived -name "ARCHIVED_IMPLEMENTATION*"
```

---

## 📌 NOTES

- **Desktop stays intact** - No deletions, just copies
- **ARCHIVED_ prefix** - Makes archives instantly recognizable
- **GitHub links** - Primary source, local repos for offline reference
- **Location** - ~/ai/projects/tuings/ only (not ~/)
- **Speed** - All in fast AI project directory
