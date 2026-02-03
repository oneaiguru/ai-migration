# Desktop Inventory & Repo Reorganization Plan

**Status:** ANALYSIS COMPLETE  
**Date:** Nov 23, 2025  
**Purpose:** Complete inventory of Desktop files + detailed repo structure plan

---

## 📊 Desktop Root Files - Complete Inventory

### 41 Files on /Users/m/Desktop/

#### Start Here (1)
- `00_START_HERE.md` → **ARCHIVE**: Copy to `docs/archived/ARCHIVED_00_START_HERE.md`

#### Core Reference (3) - KEEP & CONSOLIDATE
- `prompt.md` → Copy to `docs/analysis/PROMPT.md` (source of truth)
- `README.md` → Copy to `docs/analysis/ARCHIVED_PROJECT_OVERVIEW.md`
- `INDEX.md` → Copy to `docs/analysis/ARCHIVED_RESOURCE_INDEX.md`

#### Product/Feature Docs (3) - KEY REFERENCE
- `THINGS_TUI_HYBRID_APPROACH.md` → `docs/analysis/ARCHIVED_HYBRID_APPROACH.md`
- `THINGS_PROJECT_INDEX.md` → `docs/analysis/ARCHIVED_PROJECT_INDEX.md`
- `DATABASE_EXTRACTION_GUIDE.md` → `docs/analysis/DATABASE_EXTRACTION_GUIDE.md`

#### Strategic/Planning Docs (5) - ARCHIVE
- `DOCUMENTATION_PLAN.md` → `docs/archived/ARCHIVED_DOCUMENTATION_PLAN.md`
- `IMPLEMENTATION_ROADMAP.md` → `docs/archived/ARCHIVED_IMPLEMENTATION_ROADMAP.md`
- `REPO_ANALYSIS_AND_STRATEGY.md` → `docs/analysis/ARCHIVED_REPO_ANALYSIS.md`
- `TYPESCRIPT_TUI_QUICK_START.md` → `docs/analysis/ARCHIVED_TYPESCRIPT_QUICKSTART.md`
- `UAHIS_DEEP_ANALYSIS.md` → `docs/archived/ARCHIVED_UAHIS_ANALYSIS.md`

#### Session Handoff/Summary Docs (9) - ARCHIVE
- `SESSION_1_FINAL_SUMMARY.md` → `docs/archived/ARCHIVED_SESSION_1_FINAL.md`
- `SESSION_1_HANDOFF.md` → `docs/archived/ARCHIVED_SESSION_1_HANDOFF.md`
- `SESSION_1_SUMMARY.txt` → `docs/archived/ARCHIVED_SESSION_1_SUMMARY.txt`
- `SESSION_2_HANDOFF.md` → `docs/archived/ARCHIVED_SESSION_2_HANDOFF.md`
- `SESSION_2_SUMMARY.txt` → `docs/archived/ARCHIVED_SESSION_2_SUMMARY.txt`
- `SESSION_3_HANDOFF.md` → `docs/archived/ARCHIVED_SESSION_3_HANDOFF.md`
- `SESSION_FINAL_HANDOFF.md` → `docs/archived/ARCHIVED_SESSION_FINAL_HANDOFF.md`
- `SESSION_SUMMARY.md` → `docs/archived/ARCHIVED_SESSION_SUMMARY.md`

#### Quick Reference/Checklists (6) - ARCHIVE
- `BDD_QUICK_REFERENCE.md` → `docs/archived/ARCHIVED_BDD_QUICK_REFERENCE.md`
- `AGENTS.md` → Already in repo (`ai/projects/tuings/AGENTS.md`), skip
- `PR_STRATEGY.md` → `docs/archived/ARCHIVED_PR_STRATEGY.md`
- `COMPLETION_SUMMARY.txt` → `docs/archived/ARCHIVED_COMPLETION_SUMMARY.txt`
- `COMPLETION_SUMMARY.txt` → `docs/archived/ARCHIVED_DELIVERABLES_SUMMARY.md`
- `SUBMISSION_CHECKLIST.md` → `docs/archived/ARCHIVED_SUBMISSION_CHECKLIST.md`
- `VERIFICATION_CHECKLIST.md` → `docs/archived/ARCHIVED_VERIFICATION_CHECKLIST.md`

