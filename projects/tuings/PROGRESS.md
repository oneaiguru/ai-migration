# PROGRESS - Things TUI Clone

## Backlog Tree

### Phase 1: Harness & Safety
1.1 BDD harness health check (Cucumber runs, things-tui.feature discovered)
1.2 Coverage pipeline integration (nyc / c8 wired into test command)

### Phase 2: Read-Only UX (Navigation & Display)
2.1 List navigation (numbers 1–4 to switch between Today/Upcoming/Anytime/Someday)
2.2 Task selection (↑↓ / j/k to move cursor, display selection highlight)
2.3 Task detail view (Enter key opens detail popup with full task info)
2.4 Search functionality (/ key opens search, filters tasks by title/notes)
2.5 Tag filtering (t key opens tag picker, filters tasks by selected tags)
2.6 Status bar information (shows current list, task count, active filters)

### Phase 3: Write Operations (Data Mutation)
3.1 Quick-add task (n key opens input, type title + Enter creates task via URL scheme)
3.2 Mark complete (c key toggles task completion status)
3.3 Move between lists (m key + picker to reschedule / move task)
3.4 Edit task (e key opens editor for title/notes)
3.5 Tag assignment from TUI (T key to add/remove tags via UI)
3.6 Bulk operations (select multiple + apply action)

### Phase 4: Advanced UX & Features
4.1 Projects / Areas navigation (group tasks by project)
4.2 Checklist display and toggle (show subtasks)
4.3 Saved filters / named tag sets (preset filter shortcuts)
4.4 Config-driven keybindings (customize hotkeys via config file)

---

## Status Table

| Leaf ID | Name                              | Status    | Branch / Notes                  |
|---------|-----------------------------------|-----------|----------------------------------|
| 1.1     | BDD harness health                | DONE      | Cucumber + things-tui.feature   |
| 1.2     | Coverage pipeline                 | DONE      | nyc / c8 integrated             |
| 2.1     | List navigation (1–4 keys)        | DONE      | 8 scenarios passing             |
| 2.2     | Task selection (↑↓/jk)            | DONE      | 9 scenarios passing             |
| 2.3     | Task detail view (Enter)          | DONE      | 7 scenarios passing             |
| 2.4     | Search (/)                        | DONE      | 7 scenarios passing             |
| 2.5     | Tag filtering (t)                 | DONE      | 7 scenarios passing             |
| 2.6     | Status bar info                   | DONE      | Integrated in display           |
| 3.1     | Quick-add task (n)                | DONE      | 8 scenarios passing, 52.45% coverage |
| 3.2     | Mark complete (c)                 | DONE      | 7 scenarios passing, persistence + visual indicators |
| 3.3     | Move between lists (m)            | IN-PROG   | PR #46 pending Codex approval   |
| 3.4     | Edit task (e)                     | TODO      | Depends on 3.1                  |
| 3.5     | Tag assignment from TUI (T)       | TODO      | Depends on 3.1                  |
| 3.6     | Bulk operations                   | PARKED    | Defer after core write ops      |
| UAT     | Smoke tests (4 scenarios)         | DONE      | features/uat-smoke.feature      |
| 4.1     | Projects / Areas                  | PARKED    | Lower priority feature area     |
| 4.2     | Checklist display                 | PARKED    | Lower priority feature area     |
| 4.3     | Saved filters                     | PARKED    | Lower priority feature area     |
| 4.4     | Config-driven keybindings         | PARKED    | Lower priority feature area     |

---

## Status Legend

- **TODO** – Not started, available to pick up.
- **NEXT** – Ready to pick up next (topmost one should be your current focus).
- **IN-PROG** – Active branch, work ongoing.
- **DONE** – All scenarios green, merged to main.
- **PARKED** – Intentionally deferred (reason in notes).
- **ABANDONED** – Attempted, reverted, replaced by sibling (see notes for reason).

---

## Phase Summary

### Phase 1: Harness (✅ Complete)
- ✅ BDD test harness running (Cucumber + Gherkin)
- ✅ Coverage pipeline integrated
- ✅ All infrastructure in place for strict BDD

### Phase 2: Read-Only UX (✅ Complete)
- ✅ 38 scenarios covering all navigation and display features
- ✅ 45.78% statement coverage
- ✅ Tag filtering, search, detail view all working
- ✅ No data mutation; safe to test extensively

### Phase 3: Write Operations (🔄 In Progress)
- ✅ 3.1 (Quick-add) – Complete with 8 scenarios
- ✅ 3.2 (Mark complete) – Complete with 7 scenarios
- ⏳ 3.3 (Move between lists) – In progress
- ⏳ Will cover 3.4 (Edit), 3.5 (Tag assignment), bulk ops
- ✅ UAT smoke tests added (4 scenarios for end-to-end validation)

### Phase 4: Advanced Features (📋 Planned for later)
- 📋 Projects, checklists, saved filters, keybindings
- 📋 Lower priority; can be added after core ops are solid

---

## Development Notes

### Coverage Targets
- Current: 45.78% statements
- Soft target for Phase 3: 55–60% (new write ops code)
- Hard target for Phase 4: 70%+ (mature codebase)

### Test Scenarios
- Total scenarios added so far: 38
- All in single file: `features/things-tui.feature`
- Tagged by leaf ID for easy traceability

### Key Decision Points
- **URL scheme vs. direct DB:** Write ops will use Things URL scheme (`things://`) for safety and Things.py integration.
- **TUI input model:** Single-character hotkeys for speed; confirm via Enter or secondary key.
- **Error recovery:** Graceful degradation if Things.py subprocess fails.

---

## How to Use This File

1. **At session start:** Look at `Status` column for the topmost `NEXT` leaf.
2. **When starting work:** Create branch `feat/<id>-<slug>` and update this table to `IN-PROG`.
3. **After completing a leaf:** Update status to `DONE` and move the next `TODO` to `NEXT`.
4. **If backtracking:** Mark leaf `ABANDONED` with reason, add sibling (e.g. `3.1b`), set that to `NEXT`.

---

## Next Action

**Pick leaf 3.1 (Quick-add task):**
- Create branch: `git switch -c feat/3.1-quick-add`
- Add scenarios to `features/things-tui.feature` under `@leaf_3_1`
- Run `npm run test:bdd` (expect RED / undefined steps)
- Implement steps in `common.steps.ts`
- Add code to `src/tui/app.ts` to drive to GREEN
- Update this file when done
