# AGENTS.md — Things TUI (tuings) Phase 3

## 0. Canonical Project Info

- **Project**: Things TUI Clone (`tuings`)
- **Purpose**: Terminal UI for Things 3 with full keyboard control and BDD coverage
- **Path**: `/Users/m/ai/projects/tuings`
- **Language**: TypeScript
- **TUI Library**: Blessed
- **Tests**: Cucumber.js + Gherkin feature files
- **Data**: `better-sqlite3` read-only access to the Things database
- **Writes**: Things URL Scheme (handled by TUI side with `markTaskComplete()`, `markTaskIncomplete()`)

---

## 1. Phase Map

### Phase 1 — TUI Architecture (Done)
- Built Blessed-based terminal UI
- Implemented core flows: list navigation, task navigation, basic filtering, selection
- Introduced `ThingsTUITestable` test harness in `src/tui/app.ts`

### Phase 2 — BDD Retrofit & Coverage (Done)
- **Feature files** (38 scenarios total):
  - `features/search-tasks.feature` (7 scenarios)
  - `features/view-task-details.feature` (7 scenarios)
  - `features/filter-by-tags.feature` (7 scenarios)
  - `features/navigate-lists.feature` (8 scenarios)
  - `features/select-tasks.feature` (9 scenarios)
- **Step definitions**: all steps in `features/step_definitions/common.steps.ts`
- **Coverage (end of Phase 2)**:
  - Statements: **45.89%** (525/1144)
  - Branches: 80.86% (93/115)
  - Functions: 63.63% (49/77)
  - Lines: 45.89% (525/1144)
- **Module coverage**:
  - Database: 59.4%
  - TUI App: 51.34%
  - Components: 12.56%
  - Utils / path: 0%

### Phase 3 — Write Operations & Coverage Growth (PAUSED)
- **3.1 Quick-add task (n)** — DONE ✅ (8 scenarios)
- **3.2 Mark complete (c)** — DONE ✅ (7 scenarios, persistence + visual indicators)
- **3.3 Move between lists (m)** — IN-PROGRESS
- **3.4 Edit task (e)** — TODO
- **3.5 Tag assignment from TUI (T)** — TODO
- **3.6 Bulk operations** — PARKED

**Coverage target**: ≥ 50% statements; Components & Utils ≥ 20%

### Phase 3b — Visual Layout Parity with Official Things GUI (NEXT)
**Goal**: Replicate the official Things.app GUI layout and behavior in the TUI using the official documentation and screenshots.

**Sources of Truth**:
- **Official docs** (11 files in `docs/things-docs-mac-app-gui-official/`):
  - `01-in-depth-look-today-upcoming-anytime-someday.md` – Today/Upcoming/Anytime/Someday lists
  - `02-deal-with-waiting-todos.md` – Waiting list behavior
  - `03-prioritize-todos.md` – Prioritization workflows
  - `04-keyboard-shortcuts-mac.md` – All hotkeys and controls
  - `05-markdown-guide.md` – Markdown support
  - `06-scheduling-todos.md` – When/scheduling logic
  - `07-quick-find-search.md` – Quick Find UI/behavior
  - `08-using-tags.md` – Tag filtering and UI
  - `09-whats-new-things.md` – Feature overview
  - `10-exporting-data.md` – Data export
  - `11-why-todos-get-stuck.md` – Stuck tasks tips

**New Feature Files**:
- `features/uat-smoke.feature` – Layout smoke tests against official screenshots
- `features/scheduling-lists.feature` – Today/Upcoming/Anytime/Someday behavior
- `features/tags-and-priorities.feature` – Tag filtering and prioritization
- `features/quick-find.feature` – Quick Find search and navigation

**Workflow**:
1. Pick one doc section (e.g., "Today view" from doc 01)
2. Identify the TUI layout spec from the doc (panels, headings, focus)
3. Write a scenario in the appropriate `.feature` file
4. Implement the scenario using `ThingsTUITestable`
5. Run `npm run test:bdd` to verify
6. Repeat until all official behavior is covered

**Success**: TUI visually and functionally matches official Things.app behavior per the official documentation.

### Phase 4 — Python → TypeScript Migration (Future)
**Goal**: Eliminate Python dependency, use `better-sqlite3` for database reads

See **Section 10: Database Migration Strategy** (below) for details on:
- Why migrate away from Python
- How to use reference MCP implementations
- Timeline and BDD approach for migration

---

## 2. Daily Agent Checklist

> Treat this as your "do this every time" list.

