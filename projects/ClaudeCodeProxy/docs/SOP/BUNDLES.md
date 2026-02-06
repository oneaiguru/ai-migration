# Bundles SOP (Review & CI)

Purpose: produce predictable bundles for reviewers and CI without chasing history.

Types
- Review bundle: code changes + docs + evidence (per session/slice), zipped to `~/Downloads/<name>.zip`.
- CI bundle: stable set of schema/fixtures/keys for adapter tests.

Paths (CCC)
- CI bundle: `artifacts/agentos_bridge/agentos_bridge_ci.tar.gz`
- Review bundles: produced ad‑hoc by `scripts/review-bundle.sh` or per session instructions.

Checklist
- Include schema docs, key bundles, usage/metrics fixtures, and any UAT summaries.
- Avoid logs/results beyond small snapshots; keep size reasonable.

