# Agent Handoffs: Large Tools (agentos + ClaudeCodeProxy variants)

## Agentos
Prompt the agent with:
> Read `/Users/m/git/pilot_agentos_agent.md`. Work in `/Users/m/ai` using the Mergify/Codex flow. Follow the brief’s size/PR plan, update branch_state, use `scripts/dev/push_with_codex.sh` to trigger `@codex review`, fix P0s, defer P1/P2 in the PR body, and verify merge before starting the next PR.

## ClaudeCodeProxy (all variants)
Prompt the agent with:
> Read `/Users/m/git/pilot_claudecodeproxy_agent.md`. Work in `/Users/m/ai` using the Mergify/Codex flow. Follow the 6–10 PR plan (≤1 MB each), split by scope, update branch_state, push and trigger `@codex review`, fix P0s, defer P1/P2 in the PR body, and verify merge before opening the next PR.
