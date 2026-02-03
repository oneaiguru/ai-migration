# Desktop Structure - Things TUI Project

**Purpose**: Visual map of all files on Desktop and their purpose  
**Updated**: November 23, 2025  
**Usage**: Reference when looking for specific files or documentation

---

## Quick Navigation

### 🎯 Start Here (Read First)
1. `prompt.md` - Project requirements (source of truth)
2. `AGENTS.md` - Session handoff protocol
3. `SESSION_1_HANDOFF.md` - What Session 1 delivered

### 📋 Strategic Documents
- `THINGS_TUI_HYBRID_APPROACH.md` - Complete 3-step plan
- `REPO_ANALYSIS_AND_STRATEGY.md` - Why TypeScript, why Blessed
- `INDEX.md` - Complete resource map

### 💻 Implementation Guides
- `TYPESCRIPT_TUI_QUICK_START.md` - Code templates (copy-paste ready)
- `DATABASE_EXTRACTION_GUIDE.md` - SQL queries + Python patterns

### 📁 Reference Implementations
- `things-mcp-main/` - TypeScript foundation (USE THIS)
- `things-mcp-master/` - Python reference (REFERENCE ONLY)

### 📚 Things Documentation (17 Files)
- `Things_Documentation/Core_Features/` - Tags, scheduling, shortcuts
- `Things_Documentation/Data_Export/` - Database, AppleScript, URL scheme
- `Things_Documentation/User_Experience/` - Workflow patterns

### 🖼️ Visual Reference (25 Images)
- `Things_Screenshots/` - All UI mockups and states

---

## File Organization

```
/Users/m/Desktop/
│
├─ 📄 SESSION FILES (Created by agents)
│  ├─ AGENTS.md                          ✅ Session handoff protocol
│  ├─ SESSION_1_HANDOFF.md               ✅ Session 1 complete
│  └─ [SESSION_2_HANDOFF.md]             ⏳ Created by Session 2
│
├─ 📋 PLANNING DOCUMENTS
│  ├─ prompt.md                          ✅ Source of truth
│  ├─ THINGS_TUI_HYBRID_APPROACH.md      ✅ 3-step strategy
│  ├─ REPO_ANALYSIS_AND_STRATEGY.md      ✅ Technical decisions
│  ├─ TYPESCRIPT_TUI_QUICK_START.md      ✅ Code templates
│  ├─ DATABASE_EXTRACTION_GUIDE.md       ✅ SQL + patterns
│  ├─ INDEX.md                           ✅ Resource map
│  └─ DESKTOP_STRUCTURE.md               ✅ This file
│
├─ 📁 CODE FOUNDATIONS
│  ├─ things-mcp-main/                   ← TypeScript foundation (CLONE THIS)
│  │  ├─ src/
│  │  ├─ package.json
│  │  └─ readme.md
│  │
│  └─ things-mcp-master/                 ← Python reference (READ ONLY)
│     ├─ things_server.py
│     ├─ formatters.py
│     ├─ url_scheme.py
│     └─ tests/
│
├─ 📚 DOCUMENTATION
│  ├─ Things_Documentation/
│  │  ├─ DOCUMENTATION_INDEX.md
│  │  ├─ Core_Features/
│  │  │  ├─ Using_Tags.md
│  │  │  ├─ Scheduling_To-Dos_in_Things.md
│  │  │  ├─ Keyboard_Shortcuts_for_Mac.md
│  │  │  ├─ Searching_and_Navigating_with_Quick_Find.md
│  │  │  ├─ Writing_Notes_in_Things.md
│  │  │  ├─ Creating_Repeating_To-Dos.md
│  │  │  ├─ How_to_Prioritize_To-Dos_in_Things.md
│  │  │  └─ Whats_new_in__the_all-new_Things.md
│  │  │
│  │  ├─ Data_Export/
│  │  │  ├─ Exporting_Your_Data.md
│  │  │  ├─ Things_AppleScript_Guide.md
│  │  │  └─ Things_URL_Scheme.md
│  │  │
│  │  ├─ User_Experience/
│  │  │  ├─ An_In-Depth_Look_at_Today,_Upcoming,_Anytime,_and_Someday.md
│  │  │  ├─ Gather_it_all_in_one_place.md
│  │  │  ├─ How_to_Deal_with_Waiting_To-Dos.md
│  │  │  ├─ How_to_Prioritize_To-Dos_in_Things.md
│  │  │  └─ Why_Some_To-Dos_Get_Stuck_and_How_to_Get_Them_Moving_Again.md
│  │  │
│  │  └─ Reference/
│  │     ├─ Markdown_Guide.md
│  │     └─ Things3AppleScriptGuide.pdf
│  │
│  └─ Things_Screenshots/
│     ├─ SCREENSHOT_INDEX.md
│     ├─ 01-inbox-overview.png
│     ├─ 02-today-list.png
│     ├─ ... (25 total)
│     └─ 25-search-results.png
│
└─ 📄 REFERENCE DOCS
   ├─ README.md                         ← Project overview
   ├─ DOCUMENTATION_PLAN.md             ← Feature analysis
   ├─ IMPLEMENTATION_ROADMAP.md         ← 6-week plan (reference)
   └─ SESSION_SUMMARY.md                ← Session notes
```

