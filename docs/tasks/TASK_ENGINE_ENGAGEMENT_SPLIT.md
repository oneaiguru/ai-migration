# Task: Split Engine vs Engagements structure

## Goal
Introduce a clean separation between reusable “engine” automation/SOPs and per-engagement (per-monorepo/client) assets, without changing behaviour. Create planning docs only in this PR.

## Proposed layout
```
engine/
  README.md
  AGENTS.core.md
  scripts/ (coordinator.py, scripts/dev/*)
  docs/ (AGENTS_TEMPLATE.md, CODEX_AUTOMATION.md, SOP/worktree_hygiene.md, tasks/* templates/rollouts)
engagements/
  self-ai-monorepo/
    README.md (current root README)
    AGENTS.md (extends engine/AGENTS.core.md)
    docs/ (ProjectIndex, PR_PLAN, RTNEO briefs, dashboards, etc.)
    tasks/ (IMPORT_DASHBOARD_* etc.) or under docs/tasks/
    logs/ (coordinator.log)
    config/engagement.yml (new, defines repo mappings/policies)
```

## Files to move (non-exhaustive, keep behaviour identical)
- Scripts:
  - `scripts/coordinator.py` → `engine/scripts/coordinator.py`
  - `scripts/dev/*` → `engine/scripts/dev/`
- Generic docs:
  - `docs/AGENTS_TEMPLATE.md` → `engine/docs/AGENTS_TEMPLATE.md`
  - `docs/CODEX_AUTOMATION.md` → `engine/docs/CODEX_AUTOMATION.md`
  - `docs/SOP/worktree_hygiene.md` → `engine/docs/SOP/worktree_hygiene.md`
  - `docs/tasks/CI_CD_EXPLORATION.md`, `IMPORT_TASK_TEMPLATE.md`, `WORKTREE_HYGIENE_ROLLOUT.md` → `engine/docs/tasks/`
- Engagement-specific (self monorepo):
  - `README.md`, `AGENTS.md`, `coordinator.log`
  - `docs/ProjectIndex.md`, `PR_PLAN.md`, `RTNEO_IMPORT_BRIEF.md`, `RTNEO_REMAINING_IMPORT_PLAN.md`, `SMALL_REPO_IMPORT_STATUS.md`, `Small_Tools_Import_Wave.md`, `Agent_Handoffs_Large_Tools.md`, `ClaudeCodeProxy_Agent_SOP.md`, `Mergify_Agent_Quickstart.md`
  - `docs/tasks/IMPORT_DASHBOARD_ACTIVE.md`, `IMPORT_DASHBOARD_PENDING.md`
  → move under `engagements/self-ai-monorepo/...` preserving structure.

## New/additional files
- `engine/AGENTS.core.md`: generic agent rules (no user paths/client names).
- `engine/README.md`: how the engine works (pipeline, coordinator, fetch/watcher, CI smoke).
- `engagements/self-ai-monorepo/config/engagement.yml`: stub defining repo targets, severity policy, paths.
- Root `README.md`: brief repo map pointing to engine/ and engagements/.

## Migration approach
1) Create engine/ and engagements/self-ai-monorepo/ trees.
2) Move files as listed; update any relative references if needed.
3) Add new docs (core AGENTS, engine README, engagement config stub, root README map).
4) Ensure scripts still runnable via existing paths (add lightweight wrappers or update references).
5) Run CI (new codex feedback smoke) to confirm scripts still pass bash -n.

## Validation
- `bash -n engine/scripts/dev/push_with_codex.sh` and other moved scripts.
- `python -m py_compile engine/scripts/coordinator.py` (sanity).
- Update/verify CI workflow paths if necessary.

## Out of scope
- No behavioural changes to scripts; only moves/wrappers/docs.
- No client data changes.
