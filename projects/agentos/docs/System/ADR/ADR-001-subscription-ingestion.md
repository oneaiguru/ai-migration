# ADR-001 — Subscription-only Ingestion (No API Gateways)

- **Status:** Proposed (2025-11-05)
- **Context:** PRD v1.6 restricts the optimizer to subscription-mode usage; archival notes confirm LiteLLM/API integrations are superseded.
- **Decision:** All telemetry comes from local CLI meters and traces. Do not integrate API gateways (LiteLLM, Portkey, Helicone, etc.).
- **Rationale:** Subscription plans expose different capacity units (bars/prompts) than API pricing and keep operations offline/simple.
- **Implications:**
  - Maintain robust parsers and minimal readers for Codex `/status`, Claude `/usage`, and ccusage outputs.
  - Persist data as append-only JSONL (`snapshots.jsonl`, `glm_counts.jsonl`, `windows.jsonl`).
  - Any new tooling must align with subscription bars; API integrations require a future ADR before implementation.