1. **Open project & sync**
   ```bash
   cd /Users/m/ai/projects/tuings
   git fetch origin && git pull origin main
   ```

2. **Install & build (first run or after dependency changes)**
   ```bash
   npm install
   npm run build
   ```

3. **Run tests + coverage**
   ```bash
   npm run test:bdd
   npm run test:coverage
   ```

4. **Pick one focused task**
   - A single scenario in an existing `.feature` file, OR
   - Implement all undefined steps in a feature, OR
   - A new scenario in Phase 3 feature files (e.g., `components-display.feature`)

5. **Use strict BDD cycle**
   - **RED**: Write/confirm failing test(s)
   - **GREEN**: Implement steps + minimal code to pass
   - **REFACTOR**: Clean code while keeping tests green

6. **Re-run tests & coverage**
   ```bash
   npm run test:bdd
   npm run test:coverage
   ```
   Confirm:
   - No new ambiguous/undefined steps
   - Global coverage not regressing

7. **Commit & push**
   ```bash
   git add .
   git commit -m "feat/fix(module): description"
   git push origin branch-name
   ```

8. **Create PR and add final `@codex review` comment** (CRITICAL)
   ```bash
   gh pr create --title "..." --body "..."
   # Wait for PR to be created, note the PR number
   gh pr comment PR_NUMBER --body "@codex review"
   ```
   
   **MANDATORY RULE**: 
   - Add `@codex review` as **FINAL, SEPARATE comment only**
   - Do NOT include other text with this comment
   - This must be the LAST comment you post
   - Triggers automated Codex code review before merge

---

## 3. File Map

**Source**
- `src/tui/app.ts` — Main TUI class + `ThingsTUITestable` test harness
- `src/tui/components.ts` — Visual components & layout (12.56% coverage → target 50%+)
- `src/database/things-db.ts` — DB queries + URL scheme calls (59.4% coverage)
- `src/utils/path.ts` — Path utilities for database location (0% coverage → target 50%+)

**Tests**
- `features/*.feature` — Gherkin specs (Phase 2: 5 files, 38 scenarios; Phase 3: TBD)
- `features/step_definitions/common.steps.ts` — All step implementations

**Config & Reports**
- `cucumber.cjs` — Cucumber config
- `.c8rc.json` — Coverage config
- `coverage/index.html` — HTML coverage report
- `PROGRESS.md` — Status of all leaves & features
- `BDD_LINEAR_DEVELOPMENT.md` — General BDD methodology (reference)

---

## 4. BDD Conventions

### 4.1 Gherkin Rules

- Use **words instead of symbols** in quoted strings:
  - `"5 slash 10"` ✅ instead of `"5/10"` ❌
  - `"enter and exit"` ✅ instead of `"enter & exit"` ❌
- Prefer **short, declarative steps**:
  - ✅ `When I move to the next task`
  - ❌ `When I do something with the task list`
- Use consistent tense:
  - Given (past/setup): `Given the detail view is open`
  - When (action): `When I press escape`
  - Then (assertion): `Then the detail view closes`

### 4.2 TestableUI Interface

All step definitions use these methods from `ThingsTUITestable`:

```typescript
// Lifecycle
await tui.initialize()
tui.close()

// Simulation
await tui.simulateKeyPress(key: string)
await tui.typeText(text: string)

// Queries
tui.getVisibleTasks(): Task[]
tui.getSelectedTask(): Task | null
tui.getStatusBar(): string
tui.getCurrentList(): string
tui.isDetailViewVisible(): boolean
tui.getFilterState(): { list: string; tags: string[] }
tui.getMainListContent(): string
tui.getDetailViewContent(): string

// Selection
tui.selectTask(index: number): void
tui.selectTag(tagId: string): void
```

Compose these in steps with `expect()` assertions from Chai.

---

## 5. Phase 3 Work Plan

### 5.1 Current Task: Leaf 3.3 (Move Between Lists)

See `PROGRESS.md` for the NEXT leaf to work on.

Use this workflow:

1. Read the scenario(s) in the feature file
2. Run tests: note which steps are undefined
3. Implement each undefined step in `common.steps.ts` using `ThingsTUITestable`
4. Implement the corresponding TUI method in `src/tui/app.ts`
5. Repeat: RED → GREEN → REFACTOR until all scenarios pass

### 5.2 Coverage Improvements (Parallel)

Pick one module at a time:

- **`src/tui/components.ts`** (12.56% → 50%+)
  - Add feature file: `features/components-display.feature` (see Section 6.1)
  - Test component rendering, layout, visual indicators
  - Implement steps to exercise all branches

