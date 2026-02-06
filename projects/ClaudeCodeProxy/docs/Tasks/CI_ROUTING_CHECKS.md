Title
Local CI — Routing Checks (FW0–FW3)

Purpose
- Provide simple, local `make` targets to prove routing without GitHub Actions.
- Keep PR checks fast (tests + community smoke) and defer licensed checks to on‑demand runs.

Paths
- Shim: `services/go-anth-shim/cmd/ccp`
- Logs: `logs/prod/usage.jsonl` (tail with `ccp-logs`)
- Scripts: `scripts/uat/run_haiku_zai.sh`, `scripts/uat/run_sonnet_anth.sh`, `scripts/uat/run_haiku_sonnet.sh`
- SOPs: `docs/SOP/HAIKU_ROUTING_CHECK.md`, wiki `~/wiki/dotfiles/HaikuZaiRouting.md`

Workflows
FW0 — Build + unit tests (PRs)
```bash
make ci-fw0
```

FW1 — Community pass-through smoke (Anth-only; PRs)
```bash
make ci-fw1
# Asserts the Anth lane in logs; Z.ai is disabled in this mode
```

FW2 — Licensed Z.ai smoke (on demand; requires ZAI_API_KEY)
```bash
make ci-fw2
# Proves Haiku → Z.ai; logs show lane:"zai", status:200
```

FW3 — Mixed routing (licensed)
```bash
make ci-fw3
# Haiku → Z.ai then Sonnet → Anth; logs show both lanes
```

Notes
- Anthropic CLI auth is handled by `claude /login`; you don’t need `ANTHROPIC_AUTH_TOKEN`.
- Community mode: unset `CC_LICENSE_JSON CC_LICENSE_SIG CCP_LICENSE_PUBKEY_B64 ZAI_HEADER_MODE`, set `FORCE_HAIKU_TO_ZAI=0`.
- Licensed mode: `scripts/dev/dev-license-activate.sh && source logs/dev-license/exports.sh`.

Acceptance
- FW1: `logs/prod/usage.jsonl` contains at least one `lane:"anthropic"`, status 200.
- FW2: `logs/prod/usage.jsonl` contains at least one `lane:"zai"`, status 200.
- FW3: Both entries appear in the same run.

