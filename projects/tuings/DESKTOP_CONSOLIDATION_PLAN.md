# Desktop Consolidation Plan

**Status:** PLAN PHASE  
**Target:** Consolidate /Users/m/Desktop/ docs into repo, link external MCP repos  
**Effort Estimate:** 3-4 hours  
**Priority:** HIGH - Blocks Phase 3 start

---

## 🎯 Objective

Move all reference documentation from Desktop into the repo structure so:
1. Project is self-contained (Desktop stays clean)
2. All docs are version-controlled and reviewable
3. External MCP repos (things-mcp-*) are replaced with GitHub links
4. Feature parity tracking is consistent across all product docs

---

## 📋 What's on Desktop (Inventory)

### Desktop Root Files
```
/Users/m/Desktop/
├── README.md - Project overview
├── INDEX.md - Navigation guide (MASTER INDEX)
├── THINGS_PROJECT_INDEX.md - Alternative index
├── MANIFEST.txt - File listing
```

### Desktop/Things_Documentation/ (17 files)
```
Core_Features/
├── 1_Tags_System.md
├── 2_Shortcuts.md
├── 3_Scheduled_Tasks_&_Recurring.md
├── 4_Search_&_Quick_Entry.md
├── 5_Notes_&_Attachments.md
├── 6_Deadlines_&_Priorities.md
├── 7_Projects_&_Areas.md

Data_Export/
├── Things_Database_Structure.md
├── AppleScript_Guide.md
├── Things_URL_Scheme.md

User_Experience/
├── Workflow_&_Methodology.md
├── Task_Prioritization_Guide.md
├── Task_Organization_Patterns.md
├── Keyboard_Shortcuts_Reference.md
├── Things_3_FAQ.md

Reference/
├── Markdown_Guide.md
├── AppleScript_PDF.pdf
```

### Desktop/Things_Screenshots/ (25 images)
- UI mockups, workflows, keyboard reference

### Desktop/things-mcp-main/ (TypeScript foundation)
### Desktop/things-mcp-master/ (Python reference)

### Desktop Analysis Documents (30+ files)
- DOCUMENTATION_PLAN.md
- DATABASE_EXTRACTION_GUIDE.md
- IMPLEMENTATION_ROADMAP.md
- REPO_ANALYSIS_AND_STRATEGY.md
- TYPESCRIPT_TUI_QUICK_START.md
- SESSION_*.md handoffs (20+ files)

---

## 🔄 Consolidation Steps

### Phase 1: Create Repo Structure

```bash
# Create directory structure
mkdir -p docs/product/core-features
mkdir -p docs/product/data-export
mkdir -p docs/product/user-experience
mkdir -p docs/product/reference
mkdir -p docs/analysis
mkdir -p docs/screenshots
mkdir -p reference-repos/
```

### Phase 2: Copy Product Docs

**From:** `/Users/m/Desktop/Things_Documentation/`  
**To:** `/Users/m/ai/projects/tuings/docs/product/`

**Process for each file:**
1. Copy to appropriate subdirectory
2. Add feature parity markup (TODO/DONE sections like TAGS_SYSTEM.md)
3. Update internal cross-references to point to repo docs
4. Verify links work

**Mapping:**
```
Things_Documentation/Core_Features/*
  → docs/product/core-features/

Things_Documentation/Data_Export/*
  → docs/product/data-export/

Things_Documentation/User_Experience/*
  → docs/product/user-experience/

Things_Documentation/Reference/*
  → docs/product/reference/
```

### Phase 3: Copy Analysis Docs

**From:** `/Users/m/Desktop/`  
**To:** `/Users/m/ai/projects/tuings/docs/analysis/`

**Key files to copy:**
- README.md → docs/analysis/PROJECT_OVERVIEW.md
- INDEX.md → docs/analysis/RESOURCE_INDEX.md
- DOCUMENTATION_PLAN.md → docs/analysis/DOCUMENTATION_PLAN.md
- DATABASE_EXTRACTION_GUIDE.md → docs/analysis/DATABASE_EXTRACTION_GUIDE.md
- REPO_ANALYSIS_AND_STRATEGY.md → docs/analysis/REPO_ANALYSIS_AND_STRATEGY.md
- TYPESCRIPT_TUI_QUICK_START.md → docs/analysis/TYPESCRIPT_TUI_QUICK_START.md

