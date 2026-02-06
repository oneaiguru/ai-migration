# CCC ↔ AgentOS Integration Draft

Purpose: outline how ClaudeCodeProxy (CCC) can interoperate with the AgentOS automation stack.

## Model Alignment
- AgentOS today compares multiple providers (Codex, Claude). To add our stack:
  - Treat **Anthropic Sonnet** as the baseline premium lane.
  - Treat **GLM via Z.AI** as the cost-optimized subagent lane (replacing Haiku trials).
- Expose routing toggles via shared environment variables so AgentOS scripts can swap lanes without editing CCC internals.

## Integration Hooks
1. **CLI wrappers** (`bin/ccp`, `bin/ccc`) become callable from AgentOS sessions (e.g., their SOPs reference `ccp` for prod runs).
2. **Telemetry**: forward CCC usage logs (`logs/*/usage.jsonl`) into AgentOS reporting via the existing churn collector.
3. **Prompts**: import CE Magic Prompts (see `docs/System/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md`) so both projects share the same prompt catalog.
4. **Task orchestration**: keep CCC’s long-session methodology in sync with AgentOS runbooks (`docs/System/methodologies/long-session.md`).

## Next Steps
- Define a shared config schema (env vars + YAML) so AgentOS windows can choose Sonnet vs GLM lanes programmatically.
- Add cross-references in AgentOS docs pointing back to CCC’s SOPs and System notes.
- Once the thinking-sanitizer ships, expose its toggles to AgentOS for safer mixed-provider sessions.
