# BDD Linear Development Methodology

A minimal, reproducible framework for strict Behaviour-Driven Development with a single linear path from backlog to shipped features.

---

## Philosophy

**Three beliefs:**

1. **One spec file** eliminates process confusion. All behaviour lives in one `feature.feature`.
2. **One backlog structure** (a tree of leaves) lets you pick work deterministically without session documents.
3. **One loop** (spec → RED → steps → code → GREEN → progress → commit) forces discipline and keeps context small.

**Result:** No session handoffs, no "where are we" questions. The code, the spec, and the progress file are source of truth.

---

## Core Concepts

### Leaf
A single, self-contained feature or behaviour that can be:
- Specified as 1–3 BDD scenarios.
- Implemented in one branch.
- Completed in one or two focused development sessions.
- Identified by a **leaf ID** (e.g. `2.1`, `3.4-alt`).

### Backlog Tree
A hierarchical list of leaves, organized by feature area or phase. Each leaf has:
- A unique ID (e.g. `1.1`, `2.3`, `3.2`)
- A name / title
- A status: TODO, NEXT, IN-PROG, DONE, PARKED, ABANDONED
- Optional notes (dependencies, assumptions, alternative approaches)

### Branch Discipline
- One branch per leaf: `feat/<id>-<slug>`.
- Each branch is short-lived: created, worked, reviewed, merged.
- If a branch hits a dead end: reset to trunk, mark leaf as ABANDONED, pick a sibling.

---

## Three Files

### 1. `AGENTS.md` (or `WORKFLOW.md`)
**How we work.** Describes:
- The per-leaf development loop.
- Branch creation and naming.
- Git commands for the cycle.
- How to recognize when a leaf is done.
- How to backtrack and pick an alternative.

**Minimal content:**
```markdown
# [Project] Working Agreement

## The Loop
For each leaf in PROGRESS.md:
1. Create branch: `git switch -c feat/<id>-<slug>`.
2. Add scenarios to [spec file] for that leaf (RED: undefined).
3. Add/adjust step definitions (RED: failing).
4. Implement minimal code to go GREEN.
5. Run coverage, verify it passes project threshold.
6. Update PROGRESS.md (mark leaf DONE).
7. Commit, push, open PR, get review, merge.

## What "done" means
- All scenarios for that leaf are green.
- No regressions in other leaves' scenarios.
- Coverage threshold met (if enforced).
- PROGRESS.md updated.

## Backtracking
If mid-branch you realize the approach is wrong:
1. `git reset --hard origin/main`
2. Mark the leaf as ABANDONED in PROGRESS.md with a note.
3. Pick a sibling leaf or add an alternative (e.g. `3.1b`).
4. Start a new branch.
```

### 2. `features/[project].feature` (Gherkin spec)
**What the system must do.** One Feature block, many Scenario blocks tagged by leaf ID.

**Structure:**
```gherkin
Feature: [Project] core behaviour

  @leaf_1_1 @harness
  Scenario: [Behaviour for leaf 1.1]
    ...

  @leaf_2_1 @read_only
  Scenario: [Behaviour for leaf 2.1]
    ...

  @leaf_3_1 @write_ops
  Scenario: [Behaviour for leaf 3.1]
    ...
```

**Guidelines:**
- Use one tag per leaf ID (e.g. `@leaf_1_1`).
- Add secondary tags for grouping (e.g. `@read_only`, `@write_ops`).
- Scenarios are declarative ("what happens"), not imperative ("click this button").
- Keep scenarios small (3–7 steps each).

### 3. `PROGRESS.md`
**What's done, in-flight, parked.** Contains:
- The backlog tree (all leaves, organized).
- A status table (one row per leaf).
- A legend explaining statuses.
- Optional notes on blocked or experimental leaves.

**Minimal content:**
```markdown
# Backlog & Progress

## Backlog Tree

### Phase 1: Harness & Safety
1.1 BDD harness health check
1.2 Coverage pipeline integration

### Phase 2: Read-Only UX
2.1 List navigation
2.2 Task selection
...

### Phase 3: Write Operations
3.1 Quick add
3.2 Mark complete
...

## Status Table

| Leaf ID | Name                    | Status    | Notes                           |
|---------|-------------------------|-----------|----------------------------------|
| 1.1     | BDD harness health      | DONE      | Cucumber runs, spec discovered   |
| 1.2     | Coverage pipeline       | IN-PROG   | Threshold not yet enforced       |
| 2.1     | List navigation         | DONE      | All scenarios passing            |
| 3.1     | Quick add               | NEXT      | Pick this next                   |
| 3.2     | Mark complete           | TODO      | Depends on 3.1                   |

## Status Legend
- **TODO**: Not started
- **NEXT**: Ready to pick up next
- **IN-PROG**: Active branch, ongoing work
- **DONE**: All scenarios green, merged to main
- **PARKED**: Intentionally deferred (with reason)
- **ABANDONED**: Attempted, reverted, replaced (see notes)
```

---

## Per-Leaf Development Loop

For each leaf (e.g. leaf `3.1`):

### 1. Pick the leaf
- Find the topmost `Status = NEXT` in `PROGRESS.md`.
- Update its status to `IN-PROG` and note the branch name.

### 2. Create the branch
```bash
git switch -c feat/3.1-quick-add
```

### 3. Spec first (add scenarios to the feature file)
Add one or more scenarios under the leaf tag:

```gherkin
@leaf_3_1 @write @quick_add
Scenario: Quick-add a task with title
  Given the TUI is running and ready
  When I press "n"
  And I type "Buy milk"
  And I press Enter
  Then a new task "Buy milk" appears in the active list
  And the task exists in the underlying database
```

### 4. Run BDD tests (expect RED)
```bash
npm run test:bdd
```