**Skip:** SESSION_*.md handoffs (archive only, not needed in repo)

### Phase 4: Handle MCP Reference Repos

**Current locations:**
- `/Users/m/Desktop/things-mcp-main/` (TypeScript)
- `/Users/m/Desktop/things-mcp-master/` (Python)

**Action:**
1. Copy both to `ai/projects/tuings/reference-repos/`
2. Add to `.gitignore`:
   ```
   reference-repos/
   ```
3. Create `docs/REFERENCE_REPOS.md`:
   ```markdown
   # External Reference Implementations
   
   These are external MCP implementations for Things.app integration:
   
   - **jimfilippou/things-mcp** (TypeScript)
     Repo: https://github.com/jimfilippou/things-mcp
     Location (local): reference-repos/things-mcp-main/
   
   - **hald/things-mcp** (Python)
     Repo: https://github.com/hald/things-mcp
     Location (local): reference-repos/things-mcp-master/
   
   See links above for latest versions. Local copies are reference only.
   ```
4. Update `.gitignore`:
   ```
   # External reference repos (use GitHub links instead)
   reference-repos/
   ```

### Phase 5: Copy Screenshots

**From:** `/Users/m/Desktop/Things_Screenshots/`  
**To:** `/Users/m/ai/projects/tuings/docs/screenshots/`

Keep all 25 images, organize by feature area if needed.

### Phase 6: Create Docs Navigation

**Create:** `docs/README.md`
```markdown
# Things TUI Documentation

Complete reference for the Things TUI Clone project.

## Product Documentation

Learn how Things.app works and how features map to the TUI:

- **[Core Features](./product/core-features/)** - Tags, shortcuts, scheduling, search, notes
- **[Data Export](./product/data-export/)** - Database structure, AppleScript, URL schemes
- **[User Experience](./product/user-experience/)** - Workflows, prioritization, keyboard shortcuts
- **[Reference](./product/reference/)** - Markdown guide, resources

## Development Documentation

Understanding the project architecture and progress:

- **[Analysis](./analysis/)** - Strategy docs, extraction guides, implementation plans
- **[Screenshots](./screenshots/)** - UI mockups and workflow visualizations
- **[Reference Repos](./REFERENCE_REPOS.md)** - External MCP implementations

## Quick Links

- **Getting Started:** See main README.md
- **Development Workflow:** See ../AGENTS.md
- **Feature Progress:** See ../PROGRESS.md
- **PR Workflow:** See ../PULL_REQUEST_WORKFLOW.md
```

### Phase 7: Update Main README

**In:** `README.md` (repo root)

Add section:
```markdown
## Documentation

Complete project documentation is in the `docs/` directory:

- **Product Docs:** How Things.app works and TUI feature mapping
- **Analysis Docs:** Strategy, planning, implementation guides
- **Reference:** External MCP implementations (GitHub links)

See `docs/README.md` for navigation.
```

### Phase 8: Git Operations

```bash
# Stage all new docs
git add docs/
git add .gitignore  # updated with reference-repos/

# Commit with comprehensive message
git commit -m "docs: consolidate all desktop documentation into repo

Product Docs (17 files):
- docs/product/core-features/ (7 docs: tags, shortcuts, scheduling, search, notes, deadlines, projects)
- docs/product/data-export/ (3 docs: database, AppleScript, URL scheme)
- docs/product/user-experience/ (5 docs: workflow, prioritization, patterns, shortcuts, FAQ)
- docs/product/reference/ (2 docs: Markdown guide, resources)

Analysis Docs:
- docs/analysis/ (strategy, extraction guide, implementation roadmap, etc.)
- docs/analysis/PROJECT_OVERVIEW.md (from Desktop/README.md)
- docs/analysis/RESOURCE_INDEX.md (from Desktop/INDEX.md)

External References:
- reference-repos/ (things-mcp-main, things-mcp-master)
- Git-ignored (use GitHub links instead)
- See docs/REFERENCE_REPOS.md for canonical repos:
  * https://github.com/jimfilippou/things-mcp (TypeScript)
  * https://github.com/hald/things-mcp (Python)

Desktop Changes:
- No deletions, just documented that docs are now in repo
- Desktop/Things_Documentation copied to docs/product/
- Desktop/Things_Screenshots copied to docs/screenshots/
- Reference repos moved to reference-repos/ (git-ignored)

Next Steps:
- [ ] Remove reference-repos/ folder once offline access confirmed not needed
- [ ] Add feature parity markup to remaining product docs
- [ ] Update cross-references throughout docs
"

git push origin main
```

