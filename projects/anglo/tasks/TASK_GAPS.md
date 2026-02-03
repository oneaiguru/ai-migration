# TASK_GAPS — Phase 3/4 Alignment (v1.3.1)
Updated: 2026-01-05

This file lists remaining risks/gaps after aligning Phase 3 + Phase 4 task plans to the enhanced v1.3.1 feature specs.

## 1) @core features with partial/implicit task coverage (needs explicit acceptance criteria)

### ui/error-handling-and-edge-cases.feature
- We added global offline + incident banner + retry UX, but the tasks should explicitly cover:
  - “Content missing / 404 lesson” fallback screen with safe copy + route back to course map
  - “Audio failed to load” fallback: show text + retry, do not fail the session
  - Safe handling when sync returns partial acks (client must keep pending events)

### reliability/data-recovery.feature
- Tasks state “resume in-progress session (optional)” but feature expects recovery semantics.
  - Decide: **Do we ship session resume in v1.3.1?**
  - If yes, add explicit UI state persistence + restore flow (lesson session + review session).
  - If no, mark related scenarios as `@retention` in feature files to avoid BDD gating.

## 2) Feature tier/tag inconsistencies to resolve (BDD + planning risk)

The **projects/anglo/FEATURE_TIERING_MATRIX.md** is treated as the source of truth, but some feature files contain scenario tags that may cause confusion.


## 3) Persistence risks (ensure “real storage”, not in-memory)

- Backend: Phase 4 introduces a DB agent. Ensure no leftover `Map<string, …>` stores remain in:
  - progress tracking
  - streak state
  - review item strengths
  - sync idempotency sets
- Frontend: ensure local persistence uses IndexedDB for:
  - progress snapshot
  - sync event log
  - item strengths
  - appeal submissions while offline

## 4) Content depth risks (credibility)

Core rule: **A1 Unit 1 must be real, not a stub**.
- If the curriculum pack is already ready, wire it into the content endpoints now.
- If not, the repository must still include a minimum “credibility slice”:
  - 5 lessons × 6–12 exercises each
  - working audio URLs
  - at least 1 story + 1 checkpoint test

## 5) Notifications “effect vs function”

- Storing reminder preferences + push subscription is necessary but may not fully reproduce the Duolingo retention effect until:
  - a scheduler exists to send daily reminders
  - local timezone handling is correct (user_settings.timezone_offset_minutes)
- Recommendation: add a dev-only endpoint `/notifications/send-daily` and document how it will be wired to cron in RU hosting.

## 6) Monetization constraints (RU)

- Payments rails (Mir/SBP) + Max upgrade are **core** in v1.3.1; ensure web checkout + TWA handoff work end-to-end.
- Ensure **no pay-to-continue** mechanics creep into core:
  - hearts must not gate new lessons or review (no hearts gating at launch).

## 7) What to do with the old task files

Previous versions of `projects/anglo/tasks/master-tasks-phase-3.md` and `projects/anglo/tasks/master-tasks-phase-4.md` contained:
- energy references
- v2 implementations (payments, email verification, leaderboards)
- shallow sample content (2–3 exercises)

Use the updated v1.3.1-aligned files:
- `projects/anglo/tasks/master-tasks-phase-3.md`
- `projects/anglo/tasks/master-tasks-phase-4.md`
