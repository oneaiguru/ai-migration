Title
R5 — Routing E2E: Commit, Wiki Update, Verification

Objective
- Land the routing stability fixes and documentation with clear commits and a rollback path. Align the external wiki with the exact, tested local steps.

Steps

1) Prep (scout) — done
- Verified FW0–FW3 locally: tests green, Anth-only, Z.ai licensed, and mixed routing all pass.
- Identified intermittent http2 stalls to Z.ai; “force H1” resolves locally (MITM_FORCE_H1=1).
- Confirmed Accept-Encoding normalization prevents interactive gzip/JSON errors.

2) Plan — docs + small code hygiene
- Code: Keep Accept-Encoding: identity on Z.ai lane in `cmd/ccp/main.go`.
- SOP: Add H1 troubleshooting note to Haiku Routing Check.
- Task doc: Add LOCAL_ROUTING_QA with FW0–FW3.
- Wiki: Update `~/wiki/dotfiles/HaikuZaiRouting.md` with exact IDs and steps (license, go-proxy, go-env, -p and interactive, logs, H1 toggle).

3) Execute + verify
- Commit changes with a clear message (done).
- Update wiki (done in this session) with current model IDs and commands.
- Final probe: `timeout 60 env ANTHROPIC_BASE_URL=http://127.0.0.1:8082 claude -p --model claude-haiku-4-5-20251001 "Say ok" --output-format json` → check `lane:"zai"` 200.
- Save an artifact pointer in Progress.

Rollback
- `git log` to locate the routing commit; `git revert <sha>` restores pre-fix behavior.
- Re-run FW1 to ensure Anth-only pass-through remains functional.

