# CodeFixReview MVP

> Note: consider the domain `codefix.review` for this service.

## What this is
- Service 1: automated code review + fixes. We fork/import a repo, run an agentic loop (Codex/Opus/CLI) to migrate and clean code in small PRs, apply Codex review feedback, and ship until debt is burned down.
- Service 2: monorepo migration for scattered projects. Same loop, but consolidating many repos into one monorepo with shared hygiene/tooling.
- Differentiator: orchestration + cost discipline across models (route tasks to best model, measure value/churn, small PR cadence, Codex-reviewed).

## How the loop works today
- One worktree/PR; small diffs (300–600 KB, up to ~1 MB when needed); push via `push_with_codex.sh` to auto-request @codex review; Mergify merges on codex-approved.
- Manual gap: Codex review comments (P0/P1/P2) are copy/pasted by hand into the next agent run. Comment harvesting/watcher is being planned.
- Branch_state tracking: each imported client/repo has a state file to sequence PRs.

## MVP scope (must-haves)
- Reliable Codex feedback ingestion: fetch Codex inline comments per PR into local files; agents fix P0/P1 from that file before spawning next PR.
- Worktree hygiene enforced: one worktree per PR; cleanup helper + SOPs.
- Merge automation: codex-approved + Mergify rules; lenient on P1/P2 for pure imports, strict on P0.
- Simple metrics: time from PR open→merge, human interventions, review rounds.

## Pricing ideas
- By issue/diff; by token/quota percentage; or flat tiers per repo size. Start simple with size tiers + per-issue add-ons.

## Risks/gaps
- Missing auto-harvest of Codex comments (manual today).
- Need guardrails so only one PR per repo at a time to avoid conflicts.
- Need opt-in post-push fetch/watcher to close the loop without human copy/paste.
