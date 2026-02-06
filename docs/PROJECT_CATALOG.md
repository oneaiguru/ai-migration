# PROJECT_CATALOG.md

## Purpose
Thin, non-overlapping inventory of every project under `projects/`.

Rules:
- Keep each project to 1–3 lines unless it is NOT covered by the context pack.
- If covered by `docs/CONTEXT_PACK_20_FILES.md`, prefer “see context pack item #N” over repeating details.

## Catalog

Note: the replica `orchestrator` repo is NOT under `projects/`, but is core to the strategic inventory. It is covered in `docs/CONTEXT_PACK_20_FILES.md` items #1–#5.

### High Relevance (core “internet for AI agents”)
- `agentos` — Subscription Optimizer prototype + tracker/CCC/privacy/licensing foundations; strong “usage/cost + ops” backbone (context pack #6–#9).
- `ClaudeCodeProxy` — Multi-user proxy for Claude/Anthropic APIs with usage logging/cost tracking + admin tooling (context pack #10–#12).
- `taskflow` — Agent/task orchestration platform (templates, mobile/Telegram bridge, context mgmt) aimed at maximizing Codex/Claude workflows (context pack #13–#14).
- `genai-coder` — “artifact framework” docs for GenAI coding + client verification; describes process/outputs more than runnable product (see `projects/genai-coder/README.md`).
- `codefixreview` — MVP spec/notes for an automated PR review+fix/migration service loop (Codex-reviewed small PR cadence) (context pack #15).

### Medium Relevance (adjacent tools that support the core)
- `GenAICodeUpdater` — Applies LLM-produced multi-file edits into a repo with parsing/validation/backups/reports/task tracking (context pack #18–#19).
- `MyCodeTree2LLM` — Project switching + interactive file selection/workflow automation; includes a local FastAPI+Vue file-concatenation UI (context pack #20).
- `autotester` — Python toolkit to run tests/quality/dependency graph/TODO aggregation and write reports (see `projects/autotester/AGENTS.md`).
- `scheduler` — DeepSeek-driven scheduling/triage automation with processors + BDD tests (see `projects/scheduler/AGENTS.md`).
- `uahis` — Things MCP server + separate Things TUI clone (MCP patterns + TUI patterns) (see `projects/uahis/readme.md`).
- `tuings` — Things TUI clone with strict BDD tests (TUI patterns; MCP is external) (see `projects/tuings/README.md`).
- `whisper_infinity_bot` — Telegram bot for teacher/course management + payments tracking (processor integration is partial) (context pack #16–#17).
- `fastwhisper` — Faster-whisper based transcription pipeline with file management/dedup/retry (see `projects/fastwhisper/CLAUDE.md`).
- `groq_whisperer` — “hold key to record → Groq Whisper → clipboard” transcription tool (see `projects/groq_whisperer/README.md`).
- `groq_transcript_cleaner` — Cleans Groq Whisperer CLI output to just transcript text (see `projects/groq_transcript_cleaner/README.md`).
- `convertpdf` — PDF/DOCX → Markdown with images + page references (doc processing utility) (see `projects/convertpdf/AGENTS.md`).
- `yclientparser` — FastAPI + Playwright YClients parser into Supabase; includes TimeWeb deployment guidance (see `projects/yclientparser/README.md`).
- `yclients` — Same YClients parser family; deployment + API usage docs (see `projects/yclients/README.md`).
- `voiceanalyitcs` — Audio preprocessor/signal extraction pipeline for a QA workflow (see `projects/voiceanalyitcs/README.md`).
- `salesvocieanalytics` — Static Voice Analytics UI prototype (Next.js export) + extensive planning docs (see `projects/salesvocieanalytics/AGENTS.md`).
- `CodeInterpreterZip2LocalFolder` — Script to update a target folder from latest downloaded ZIP (see `projects/CodeInterpreterZip2LocalFolder/README.txt`).

### Low Relevance (client delivery repos / domain-specific apps)
- `forecastingrepo` — Forecasting POC repo (Phase 1) for the RTNEO/MyTKO domain (see `projects/forecastingrepo/README.md`).
- `forecast-ui` — React/Vite UI prototype for MyTKO forecasting visualization (see `projects/forecast-ui/README.md`).
- `mytko-forecast-demo` — Small Vite+React demo consuming `/api/mytko/forecast` (see `projects/mytko-forecast-demo/README.md`).
- `qbsf` — Salesforce ↔ QuickBooks integration project; “ai-docs/specs/.claude” structure; near-complete client delivery (see `projects/qbsf/README.md`).
- `rtneo-docs` — Workspace/doc wrapper around RTNEO repos (see `projects/rtneo-docs/README.md`).
- `rtneo-mock` — RTNEO UI documentation bundle + local viewer helper (see `projects/rtneo-mock/README.md`).
- `rtneo-reports` — Demo report CSV samples for RTNEO/MyTKO (see `projects/rtneo-reports/README.md`).
- `rtneo-scripts` — RTNEO/MyTKO data export conversion + demo subset scripts (see `projects/rtneo-scripts/README.md`).
- `rtneo-ui-docs` — RTNEO UI docs bundle (docs-only) (see `projects/rtneo-ui-docs/AGENTS.md`).

### Ops / Personal / Not part of “internet for agents”
- `accounting-operations` — Accounting data workflow handoff (highly local, data-path specific) (see `projects/accounting-operations/README.md`).
- `adesk` — Adesk accounting migration toolkit + runbooks/mappings (highly local, data-path + credentials) (see `projects/adesk/HANDOFF.md`).

### Unknown / Incomplete
- `ccg3` — Contains only a `.claude/` directory (no repo scaffold/docs found in this import).
- `last20reddit` — Contains `node_modules/` and folders but no manifest/README; likely an artifact/output folder rather than a maintainable project.
