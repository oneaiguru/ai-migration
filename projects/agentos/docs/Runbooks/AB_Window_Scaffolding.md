# A/B Window Scaffolding — Stock vs Offload

Use these one-liners at daily reset. Set `AGENT_ID` per shell to isolate state.

## Stock Claude (Anthropic)

```bash
# BEFORE
claude /usage | PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live ingest claude --window W0-CL-XX --phase before --stdin
# AFTER (≥5 min post close)
claude /usage | PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live ingest claude --window W0-CL-XX --phase after --stdin
# Finalize
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  complete --window W0-CL-XX --claude-features <N> --quality 1.0 \
  --outcome pass --methodology stock_anthropic
# Churn
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  churn --window W0-CL-XX --provider claude --methodology stock_anthropic \
  --commit-start <shaA> --commit-end <shaB>
# Audit & Decision
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  window-audit --window W0-CL-XX --format json | tee logs/W0-CL-XX_window_audit.json
python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CL-XX
```

## Offload (Haiku→GLM‑4.6 via Proxy)

```bash
# Start proxy + env (once per session)
MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 make mitm
source scripts/sub-env.sh 8082

# Work, then ingest telemetry to tracker
< ../ClaudeCodeProxy/logs/usage.jsonl PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live ingest proxy-telemetry --window W0-MITM-XX --stdin

# Finalize
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  complete --window W0-MITM-XX --codex-features <N> --quality 1.0 \
  --outcome pass --methodology mitm_offload
# Churn
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  churn --window W0-MITM-XX --provider codex --methodology mitm_offload \
  --commit-start <shaA> --commit-end <shaB>
# Audit & Decision
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  window-audit --window W0-MITM-XX --format json | tee logs/W0-MITM-XX_window_audit.json
python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-MITM-XX
```

Notes
- Respect +5‑minute AFTER buffer.
- Keep ≥10 pp weekly headroom unless explicitly probing limits (note in window).
- Use `AGENT_ID` per shell; optional `TRACKER_DATA_DIR` for hard separation.

