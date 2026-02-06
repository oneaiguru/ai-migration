# SOP – Reuse Metrics & Parallelization Gate (Phase 9)

## Purpose
Provide a standard way to measure component reuse and decide when to parallelize remaining demos after Demo #2.

## Reuse Definition (canonical)
- Reused: Unmodified export from the library renders the UI. Props/tokens/adapters/composition allowed.
- Partial (0.5): Extended behavior but library component still renders (e.g., plugin/preset beyond documented props).
- Not reuse (0): Forked internals, alternate engines, or test-only stubs.

## Measurement
- Feature slots per screen (from the parity checklist) – one component type per slot.
- Scoring per slot: 1.0 / 0.5 / 0.0.
- Reuse % = (sum of slot scores) / (total slots) × 100, averaged across target screens.
- Record: reuse %, time stripping hallucinations, new patterns to extract.

## Hallucination Profile
- Captured during refactor loop (no separate scan):
  - Isolated = Fake UI only; Tangled = mixed into data/state.
  - Log examples and effort to strip along the way.

## Decision Gate
- Active gate for Scheduling (first domain pass): 60%.
- After extracting new patterns into the library, raise the gate to 70% for subsequent demos.
- If reuse ≥ gate AND hallucinations isolated → Parity-first in parallel (Option B), then refactor wave.
- If reuse < gate OR hallucinations tangled → Refactor-first sequentially for next demo (Option A), then parallelize.

Library extraction buffer after Demo #2
- If new patterns are discovered, estimate extraction time:
  - If ≤ 3 days: extract first, then parallelize.
  - If > 3 days: run one more sequential refactor before parallelizing.

## Artifacts
- docs/System/DEMO2_VALIDATION_GATE.md – gate metrics + decision.
- docs/System/PARITY_MVP_CHECKLISTS.md – feature slot lists per demo.
- SESSION_HANDOFF.md – note decision and next path.

## Roles
- Executor: refactor Demo #2, log metrics/unknowns, update mapping.
- Planner: maintain parity checklists (slots) and update mapping.
- UAT: confirm visuals/labels/clamps; capture unknowns.