---

## 📝 Specific File Mappings

### Core Features (7 files)
| Source | Destination | Feature Parity |
|--------|-------------|-----------------|
| 1_Tags_System.md | core-features/TAGS.md | ✅ (already done) |
| 2_Shortcuts.md | core-features/SHORTCUTS.md | TODO |
| 3_Scheduled_Tasks_&_Recurring.md | core-features/SCHEDULING.md | TODO |
| 4_Search_&_Quick_Entry.md | core-features/SEARCH.md | TODO |
| 5_Notes_&_Attachments.md | core-features/NOTES.md | TODO |
| 6_Deadlines_&_Priorities.md | core-features/DEADLINES.md | TODO |
| 7_Projects_&_Areas.md | core-features/PROJECTS.md | TODO |

### Data Export (3 files)
| Source | Destination |
|--------|-------------|
| Things_Database_Structure.md | data-export/DATABASE.md |
| AppleScript_Guide.md | data-export/APPLESCRIPT.md |
| Things_URL_Scheme.md | data-export/URL_SCHEME.md |

### User Experience (5 files)
| Source | Destination |
|--------|-------------|
| Workflow_&_Methodology.md | user-experience/WORKFLOW.md |
| Task_Prioritization_Guide.md | user-experience/PRIORITIZATION.md |
| Task_Organization_Patterns.md | user-experience/PATTERNS.md |
| Keyboard_Shortcuts_Reference.md | user-experience/KEYBOARD.md |
| Things_3_FAQ.md | user-experience/FAQ.md |

### Reference (2 files)
| Source | Destination |
|--------|-------------|
| Markdown_Guide.md | reference/MARKDOWN.md |
| AppleScript_PDF.pdf | reference/APPLESCRIPT.pdf |

---

## 🔗 Reference in PROGRESS.md

Add to PROGRESS.md under "Technical Debt":

```markdown
### Documentation Consolidation
- [x] Copy docs/product/* from Desktop/Things_Documentation/
- [x] Copy docs/analysis/* from Desktop analysis files
- [x] Copy docs/screenshots/* from Desktop/Things_Screenshots/
- [x] Move reference-repos/ and git-ignore
- [x] Create docs/README.md navigation
- [ ] Update all cross-references in docs
- [ ] Add feature parity markup to core-features/ (7 files)
- [ ] Remove reference-repos/ folder after confirming offline access not needed
```

---

## ✅ Success Criteria

- [ ] All 17 product docs copied to docs/product/
- [ ] All analysis docs copied to docs/analysis/
- [ ] All 25 screenshots copied to docs/screenshots/
- [ ] reference-repos/ created and git-ignored
- [ ] docs/REFERENCE_REPOS.md created with GitHub links
- [ ] docs/README.md navigation complete
- [ ] Main README.md updated
- [ ] PR opened and reviewed
- [ ] PR merged by Mergify
- [ ] PROGRESS.md updated with consolidation status

---

## 🚀 Next Steps After Consolidation

1. **Feature Parity Markup:** Add TODO/DONE sections to all 7 core-features/ docs
2. **Phase 3 Start:** Pick leaf 3.1 (Quick-add) from PROGRESS.md
3. **Keep Desktop Clean:** Desktop becomes archive/backup only
4. **Repo Self-Contained:** All development references point to docs/

---

## 📌 Notes

- **Desktop stays intact:** No deletions, just copies
- **Git-ignore reference-repos:** Don't version control external repos
- **Feature parity tracking:** Consistent markup across all product docs
- **Canonical sources:** GitHub links in REFERENCE_REPOS.md (not local repos)
- **Effort:** ~3-4 hours (mostly copying & organizing)
