# Long Session Methodology

This summarizes the approved long-session workflow captured in `docs/HANDOFF-LONG-SESSION.md`.

## Phases
1. **Automation pack** – ledger checkpoints, automation scripts, anomaly surfacing.
2. **Parallel agents** – isolate state via `AGENT_ID`, separate trackers, and schedule coordination.
3. **Subagent telemetry** – ingest proxy telemetry, compare costs across providers.

Each phase is independently shippable; follow the detailed tasks in the handoff doc for implementation specifics.

## Acceptance Gates
- Automation smoke tests green (`behave` scenarios, tracker preview anomalies line).
- Parallel agents verified via dual-agent behave scenario.
- Telemetry ingestion produces `proxy_telemetry.jsonl` with summarised stats in preview.

## Artifacts
- `docs/HANDOFF-LONG-SESSION.md` – canonical step list.
- `docs/Tasks/license_ux_discovery.md` / `docs/ops/license-ux-plan.md` – supporting design documents.

## Next Steps
- Once executed, capture outcomes in `docs/SESSION_HANDOFF.md` and archive key metrics in `results/`.
- Fold lessons learned back into SOPs or System docs as necessary.
