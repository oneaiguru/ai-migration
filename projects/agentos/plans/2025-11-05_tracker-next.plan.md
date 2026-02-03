# Plan 2025-11-05 – Tracker Follow-up (Preview, Estimators, Bridges)

## Metadata
- Task: Extend tracker CLI to cover preview output, efficiency estimators, and GLM/ccusage ingestion.
- Discovery: `docs/Tasks/tracker_cli_discovery.md`, `docs/System/CE_MAGIC_PROMPTS/*`, `archive/dr_task3_repos.md`.
- Related docs: `docs/SOP/PRD_v1.6-final.md`, `docs/SOP/week0_final_protocol.md`, `docs/System/ADR/ADR-003-glm-counting.md`.

### Required Reading (complete in order before execution)
1. `docs/SOP/PRD_v1.6-final.md` (§§2–3, §8, §9).
2. `docs/SOP/week0_final_protocol.md` (Week-0 cadence + commands).
3. `docs/SOP/saturday_prep_checklist.md` (tooling checks; ensure ccusage section is read).
4. `docs/Tasks/tracker_cli_discovery.md` (latest findings + fixture locations).
5. `docs/Tasks/tracker_phase2_executor.md` (step-by-step automation checklist).
6. Role prompts: `/Users/m/ai/projects/agentos/docs/System/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md` plus the role-specific prompt.
7. Wiki context: `~/wiki/replica/work/KnownQuirks.md` → follow nested links if they mention tracker/ccusage specifics

### Pre-flight Checklist
- [ ] `uv --version` succeeds.
- [ ] `cd tracker && uv venv .venv` (reuse existing venv if present).
- [ ] `. .venv/bin/activate && uv pip install -e .[dev]`.
- [ ] Fixtures available:
  - `tests/fixtures/codex/*.txt`
  - `tests/fixtures/claude/*.txt`
  - `tests/fixtures/glm/ccusage_sample.json`
- [ ] Plan reviewed end-to-end (no edits) before executing commands.

## Desired End State
- CLI exposes `tracker preview` summarising latest snapshots/windows and efficiency stats per provider.
- `tracker/estimators/efficiency.py` provides ratio-of-totals calculation with simple CI for Week-0 reporting.
- `tracker/sources/ccusage.py` ingests GLM prompt counts into `glm_counts.jsonl`; preview command surfaces them.
- README/saturday prep checklist updated with new commands and workflow notes.

### Key Discoveries
- `tracker/tests/test_cli_flow.py:1` covers ingest/complete flows but no preview path yet.
- `archive/dr_task3_repos.md:1` documents ccusage CLI outputs for GLM prompt tracking (primary source per ADR-003).
- `docs/SOP/PRD_v1.6-final.md:59` mandates append-only JSONL for snapshots/windows/glm counts.
- `docs/SOP/week0_final_protocol.md:124` expects a CLI that can report window metrics for operators.

## What We're NOT Doing
- No advanced estimator methods (Fieller/BCa) or bandit router work in this iteration.
- No changes to Week-0 fixtures beyond what's required for preview tests.
- No GLM live integration beyond ccusage CLI parsing and JSONL storage.

## Implementation Approach
Add estimator and preview modules alongside new tests while reusing the existing CLI/test structure. Introduce ccusage parser with fixture-driven tests and extend CLI flow tests to cover preview reporting.

## Phase 1: Estimator & Preview Skeleton
### Overview
Introduce efficiency estimator module and wire a preview command for basic reporting.

### Changes Required
1. **File**: `tracker/src/tracker/estimators/__init__.py`
   **Changes**: new module exporting `compute_efficiency` helpers.
   ```python
   from __future__ import annotations

   from .efficiency import EfficiencyReport, compute_efficiency

   __all__ = ["EfficiencyReport", "compute_efficiency"]
   ```
