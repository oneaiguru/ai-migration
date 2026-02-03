# Session Final Handoff – Things TUI (tuings)

Status: **TUI project created, BDD retrofit done, Phase 3 improvements pending.**

---

## 1. What You Inherit

You now own the **tuings** project at:

- `/Users/m/ai/projects/tuings`

You get:

- A working TypeScript + Blessed TUI for Things
- 38 BDD scenarios describing key flows (search, filter, navigate, select, view details)
- A test harness (`ThingsTUITestable`) for deterministic UI testing
- Coverage instrumentation with a current snapshot around 45.78% statements

The MCP server codebase lives elsewhere and is **out of scope** for this handoff.

---

## 2. Immediate Next Actions (in order)

1. **Run the verification script**

   ```bash
   cd /Users/m/ai/projects/tuings
   bash VERIFY_TESTS.sh
   ```

2. **Read the local docs**

   * `README.md` – for overall project picture
   * `AGENTS.md` – for exact working rules and queues
   * `THINGS_PROJECT_INDEX.md` – for file and task map
   * `DELIVERABLES_SUMMARY.md` – for metrics snapshot

3. **Open coverage report**

   ```bash
   open coverage/index.html
   ```

4. **Pick work from AGENTS.md queues**

   * Start with **undefined steps** (Queue A)
   * Then fix failing scenarios
   * Then coverage work on components/utils

---

## 3. Phase 3 Goals (for you and any future agent)

* All scenarios defined, non-ambiguous, and passing for core flows
* Coverage ≥ 70% statements, with:
  * `src/tui/components.ts` well-tested
  * `src/utils/path.ts` covered
* Docs updated and consistent:
  * `README.md`, `AGENTS.md`, `DELIVERABLES_SUMMARY.md`, `THINGS_PROJECT_INDEX.md`

---

## 4. Risks / Things to Watch

* **Gherkin syntax**: be careful with slashes (`/`) and special characters.
* **Tight coupling**: don't let step definitions depend on internal structures; use `ThingsTUITestable`.
* **Flaky tests**: if any appear, prefer deterministic DB state or clear assumptions instead of sleeps and timing tricks.

---

## 5. Handoff BDD Spec

```gherkin
Feature: Handoff to next Things TUI agent

  Scenario: New agent accepts the handoff
    Given I have cloned or opened the tuings repository
    And I have read "README.md"
    And I have read "AGENTS.md"
    When I run "bash VERIFY_TESTS.sh"
    Then I understand the current failing and undefined scenarios
    And I can choose a concrete task from the work queues

  Scenario: Agent completes a Phase 3 slice
    Given I have selected an item from the Phase 3 goals
    When I implement the necessary code and tests
    And I re-run "bash VERIFY_TESTS.sh"
    Then my chosen scenarios pass
    And coverage is not lower than before
    And I update documentation to match the new behavior
```
