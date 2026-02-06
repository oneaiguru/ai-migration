# Demo scripts (dev)

- demo_up.sh — start local API + quick Cloudflare tunnel; print `BASE=<url>`
- demo_down.sh — stop cloudflared and uvicorn
- verify_backend.sh — check `GET /api/metrics` and CORS preflight for a given BASE and UI origin

See docs/SOP/DEMO_RUNBOOK.md for the complete flow including UI deployment.

