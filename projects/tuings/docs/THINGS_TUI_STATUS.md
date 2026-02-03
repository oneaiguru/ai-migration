# Things TUI Project Status

**Status:** ⏸️ PAUSED (Phase 2 Complete)  
**Last Updated:** Nov 23, 2025  
**Current Coverage:** 41.86% statements, 82.31% branches  

---

## Executive Summary

The Things TUI project is a **Terminal UI clone of Things.app** built with Blessed + TypeScript + BDD (Cucumber.js). 

**Current State:**
- ✅ Core TUI architecture is working
- ✅ BDD test framework is in place (38 scenarios, 24 passing)
- ⚠️ Stack has fundamental limitations for LLM-based UAT
- ❌ Large-dataset handling (3000+ tasks) is broken
- ⏸️ Project paused due to stack mismatch + planning issues

**Why Paused:**
1. **Blessed + stdout mismatch** – Can't inspect TUI via stdout for automated UAT
2. **Planning mismatch** – BDD features weren't derived from UX docs/screenshots
3. **Large-dataset failure** – UI breaks with real Things accounts (3000+ tasks in Anytime)
4. **Testing challenges** – Can't easily generate visual proofs for code review

---

## What Works ✅

### TUI Navigation & Core Features
- ✅ List switching (1/2/3/4 keys) – Today/Upcoming/Anytime/Someday
- ✅ Task selection & movement (up/down, j/k)
- ✅ Task detail view (Enter key)
- ✅ Search (`/` key)
- ✅ Tag filtering (`t` key)
- ✅ Task completion toggle (`c` key) – partial, Things app not always available
- ✅ Help screen (`?` key)
- ✅ Clean plain-text UI (no markup styling)

### Testing & Documentation
- ✅ BDD framework (Cucumber.js + Gherkin)
- ✅ 38 scenarios written, 24 passing
- ✅ Coverage reports (41.86% overall)
- ✅ Test harness (`ThingsTUITestable`) for UI inspection
- ✅ Step definitions library (~280 steps defined)

### Recent Improvements (This Session)
- ✅ Removed all blessed markup tags (~55 tags)
- ✅ Added Unicode symbols for visual distinction (▶, ✓, ·)
- ✅ Fixed Things app error handling (silent fail in dev)
- ✅ Created comprehensive documentation (7+ docs)

---

## What's Broken ❌

### Large-Dataset Handling
- ❌ Opening "Anytime" with 3000+ tasks causes UI freeze/corruption
- ❌ Keypress latency: 5+ seconds per key
- ❌ Terminal buffer overflow (screen garbage)
- ❌ Status bar becomes invisible or corrupted
- ❌ No windowing/virtualization (renders ALL tasks at once)

### UAT & LLM Integration
- ❌ Cannot inspect TUI via stdout (Blessed uses alternate buffer)
- ❌ Code tool/LLM cannot "see" rendered UI frame-by-frame
- ❌ No screenshot/snapshot capability for visual review
- ❌ Blocks automated "UAT agent" pattern

### Planning & Scope
- ⚠️ Original UX docs not fully mapped to BDD features
- ⚠️ Behavior wasn't pinned down before implementation
- ⚠️ Visual/layout quality diverged from Things app without tests

---

## Partial Implementation ⚠️

### Things App Integration
- ⚠️ URL scheme calls work IF Things app is installed
- ⚠️ Silent fail in dev environments (Things not available)
- ⚠️ No real persistence (doesn't actually mark tasks in Things.app)

### BDD Test Coverage
- ⚠️ 24/38 scenarios passing (63%)
- ⚠️ 2 ambiguous steps
- ⚠️ 34 undefined steps
- ⚠️ Components module at 13.7% coverage (too low)

---

## Stack Overview

| Component | Tech | Status |
|-----------|------|--------|
| **TUI Framework** | Blessed | ✅ Works but has limitations |
| **Language** | TypeScript | ✅ Works well |
| **Testing** | Cucumber.js + Gherkin BDD | ✅ Works well |
| **Database** | better-sqlite3 + Python helpers | ⚠️ Works but Python dependency |
| **Build** | tsc + npm | ✅ Works |
| **Coverage** | c8 (nyc) | ✅ Works |

---

## Known Limitations

### 1. Blessed Terminal Rendering
- Writes directly to `/dev/tty` in alternate buffer
- Cannot be reliably captured via stdout
- Makes LLM inspection very difficult

### 2. Large-Dataset Performance
- Renders all tasks in single pass
- No virtualization/windowing
- Breaks at ~3000+ tasks

### 3. Things App Integration
- URL scheme only works on macOS with Things.app installed
- No real persistence in current dev environment
- Would need different approach for other platforms

### 4. Testing Challenges
- Visual verification requires manual UI inspection
- Cannot generate automated screenshots
- UAT via LLM agents not feasible

---

## Metrics at Pause

### Coverage (as of Nov 23, 2025)
```
Statements:  41.86% (630/1505)
Branches:    82.31% (121/147)
Functions:   64.77% (57/88)
Lines:       41.86% (630/1505)

By Module:
- Database:      59.2% statements (good)
- App (TUI):     55.62% statements (okay)
- Components:    13.7% statements (TOO LOW)
- Utils/Path:    0% statements (not tested)
```

### BDD Status
```
74 scenarios total
├─ 24 passed ✅
├─ 14 failed ❌
├─ 2 ambiguous ⚠️
└─ 34 undefined 🔲

418 total steps
├─ 280 passed ✅
├─ 77 undefined 🔲
├─ 45 skipped (pending)
├─ 14 failed ❌
└─ 2 ambiguous ⚠️
```

---

## Recommended Next Steps

See `docs/THINGS_TUI_NEXT_ITERATION.md` for options:

1. **Quick Fix (Phase 4)** – Implement windowing for large lists
2. **Medium Refactor** – Switch to a different TUI framework with better stdout support
3. **Major Redesign** – Headless + web-based UI with separate stdout renderer

---

## Key Files for Future Reference

- `AGENTS.md` – Full project phases and current work plan
- `docs/STACK_LIMITATIONS.md` – Why Blessed + stdout doesn't work
- `docs/LARGE_DATASET_NOTES.md` – Performance issues with 3000+ tasks
- `features/anytime-large-lists.feature` – BDD specs for stability phase
- `STABILITY_PHASE_PLAN.md` – Detailed plan for Phase 4
- `SESSION_SUMMARY_STYLING_REMOVAL.md` – Recent refactoring work
- `THINGS_TUI_LEARNINGS.md` – Why the project stalled (fill in next)
- `THINGS_TUI_NEXT_ITERATION.md` – Recommendations for restart (fill in next)

---

## How to Restart

1. Read `THINGS_TUI_STATUS.md` (this file) + `THINGS_TUI_LEARNINGS.md`
2. Review `AGENTS.md` to understand current phase
3. Decide on next approach:
   - Phase 4: Windowing fix (1-2 weeks)
   - Alternative stack: Ink.js, Pastel, or web UI (2-4 weeks)
4. Update `THINGS_TUI_NEXT_ITERATION.md` with chosen path
5. Create new feature files for next phase
6. Begin work in BDD cycle (RED → GREEN → REFACTOR)

---

## Questions for Next Agent

- Should we fix windowing (Phase 4) or switch stacks?
- Do we need stdout-visible rendering for UAT?
- Should Things app integration be real (macOS) or mocked (everywhere)?
- How much time do we have for the next iteration?

See `THINGS_TUI_NEXT_ITERATION.md` for detailed options.