- **`src/utils/path.ts`** (0% → 50%+)
  - Add feature file: `features/path-utils.feature` (see Section 6.2)
  - Test path resolution, environment variable handling, error cases
  - Implement steps that call exported functions and verify outputs

---

## 6. Draft Phase 3 Feature Files

### 6.1 `features/components-display.feature`

```gherkin
Feature: Display and interaction of core TUI components
  As a Things user in the terminal
  I want the main view to show tasks, selection, and a status bar
  So that I can navigate and inspect tasks confidently

  Background:
    Given Things TUI is running with real data
    And at least one task exists in current list

  Scenario: Initial layout shows tasks, selection, and status bar
    Then I see at least one visible task
    And I see a selected task
    And I see a status bar
    And the detail view is not visible

  Scenario: Moving the selection updates the selected task
    Given I note the currently selected task
    When I press Down arrow
    Then the selected task is different from the noted task
    And the status bar still shows the current list name

  Scenario: Moving selection backwards works as well
    Given I note the currently selected task
    When I press Up arrow
    Then the selected task is different from the noted task

  Scenario: Opening the detail view for the selected task
    Given the detail view is not visible
    When I press Enter
    Then the detail view is visible

  Scenario: Closing the detail view
    Given the detail view is visible
    When I press Escape
    Then the detail view is not visible

  Scenario: Status bar shows list name and task count
    Then the status bar contains the current list name
    And the status bar shows task count
```

### 6.2 `features/path-utils.feature`

```gherkin
Feature: Resolve Things database paths
  As a developer
  I want clear path resolution for the Things database
  So that the TUI can start reliably in different environments

  Scenario: Resolve default Things database path
    When I resolve the Things database path
    Then the resolved path is a string
    And the resolved path is not empty

  Scenario: Database path points to a real location
    When I resolve the Things database path
    Then I can check if the path exists

  Scenario: Environment variable can override the default
    Given I set an environment variable for the database path
    When I resolve the Things database path
    Then the resolved path uses the environment variable
```

---

## 7. How to Use This Guide

1. **On each session**: Start with checklist (Section 2)
2. **For each feature**: Read the scenario, identify undefined steps, implement them
3. **Use `PROGRESS.md`**: It tells you which leaf is NEXT
4. **Track coverage**: Aim for global ≥ 50%, then grow Components & Utils to ≥ 50%
5. **Keep commits focused**: One feature/fix per commit, reference the scenario or module

---

## 8. Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run build` | Compile TypeScript |
| `npm run test:bdd` | Run all BDD scenarios |
| `npm run test:bdd -- --tags="@leaf_3_2"` | Run one leaf |
| `npm run test:bdd:watch` | Watch mode (auto-rerun on save) |
| `npm run test:coverage` | Generate coverage + check threshold |
| `npm start` | Run the TUI app in terminal |

---

## 9. Common Issues & Fixes

### Undefined step after adding a new scenario

1. Copy the suggested snippet from test output
2. Paste into `features/step_definitions/common.steps.ts`
3. Replace placeholder with actual implementation using `ThingsTUITestable`
4. Import any new types (e.g., `Task`, `Tag`) at the top of the file
5. Re-run: `npm run test:bdd`

### Coverage not increasing after new code

1. Confirm the new code path is exercised by at least one scenario
2. Check if there's a condition (e.g., `if (x)`) that's never hit
3. Add a scenario to exercise that branch
4. Re-run: `npm run test:coverage`

### Test passes locally but fails on CI

1. Run `npm run test:coverage` to check for environment-specific issues
2. Check `.c8rc.json` coverage thresholds
3. Verify imports use `.js` extensions (TypeScript + ESM)

---

## 10. Phase 4: Database Migration Strategy (Python → TypeScript)

### Why Migrate Away from Python

Current `src/database/things-db.ts` uses Python via `execSync()`:
- ❌ Subprocess overhead (slow)
- ❌ Indentation/escaping bugs (Codex found: search fails)
- ❌ Python dependency required
- ❌ Not compatible with MCP server pattern
- ❌ Hard to test and maintain

**Target**: Use `better-sqlite3` (already in dependencies) for synchronous database access.

### Reference MCP Implementations

We have **3 reference implementations** in `reference-repos/`:

