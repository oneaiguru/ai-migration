# Things TUI Project Index (tuings)

Use this file as the entry point for anyone touching the **TUI clone**.

---

## 1. Start Here

1. Open `/Users/m/ai/projects/tuings`.
2. Read:
   - `README.md` – user & dev overview
   - `AGENTS.md` – how to work (strict BDD)
3. Run quick verification:

```bash
bash VERIFY_TESTS.sh
# or:
npm install
npm run build
npm run test:bdd
npm run test:coverage
open coverage/index.html
```

---

## 2. Files by Concern

### Implementation

* `src/tui/app.ts` – TUI entry + `ThingsTUITestable`
* `src/tui/components.ts` – UI widgets/rendering
* `src/database/things-db.ts` – read-only Things DB access
* `src/utils/path.ts` – utility functions

### Tests (BDD)

* Features:
  * `features/search-tasks.feature`
  * `features/view-task-details.feature`
  * `features/filter-by-tags.feature`
  * `features/navigate-lists.feature`
  * `features/select-tasks.feature`
* Step definitions:
  * `features/step_definitions/common.steps.ts`

### Tooling

* `cucumber.cjs` – Cucumber configuration
* `.c8rc.json` – coverage configuration
* `VERIFY_TESTS.sh` – one-command test+coverage run

---

## 3. Quick Task Picking

### If you have 15–30 minutes

* Choose **one undefined step** reported by `npm run test:bdd`.
* Implement it in `features/step_definitions/common.steps.ts`.
* Re-run tests and confirm the scenario now executes.

### If you have 1–2 hours

* Pick a **failing scenario** from:
  * `search-tasks.feature`
  * `filter-by-tags.feature`
  * `navigate-lists.feature`
  * `select-tasks.feature`
  * `view-task-details.feature`
* Trace it to `src/tui/app.ts` and `src/tui/components.ts`.
* Fix the behavior to match the scenario.

### If you have more time (deep work)

* Raise coverage for:
  * `src/tui/components.ts`
  * `src/utils/path.ts`
* Add scenarios that exercise the missing branches and paths.
* Target: **≥ 70% statement coverage** overall.

---

## 4. Project State Snapshot

* **Scenarios**: 38 total
* **Coverage**: 45.78% statements
* Priority modules:
  * Components: ~12.56%
  * Utils: 0%

---

## 5. Mini BDD Index

```gherkin
Feature: Things TUI project entry

  Scenario: New contributor understands the project
    Given I have read "README.md"
    And I have read "AGENTS.md"
    When I open "THINGS_PROJECT_INDEX.md"
    Then I know which files to change for implementation, tests, and tooling

  Scenario: Contributor picks work based on timebox
    Given I have 30 minutes available
    When I open the "Quick Task Picking" section
    Then I can choose a single undefined or failing scenario to work on
```