#### Verification/Status Docs (5) - ARCHIVE
- `PHASE_1_VERIFICATION.md` → `docs/archived/ARCHIVED_PHASE_1_VERIFICATION.md`
- `PHASE_2_BDD_RETROFIT.md` → `docs/archived/ARCHIVED_PHASE_2_BDD_RETROFIT.md`
- `PHASE_3_BDD_PREPARATION.md` → `docs/archived/ARCHIVED_PHASE_3_PREPARATION.md`
- `EXPLORATION_COMPLETE.md` → `docs/archived/ARCHIVED_EXPLORATION_COMPLETE.md`
- `DESKTOP_STRUCTURE.md` → `docs/archived/ARCHIVED_DESKTOP_STRUCTURE.md`

#### Scripts/Text (2) - SKIP
- `organize_documentation.sh` → Skip (old script)
- `MANIFEST.txt` → Skip (old manifest)

#### System Files (3) - SKIP
- `.DS_Store` → System, skip
- `.localized` → System, skip
- `.claude-trace/` → System cache, skip
- `.mypy_cache/` → System cache, skip

---

## 📁 Desktop Subdirectories

### Things_Documentation/ (4 subdirs + 1 index file)

**Core_Features/** (7 files)
```
Creating_Repeating_To-Dos.md
Keyboard_Shortcuts_for_Mac.md
Scheduling_To-Dos_in_Things.md
Searching_and_Navigating_with_Quick_Find.md
Using_Tags.md
Whats_new_in__the_all-new_Things.md
Writing_Notes_in_Things.md
```
→ Copy to `docs/product/core-features/`

**Data_Export/** (3 files)
```
Exporting_Your_Data.md
Things_AppleScript_Guide.md
Things_URL_Scheme.md
```
→ Copy to `docs/product/data-export/`

**User_Experience/** (5 files)
```
An_In-Depth_Look_at_Today,_Upcoming,_Anytime,_and_Someday.md
Gather_it_all_in_one_place.md
How_to_Deal_with_Waiting_To-Dos.md
How_to_Prioritize_To-Dos_in_Things.md
Why_Some_To-Dos_Get_Stuck_and_How_to_Get_Them_Moving_Again.md
```
→ Copy to `docs/product/user-experience/`

**Reference/** (2 files)
```
Markdown_Guide.md
Things3AppleScriptGuide.pdf
```
→ Copy to `docs/product/reference/`

**Index File:**
- `DOCUMENTATION_INDEX.md` → `docs/product/DOCUMENTATION_INDEX.md`

### Things_Screenshots/ (25 images + 1 index)

All 25 PNG files:
```
01-inbox-overview.png
02-today-list-main.png
03-today-evening-section.png
04-upcoming-week-view.png
05-anytime-active-tasks.png
06-someday-ideas.png
07-tag-manager-panel.png
08-tag-shortcuts-config.png
09-tag-filtering-ui.png
10-quick-entry-dialog.png
11-quick-find-search.png
12-keyboard-shortcuts-help.png
13-task-detail-editing.png
14-note-editing-markdown.png
15-checklist-items.png
16-project-creation.png
17-area-management.png
18-tag-hierarchy.png
19-date-picker-when.png
20-deadline-assignment.png
21-reminder-settings.png
22-sidebar-navigation.png
23-multi-select-tasks.png
24-drag-drop-reorder.png
25-search-results-tags.png
```
→ Copy all to `docs/screenshots/`

Index File:
- `SCREENSHOT_INDEX.md` → `docs/screenshots/SCREENSHOT_INDEX.md`

### Reference Repos (2 directories)

- `things-mcp-main/` → Move to `reference-repos/things-mcp-main/` (git-ignore)
- `things-mcp-master/` → Move to `reference-repos/things-mcp-master/` (git-ignore)

---

## 📂 Target Repo Structure

```
/Users/m/ai/projects/tuings/
├── src/
├── features/
├── dist/
├── node_modules/
│
├── docs/
│   ├── README.md (NEW - navigation)
│   ├── REFERENCE_REPOS.md (NEW - GitHub links)
│   │
│   ├── product/
│   │   ├── DOCUMENTATION_INDEX.md (from Desktop)
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
│   │   ├── 01-inbox-overview.png
│   │   ├── 02-today-list-main.png
│   │   └── ... (all 25 images)
│   │
│   └── archived/
│       ├── ARCHIVED_00_START_HERE.md
│       ├── ARCHIVED_BDD_QUICK_REFERENCE.md
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
│       ├── ARCHIVED_UAHIS_ANALYSIS.md
│       ├── ARCHIVED_VERIFICATION_CHECKLIST.md
│       └── ... (all archived files prefixed ARCHIVED_)
│   │
│   └── analysis/
│       ├── PROMPT.md (source of truth)
│       ├── ARCHIVED_PROJECT_OVERVIEW.md
│       ├── ARCHIVED_RESOURCE_INDEX.md
│       ├── DATABASE_EXTRACTION_GUIDE.md
│       ├── ARCHIVED_HYBRID_APPROACH.md
│       ├── ARCHIVED_PROJECT_INDEX.md
│       ├── ARCHIVED_REPO_ANALYSIS.md
│       └── ARCHIVED_TYPESCRIPT_QUICKSTART.md
│
├── reference-repos/
│   ├── things-mcp-main/ (git-ignored)
│   └── things-mcp-master/ (git-ignored)
│
├── .gitignore (updated)
├── README.md (updated)
├── AGENTS.md
├── PROGRESS.md
├── PULL_REQUEST_WORKFLOW.md
├── BDD_LINEAR_DEVELOPMENT.md
├── SESSION_HANDOFF.md
├── PROJECT_STATE_AND_RESOURCES.md
└── NEXT_PR_PLAN.md
```

---

## 🎯 Archive Naming Convention

**All archived files use this pattern:**
```
ARCHIVED_<ORIGINAL_FILENAME>
```

**Example:**
- `00_START_HERE.md` → `ARCHIVED_00_START_HERE.md`
- `SESSION_1_FINAL_SUMMARY.md` → `ARCHIVED_SESSION_1_FINAL.md`
- `IMPLEMENTATION_ROADMAP.md` → `ARCHIVED_IMPLEMENTATION_ROADMAP.md`

**Benefits:**
- ✅ Easy to grep: `grep -r ARCHIVED_ docs/`
- ✅ Clear file purpose at a glance
- ✅ Prevents accidental use of old docs
- ✅ Preserves original names for reference

---

## 📋 Copy Operations (Detailed)

### 1. Product Documentation (15 files)

**Core Features (7 files):**
```bash
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
```

**Data Export (3 files):**
```bash
cp Desktop/Things_Documentation/Data_Export/Exporting_Your_Data.md \
   docs/product/data-export/01_Exporting_Data.md
cp Desktop/Things_Documentation/Data_Export/Things_AppleScript_Guide.md \
   docs/product/data-export/02_AppleScript_Guide.md
cp Desktop/Things_Documentation/Data_Export/Things_URL_Scheme.md \
   docs/product/data-export/03_URL_Scheme.md
```

**User Experience (5 files):**
```bash
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
```

**Reference (2 files):**
```bash
cp Desktop/Things_Documentation/Reference/Markdown_Guide.md \
   docs/product/reference/Markdown_Guide.md
cp Desktop/Things_Documentation/Reference/Things3AppleScriptGuide.pdf \
   docs/product/reference/Things3AppleScriptGuide.pdf
```

**Index:**
```bash
cp Desktop/Things_Documentation/DOCUMENTATION_INDEX.md \
   docs/product/DOCUMENTATION_INDEX.md
```

### 2. Screenshots (25 images + index)

```bash
cp -r Desktop/Things_Screenshots/*.png docs/screenshots/
cp Desktop/Things_Screenshots/SCREENSHOT_INDEX.md docs/screenshots/
```

### 3. Analysis Docs (13 files)

**Key files (keep original names):**
```bash
cp Desktop/prompt.md docs/analysis/PROMPT.md
cp Desktop/DATABASE_EXTRACTION_GUIDE.md docs/analysis/DATABASE_EXTRACTION_GUIDE.md
```

**Archived versions (add ARCHIVED_ prefix):**
```bash
cp Desktop/README.md docs/analysis/ARCHIVED_PROJECT_OVERVIEW.md
cp Desktop/INDEX.md docs/analysis/ARCHIVED_RESOURCE_INDEX.md
cp Desktop/THINGS_TUI_HYBRID_APPROACH.md docs/analysis/ARCHIVED_HYBRID_APPROACH.md
cp Desktop/THINGS_PROJECT_INDEX.md docs/analysis/ARCHIVED_PROJECT_INDEX.md
cp Desktop/REPO_ANALYSIS_AND_STRATEGY.md docs/analysis/ARCHIVED_REPO_ANALYSIS.md
cp Desktop/TYPESCRIPT_TUI_QUICK_START.md docs/analysis/ARCHIVED_TYPESCRIPT_QUICKSTART.md
```

### 4. Archived Docs (20 files)

All to `docs/archived/` with `ARCHIVED_` prefix:
```bash
cp Desktop/00_START_HERE.md docs/archived/ARCHIVED_00_START_HERE.md
cp Desktop/BDD_QUICK_REFERENCE.md docs/archived/ARCHIVED_BDD_QUICK_REFERENCE.md
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
cp Desktop/UAHIS_DEEP_ANALYSIS.md docs/archived/ARCHIVED_UAHIS_ANALYSIS.md
cp Desktop/VERIFICATION_CHECKLIST.md docs/archived/ARCHIVED_VERIFICATION_CHECKLIST.md
```

### 5. Reference Repos (move & git-ignore)

```bash
cp -r Desktop/things-mcp-main/ reference-repos/things-mcp-main/
cp -r Desktop/things-mcp-master/ reference-repos/things-mcp-master/
```

Update `.gitignore`:
```
# External reference repos (use GitHub links instead)
reference-repos/
```

---

## 📑 New Navigation Files to Create

### 1. docs/README.md
Navigation hub for all documentation.

### 2. docs/REFERENCE_REPOS.md
Links to external MCP implementations:
- https://github.com/jimfilippou/things-mcp (TypeScript)
- https://github.com/hald/things-mcp (Python)

### 3. docs/product/core-features/README.md
Index to all core feature docs with feature parity tracking.

### 4. docs/analysis/README.md
What each analysis file contains and when to use.

### 5. docs/archived/README.md
What these files are and how to grep for them.

---

## 🔍 Grep Usage (Archive Strategy)

With `ARCHIVED_` prefix, easy to:

**Find all archived docs:**
```bash
grep -r "ARCHIVED_" docs/ --include="*.md"
```

**List only archive files:**
```bash
find docs/ -name "ARCHIVED_*"
```

**Exclude archived docs from search:**
```bash
grep -r "keyword" docs/ --exclude-dir=archived
# or
grep -r "keyword" docs/ --not -name "ARCHIVED_*"
```

---

## ✅ Total File Count

| Category | Count | Location |
|----------|-------|----------|
| Core Features | 7 | `docs/product/core-features/` |
| Data Export | 3 | `docs/product/data-export/` |
| User Experience | 5 | `docs/product/user-experience/` |
| Reference | 2 | `docs/product/reference/` |
| Screenshots | 25 | `docs/screenshots/` |
| Analysis Docs | 7 | `docs/analysis/` |
| Archived Docs | 23 | `docs/archived/` |
| **Total** | **72** | **All consolidated** |

---

## 📌 Next Steps

1. Create directory structure
2. Copy product docs with numbered prefixes
3. Copy screenshots
4. Copy analysis docs (keep prompt.md, archive others)
5. Copy all other docs with ARCHIVED_ prefix
6. Move reference-repos and update .gitignore
7. Create navigation files (docs/README.md, etc.)
8. Commit and open PR
9. Update PROGRESS.md

All with `ARCHIVED_` prefix for easy grepping.
