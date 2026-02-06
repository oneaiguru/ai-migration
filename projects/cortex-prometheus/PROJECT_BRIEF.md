# Project Brief

## Repo Snapshot
- This repo packages a Prometheus + Cortex monitoring stack with configuration under `config/`, deployment assets in `docker-compose.yml` and `kubernetes/`, and operational scripts in `scripts/` for exporter install, host enrollment, secrets, and verification. Supporting docs live under `docs/`.

## Current Goal
- Build the FleetPulse MVP per `specs/cortexfleet.md`, using this repo as the base and reusing existing monitoring scripts and alert rule patterns where applicable.

## Constraints
- Localhost-only; no external services or real payments.
- Tech stack: Next.js 14 + TypeScript + Tailwind (frontend), Flask + SQLite (backend).
- Keep existing infrastructure assets (`config/`, `kubernetes/`, `docker-compose.yml`, `scripts/`) intact unless a task explicitly requires changes.
- Adapt alert rules from `config/prometheus-rules.yml` and installer logic from `scripts/install_node_exporter.sh` and `scripts/install_windows_exporter.ps1`.
- No destructive commands; prefer additive changes.

## Non-goals
- Production deployment or multi-cluster Cortex work.
- SSO/SAML, white-label, or enterprise-only features.
- Replacing existing Prometheus/Cortex configs.

## Success Signals
- FleetPulse app runs locally with signup/login and demo account.
- Seeded vehicles appear on Fleet Overview with mock metrics.
- Alerts list renders and acknowledgement flow works.
- Pricing/checkout flow works (mocked) and plan limits update.
