Title
SOP — Expanding Routing (Providers, Models, Tests)

Purpose
- Define a repeatable way to add new upstream providers and model routes to the CCP shim while keeping community (Anth-only) and licensed (feature‑gated) modes simple and safe.

Definitions
- Provider: Upstream API (Anthropic, Z.AI, …) identified by base URL + auth mode.
- Lane: Internal routing target for a request (e.g., `anthropic`, `zai`).
- Header mode: How credentials are passed (`authorization: Bearer …` or `x-api-key: …`).
- Policy: Optional signed config controlling which models route to which lanes and what features are enabled.

Prereqs
- Working CCP shim (`services/go-anth-shim/cmd/ccp`) and tests green (`make ci-fw0`).
- Z.AI key in `.env` (for licensed Z.AI flows). For new providers, decide on credential env(s) up front.
- CLI login (`claude /login`) for Anthropic; no `ANTHROPIC_AUTH_TOKEN` needed in typical CLI runs.

Procedure — Add a provider + model route
1) Model intent and lane mapping
   - Decide which models should route to the new provider (e.g., `glm-4-air` or a Haiku subagent variant).
   - In code (`cmd/ccp/main.go`), extend the `decideLane(model)` logic or the policy‑based mapping so the new model(s) select a new lane name (e.g., `acme`).

2) Provider wiring
   - Add a client for the provider: base URL, JSON and streaming clients, timeouts.
   - Decide `header_mode` (`authorization` vs `x-api-key`) and the env var name (e.g., `ACME_API_KEY`).
   - Normalize request headers on that lane:
     - Remove foreign provider headers.
     - Set credential header according to `header_mode`.
     - For interactive CLI stability: set `Accept-Encoding: identity` to avoid gzip issues in terminal UIs.

3) Licensing / feature gates (optional)
   - Gate the new lane behind a license feature (e.g., `acme_offload`).
   - The shim should emit a `decision:"license_block"` record and route to Anth in community mode.
   - Expose a trial pack path via `scripts/dev/dev-license-activate.sh` so local licensed checks are one‑command.

4) Tests
   - Unit: add or adjust tests under `services/go-anth-shim` to cover routing decisions and header normalization.
   - Local CI (no GH):
     - Community pass‑through: `make ci-fw1` (asserts `lane:"anthropic"`).
     - Licensed smoke for the new lane: model → lane with `status:200`.
     - Mixed routing: one success line per lane.

5) UAT scripts
   - Add a `scripts/uat/run_<lane>.sh` patterned after `run_haiku_zai.sh` to prove the new provider with `claude -p`.
   - If the lane should be used by a specific model prefix, include that in the CLI call (e.g., `--model glm-4-air`).

6) Observability
   - Verify `logs/prod/usage.jsonl` shows the expected `lane`, `status`, `header_mode`, and `upstream`.
   - Confirm counters on `/metrics` (e.g., `ccp_requests_total{lane="acme"}`) increment.

7) Docs
   - Update README (credentials + community/licensed notes).
   - Update this SOP and `docs/SOP/HAIKU_ROUTING_CHECK.md` with the new lane’s quick‑start.
   - Add provider notes to the wiki (commands, troubleshooting, expected logs).

Verification — copy/paste
- Community (Anth-only):
  ```bash
  unset CC_LICENSE_JSON CC_LICENSE_SIG CCP_LICENSE_PUBKEY_B64 ZAI_HEADER_MODE
  export FORCE_HAIKU_TO_ZAI=0
  make go-proxy && source scripts/go-env.sh 8082
  timeout 60 claude -p --model claude-sonnet-4-5-20250929 "Say hi" --output-format json
  rg '"lane":"anthropic"' logs/prod/usage.jsonl | tail -n 1
  ```

- Licensed (new lane):
  ```bash
  scripts/dev/dev-license-activate.sh && source logs/dev-license/exports.sh
  make go-proxy && source scripts/go-env.sh 8082
  timeout 60 env ANTHROPIC_BASE_URL=http://127.0.0.1:8082 \
    claude -p --model <your-model> "Say hi" --output-format json
  rg '"lane":"<new_lane>".*"status":200' logs/prod/usage.jsonl | tail -n 1
  ```

Rollback
- Remove the lane mapping and clients; revert docs and scripts.
- Validate community smoke still passes (`make ci-fw1`).

Appendix — Tips
- Keep lane names short and stable; match them in metrics and UAT scripts.
- Prefer env-driven credentials and document the exact env var names.
- For interactive CLI stability, normalize `Accept-Encoding` to `identity` on non‑Anth lanes.

