# CONTEXT_PACK_20_FILES.md

## Purpose
Curated <=20-file packet for an intermediate agent to read in full, to prepare an Opus-ready “what exists” assets overview.

Rules:
- This pack is intentionally small to reduce summarization effort and avoid duplicated prose.
- Prefer “primary evidence” files (README/architecture docs/entrypoints) over derived summaries.

## How To Use (Intermediate Agent)
1. Read `/Users/m/Desktop/mossy-wishing-salamander.md` (strategy + mapping).
2. Read every file listed below (in order).
3. Use `docs/PROJECT_CATALOG.md` only as a directory/map; do not trust it without reading this pack.

Non-overlap rule:
- If the “standard headers” are already covered by a README/doc in this pack, do not rewrite them—cite the file and extract only the unique differentiators.

Confidentiality:
- Treat all file contents as internal context. Do not paste secrets/credentials into any Opus-facing summary.
- Optional deepening: see `docs/EXTRA_FOLDERS_CANDIDATES.md` for wiki/SUMMARYREPO files that may replace lower-signal pack items if needed.

## File List (<=20)

### Reading prerequisites (not counted in the 20)
- `/Users/m/Desktop/mossy-wishing-salamander.md` — strategic mapping + the “5-minute inventory” shape to target.

### 1) Orchestrator (replica) — plugins/routing/value/trajectory foundations
1. `/Users/m/Documents/replica/orchestrator/src/imports/l1/imports-architecture.md` — L1/L2/L3 imports architecture (why it predates/exceeds “skills”).
2. `/Users/m/Documents/replica/orchestrator/src/imports/l1/model-selection.md` — declarative model routing rules.
3. `/Users/m/Documents/replica/orchestrator/src/imports/l2/delegation-economics-essence.md` — token efficiency methodology (the “94% reduction” style claim lives here).
4. `/Users/m/Documents/replica/orchestrator/argus/COMPLETE_35M_RUB_ANALYSIS.md` — quantified ROI/value methodology (35M RUB analysis).
5. `/Users/m/Documents/replica/orchestrator/src/LIVING-SESSION-COORDINATION-SYSTEM.md` — session/trajectory coordination (Scout→Planner→Executor handoff system).

### 2) AgentOS — tracker + privacy + licensing + CCC integration
6. `projects/agentos/tracker/src/tracker/cli.py` — main tracker CLI (parsers/rollups/windows; “real code exists” proof).
7. `projects/agentos/agentos/privacy/tier.py` — privacy tiers/strategies (LocalOnly/Minimized/Full).
8. `projects/agentos/agentos/licensing/client.py` — license framework client (validation/crypto pack handling).
9. `projects/agentos/agentos/integrations/ccc_client.py` — CCC adapter client (session lifecycle + API client).

### 3) ClaudeCodeProxy — multi-user proxy + cost tracking + quotas
10. `projects/ClaudeCodeProxy/README.md` — high-level overview of the proxy’s purpose/features.
11. `projects/ClaudeCodeProxy/src/server/server.js` — Node proxy server logic (usage/cost tracking + auth/balance behavior). (Repo-root `server.js` is a scaffold placeholder.)
12. `projects/ClaudeCodeProxy/configs/quotas.example.json` — quota model/config surface (what’s intended to be enforced).

### 4) TaskFlow — orchestration layer and task execution routing
13. `projects/taskflow/README.md` — what TaskFlow is and how it’s structured.
14. `projects/taskflow/bot/task_executor.py` — task execution + model selection plumbing at the task level.

### 5) CodeFixReview — automated PR fix/migration service loop
15. `projects/codefixreview/README.md` — service definition + operating loop (Codex-reviewed PR cadence).

### 6) Whisper Infinity Bot — product bot baseline + payments surface
16. `projects/whisper_infinity_bot/CLAUDE.md` — purpose + command surface + components summary.
17. `projects/whisper_infinity_bot/bot.py` — core bot implementation (what’s actually implemented today).

### 7) LLM update + context packing utilities (supporting tooling)
18. `projects/GenAICodeUpdater/CLAUDE.md` — “apply LLM output safely” overview (backups/reports/task tracking).
19. `projects/GenAICodeUpdater/llmcodeupdater/code_parser.py` — the file-block parsing format (`# path/to/file.ext`) and validation rules.
20. `projects/MyCodeTree2LLM/README.md` — project switching + interactive file selection/workflow automation for context packing.
