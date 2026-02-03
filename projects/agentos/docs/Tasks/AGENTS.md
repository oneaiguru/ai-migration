# Agent Operating Guide

Welcome! This repository is now the single source of truth for the subscription-optimizer project.
Follow this guide **before doing any work** so we keep the documentation and archives consistent.

---

## 1. Folder Layout (do not add new top-level folders)

```
docs/
  Archive/    # Historical research packets, tooling notes, churn studies
  SOP/        # Operating procedures, handoffs, playbooks
  System/     # Active PRDs, timelines, provider facts
  Tasks/      # Current task plans, TODOs, meeting notes
plans/        # Session plans
progress.md   # Running log
final_docs_summary.md
```

**Rules:**
- Store any new doc in one of the three `docs/` subfolders above.
- Historical material goes under `docs/Archive/` (create a dated subfolder if needed).
- Do **not** create extra doc directories (e.g., `/docs/deepresearch-old/`).
- Scout outputs or quick research notes may live temporarily in `docs/Tasks/`, but archive them once resolved.

---

## 2. Required Reading (before editing anything)

1. `docs/Archive/deep_research_2025-10-18_normalized_code_churn.md`
2. `docs/Archive/deep_research_master_summary.md`
3. `docs/Archive/deep_research_2025-10-18_assumptions.md`
4. `docs/Archive/tooling_notes_overview.md`
5. `docs/Archive/churn_research_overview.md`
6. `docs/Archive/magic_prompt_plan_summary.md`
7. `docs/Archive/magic_prompt_execute_summary.md`
8. `docs/Archive/tracker_repo_survey_summary.md`
9. `docs/Archive/reporting_tasks_summary.md`

Take notes while reading—many action items are scattered through these briefs. If anything conflicts with the current PRD or SOP files, update the active document and reference the archived source in a footnote.

---

## 3. Current Active Docs

- `docs/System/PRD_v1.6-final.md`
- `docs/System/prd_spinoff_brief.md`
- `docs/System/revised_timeline.md`
- `docs/SOP/week0_final_protocol.md`
- `docs/SOP/saturday_prep_checklist.md`

Before editing, skim the active doc and cross-check the relevant archival note. All updates must stay synchronized (cite the archival evidence you relied on).

---

## 4. Tools & Telemetry References

- claude-trace, ccusage, and claude-monitor documentation live in `docs/Archive/tooling_notes.md` and `docs/Archive/tooling_notes_overview.md`.
- Code/scripts for those tools are not imported in this slice; defer hands-on changes until the tracker/tooling code lands.
- `docs/Tasks/tooling_notes.md` contains distilled conventions taken from the orchestrator instructions.
- When the tooling code arrives, capture sample outputs before changing collection scripts.

---

## 5. Task Intake Process

1. Update the plan via the TODO tool (`/docs/Tasks/` should mirror the open tasks).
2. If a new research thread is required, park your findings under `docs/Tasks/` temporarily, then file the cleaned result in `docs/System/` or `docs/SOP/` and archive the raw notes.
3. Reference the relevant archive path in every new section you add.

---

## 6. Version Control Discipline

- Commit snapshots before large restructures (as already done in `Initial snapshot before restructuring`).
- Keep commits scoped (e.g., `docs: publish helper prompts`, `archive: import research packet`).
- Avoid checking in temporary scratch files or personal notes.

---

### Questions?
If something is unclear, add a question block to `docs/Tasks/questions.md` (create it if missing) and tag it in the TODO plan so the next agent sees it.
Track overall progress in the root `progress.md` file, and consult `docs/Tasks/index.md` for a quick map of key documents.
+ See `progress.md` for current outstanding tasks.

## 7. Tracker CLI Follow-up

The tracker CLI implementation is not present in this import. When it is added, follow `docs/Tasks/tracker_cli_todo.md` and use the fixtures under `tests/fixtures/{codex,claude}/` to validate the ingest/finalize pipeline, then record outputs in `progress.md`.
