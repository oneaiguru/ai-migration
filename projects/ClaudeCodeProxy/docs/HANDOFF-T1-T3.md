# Handoff: Run T1–T3 Exactly

This is the only doc the next agent needs to run P0 smoke (T1–T3). It points to the canonical runbook you will follow step‑by‑step.

- Primary runbook: `docs/mitm-subagent-offload/DO-THIS-EXACTLY-T1-T3.md`
- PRD for scope: `docs/mitm-subagent-offload/02-PRD-SUBAGENT-OFFLOAD.md`
- Addon spec: `docs/mitm-subagent-offload/05-MITM-ADDON-SPEC.md`

## Quick Start (summary)

1) Prep
- `make setup && make versions`
- `export ZAI_API_KEY=sk-…`
- `make mitm`

2) Start lanes in two terminals
- `make sub`  (subscription; login once if prompted)
- `ZAI_API_KEY=… make zai`  (Z.AI; check `/status`)

3) Execute T1–T3
- Follow the exact commands from the runbook file above.
- Watch `make logs` for JSONL entries; copy relevant lines into:
  - `results/TESTS.md`
  - `docs/SESSION_HANDOFF.md`

## Notes
- For P0, we temporarily allow `FORCE_HAIKU_TO_ZAI=1` for T1 so Haiku probes always exercise the Z.AI lane.
- If Z.AI returns 401, set `ZAI_HEADER_MODE=authorization` and retry once.
- If HTTP/2 causes issues, set `MITM_FORCE_H1=1` before `make mitm`.

## Next Steps After T1–T3
- Capture a real subagent payload using the debug snippet in the runbook, then update the addon’s subagent detector and re‑run T1–T2 without `FORCE_HAIKU_TO_ZAI`.

## Long Session (optional)
- If asked to run a long session, enable trace mode (`claude -c`) and, optionally, the trace watcher prototype. Record metrics and anomalies.

That’s it. Start from the runbook and fill in the two results files as you go.
