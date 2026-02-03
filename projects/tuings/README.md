# Things TUI (tuings)

Terminal UI clone for [Things 3](https://culturedcode.com/things/), built in TypeScript using the Blessed TUI library and driven by Cucumber BDD tests.

> This README describes the **TUI project only**.  
> The original MCP server lives in a separate repo and is treated as an external integration.
> **Monorepo note:** `/Users/m/ai` is a monorepo containing many projects. Each project should state this in its `AGENTS.md`; see the root README for details.

---

## 1. What This Project Does

- Shows your Things tasks in a terminal UI
- Supports keyboard navigation across lists and tasks
- Lets you filter, search, and inspect task details
- Is fully testable via a `ThingsTUITestable` interface and BDD scenarios

The UI behavior is specified by Gherkin feature files and enforced by automated tests.

---

## 2. Requirements

- **macOS** with Things 3 installed (for the local Things database)
- **Node.js** 16+
- `npm`

---

## 3. Getting Started

Clone or open the tuings project, then:

```bash
cd /Users/m/ai/projects/tuings

# Install dependencies
npm install

# Build TypeScript
npm run build
```

To run the TUI interactively (if a CLI entry exists):

```bash
npm run start   # or the appropriate start script for your setup
```

(If there is no dedicated start script yet, treat that as a future task.)

---

## 4. Tests & Coverage

The project is BDD-first.

### Run all BDD scenarios

```bash
npm run test:bdd
```

### Generate coverage report

```bash
npm run test:coverage
open coverage/index.html
```

Or use the helper script:

```bash
bash VERIFY_TESTS.sh
```

**Current snapshot:**

* 38 scenarios total
* Coverage: ~45.78% statements

These numbers should **increase** over time as Phase 3 work progresses.

---

## 5. Project Structure (TUI only)

```text
/Users/m/ai/projects/tuings
├── src/
│   ├── tui/
│   │   ├── app.ts          # main TUI app + ThingsTUITestable
│   │   └── components.ts   # UI components
│   ├── database/
│   │   ├── things-db.ts    # read-only DB access
│   │   └── types.ts
│   └── utils/
│       └── path.ts         # utilities (currently under-tested)
├── features/
│   ├── search-tasks.feature
│   ├── view-task-details.feature
│   ├── filter-by-tags.feature
│   ├── navigate-lists.feature
│   ├── select-tasks.feature
│   └── step_definitions/
│       └── common.steps.ts
├── coverage/               # HTML coverage reports
├── AGENTS.md               # agent workflow & queues
├── THINGS_PROJECT_INDEX.md # quick index & task picking
├── DELIVERABLES_SUMMARY.md # metrics snapshot
├── SESSION_FINAL_HANDOFF.md
├── VERIFY_TESTS.sh
├── cucumber.cjs
├── .c8rc.json
└── tsconfig.json
```

---

## 6. Development Approach (Strict BDD)

* Start from feature files in `features/*.feature`.
* Keep step definitions in `features/step_definitions/common.steps.ts`:
  * Use `ThingsTUITestable` for interaction and assertions.
* Implement behavior in `src/tui/*.ts` and supporting modules.
* Run tests frequently and maintain or improve coverage.

For detailed working rules and work queues, see **`AGENTS.md`**.

---

## 7. Meta BDD Spec for the README

```gherkin
Feature: Things TUI project documentation

  Scenario: Developer understands how to work on the project
    Given I have opened "README.md" in the tuings repository
    When I read the requirements and getting started sections
    Then I know how to install dependencies and build the project
    And I know how to run BDD tests and open the coverage report
    And I know where to look for deeper workflow details in "AGENTS.md"
```
