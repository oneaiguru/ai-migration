# Next Agent: Start Here

**Project:** Things TUI Clone  
**Status:** ⏸️ PAUSED (Phase 2 Complete)  
**Date:** Nov 23, 2025  

---

## TL;DR

Things TUI is a **terminal UI clone of Things.app**. It mostly works for normal accounts but **breaks with 3000+ tasks** (real Things accounts). The Blessed library makes it hard to verify UI state in automated tests.

**Your choice:**
1. **Fix it** (Phase 4) – Implement windowing for large lists (~1-2 weeks)
2. **Redesign it** – Switch to different TUI framework with stdout support (~2-4 weeks)

---

## Quick Status

| Aspect | Status | Details |
|--------|--------|---------|
| **TUI Works** | ✅ | Navigation, search, filtering, selection |
| **Large Lists** | ❌ | Breaks with 3000+ tasks in Anytime |
| **Tests** | ✅ Partial | 24/38 BDD scenarios passing |
| **Coverage** | 41.86% | Need improvement in components (13.7%) |
| **UAT Friendly** | ❌ | Blessed can't be inspected via stdout |
| **Stack** | ⚠️ | TypeScript + Blessed + Cucumber.js |

---

## What's Here

### Core Code
- `src/tui/app.ts` – Main TUI class (700+ lines)
- `src/tui/components.ts` – UI components (dialogs, lists)
- `src/database/things-db.ts` – Task queries + Things URL scheme
- `src/index.ts` – Entry point

### Tests & Specs
- `features/*.feature` – 38 BDD scenarios (5 files)
- `features/step_definitions/common.steps.ts` – Step implementations
- `features/anytime-large-lists.feature` – Large-list specs (NEW)

### Documentation (Read These First)
- `AGENTS.md` – Full project phases and structure
- `docs/THINGS_TUI_STATUS.md` – Executive summary (NEW)
- `docs/STACK_LIMITATIONS.md` – Why stdout inspection doesn't work (NEW)
- `docs/LARGE_DATASET_NOTES.md` – Performance issues (NEW)
- `STABILITY_PHASE_PLAN.md` – Phase 4 plan (NEW)

### Recent Changes (This Session)
- ✅ Removed all blessed markup styling tags
- ✅ Fixed Things app error handling
- ✅ Created stability phase docs & specs
- 📝 4 new docs, 1 new feature file

---

## Immediate Tasks

### Option A: Quick Fix (Phase 4 – Windowing)
```
1. Read STABILITY_PHASE_PLAN.md
2. Implement windowed rendering in src/tui/app.ts
3. Run BDD: npm run test:bdd -- --tags="@stability"
4. Verify with 3000+ Anytime tasks
5. PR → merge
```

**Timeline:** 1-2 weeks  
**Effort:** Medium (rendering logic change)

### Option B: Redesign (Different Stack)
```
1. Review docs/THINGS_TUI_NEXT_ITERATION.md (draft it if needed)
2. Research alternatives: Ink.js, Pastel, web UI
3. Propose new stack to team
4. Create new feature files
5. Implement with new framework
```

**Timeline:** 2-4 weeks  
**Effort:** High (full rewrite)

---

## Running the Project

```bash
# Install
npm install

# Build
npm run build

# Run TUI
npm start

# Run tests
npm run test:bdd
npm run test:bdd -- --tags="@stability"

# Coverage
npm run test:coverage
```

---

## Key Constraints

### 1. Blessed Terminal Library
- ✅ Good for building TUIs
- ❌ Writes directly to `/dev/tty` (not stdout)
- ❌ Can't be inspected by code tools/LLM agents via stdout
- ❌ See `docs/STACK_LIMITATIONS.md`

### 2. Large Lists Break
- Renders ALL 3000+ tasks in one pass
- Terminal buffer overflows
- UI becomes unresponsive
- Solution: Windowing (render only visible ~40 rows)
- See `docs/LARGE_DATASET_NOTES.md`

### 3. Things App Integration
- Uses URL scheme (`things:///complete?id=...`)
- Only works on macOS with Things.app installed
- Silent fails in dev environments (expected)

---

## Test Coverage

**Current:**
```
Statements:  41.86% (need: 50%+)
Branches:    82.31% (good)
Functions:   64.77% (good)
```

**By module:**
- Database: 59.2% ✅
- App (TUI): 55.62% ✅
- Components: 13.7% ❌ (too low)
- Utils: 0% ❌ (not tested)

**BDD Status:**
- 24 passing ✅
- 14 failing ❌
- 34 undefined 🔲
- 2 ambiguous ⚠️

---

## Recent Commit History

```
f3d7821 docs: add Phase 4 stability plan and large-dataset documentation
323cf60 fix(database): silent fail for Things app URL scheme when app not installed
bfb9c24 refactor(tui): remove all blessed markup styling tags
```

---

## Decision Tree

**What should I do?**

1. **"Fix the existing TUI"**
   → Read `STABILITY_PHASE_PLAN.md`
   → Implement windowing in `src/tui/app.ts`
   → Run `npm run test:bdd -- --tags="@stability"`
   → Phase 4, ~1-2 weeks

2. **"Switch to different UI framework"**
   → Draft `docs/THINGS_TUI_NEXT_ITERATION.md` with options
   → Research: Ink.js, Pastel, web UI + headless mode
   → Rewrite or redesign, ~2-4 weeks

3. **"Just maintain status quo"**
   → It works for small accounts (<500 tasks)
   → Document known limitations
   → Call it done, move to next project

---

## Key Files to Read (In Order)

1. **This file** (NEXT_AGENT_START_HERE.md)
2. `docs/THINGS_TUI_STATUS.md` – What's working/broken
3. `AGENTS.md` – Full project context
4. `STABILITY_PHASE_PLAN.md` – Phase 4 plan (if fixing)
5. `docs/STACK_LIMITATIONS.md` – Why Blessed is tricky
6. `docs/LARGE_DATASET_NOTES.md` – Performance details
7. `features/anytime-large-lists.feature` – BDD specs to lock in

---

## PR Status

**Active PR:** #47  
**Branch:** `feat/3.3-move-between-lists`  
**Changes:**
- Styling removal (55+ tags)
- Things app error handling
- New stability docs & specs

Ready to merge after this session.

---

## Questions?

- **What's blocking the project?** See `docs/THINGS_TUI_STATUS.md` (What's Broken)
- **What do I fix first?** See above "Decision Tree"
- **How do I test it?** `npm run test:bdd` + manual `npm start`
- **What's the stack?** TypeScript + Blessed + Cucumber.js (see `AGENTS.md`)

---

## Next Steps for You

1. ✅ Read this file (done!)
2. ✅ Read `docs/THINGS_TUI_STATUS.md`
3. Choose Option A, B, or C above
4. If Option A: Read `STABILITY_PHASE_PLAN.md` → start coding
5. If Option B: Draft `docs/THINGS_TUI_NEXT_ITERATION.md` → propose new stack
6. Update AGENTS.md with your plan
7. Create BDD scenarios for your work
8. Implement in RED → GREEN → REFACTOR cycle
9. PR → @codex review

---

**Good luck! The project is in good shape for a restart. Pick your direction and go.** 🚀
