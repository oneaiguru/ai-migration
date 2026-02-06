# Long‑Term Documentation Maintenance Strategy

Purpose
- Keep docs synchronized with code and prevent documentation debt across phases and demos.

Three‑Tier Documentation System
- Tier 1 — Canonical (always current)
  - Location: `docs/System/`, `docs/SOP/`, root docs like `PROGRESS.md`, `SESSION_HANDOFF.md`
  - Owners: all agents
  - Frequency: update with every relevant code or process change
  - Authority: single source of truth
- Tier 2 — Active Work (short‑lived)
  - Location: `docs/Workspace/`, `ai-docs/wrappers-draft/`
  - Owners: assigned agents (Scout/Planner)
  - Lifecycle: Create → Use → Complete Phase → Archive/Delete/Freeze snapshot
  - Authority: staging only
- Tier 3 — Archive (historical)
  - Location: `docs/Archive/`, `ai-docs/snapshots/`
  - Owners: orchestrator (write‑once)
  - Frequency: never modified post‑archive
  - Authority: historical reference only

Weekly Maintenance Routine
- Monday — Status Sync (15 min)
  - Review `PROGRESS.md`, `docs/STATUS_DASHBOARD.md`
  - Find stale task docs: `find docs/Tasks -name "*.md" -mtime +30 | grep -v Archive`
  - Update dashboard: `./docs/scripts/update-status.sh`
  - Commit dashboard if changed
- Wednesday — Cleanup Check (20 min)
  - AI‑docs dry run: `./ai-docs/scripts/cleanup-stale.sh --dry-run`
  - Review suggestions (merge URL lists, draft audits)
  - Apply with `--apply` when approved; update `ai-docs/README.md` and `ai-docs/MANIFEST.md`
- Friday — Health Check (15 min)
  - Run: `./docs/scripts/health-check.sh > health-report.txt`
  - Fix criticals (absolute paths, broken links if tracked)
  - If structure changed: `./docs/scripts/generate-index.sh`

Monthly Maintenance Routine
- First Monday — Archive Sweep (30 min)
  - Move completed phase docs to `docs/Archive/Tasks/`
  - Move executed plans to `docs/Archive/Plans/executed/`
  - Create AI‑docs snapshot: `./ai-docs/scripts/create-snapshot.sh phase-N` (when available)
- Mid‑Month — Consistency Audit (45 min)
  - Cross‑refs: `grep -r "docs/Tasks" docs/ | grep -v Archive`
  - Path conventions: `grep -r "/Users/m/" docs/ | grep -v path-conventions.md`
  - Duplicate check (manual md5 or diff as needed)
- Month‑End — Metrics Review (30 min)
  - Review `docs/System/workflow-metrics.md` targets
  - Document misses/reasons in `docs/SESSION_HANDOFF.md`

Per‑Phase Maintenance
- Phase Start (Scout)
  - Confirm ai‑docs is current: `./ai-docs/scripts/cleanup-stale.sh --dry-run`
  - Create discovery doc from your template; include AI‑docs citations
- Phase Planning (Planner)
  - Verify discovery has AI‑docs citations; create plan file; add tests/rollback
- Phase Execution (Executor)
  - Follow plan; do not refactor ai‑docs mid‑execution; note drift in handoff
- Phase Completion (Orchestrator)
  - Archive phase docs; mark `PRD_STATUS.md`; freeze ai‑docs snapshot if needed; update roadmap

Anti‑Patterns & Solutions
- Docs drift from code
  - Add PR checklist items: update Tasks doc, run health check, add handoff entry
- Duplicate documentation
  - SSOT: prefer `docs/System/`; delete duplicates and add a small redirect note
- Orphaned files
  - Monthly: list orphans (no inbound references) and decide keep/archive/delete
- Stale AI‑docs
  - Use `ai-docs/scripts/cleanup-stale.sh` to detect; freeze to snapshots or delete

Automation (Examples)
- Pre‑commit hook (optional)
  - Prevent committing absolute paths; see `docs/System/path-conventions.md`
- CI (optional)
  - Add a docs health workflow to check for absolute paths and run the health check script
- Cron (optional)
  - Schedule weekly status update and ai‑docs dry run for reminders

Scripts Inventory (value vs overhead)
- `docs/scripts/validate-discovery.sh` — High value; Low overhead
- `docs/scripts/update-status.sh` — Medium value; Low overhead
- `docs/scripts/health-check.sh` — High value; Low overhead
- `docs/scripts/generate-index.sh` — Medium value; Low overhead
- `ai-docs/scripts/cleanup-stale.sh` — High value; Medium overhead (requires review)

Governance
- Fast‑path exceptions for low‑risk changes: `docs/SOP/fast-path-exceptions.md`
- Archive policy and retention: `docs/System/archive-policy.md`
- Path portability: `docs/System/path-conventions.md`

Emergency Recovery (“Docs are a Mess”)
- Day 1: Create a `docs-recovery` branch; triage must‑keep vs stale; list TODOs
- Day 2–3: Delete duplicates; archive old and unreferenced; keep only core Tier 1 docs and current Tasks/Plans
- Day 4: Rebuild minimal structure (indices, path conventions)
- Day 5: Document new state; commit and announce

