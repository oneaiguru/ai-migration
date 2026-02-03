# Plan — Brief 006 (Polishing & Proxy Hardening)

## Scope & Budget
- Provider: codex (single lane, observe-only telemetry)
- Target window: W0-CHP-2 (70–80% of 272K ≈ **210K tokens** planned)
- Focus: polish proxy/preview outputs, harden churn UX, add window audit helper

## Required Reading
1. `docs/CurrentPlan/006_PRO_TLDR.md` — PRO review & guardrails
2. `docs/CurrentPlan/006_Agent_Brief.md` — step-by-step brief
3. `docs/System/scheduler/standing_jobs.md` — updated commands + wiki pointers
4. `docs/Tasks/tracker_cli_todo.md` — Brief 006 block
5. `docs/SESSION_HANDOFF.md` — “PRO Review — Brief #6” section

## Tasks (spec-first)
### Task A — Percent Formatting Helper (~40K tokens)
- Add `_format_percent(value, digits=1)` in CLI utilities
- Refactor preview, decision-card, proxy cost compare to use helper
- Update relevant tests (CLI flow, decision card, cost compare)
- Artifacts: `tracker/src/tracker/cli.py`, `scripts/tools/decision_card.py`, `scripts/tools/proxy_cost_compare.py`, tests

### Task B — Proxy Latency & Status Refinement (~45K tokens)
- Refactor `parse_proxy_telemetry_stream` latency gathering to single `_to_float` pass
- Introduce status whitelist (ok/success/200/routed/cached)
- Extend pytest coverage (`tracker/tests/test_proxy_telemetry.py`)
- Update doc `docs/Tasks/subagent_proxy_telemetry_ingest.md` notes

### Task C — Pytest Config & Churn Resilience (~55K tokens)
- Set `asyncio_default_fixture_loop_scope = function` in pytest config (e.g., `pyproject.toml` or `pytest.ini`)
- Harden `tracker churn` when commit hashes missing (warn + skip diff + mark decision)
- Add pytest case for missing commit range path

### Task D — Window Audit Helper (~50K tokens)
- Implement `tracker window-audit --window <id>` (read-only report)
- Document usage in `docs/System/scheduler/standing_jobs.md`
- Add unit test verifying duplicate detection on synthetic data

**Buffer:** 20K tokens reserved for iteration/tests/docs

## Validation Matrix
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN`
- `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP-1`

## Handoff Requirements
- Update `docs/Tasks/tracker_cli_todo.md` (Brief 006 block)
- Append commands/artifacts to `docs/SESSION_HANDOFF.md`
- Add concise note to `progress.md`
- Refresh `/Users/m/Downloads/agentos_review_20251020/`