---

## Which File Should I Read For...

### Understanding Requirements
- **What is the project?** → `prompt.md`
- **What are the features?** → `Things_Documentation/Core_Features/`
- **What does the UI look like?** → `Things_Screenshots/`

### Understanding Architecture
- **Why TypeScript?** → `REPO_ANALYSIS_AND_STRATEGY.md`
- **Why Blessed?** → `REPO_ANALYSIS_AND_STRATEGY.md`
- **Why better-sqlite3?** → `REPO_ANALYSIS_AND_STRATEGY.md`

### Getting Started
- **How do I start?** → `AGENTS.md` (session protocol)
- **What's the plan?** → `THINGS_TUI_HYBRID_APPROACH.md`
- **What's the code?** → `TYPESCRIPT_TUI_QUICK_START.md`

### Building Features
- **Database queries?** → `DATABASE_EXTRACTION_GUIDE.md`
- **URL scheme?** → `Things_Documentation/Data_Export/Things_URL_Scheme.md`
- **Keyboard shortcuts?** → `Things_Documentation/Core_Features/Keyboard_Shortcuts_for_Mac.md`
- **Tag system?** → `Things_Documentation/Core_Features/Using_Tags.md`
- **Lists (Today, etc)?** → `Things_Documentation/User_Experience/An_In-Depth_Look_at_Today,_Upcoming,_Anytime,_and_Someday.md`

### Debugging
- **Database not working?** → `DATABASE_EXTRACTION_GUIDE.md`
- **Blessed not rendering?** → GitHub blessed docs
- **Confused about architecture?** → `REPO_ANALYSIS_AND_STRATEGY.md`

---

## File Sizes & Creation Timeline

| File | Size | Created | Status |
|------|------|---------|--------|
| `AGENTS.md` | 8 KB | Session 1 | ✅ |
| `SESSION_1_HANDOFF.md` | 12 KB | Session 1 | ✅ |
| `THINGS_TUI_HYBRID_APPROACH.md` | 15 KB | Session 1 | ✅ |
| `TYPESCRIPT_TUI_QUICK_START.md` | 14 KB | Session 1 | ✅ |
| `DATABASE_EXTRACTION_GUIDE.md` | 13 KB | Session 1 | ✅ |
| `REPO_ANALYSIS_AND_STRATEGY.md` | 15 KB | Session 1 | ✅ |
| `INDEX.md` | 10 KB | Session 1 | ✅ |
| `Things_Documentation/` | 200 KB+ | Original | ✅ |
| `things-mcp-main/` | 100 KB | Reference | ✅ |
| `things-mcp-master/` | 200 KB | Reference | ✅ |

**Total Documentation**: ~600 KB (mostly reference material)

---

## Reading Order by Role

