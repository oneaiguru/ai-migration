# ClaudeCodeProxy
- What: Proxy for Claude Code/Chat with multi-user auth, quotas, logging, and admin tooling; ships a Node gateway plus a Go shim for Anthropic/Z.ai lanes.
- PR plan: 7 slices ≤1MB (01 scaffold+configs, 02 node server+admin/bin, 03 scripts/tooling, 04 go shim services, 05 artifacts+archive+fixtures/results, 06 main docs, 07 cc docs/remaining notes).
- Setup: Node 18+ and Go (for the shim). Copy config seeds from `configs/*.example` as needed; `.env` can hold `DEFAULT_ANTHROPIC_API_KEY` or `ZAI_API_KEY`.
- Run (Node proxy): `npm ci --prefix src/server` then `DEFAULT_ANTHROPIC_API_KEY=... npm start --prefix src/server`.
- Go shim (lands in PR04): `make go-proxy` or `GO111MODULE=on go build -o services/go-anth-shim/bin/ccp ./cmd/ccp`; `source scripts/go-env.sh <port>` exports shim vars.
- Logs/results: default to `logs/` and `results/` (ignored). Override via `CCP_LOGS_DIR` / `CCP_RESULTS_DIR`. Makefile provides helpers (logs, summarize, repo-map, go-test) once later slices land.
- Repo SOP: follow `docs/ClaudeCodeProxy_Agent_SOP.md` (root) for PR naming (`import:claudecodeproxy:NN-<scope>` / `docs:claudecodeproxy:<scope>`), branch_state updates, and the standard Codex status comment after fixes.

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
