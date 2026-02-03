# Subscription Optimizer – Agent Playbook

This repo hosts the "living" subscription-optimizer workspace that we update regularly. Treat the archival folders as read-only references; all day-to-day work happens here.

---
## Environment
- **Repo path**: `~/ai/projects/agentos`
- **Python tooling**: `uv` virtualenv (Python 3.11). Run `cd tracker && uv venv .venv && . .venv/bin/activate && uv pip install -e .[dev]` on first use.
- **Core commands**:
  - `PYTHONPATH=tracker/src pytest`
  - `PYTHONPATH=tracker/src behave features`
  - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W0-XX>`
  - `python scripts/tools/decision_card.py --data-dir data/week0/live --window <W0-XX>`
- **Data discipline**: outputs land in `data/week0/live/*.jsonl` and `docs/Ledgers/*.csv` (append-only). Use tracker aliases (`scripts/tracker-aliases.sh`) for Codex/Claude snapshots.

---
## Session Pipeline (Codex lane)
1. **Read progress & plan** — `progress.md` points to the active plan (e.g., `plans/006_polishing-next.plan.md`). Complete the required-reading list before touching code.
2. **Run UAT opener** — execute the commands above (pytest, behave, preview, decision card). Results must be logged in `progress.md` + `docs/SESSION_HANDOFF.md`.
3. **Execute plan** — follow the numbered phases; use tracker CLI/aliases to capture `before/after` panes, run specs/tests as directed, and keep JSONL/CSV files append-only.
4. **Validate & log** — rerun plan validation matrix; append ledgers/evidence with `scripts/automation/ledger_checkpoint.sh` and `scripts/tools/append_evidence.sh`.
5. **Handoff** — update `progress.md`, `docs/SESSION_HANDOFF.md`, refresh the Downloads review bundle, and leave the working tree clean (no commits unless instructed).

---
## Quick Local Smoke Check
```
cd tracker
PYTHONPATH=tracker/src pytest
PYTHONPATH=tracker/src behave features
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W0-XX>
python ../scripts/tools/decision_card.py --data-dir data/week0/live --window <W0-XX>
```
Review the tracker preview output for:
- `Anomalies: 0 (see anomalies.jsonl)` (or documented non-zero count with notes).
- `Subagent Proxy` block when telemetry exists (routed %, latency p50/p95, errors %).
- `Churn:` section reporting per-provider stats or the new `decision=missing-commit-range` skip note when commit bounds are absent.

---
## Role Selection & Required Reading
1. Start with `progress.md` to confirm the active plan and identify which role is expected (Scout, Planner, or Executor). If the role is unclear, stop and ask for direction before touching files.
2. Read the CE_MAGIC prompts for your role plus the shared `SIMPLE-INSTRUCTIONS.md` (see table below).
3. Read the SOP tied to that role, then open every item in the plan’s Required Reading list—including `ai-docs/` entries. Spend time in the knowledge base (`ai-docs/README.md`, `MANIFEST.md`, `RESEARCH_BRIEF.md`, `QUESTIONS.md`, playground/reference examples) before you act.

| Role | Prompts | SOP | Deliverable |
| --- | --- | --- | --- |
| Scout | `/Users/m/ai/projects/agentos/docs/System/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`<br>`/Users/m/ai/projects/agentos/docs/System/CE_MAGIC_PROMPTS/RESEARCH-FOLLOWING-MAGIC-PROMPT.md` | `docs/SOP/code-change-plan-sop.md` (Exploration) | Discovery notes + `docs/SESSION_HANDOFF.md` entry |
| Planner | `/Users/m/ai/projects/agentos/docs/System/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`<br>`/Users/m/ai/projects/agentos/docs/System/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md` | `docs/SOP/code-change-plan-sop.md` (Plan authoring) | `plans/YYYY-MM-DD_<task>.plan.md` + handoff update |
| Executor | `/Users/m/ai/projects/agentos/docs/System/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`<br>`/Users/m/ai/projects/agentos/docs/System/CE_MAGIC_PROMPTS/EXECUTE-WITH-MAGIC-PROMPT.md` | `docs/SOP/plan-execution-sop.md` | Code changes, tests, documentation updates |

See `docs/System/context-engineering.md` for the full context engineering playbook. Path variables are defined in `docs/System/path-conventions.md`.

---
## References & Docs
- `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` – current backlog & status.
- `docs/SCREENSHOT_INDEX.md` – alias ↔ screenshot mapping.
- `docs/AGENT_PARITY_REPORT.md` – browser-agent comparison report.
- `docs/Tasks/parity-backlog-and-plan.md` – pointer to the archived backlog (Phase 1–5 history).
- `docs/Archive/Tasks/03_phase-3-crud-and-data-parity-prd.md` – Phase 3 scope (CRUD/bulk edit/import-export).
- `docs/Archive/Tasks/04_phase-4-accessibility-and-final-parity.md` – Phase 4 a11y sweep & final parity polish.
- `docs/SOP/standard-operating-procedures.md` – workflow checklist (UI, tests, deploys).
- `docs/SOP/standard-operating-procedures.md#bdd-workflow-tracker-tooling` – tracker spec-first cadence (feature file + pytest + `behave ../features`).
- `docs/SOP/next_session_planning_sop.md` – token‑budgeted planning ritual to prepare the next autonomous session (target 70–80% of 272K, spec‑first tasks, validation matrix).
- `docs/SOP/session_reflection_sop.md` – end‑of‑session TLDR capture: save reflection under `docs/SessionReports/<date>_TLDR.md`, update progress/handoff, and seed the next-session plan.
- `docs/SOP/brainstorming_sop.md` – capture → triage → spec → budget backlog ideas.
- `docs/SOP/backlog_naming_sop.md` – naming/structure conventions for backlog specs.
- `docs/SessionReports/` – per‑session reflections (TLDRs) stored with dates.
- `docs/Ledgers/` – CSV ledgers for tokens/churn and feature log (optional but recommended).
- `docs/Backlog/index.md` – high‑leverage backlog index with individual idea specs (diagrams, contracts, token budgets).
- `docs/System/contracts.md` – cross-cutting invariants (IDs, time, JSONL, deltas, citations, features).
- `docs/SOP/definition_of_done.md` – cross-team “done” checklist for tracker features.
- `docs/Backlog/anti_patterns.md` – guardrails and pitfalls to review before implementing backlog items.
- `docs/SOP/recipes_index.md` & `docs/Recipes/` – repeatable operator recipes (ccusage ingest, codex status capture, progressive summaries, bundler).
- `docs/SOP/ui-walkthrough-checklist.md` – step-by-step validation script.
- `docs/SOP/session-prep-and-handoff.md` – pre-handoff checklist.
- `docs/System/employee-management-overview.md` – module/data summary.
- `docs/System/parity-roadmap.md` – upcoming module staging notes.
- `docs/ENVIRONMENT_FIX_TODO.md` – shell/Node/preview guidance.
- `docs/System/ui-guidelines.md` – copy conventions (no “демо” labels, no tech names in UI).
- `docs/ai-docs/README.md` – quick map of the `ai-docs/` workspace; read before citing AI-doc assets.
- `docs/System/methodologies/README.md` – index of tracker workflows (aliases, BDD cadence, churn measurement) with metrics/experiments.
- `ai-docs/` – Phase 6 research workspace (playground, wrapper drafts, harvested reference docs, open questions).
- `docs/SOP/PRD_v1.6-final.md` – subscription optimizer PRD.
- `docs/SOP/week0_final_protocol.md` – Week-0 measurement runbook.
- `docs/System/ADR/` – ingestion, parser, bandit decisions.
- `docs/Tasks/tracker_cli_todo.md` – tracker CLI follow-up.
- `docs/Tasks/tooling_notes.md` – claude-trace conventions.
- `final_docs_summary.md` – summary of required documents.
- **Validation commands:** For every tracker change run `cd tracker && . .venv/bin/activate && pytest` followed by `behave ../features`. Capture command output in `progress.md` / `docs/SESSION_HANDOFF.md`.
- **Alias ingestion:** Source `scripts/tracker-aliases.sh` (`. scripts/tracker-aliases.sh`) so `os/oe/ox`, `as/ae/ax`, `zs/ze/zx`, `occ`, and `acm` are available before field work.

---
## Agent Login (Real System)
For side-by-side validation, use:
- **OIDC URL**: see parity plan or latest agent prompt.
- **Username**: `user20082025`
- **Password**: `user20082025`
Follow the login macro (Ctrl+L → paste OIDC URL → enter credentials → wait). Further details are in the parity plan.

---
## Summary
- All active work happens in this repo.
- Always verify with `npm run build` (or the Python/behave commands listed in the active plan) before committing.
- Deploy via `vercel deploy --prod --yes` (or follow the tracker release steps once available).
- Keep the older Vercel project as a read-only reference.
- Tracker sessions run in a single-agent Codex loop—follow `docs/Tasks/tracker_long_session_plan.md`, keep context alive until capacity resets, and rotate Scout → Planner → Executor activities as described there.

---
## Glossary (Docs Structure, Short and Clear)
- Methodologies — Experimental comparisons and measurement of approaches (e.g., alias cadence vs. BDD throughput). Lives under `docs/System/methodologies/`.
- Workflows — Practical, repeatable techniques used during work (e.g., progressive line‑indexed summaries). For now referenced at `docs/System/methodologies/progressive_summary/overview.md` and cited from tasks; keep nesting minimal.
- SOP — Authoritative step‑by‑step procedures we must follow (`docs/SOP/*`).
- Tasks — Backlog items and execution notes (`docs/Tasks/*`). Always start new work with a spec stub.
- Plans — Short execution plans/checklists (`plans/*`), used to stage multi‑step changes.
- ADR — Architecture decisions and their implications (`docs/System/ADR/*`).
- AI‑Docs — Mirrored upstream references for external tools (`docs/ai-docs/*`).
- Archive — Curated historical research and summaries (`docs/Archive/*`).
- Features/Scenarios — BDD assets (`features/*.feature`, `features/steps/*`).
- Aliases — Operator shorthands defined in `scripts/tracker-aliases.sh` (`os/oe/ox`, `as/ae/ax`, `zs/ze/zx`, `occ`, `acm`).

- PRO — Operator-grade guidance produced via ChatGPT (GPT‑5‑Pro). Live drafts are provided as external files (`/Users/m/Desktop/TLDR.markdown`, `/Users/m/Desktop/PRO.markdown`). We ingest and process these into `docs/CurrentPlan/<NNN>_PRO_TLDR.md` and the matching brief/board per `docs/SOP/external_tldr_ingestion_sop.md`.

Note on structure: we aim to keep `docs/` as flat as practical. Prefer extending existing folders over adding new ones; avoid deep nesting unless a comparison experiment (under Methodologies) clearly benefits from its own subfolder.

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
