Title
Local Routing QA — Community + Licensed (FW0–FW3)

Goal

- Prove community (Anth-only) and licensed (Haiku→Z.ai) flows work via the Claude CLI.
- Verify both non-interactive (-p) and interactive (/model) sequences.
- Capture any licensing/routing issues in docs/BUGLOG.md with trace links.

Repo/branch

- Repo: /Users/m/git/tools/ClaudeCodeProxy
- Branch: master (HEAD)

Prep (once)

- Ensure Claude CLI is logged in (claude /login).
- Confirm Z.AI key in .env if running licensed checks.

Baseline sanity

- Build + tests
    - make ci-fw0
    - Pass if Go tests are green.

FW1 — Community pass-through smoke (Anth-only)

- Environment (no license)
    - unset CC_LICENSE_JSON CC_LICENSE_SIG CCP_LICENSE_PUBKEY_B64 ZAI_HEADER_MODE
- Run
    - make ci-fw1
- Acceptance
    - CLI prints {"result":"ok"...}
    - logs/prod/usage.jsonl contains lane:"anthropic", status:200 (ccp-logs to view)

FW2 — Licensed Z.ai smoke (Haiku→Z.ai)

- Provision + env
    - scripts/dev/dev-license-activate.sh
    - source logs/dev-license/exports.sh
- Run
    - make ci-fw2
- Acceptance
    - CLI prints {"result":"ok"...}
    - logs/prod/usage.jsonl contains lane:"zai", status:200, header_mode:"authorization"

FW3 — Mixed routing (licensed: Haiku→Z.ai then Sonnet→Anth)

- Env (licensed still active)
    - source logs/dev-license/exports.sh
- Run
    - make ci-fw3
- Acceptance
    - One lane:"zai" 200 and one lane:"anthropic" 200 present in logs (back-to-back)

Interactive checks (human spot test)

- Licensed, start shim and env
    - make go-proxy && source scripts/go-env.sh 8082
- Sequence 1 (Sonnet → Anth)
    - claude
    - > /model claude-sonnet-4-5-20250929
    - > say hi
    - Expect Anth lane in logs: lane:"anthropic", status:200
- Sequence 2 (switch to Haiku → Z.ai)
    - > /model claude-haiku-4-5-20251001
    - > say hi
    - Expect Z.ai lane in logs: lane:"zai", status:200, header_mode:"authorization"
- Note
    - The shim normalizes Accept-Encoding: identity on Z.ai so the interactive CLI won’t crash on gzip.

One-line probes (optional, non-interactive)

- Licensed (Haiku → Z.ai)
    - timeout 60 env ANTHROPIC_BASE_URL=http://127.0.0.1:8082 claude -p --model claude-haiku-4-5-20251001 "Say hi" --output-format json
- Anth-only (community)
    - timeout 60 claude -p --model claude-sonnet-4-5-20250929 "Say hi" --output-format json
- Mixed in one go
    - timeout 60 claude -p --model claude-haiku-4-5-20251001 "Say hi" --output-format json
    - timeout 60 claude -p -c --model claude-sonnet-4-5-20250929 "Switch to sonnet" --output-format json

Log viewing

- ccp-logs (alias) tails logs/prod/usage.jsonl
- Decision lines (status:-1) are expected before status:200 entries

Artifacts to check/attach

- logs/prod/usage.jsonl
- logs/prod/ccp.out
- If interactive issues occur: ~/.claude-trace/log-*.{jsonl,html}

Bug logging (licensing/routing)

- File entries in docs/BUGLOG.md with:
    - Timestamp, lane, repro commands, what you expected, what happened
    - Trace paths (CLI .claude-trace files) and the exact log lines (rid and lane)
    - Proposed fix or triage notes
- If it’s a docs gap, update docs/SOP/HAIKU_ROUTING_CHECK.md or ~/wiki/dotfiles/HaikuZaiRouting.md accordingly

Where to look in repo

- SOPs: docs/SOP/HAIKU_ROUTING_CHECK.md, docs/SOP/ROUTING_EXPANSION.md
- Task runbook: docs/Tasks/CI_ROUTING_CHECKS.md
- Helper scripts: scripts/uat/run_haiku_zai.sh, scripts/uat/run_sonnet_anth.sh, scripts/uat/run_haiku_sonnet.sh
- Shim routing: services/go-anth-shim/cmd/ccp/main.go (header normalization + Accept-Encoding)

Notes

- Community mode equals Anth-only: unset license env and FORCE_HAIKU_TO_ZAI=0.
- Licensed mode enables Haiku→Z.ai: run scripts/dev/dev-license-activate.sh and source the exports.
- After any run, pkill -f 'services/go-anth-shim/bin/ccp' || true to quiet logs.

