Title
Browser Agent — Accounts & Keys for R4 Licensing + Providers

Scope (parallel work while R3 code lands)

• Merchant‑of‑Record (pick: Lemon Squeezy vs Paddle in the separate licensing track). Create sandbox/test accounts; collect webhooks; note retry schedules; validate device‑code/loopback flows.
• Provider accounts: Anthropic, Z.AI, OpenAI Codex, GLM; create API keys (test/dev); record rate‑limit docs.
• Distribution: Apple developer ID & notarytool setup; Windows code‑signing certificate workflow (EV optional); winget publisher registration.

Artifacts to deliver

• A single “Credentials & Webhooks” sheet under `docs/LICENSING/` listing: account IDs, webhook URLs, secret rotation notes, and the earliest date production‑grade signing can be used. (Licensing ADR bundle already exists; keep it the source of truth.)