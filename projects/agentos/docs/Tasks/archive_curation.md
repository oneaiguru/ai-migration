# Task: Archive Curation & Knowledge Surfacing (2025-10-19)

## Goal
Triage the root `archive/` folder, migrate reusable research into curated docs, and cross-link methodology insights so future agents can work autonomously.

## Scope
- `archive/deepresearch/` (churn analysis, tooling notes, historical plans)
- `archive/raw_feedback/` and other stray `.md` files that inform current SOPs
- Ignore large binary assets unless they contain indispensable context

## Work Items
1. Inventory archive folders; note useful docs vs stale materials.
2. For each useful doc, either:
   - Move/clone into `docs/Archive/` with a short summary, **or**
   - Extract actionable snippets into existing SOPs/tasks/methodologies.
3. Update referencing docs (`docs/System/methodologies/*`, `docs/Tasks/*.md`) with links to curated content.
4. Record progress in `progress.md` + `docs/SESSION_HANDOFF.md` (include files touched and insights surfaced).
5. Use the progressive summary format (`docs/System/methodologies/progressive_summary/overview.md`) so summaries include line-index navigation.

## Deliverables
- Updated `docs/Archive/` folder containing curated summaries.
- Cross-references added to active SOPs/tasks.
- Note in `docs/System/methodologies/churn_measurement/experiments.md` if churn insights were imported.

### Progress Snapshot (2025-10-20)
- ✅ Moved: `deep_research_2025-10-18_normalized_code_churn.md`, `tooling_notes.md`, `deep_research_2025-10-17_claude_usage_findings.md`, `deep_research_2025-10-16_tracker_repo_summary.md`, `deep_research_master_summary.md`.
- ✅ Summaries: `docs/Archive/churn_research_overview.md`, `docs/Archive/tooling_notes_overview.md`, `docs/Archive/tracker_repo_survey_summary.md`, `docs/Archive/reporting_tasks_summary.md`, `docs/Archive/magic_prompt_plan_summary.md`, `docs/Archive/magic_prompt_execute_summary.md`, refreshed `docs/Archive/README.md`.
- 🚫 Remaining: _None_ (2025-10-18 deep research backlog fully summarised).

## Validation
- `git status` shows only intended archive moves/edits.
- New or updated docs mention source paths (so we can trace provenance).

## Detailed Reading Plan (2025-10-19)
| Order | File | Size KB | Notes/Effort |
| --- | --- | --- | --- |
| ✅ | deep_research_2025-10-18_assumptions.md | 42.1 | Summary at `docs/Archive/assumptions_overview.md`; moved to docs archive. |
| ✅ | deep_research_2025-10-17_tracker_repo_survey.md | 27.0 | Summarised in `docs/Archive/tracker_repo_survey_summary.md`; linked in README and methodology doc. |
| ✅ | reporting_tasks.md | 2.5 | Summarised in `docs/Archive/reporting_tasks_summary.md`; cross-linked to task tracker. |
| ✅ | deep_research_2025-10-18_I_plan_using_magic_prompt.md | 3.4 | Summarised in `docs/Archive/magic_prompt_plan_summary.md`; referenced by CE prompts. |
| ✅ | deep_research_2025-10-18_J_execute_with_magic_prompt.md | 4.0 | Summarised in `docs/Archive/magic_prompt_execute_summary.md`; referenced by CE prompts. |
