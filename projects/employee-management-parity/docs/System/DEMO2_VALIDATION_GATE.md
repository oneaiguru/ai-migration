# Demo #2 Validation Gate – Parallelization Criteria

## Purpose
Decide whether to parallelize work on remaining demos after Demo #2 by measuring reuse and hallucination profile.

## Metrics to Record (from Demo #2)
- Component reuse rate: % of UI built with library wrappers/components (Active gate for Scheduling: 60%; see Note below).
- Hallucination entanglement (captured during the refactor loop, not a separate scan): Isolated (UI-only) vs Tangled (in data flows), with 1–2 examples.
- New patterns to extract into library: list + quick estimate.
- Time spent stripping hallucinations vs refactoring to wrappers.

### Canonical "Reuse" Definition
- A component counts as reused when the rendered UI is produced by an unmodified export from the library (imported from the library module), with no local forks of its implementation. Passing different props, tokens, or data adapters is allowed.

Allowed adaptations (still reuse)
- Prop adaptation (map domain data to documented props).
- Composition (local shell binds defaults/layout/i18n/tokens; no new semantics).
- Theming (tokens/CSS vars/classNames per library contracts).
- Data adapters (transform domain data without changing the renderer).

Partial reuse (score 0.5)
- Extension that alters behavior but keeps the library component as renderer (e.g., custom tooltip plugin/preset beyond documented props).
- Local wrapper that introduces new semantics while still rendering the library component.

Not reuse (score 0)
- Forked/copied internals of a library component (new local variant replacing the renderer).
- Alternate rendering engines (e.g., direct Chart.js/Recharts) where the library wrapper should be used.
- Test/Storybook stubs that aren’t used in app code.

### How to Measure Reuse (scoring rubric)
- Unit: feature slot reuse per screen (not raw import counts).
- Slot definition: Use the feature list from the parity checklist as your slots. Define slots for each target screen before refactoring begins (e.g., "Line chart", "Bar chart", "KPI grid", "Report table", "Dialog"). One component type per slot.
- Scoring per slot: 1.0 reused, 0.5 partial reuse, 0.0 not reuse.
- Reuse % = (sum of slot scores) / (total slots) × 100, averaged across target screens.

Note on the gate threshold (Decision: 60% for Scheduling)
- For Scheduling (first domain pass with new wrappers), we set the active gate at 60%.
- After extracting any new patterns into the library, future demos should use a 70% gate.

## Decision Gate
- If reuse ≥ gate (60% for Scheduling) AND hallucinations isolated → Option B: Parity-first in parallel (then refactor wave).
- If reuse < gate OR hallucinations tangled → Option A: Refactor-first sequentially (#3), then parallelize (#4–5).

Library extraction buffer after Demo #2
- If new patterns are discovered, estimate extraction time:
  - If ≤ 3 days: extract patterns first, then parallelize.
  - If > 3 days: run one more sequential refactor before parallelizing.

## Parallel Execution Options
- Option A (Refactor-first):
  - Week 1–2: Demo #2 refactor (validation)
  - Week 2–3: Refactor #3
  - Week 3–4: Refactor #4–5 in parallel
  - Week 4–5: Parity for all three in parallel
- Option B (Parity-first):
  - Week 1–2: Demo #2 parity
  - Week 2–3: Parity #3–#5 in parallel
  - Week 3–5: Bulk refactor with validated library

## Required Artifacts
- MVP parity checklist per demo (must-haves by CH docs).
- Hallucination profile scan (isolated/tangled) for demos #3–5 (1h each).
- Library gap list discovered in Demo #2.

## Reporting Format
- Reuse %: __
- Hallucination: Isolated / Tangled
- New patterns to extract: [list]
- Recommendation: Option A / Option B + justification

## Gate Result — Scheduling (Recorded 2025-10-13)
- Reuse %: ≥60% (meets active first‑domain gate; wrappers in use across LineChart, BarChart, KpiCardGrid, ReportTable, and overlay line series)
- Hallucination: Isolated (UI toggles/labels only; no data‑flow tangles observed during UAT)
- New patterns to extract: none blocking. Optional: consider promoting `toPeriodSeries` (day→period aggregation) as a shared util if reused by other demos.
- Recommendation: Option B — Parity‑first in parallel, then refactor wave as needed
- Next steps:
  - Trim Scheduling per `docs/SOP/trim-after-uat-sop.md`, re‑validate quickly
  - Spin up parallel agents for Manager Portal (Refactor‑first), Analytics Dashboard (Refactor‑first), and Employee Portal (Parity‑first) per `docs/System/DEMO_EXECUTION_DECISION.md`