#### 1. things-mcp-main (TypeScript) ✅ RECOMMENDED
- **Path**: `reference-repos/things-mcp-main/`
- **Stack**: TypeScript + MCP SDK + URL Scheme (no database)
- **Pattern**: `execAsync()` for Things URL scheme calls
- **Reuse**:
  - ✅ URL encoding logic (`URLSearchParams` patterns)
  - ✅ Command execution patterns
  - ✅ Zod validation schemas
  - ✅ Error handling

#### 2. things-mcp-jimfilippou (TypeScript)
- **Path**: `reference-repos/things-mcp-jimfilippou/`
- **Stack**: TypeScript + MCP SDK + minimal URL Scheme
- **Similar to**: things-mcp-main
- **Reuse**: Same patterns as above

#### 3. things-mcp-master (Python)
- **Path**: `reference-repos/things-mcp-master/`
- **Stack**: Python + Things.py library
- **Pattern**: Database read via Things.py
- **Reuse** (after migration to TypeScript):
  - ✅ SQL query logic (adapt to better-sqlite3)
  - ✅ Data formatting utilities
  - ✅ Test patterns (convert to Jest)

### Migration Plan (Phase 4)

#### Step 1: Add better-sqlite3 Layer
```typescript
// src/database/things-db.ts (replace Python queries)
import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

export class ThingsDatabase {
  private db: Database.Database;
  
  constructor() {
    const dbPath = this.getDatabasePath();
    this.db = new Database(dbPath);
  }
  
  getTodayTasks(): Task[] {
    return this.db.prepare(`
      SELECT * FROM TMTask
      WHERE status = 0
      ORDER BY index
    `).all() as Task[];
  }
  
  // ... other methods
}
```

**Key Points**:
- Synchronous queries (better for TUI)
- Direct SQLite access (no subprocess)
- Same interface as current `things-db.ts`

#### Step 2: Preserve URL Scheme Operations
Keep `markTaskComplete()` and `markTaskIncomplete()` calling Things URL scheme:
```typescript
markTaskComplete(taskId: string): void {
  const url = `things:///complete?id=${encodeURIComponent(taskId)}`;
  execSync(`open -a Things "${url}"`);
}
```

Pattern from: **things-mcp-main** (reference implementation)

#### Step 3: BDD Testing for Migration
Use existing BDD framework to verify:
1. Database reads return correct data
2. URL scheme calls still work
3. No regression in Phase 2-3 functionality

```gherkin
Feature: Database reads (Phase 4)
  Scenario: Get today's tasks from database
    When I query the database for today's tasks
    Then I get a non-empty list
    And each task has required fields (id, title, status)
  
  Scenario: Search tasks with TypeScript
    When I search tasks for "keyword"
    Then results match the original Python search behavior
```

### Timeline for Phase 4

**Week 1**: Setup better-sqlite3
- Install `better-sqlite3` + types
- Create new `things-db.ts` using database queries
- Test with existing BDD suite

**Week 2**: Migrate all queries
- Port `getTodayTasks()`, `getUpcomingTasks()`, etc.
- Port `searchTasks()`
- Verify no behavior change

**Week 3**: Remove Python dependency
- Delete Python scripts from `things-db.ts`
- Remove Python-related files
- Update documentation

**Week 4**: Testing & Polish
- Full regression test with BDD
- Performance benchmarks
- Update AGENTS.md with new patterns

### Database Schema Reference

Things.app uses SQLite with these key tables:

```sql
TMTask          -- todos, projects
TMTag           -- tags
TMTaskTag       -- todo-tag relationships
TMChecklistItem -- checklist items
TMArea          -- projects/areas
TMHeading       -- headings within projects
```

See: `reference-repos/things-mcp-master/` for full schema documentation.

### What NOT to Do

- ❌ Don't use an ORM (SQLAlchemy, TypeORM) — too heavy for sync queries
- ❌ Don't migrate to Node.js SQLite library (slower than better-sqlite3)
- ❌ Don't try to keep Python code (eliminates dependency, doesn't fix bugs)

### Validation Checklist for Phase 4

- [ ] `npm install better-sqlite3 @types/better-sqlite3`
- [ ] Database connection works (test with `npm test:bdd`)
- [ ] All 4 list queries (`getTodayTasks`, etc.) pass
- [ ] `searchTasks()` works without Python
- [ ] `markTaskComplete()` still uses URL scheme
- [ ] All Phase 2-3 BDD scenarios still pass
- [ ] Python dependency removed from codebase
- [ ] Coverage maintained or improved

---

**Ready to start Phase 3?** Pick the NEXT leaf from `PROGRESS.md` and follow the checklist!

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
