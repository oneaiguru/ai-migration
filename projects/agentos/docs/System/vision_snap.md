# Vision Snap — Subscription Optimizer

## Core Question
Which provider + methodology combination delivers the lowest cost per shipped feature while maintaining acceptable quality?

## Non‑Negotiables
- **Definition of Done** (`docs/SOP/definition_of_done.md`): spec-first delivery, tests, ledgers, handoff.
- **Contracts & Invariants** (`docs/System/contracts.md`): ISO timestamps, append-only JSONL with `source` + `captured_at`, non-negative deltas, recorded `reset_at`, citations `path:line`.

## Focus Pillars
1. Measure provider efficiency (features per capacity unit) with statistical confidence.
2. Capture outcome quality (quality_score 1–5, churn) so efficiency is meaningful.
3. Reduce human time through automation only after measurement is trustworthy.
4. Route work autonomously once replay & stats prove the gains.

Use this page as the anchor when triaging backlog ideas or writing SOPs: every item must trace back to the core question and respect the non-negotiables.