**Expected output:** "Undefined step" or assertion failures for the new scenarios.

### 5. Add step definitions
In `features/step_definitions/[...].steps.ts`, implement the Givens/Whens/Thens. Keep them thin:

```typescript
When('I press {string}', async function(key: string) {
  await this.tui.simulateKeyPress(key);
});

When('I type {string}', async function(text: string) {
  await this.tui.simulateTyping(text);
});

Then('a new task {string} appears in the active list', async function(title: string) {
  const tasks = this.tui.getVisibleTasks();
  const found = tasks.find(t => t.title === title);
  expect(found).to.exist;
});
```

Steps forward calls to the testable API (`ThingsTUITestable`, `MockDatabase`, etc.). They do not contain business logic.

### 6. Implement minimal code (drive to GREEN)
- Modify only what's needed in `src/` or equivalent to make scenarios pass.
- One feature per commit (or per logical change).
- Run tests frequently: `npm run test:bdd` or `npm run test:bdd:watch`.

### 7. Coverage
Run the coverage report:
```bash
npm run test:coverage
```

Check that:
- Your new code is covered by the BDD tests.
- Project coverage threshold is met (if enforced).
- No regressions in other areas.

### 8. Update PROGRESS.md
Change the leaf's status from `IN-PROG` to `DONE`. Optionally add a note:

| Leaf ID | Name      | Status | Notes                        |
|---------|-----------|--------|------------------------------|
| 3.1     | Quick add | DONE   | All 3 scenarios passing      |

### 9. Commit and push
```bash
git add .
git commit -m "feat(3.1): quick-add task with URL scheme integration

Implements:
- Press 'n' to open quick-add input
- Type task title and press Enter
- Task created via Things URL scheme
- Refresh and show in active list

All scenarios passing."

git push origin feat/3.1-quick-add
```

### 10. PR, Review, Merge
Open a PR. Request review (e.g. `@codex review`). Once approved, merge to main.

---

## Backtracking (Dead-End Handling)

If mid-branch you realize the approach won't work:

1. **Hard reset to main:**
   ```bash
   git checkout main
   git pull
   git switch -c feat/3.1-abandoned  # keep branch for reference
   git reset --hard origin/main
   ```

2. **Mark in PROGRESS.md:**
   ```markdown
   | 3.1 | Quick add (URL scheme approach) | ABANDONED | URL scheme integration too complex; trying 3.1b |
   ```

3. **Add a sibling leaf:**
   ```markdown
   | 3.1b | Quick add (minimal hardcoded path) | NEXT | Simpler test harness |
   ```

4. **Create new branch from the sibling:**
   ```bash
   git switch -c feat/3.1b-quick-add-minimal
   ```

This keeps the tree honest and lets you pivot without losing context.

---

## Typical Backlog Structure

A mature project usually has leaves organized like:

```
1. Harness & Safety
   1.1 BDD setup / health check
   1.2 Coverage pipeline
   1.3 CI integration

2. Read-Only / Navigation
   2.1 List switching
   2.2 Task selection / movement
   2.3 Detail view
   2.4 Search
   2.5 Filtering (tags, etc.)
   2.6 Status bar / info display

3. Write Operations
   3.1 Create / quick-add
   3.2 Complete / toggle
   3.3 Move between lists
   3.4 Edit / update
   3.5 Tag assignment
   3.6 Bulk operations

4. Advanced UX
   4.1 Config-driven keybindings
   4.2 Saved filters / workspaces
   4.3 Projects / nested structures
   4.4 Performance / caching

5. Integrations & Polish
   5.1 Sync with external systems
   5.2 Export / import
   5.3 Error handling & recovery
```

Work through them in order: harness first, then read-only (safe, observational), then write (risky, data-changing), then advanced.

---

## Quick Checklist for Each Leaf

Before picking a leaf:
- [ ] Its status is `NEXT`.
- [ ] Its scenarios (or a draft) are clear in your mind.
- [ ] Its dependencies are already `DONE` (check PROGRESS.md).
- [ ] It's small enough to spec + code + test in one or two sessions.

Before committing a leaf:
- [ ] All scenarios are green.
- [ ] Coverage threshold is met.
- [ ] PROGRESS.md is updated.
- [ ] No regressions in other leaves' scenarios.
- [ ] Commit message mentions the leaf ID.

---

## Benefits of This Approach

1. **No session documents.** The three files are always up-to-date and sufficient.
2. **Linear progression.** Pick the topmost `NEXT` leaf; no ambiguity.
3. **Easy backtracking.** Mark a leaf as ABANDONED, pick a sibling, reset to main.
4. **Testable by design.** Every leaf is a BDD contract; all code is covered.
5. **Reviewable.** Each branch is one leaf; reviewers know exactly what changed and why.
6. **Portable across projects.** This methodology works for web apps, TUIs, APIs, CLIs, etc.

---

## Customization Points

Adapt this to your project:

- **Feature file naming:** Use `app.feature`, `tui.feature`, `api.feature`, etc.
- **Step definitions location:** `features/steps/`, `test/steps/`, etc.
- **Branch naming:** `feat/<id>-slug` is standard, but `f/<id>` or `work/<id>` are also fine.
- **Coverage tool:** nyc, c8, istanbuljs, etc. — just wire it consistently.
- **Status table format:** Markdown, YAML, JSON, whatever your tools prefer.
- **Leaf ID scheme:** Numeric (1.1, 1.2) vs. alphanumeric (f-harness, f-nav-lists) — pick one and stick with it.

---

## References & Inspiration

- **BDD & Gherkin:** Cucumber.io, Behave, SpecFlow.
- **Linear development:** Shape Up (Ryan Singer), Kanban boards, Taiga.
- **Testable design:** Test-Driven Development (Kent Beck), ATDD (Dan North).

