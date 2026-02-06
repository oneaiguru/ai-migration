# Routing Policy

Order of precedence:

1) **Manual override** — if `~/.config/ccp/model` (or `CCP_MODEL`) is set, route to that model. Decision event includes `decision:"manual_override"`.
2) **Catalog** — consult `providers.yaml` to map model → provider lane (`anth`/`zai`/...). If unknown, fall back and log `decision:"fallback_catalog_miss"`.
3) **Heuristics (optional)** — start small for scans/greps; escalate on repeated failure or loop signal.

**Budget guard** (R2): respect `x-cc-max-tokens-task`; return `429 budget_exhausted` with suggested escalation target.

**Quota guard** (R3): run to the real provider limit once; if a 429 is observed, fall back to Anthropic, log `quota_overshoot`, and honor a cooldown before retrying the primary lane (`CCP_QUOTA_COOLDOWN`, default 5m).

**Invariants**:

- No body logs.
- SSE preserved (no buffering).
- Header isolation (Z.AI keys never appear on Anth lane).

## Provider catalog schema (configs/providers.yaml)

Each provider entry accepts:

- `key_env` — environment variable containing the API key (legacy field).
- `scoped_env` — optional map of profile → env var; falls back to `key_env` when present.
- `base_url` — upstream base URL.
- `header_mode` — `authorization` (Bearer) or `x-api-key`.
- `via` — optional shim (`openrouter`, `ollama`, etc.).
- `model_map` / `models` — rename or whitelist models per provider lane.
- `notes` — free-form operator notes.

Routes map glob patterns → provider name (and optional `cost_limit`). The CLI (`cc providers`) now prints both providers and routes in a table.
