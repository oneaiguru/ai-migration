# Backlog (MVP)

- Brand: CodeFixReview (potential domain: `codefix.review`).

- Codex feedback harvest helper (PR #57 plan): script to fetch `chatgpt-codex-connector` review comments into `codex_feedback_<PR>.md`; update AGENTS/SOP to require running it post-review.
- Post-push fetch hook (PR #58 plan): optional hook after `push_with_codex.sh` to trigger the harvest after a delay; guard against overwriting existing feedback files. (Matches the Codex reaction idea shown in the PR screenshot.)
- Codex comment watcher (PR #59 plan): opt-in cron/watcher that polls open PRs, writes/updates feedback files when new Codex comments appear, tracks state to avoid duplicates.
- One-PR-at-a-time guardrail: enforce serialized PRs per repo (preflight check + branch_state sanity) so Mergify never sees conflicts.
- Metrics/logging: track PR open→merge time, human interventions, review rounds; surface in a simple dashboard.
- Codex task ingestion: handle cases where Codex approves via summaries/emoji only (no inline comments) and ensure watcher/automation records that feedback in `codex_feedback_<PR>.md` and labels appropriately.
- Domains to consider: `codefix.review` (primary), `fix.review` (premium ~$650 upfront, ~$84.50/yr renewal) once traction justifies.
