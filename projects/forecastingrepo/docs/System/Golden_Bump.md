# Golden Baseline — Update Procedure (“Golden Bump”)

**Goal.** Keep default forecasts stable across PRs. Change the golden baseline only via this process.

## When to bump
- A deliberate, reviewed change to the **default** forecast behavior.
- A new **scenario** becomes the default.

## Process
1. Open a PR titled: `chore: golden bump — <reason>`
2. Update the golden hashes:
   - Re‑run baseline forecast on canonical inputs.
   - Compute hashes (or run the existing golden test generator).
   - Update `tests/golden/golden.yml`.
3. Update docs:
   - Write a brief note in `docs/research/findings.md` and this file (Why? What changed?).
4. CI gates:
   - tests/spec_sync/docs_check green
   - Review by CODEOWNERS
5. Merge & tag:
   - Tag `vX.Y.Z-golden-bump`
   - Produce review ZIP (see `docs/SOP/review-bundle.md`)

## Explicitly not a golden bump
- Adding evaluation tools (backtest, offline A/B) that do not alter default forecasts.
- Adding scenarios with weather unless they become **default**.
