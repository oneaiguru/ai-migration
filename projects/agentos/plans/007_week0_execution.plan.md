# Plan — Brief 007 Week‑0 Execution Sprint

## Scope & Constraints
- Providers: **Codex**, **Claude**, **GLM** (observe-only telemetry; no routing changes).
- Target: Complete Week‑0 measurement run (≥6 windows/provider, 10 pp buffer) and produce CI + router replay evidence for PRD v1.6.
- Non-negotiables: append-only ledgers/JSONL, run decision card, capture CLS/IMPF/churn_14d fields per window, respect PRD sampling gates.
- Budget: aim ≤ 200 k tokens (≈ 3 full windows per provider per session) to leave room for reruns.

## Required Reading (before execution)
1. `docs/CurrentPlan/007_PRO_TLDR.md`
2. `docs/CurrentPlan/007_Agent_Brief.md`
3. `docs/SessionBoards/007_board.md`
4. `docs/Tasks/tracker_cli_todo.md` (Brief #7 block)
5. `docs/SOP/uat_opener.md` + `docs/SOP/standard-operating-procedures.md`
6. `docs/System/scheduler/standing_jobs.md` (codex/claude capture, ledger checkpoint, window-audit)
7. `docs/SOP/weekly_run_protocol.md` (buffers, evidence logging)

## Pre-flight Checklist (run once)
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHP`
- `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP`
- `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live window-audit --window W0-CHP`

Log results in progress.md + SESSION_HANDOFF.md.

## Execution Phases

### Phase 1 — Window Preparation
1. Export/confirm `AGENT_ID` and source `scripts/tracker-aliases.sh`.
2. Create/verify shared ledgers:
   - `docs/Ledgers/Acceptance_Evidence.csv`
   - `docs/Ledgers/Feature_Log.csv`
   - `docs/Ledgers/Token_Churn_Ledger.csv`
   - `docs/Ledgers/Churn_Ledger.csv`
3. Ensure `docs/System/capability_map/<project>/capabilities.csv` exists (10–20 entries).
4. Reserve features for the upcoming windows via `scripts/tools/reserve_feature.py` (one per capability).

### Phase 2 — Week‑0 Window Loop (repeat for each provider)
For each provider (**Codex**, **Claude**, **GLM**) run steps A–G for six windows:

A. **Before capture** (respect 10 pp buffer):
   - Codex: `codex /status | tracker ... alias start codex`
   - Claude: send “hi”, `claude /usage | tracker ingest claude --phase before`
   - GLM: `ccusage blocks --json | tracker ingest glm --window <id>`

B. **Work window** — execute planned features, record CLS/IMPF/notes.

C. **After capture** (wait +5 min): repeat meters with alias end/ingest.

D. **Finalize**: `tracker complete --window <id> --<provider>-features N --quality Q --outcome pass --cls <value> --impf <value>`.

E. **Churn**: `tracker churn --window <id> --provider <provider> --methodology week0 --commit-start <shaA> --commit-end <shaB>` (expect skip warning only if start hash missing; remediate).

F. **Evidence & telemetry**:
   - `scripts/tools/append_evidence.sh` for pytest, behave, manual QA.
   - `tracker window-audit --window <id>` (capture counts).
   - `python scripts/tools/proxy_cost_compare.py --data-dir ... --min 3` (store output).

G. **Log**: update `docs/Ledgers/*`, `progress.md`, `docs/SESSION_HANDOFF.md`.

### Phase 3 — Post-run Analytics
1. Aggregate preview: `tracker preview --data-dir data/week0/live` (per-provider CI, sample size).
2. Router dry-run: `python scripts/tools/router_replay.py --data-dir data/week0/live --strategy bwk --baseline greedy` (expect BwK ≥ greedy).
3. Decision Card: `python scripts/tools/decision_card.py --data-dir data/week0/live --window WEEK0` (compiled view) and log Tier-1 panel votes.
4. Run `tracker window-audit --window <id> --json` for each provider (store artefacts for PRD briefing).
5. Update `docs/SessionBoards/007_board.md` “Must-Ship” section with outputs.

### Phase 4 — PRD Brief & Handoff
1. Assemble Show & Ask pack (preview, decision card, window-audit JSON, cost compare) and paste into `docs/SESSION_HANDOFF.md` + PRD note.
2. Note PRD decision responses (GO criteria, error whitelist) once received; create follow-up tasks if needed.
3. Refresh `/Users/m/Downloads/agentos_review_20251020/` with final artefacts.
4. Draft next-session quick plan if working continues (token budget, remaining tasks).

## Validation Matrix (end of session)
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live window-audit --window <id> --json`
- `python scripts/tools/decision_card.py --data-dir data/week0/live --window WEEK0`
- `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
- `python scripts/tools/router_replay.py --data-dir data/week0/live --strategy bwk --baseline greedy`

## Deliverables Checklist
- [ ] Six windows per provider with BEFORE/AFTER snapshots + CLS/IMPF.
- [ ] `windows.jsonl` entries filled (quality, methodology, commit hashes).
- [ ] Ledgers updated (Token_Churn, Feature_Log, Acceptance Evidence, Churn).
- [ ] Preview CI output archived.
- [ ] Router dry-run results logged.
- [ ] Decision cards generated (window-level + Week-0 summary).
- [ ] Handoff/Progress updated, review bundle refreshed.

