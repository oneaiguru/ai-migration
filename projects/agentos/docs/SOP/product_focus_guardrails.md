# Product Focus Guardrails (v1)

Purpose
- Keep all work aligned with the PRD and active plans. Avoid “data-padding” features that do not directly advance measurement, quality, or operator throughput.

Guardrails
- Do not propose features whose only purpose is to generate artificial feature counts.
- New ideas must map to a current plan item or clearly close a PRD‑stated gap (measurement, quality, UPS, automation, or routing). 
- Any speculative idea requires a one‑liner “Why Now” and an acceptance line that ties to preview/tests/ledgers.
- Append-only process: if reality diverges from plan, add a correction row/note rather than rewriting history.
- Avoid moving/renaming large sets of files mid-session. Update content in place unless a spec explicitly calls for a restructure; keep archives stable.
- Housekeeping cadence:
  - Review single-file directories and unused folders monthly; remove or merge only when artifacts are clearly obsolete and linked SOP/tasks confirm deprecation.
  - When deleting, note the rationale in progress.md and ensure no current plan references the folder.
- For housekeeping passes, grep for the literal string `@housekeeping` in docs/.* to find staging notes and reminders.
- Prefer the simplest possible directory tree. When introducing new spec/docs/plan folders, confirm the content cannot live alongside existing files. Flatten or merge doc trees during housekeeping once older items are archived.
- Keep task specifications only in `docs/Tasks/`. Other docs (briefs, TLDRs, boards, plans) must reference tasks rather than restating them; update progress in the task files to avoid drift.
 - Minimize repetitive logging: do not echo routine SOP steps (e.g., TLDR copy, UAT commands) in `progress.md` unless there is a deviation or decision. Favor links to tasks/boards over duplicated text.

Decision Gate (feature proposals)
1) Does it help us compare providers or improve measurement/quality? If not, defer.
2) Will it reduce operator time in the current phase? If not, defer.
3) Can we ship it spec‑first within the current window budget? If not, park it in Backlog.

References
- docs/SOP/standard-operating-procedures.md
- docs/System/vision_snap.md
- docs/System/schemas/universal_provider_schema.md
- Keep NextAgent and SessionReports flat and sequential (e.g., `00N_*`). Do not create nested folders for briefs, TLDRs, boards, plans, or learnings.