### If You're Starting Session 2
1. `prompt.md` - Requirements (5 min)
2. `AGENTS.md` - Protocol (5 min)
3. `SESSION_1_HANDOFF.md` - What's done (10 min)
4. `TYPESCRIPT_TUI_QUICK_START.md` - Code (15 min)
5. `DATABASE_EXTRACTION_GUIDE.md` - Queries (10 min)

**Total**: ~45 min prep before coding

### If You're Reviewing Architecture
1. `prompt.md` - Requirements
2. `REPO_ANALYSIS_AND_STRATEGY.md` - Why these decisions
3. `THINGS_TUI_HYBRID_APPROACH.md` - Complete plan
4. Look at code in `things-mcp-main/` and `things-mcp-master/`

### If You're Building a Feature
1. Find feature in `Things_Documentation/`
2. See screenshot in `Things_Screenshots/`
3. Get queries from `DATABASE_EXTRACTION_GUIDE.md`
4. Check templates in `TYPESCRIPT_TUI_QUICK_START.md`
5. Test with real Things data

---

## What Each Repo Contains

### `things-mcp-main/` (TypeScript - Foundation)
- ✅ Modern TypeScript setup
- ✅ Things URL scheme implementation
- ✅ Zod validation
- ✅ Clean, minimal codebase (~600 lines)
- ⚠️ No database read layer (we'll add this)

**Use For**: Clone as foundation, add database layer

### `things-mcp-master/` (Python - Reference)
- ✅ Complete database access (things.py)
- ✅ Data formatting patterns
- ✅ Tag hierarchy logic
- ✅ Comprehensive test suite (51 tests)
- ❌ Python (not what we're using)

**Use For**: Extract SQL patterns, read data formatting logic, copy test ideas

---

## Key Decision Points Documented

| Decision | Doc | Reasoning |
|----------|-----|-----------|
| TypeScript vs Python | `REPO_ANALYSIS_AND_STRATEGY.md` | Better TUI ecosystem |
| Blessed vs Textual | `REPO_ANALYSIS_AND_STRATEGY.md` | Lighter, faster |
| things-mcp-main vs uahis | `REPO_ANALYSIS_AND_STRATEGY.md` | Cleaner code |
| better-sqlite3 | `REPO_ANALYSIS_AND_STRATEGY.md` | Sync, TypeScript support |
| URL scheme for writes | `REPO_ANALYSIS_AND_STRATEGY.md` | No DB conflicts |
| 4 phases | `AGENTS.md` | Incremental delivery |

---

## Handoff Checklist

When handing off to next session, verify:

- [ ] `/Users/m/Desktop/AGENTS.md` explains protocol
- [ ] Session handoff file exists (`SESSION_X_HANDOFF.md`)
- [ ] Code is in `~/ai/projects/uahis/`
- [ ] README explains how to run
- [ ] Tests pass
- [ ] No breaking changes documented

---

## Troubleshooting

### "I can't find X file"
→ Use this file to locate it (search by filename or topic)

### "What should I read?"
→ See "Which File Should I Read For..." section above

### "What's the deadline?"
→ Check `AGENTS.md` for session scope and time estimates

### "What's done / what's next?"
→ Read the latest `SESSION_X_HANDOFF.md` file

### "Who made this decision?"
→ Search the decision in appropriate doc (usually `REPO_ANALYSIS_AND_STRATEGY.md`)

---

## Updates to This File

- **Session 1** (Nov 23): Created structure, populated with Session 1 files
- **Session 2** (TBD): Add SESSION_2_HANDOFF.md, update progress
- **Session 3** (TBD): Add SESSION_3_HANDOFF.md, continue
- **...Future sessions**: Update as needed

---

## Notes for Maintainers

- Keep all session handoff files on Desktop
- Update DESKTOP_STRUCTURE.md after each session
- Don't delete old handoff files (they're history)
- Use Desktop only for coordination, code lives in ~/ai/projects/uahis
- Archive old documentation if it becomes too cluttered

---

**Last Updated**: November 23, 2025 (Session 1)  
**Next Update**: After Session 2 complete  
**Maintained By**: Agent system + Manual updates
