# HANDOFF: Platform Monorepo (Claude plan)

> Location: /Users/m/aa (monorepo root)
> Last Updated: 2026-01-22
> Status: Planning only; no Claude implementation landed yet.

---

## Purpose
Define how to extend the Codex-first Stage 0 implementation to support Claude Code without forking repos.

## Current baseline (Codex)
- Coordinator/worker/contracts are implemented for Codex.
- Stage 0 tests pass; Docker-based smoke/backpressure are blocked by Docker build errors.
- Artifacts standard: /output/runs/<session>/<run>/ with raw.jsonl.gz, meta.json, prompt_snapshot.md.

## Decision
Single repo with provider adapters (no fork). Keep shared coordinator/worker/contracts, swap entrypoints per provider.

## Planned contract changes (doc-only, post-Stage 0)
- Task payload adds `provider` (default "codex"; allow "claude").
- Completion payload renames `codex_thread_id` -> `provider_thread_id` (string|null).
- meta.json uses `provider` plus `provider_thread_id` (or `thread_id`) instead of codex-only names.
- Backward-compat: accept `codex_thread_id` until migration completes.

## Claude entrypoint outline (planned)
- Use a Claude-specific entrypoint or image.
- Mount Claude home state (validate actual path/vars).
- Run prompts from /workspace/PROMPT_${MODE}.md (or PROMPT_FILE override).
- Capture provider JSONL and produce raw.jsonl.gz, meta.json, prompt_snapshot.md, thread_id.txt.
- Enforce banned paths (.claude/** except .claude/skills/**, history/jsonl, logs, traces, prompts, teleport bundles).

## Provider differences to validate
- CLI command for non-interactive run and resume.
- JSONL location and schema for Claude Code runs.
- Best-effort extraction of thread_id from JSONL.
- Auth/home directory variables (CLAUDE_HOME vs ~/.claude).

## Skill extraction alignment
- Codex skills: .codex/skills
- Claude skills: .claude/skills
- Maintain separate frontmatter schemas; do not reuse Codex limits for Claude.

## Next steps after Stage 0 passes
1. Update specs to include provider-agnostic fields and aliases.
2. Add a Claude entrypoint spec and test harness variant.
3. Implement provider selection in the worker and container.
4. Add Claude smoke test coverage.
