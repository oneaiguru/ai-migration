# Task: CI/CD and Test Automation Exploration

## Goal
Map out how we should run tests and lightweight automation for this monorepo, with a bias toward agents running tests locally for now. Produce a concrete recommendation (local-only vs. GitHub Actions vs. simple cron) plus a minimal starter pipeline design for rare automated runs.

## Deliverables
- Short assessment of options:
  - Local agent runs only (current default).
  - Minimal GitHub Actions workflow for smoke/unit tests per project.
  - Optional cron/on-demand job for long/rare checks.
- Constraints/assumptions: no secrets in CI unless approved; keep runtimes short; avoid external infra.
- Recommended path and why (e.g., stay local now, add a GH Actions smoke workflow scaffold for future use).
- List of projects and how/if they should be covered (which tests, skip rules, per-project setup).

## Suggested steps
1) Inventory current test entrypoints per project (pytest/npm/etc.) and note heavy/long ones to avoid in CI. Use AGENTS.md per project where available.
2) Evaluate GH Actions feasibility:
   - Single reusable workflow vs per-project matrices.
   - Caching needs (npm/pip) vs keeping runs minimal.
   - How to gate: push to main? PR only? opt-in labels?
3) Propose the minimal starter workflow (YAML outline) and when to trigger it (on PR label, manual dispatch).
4) Decide: keep default as “agents run locally; CI optional/opt-in” and document the recommendation.
5) Document trade-offs and back-burner ideas (full test suites, nightly cron) for later.

## Acceptance criteria
- Clear recommendation (local vs limited CI) with rationale.
- Concrete next step (e.g., add a GH Actions smoke workflow scaffold or stay local and revisit later).
- Updated per-project coverage notes (which tests to run or skip in automation).
