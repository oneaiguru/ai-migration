# Small Repo Import Status (Mergify + Codex)

Workdir: `/Users/m/ai` · Flow: Mergify/Codex (see `docs/Mergify_Agent_Quickstart.md` and `docs/Small_Tools_Import_Wave.md`). One PR per repo unless split; size 300–600 KB (≤~1 MB if pre-planned). Update `branch_state_<repo>.json`, trigger `@codex review`, fix P0s, defer P1/P2, verify merge before next.

| Repo | Planned PRs | Status | PR # / Branch | Size band | Notes |
| ---- | ----------- | ------ | ------------- | --------- | ----- |
| CodeInterpreterZip2LocalFolder | 1 | planned | | 300–600 KB | |
| GenAICodeUpdater | 1 | planned | | 300–400 KB | Pilot 1 target |
| MyCodeTree2LLM | 1 | planned | | 300–600 KB | |
| MyCodeTree2LLM 2 | 1 | planned | | 300–600 KB | |
| genai-coder | 1 | planned | | 300–600 KB | |
| autotester | 1 | open | PR #27 | ~<1 MB | Seen green check; awaiting codex-approved |
| groq_whisperer | 1 | planned | | 300–600 KB | |
| reference-mcp | 1 | planned | | 300–600 KB | |
| fastwhisper | 1 | done | PR #28 | 300–600 KB | Skip (already handled) |
| scheduler | 1 | planned | | 300–600 KB | Pilot candidate |
| panewiki | 1 | planned | | 600–900 KB | |
| taskflow | 1 | planned | | 600–900 KB | |

Legend: planned | open | in_review | codex-approved | merged | blocked.
