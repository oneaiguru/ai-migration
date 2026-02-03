# Tracker Phase-2 Execution Guide

Use this checklist to run `plans/2025-11-05_tracker-next.plan.md` end-to-end without additional back-and-forth. Follow the steps exactly and record outcomes in the TODO tool (`docs/Tasks/tracker_cli_todo.md`), `progress.md`, and `docs/SESSION_HANDOFF.md`.

---

## 0. Required Reading (in order)
1. `docs/SOP/PRD_v1.6-final.md` (§§2–3, §8, §9)
2. `docs/SOP/week0_final_protocol.md`
3. `docs/SOP/saturday_prep_checklist.md`
4. `docs/Tasks/tracker_cli_discovery.md`
5. Role prompts under `/Users/m/ai/projects/agentos/docs/System/CE_MAGIC_PROMPTS/`
6. Wiki context: `~/wiki/replica/work/KnownQuirks.md` → follow nested links if they mention tracker/ccusage specifics

Only proceed when all documents are read end-to-end.

---

## 1. Tooling Pre-flight
- `uv --version`
- `cd tracker && uv venv .venv`
- `. .venv/bin/activate && uv pip install -e .[dev]`
- Verify fixtures exist:
  - `tests/fixtures/codex/wide_status_82_1.txt`
  - `tests/fixtures/claude/usage_wide_90_1_0.txt`
  - `tests/fixtures/glm/ccusage_sample.json`
- Run baseline tests: `pytest`

Log each confirmation in `docs/Tasks/tracker_cli_todo.md` (mark checkbox or bullet updates).

---

## 2. Execute Plan Phases

### Phase 1 – Preview + Efficiency Estimator
1. Implement files per plan:
   - `tracker/src/tracker/estimators/__init__.py`
   - `tracker/src/tracker/estimators/efficiency.py`
   - `tracker/src/tracker/cli.py`
   - `tracker/tests/test_cli_flow.py`
2. Commands to run after edits:
   ```bash
   cd tracker
   . .venv/bin/activate
   pytest tests/test_parsers.py tests/test_cli_flow.py
   tracker preview --window W0-TEST
   ```
3. Update `progress.md` with work summary.
4. Document detailed changes + command output summary in `docs/SESSION_HANDOFF.md`.
5. In `docs/Tasks/tracker_cli_todo.md`, note Phase 1 completion + any follow-ups.

### Phase 2 – GLM ccusage Bridge
1. Implement:
   - `tracker/src/tracker/sources/ccusage.py`
   - `tracker/src/tracker/storage/jsonl.py` (add `load_glm_counts` if missing)
   - `tracker/src/tracker/cli.py` (ingest glm)
   - `tracker/tests/test_ccusage.py`
   - Fixtures already reside in `tests/fixtures/glm/`
2. Commands:
   ```bash
   cd tracker
   . .venv/bin/activate
   pytest tests/test_ccusage.py
   < ../tests/fixtures/glm/ccusage_sample.json tracker ingest glm --window W0-CC --stdin
   tracker preview --window W0-CC
   ```
3. Record outcomes in `progress.md`, `docs/SESSION_HANDOFF.md`, and update TODO file.

### Phase 3 – Documentation & Verification
1. Update:
   - `README.md`
   - `docs/SOP/saturday_prep_checklist.md`
   - `docs/Tasks/tracker_cli_todo.md`
2. Commands/checks:
   ```bash
   sed -n '1,160p' README.md
   sed -n '1,200p' docs/SOP/saturday_prep_checklist.md
   sed -n '1,160p' docs/Tasks/tracker_cli_todo.md
   ```
3. Record documentation summary and residual risks in `progress.md` and handoff log.

---

## 3. TODO Tool Usage
- Use `docs/Tasks/tracker_cli_todo.md` as the primary TODO tracker:
  - Before starting a phase, add a checkbox/bullet describing the phase tasks.
  - After completing commands/tests, tick the checkbox with a short status line + references to plan sections.
- Maintain chronological updates so the next agent sees history without searching.

Example entry:
```
- [x] Phase 1 – preview + estimator (`plans/2025-11-05_tracker-next.plan.md`, Phase 1)
  - `pytest tests/test_cli_flow.py`
  - `tracker preview --window W0-TEST`
```

---

## 4. Handoff Checklist
- `git status` → ensure only expected files changed.
- Update `progress.md` with:
  - Summary bullet(s)
  - Commands run
  - Follow-ups or blockers
- Append section to `docs/SESSION_HANDOFF.md` with:
  - Path references
  - Test output summary
  - Next steps
- If work is complete, archive finished plan in `plans/` or mark TODO items done; ensure plan references remain for audit.

---

## 5. Escalation / Questions
- If any step conflicts with instructions, stop after documenting the issue in `docs/SESSION_HANDOFF.md` and notify the coordinator.
- Do not modify files outside the plan scope unless explicitly instructed.
- All path references must remain absolute per ADR-007.
