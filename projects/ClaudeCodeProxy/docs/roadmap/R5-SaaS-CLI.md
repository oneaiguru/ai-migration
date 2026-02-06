Title
R5 — Pure SaaS for CLI Tools (Licensing + Ingest + Billing)

Intent
- Convert the R5 track into a focused SaaS offering for developers using CLI tools (Claude Code, CC CLI, others) backed by a hosted control plane (licensing, policy, ingest, dashboards, billing).
- Keep local (community) mode viable for offline/dev, but make the paid path turnkey and hosted.

Top Outcomes
- Developers pay for a tool (CLI agent + plugin) and get license‑gated features (e.g., Z.ai offload, advanced analytics) with zero local ops.
- Organization admins manage seats and policies centrally; billing is automated.
- Usage aggregation and rollups happen in the cloud; local CCP stays optional.

Scope (MVP → Beta → GA)
1) MVP (2–3 weeks)
   - Identity + license:
     - Email/device login + OAuth device flow.
     - Issue signed license packs with entitlements (features, privacy tier, seat count, expiry).
   - Ingest (Minimized):
     - Hosted endpoint for /v1/usage rollups (hour/day) + model health; per‑seat auth via license pack.
   - Billing (Polar first):
     - Polar paywall for projects/repos; pledge/checkout → webhook → license activation.
     - Seat mapping by GitHub handle or email; license entitlements updated on webhook.
     - Stripe remains a fallback/alt for non‑Polar flows (see backlog ticket).
   - CLI experience:
     - ccp login; ccp status; ccp plan; ccp upgrade.
     - Auto‑attach license/entitlements to CLI sessions (no manual tokens).
   - Operator portal (very thin):
     - Team seats, plan, last sync, license features, quick links.

2) Beta (2–3 weeks)
   - Dashboards:
     - Per‑model health, TTFT quantiles, lane split, hourly/day rollups; CSV export.
   - Privacy tiers:
     - Local‑only (no upload), Minimized (rollups only), Full (events with redaction).
   - Policy packs:
     - Hosted policy distribution + signature; dev/prod channels; hot reload; cache fallback.
   - Org admin features:
     - Seat invites, SSO/SAML stub, audit log.

3) GA (2–3 weeks)
   - IDE thin extension (VS Code): approve steps, show diffs, commit.
   - GitHub reviewer bot: check + comments; simple policy integration.
   - Slack: /ccp run and progress updates.
   - Packaging/signing: brew/winget/deb; macOS notarize; Windows signtool.
   - Billing GA: Polar primary; Stripe alt path in reserve.

System Architecture (hosted)
- Auth: OAuth device flow → SaaS session → issue license pack (Ed25519 signed JWT-ish) bound to device/user/org.
- Licensing: license service issues/refreshes packs and validates billing state; exposes entitlement API.
- Ingest: HTTPS endpoint receives rollups (hour/day), TTFT percentiles, minimal counters; keyed by license/org.
- Dashboards: server‑rendered JSON + static charts for low‑ops MVP; later SPA.
   - Billing: Polar (primary) → license state changes via webhook; Stripe alt path kept simple.

APIs (MVP)
- POST /v1/license/issue (device login flow)
- GET  /v1/license/status (current entitlements)
- POST /v1/ingest/rollups (hour/day blocks)
- GET  /v1/dash/models (model health snapshot)
- Webhooks: /billing/stripe

CLI UX (MVP)
- ccp login → opens device flow; persists pack under ~/.config/ccp/license.pack
- ccp status → shows plan, features, expiry, ingest last sync
- ccp plan/upgrade → opens Polar checkout/paywall
- ccp export rollups → sends local rollups to SaaS (Minimized)

Security & Privacy
- Tiers: Local‑only (default community), Minimized (paid default), Full (opt‑in; redaction applied).
- License feature gates (zai_offload, dashboards, reviewer bot) enforced server‑side and client‑side.
- Device bound license; revocation honored on next sync.

Data Model
- Keep R4 rollups shape for ingest; add org/seat/license metadata server‑side.
- Persist hourly/day rollups + TTFT p50/p90/p99; compute dashboards from rollups.

Pricing (initial)
- Solo: $29/seat/mo (Minimized), $49 (Full)
- Team: volume tiers; trials 7–14 days.

Risks
- Auth friction for CLI; mitigate with device flow and good copy.
- Over‑scope IDE/bot before billing stabilizes; keep them Beta until revenue.
- Privacy posture: ensure Minimized default; Full requires explicit consent.

Rollout Plan
- Week 1–3: MVP backend + CLI, Stripe, license packs, ingest; private Beta with 3 friendly teams.
- Week 4–6: Dashboards + policy packs; onboard first paid seats; improve copy & UX.
- Week 7–9: IDE/bot Beta, packaging/signing; tighten support + docs.

Success Metrics
- ≥10 paying teams in 6–8 weeks; churn < 10% in first 60 days.
- ≥80% of sessions sync Minimized rollups daily.