2. **File**: `tracker/src/tracker/estimators/efficiency.py`
   **Changes**: implement ratio-of-totals calc with simple CI (normal approximation) and dataclass `EfficiencyReport`.
3. **File**: `tracker/src/tracker/cli.py`
   **Changes**: add `preview` subcommand; reuse JsonlStore + estimator to output provider summaries; pretty-print to stdout.
4. **File**: `tracker/tests/test_cli_flow.py`
   **Changes**: extend tests to cover preview output using existing snapshots/windows fixtures.
5. **Commands to run after edits:**
   ```bash
   cd tracker
   . .venv/bin/activate
   pytest tests/test_parsers.py tests/test_cli_flow.py
   tracker preview --window W0-TEST
   ```

## Phase 2: GLM ccusage Bridge
### Overview
Add parser for ccusage JSON and wire JSONL output path.

### Changes Required
1. **File**: `tracker/src/tracker/sources/ccusage.py`
   **Changes**: parse ccusage JSON (blocks prompt counts) → dict with fields (`window`, `prompts_used`, `source`).
2. **File**: `tracker/src/tracker/storage/jsonl.py`
   **Changes**: expose helper `load_glm_counts` mirroring snapshots/windows for preview usage.
3. **File**: `tracker/src/tracker/cli.py`
   **Changes**: add `tracker ingest glm --stdin` option calling ccusage parser and writing to `glm_counts.jsonl`.
4. **Tests**: `tracker/tests/test_ccusage.py` (new) with fixture from `tests/fixtures/glm/` (to be created) verifying parser + CLI ingest.
5. **Commands to run after edits:**
   ```bash
   cd tracker
   . .venv/bin/activate
   pytest tests/test_ccusage.py
   < ../tests/fixtures/glm/ccusage_sample.json tracker ingest glm --window W0-CC --stdin
   tracker preview --window W0-CC
   ```

## Phase 3: Docs & Fixtures
### Overview
Add fixtures/documentation updates for new commands and workflow.

### Changes Required
1. **Dir**: `tests/fixtures/glm/`
   **Changes**: ensure ccusage JSON fixtures exist (e.g., `ccusage_sample.json`, `ccusage_missing_blocks.json`).
2. **File**: `README.md`
   **Changes**: document tracker install/test instructions, include preview usage.
3. **File**: `docs/SOP/saturday_prep_checklist.md`
   **Changes**: add ccusage CLI verification + preview command under evening checks.
4. **File**: `docs/Tasks/tracker_cli_todo.md`
   **Changes**: mark Week-0 tracker verification steps done and point to new plan phases.
5. **Commands to verify before handoff:**
   ```bash
   sed -n '1,160p' README.md
   sed -n '1,200p' docs/SOP/saturday_prep_checklist.md
   sed -n '1,160p' docs/Tasks/tracker_cli_todo.md
   ```

## Tests & Validation
1. `. .venv/bin/activate`
2. `uv pip install -e .[dev]`
3. `pytest`
4. Manual CLI sanity:
   ```bash
   < tests/fixtures/codex/wide_status_82_1.txt tracker ingest codex --window W0-02 --phase before --stdin
   < tests/fixtures/claude/usage_wide_90_1_0.txt tracker ingest claude --window W0-02 --phase before --stdin
   < tests/fixtures/glm/ccusage_sample.json tracker ingest glm --window W0-02 --stdin
   tracker complete --window W0-02 --codex-features 2 --claude-features 3 --glm-features 1 --quality 1.0 --outcome pass
   tracker preview --window W0-02
   ```

## Rollback
- Remove new estimator/ccusage modules and revert CLI/fixture changes (`git checkout -- tracker`).
- Delete added fixtures/docs updates if plan aborted.

## Handoff
- Update `progress.md` with estimator/preview + ccusage notes and executed commands.
- Append executor handoff entry with summary/validation results in `docs/SESSION_HANDOFF.md`.
- Flag next focus (advanced estimators/bandits) once preview + ccusage bridge are stable.
