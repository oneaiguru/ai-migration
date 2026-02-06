# ADR 2025-10-12 – Trim After UAT Pass

Context
- We run a UAT→Code loop for each demo (visuals frozen). Trimming removes placeholders/hallucinations to produce a clean reference. Trimming too early risks duplicating fixes across repos if UAT fails.

Decision
- Do not trim before UAT passes. Always run UAT first on the latest build; if it passes, trim and re-validate. If it fails, fix and re-run UAT before any trim.

Consequences
- Keeps one clean source until behavior is validated; avoids churn across multiple repos.
- Slight delay to trimming steps, but fewer reworks overall.

Status
- Accepted. Referenced by `docs/SOP/trim-after-uat-sop.md`.

