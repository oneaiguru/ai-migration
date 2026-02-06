# JOINT UAT Pattern (10‑Minute Smoke)

Purpose: minimally validate integration surfaces and produce evidence files.

Steps (generic)
1) Start local service(s) — e.g., shim on :8082
2) Generate small usage (2–3 calls)
3) Snapshots: `/v1/usage` → usage.json; `/metrics` → metrics.prom
4) Ingest/adapter step (no content upload): produce summary.json
5) Record in CHAT.md and index paths in ARTIFACT_INDEX.md

Evidence
- Store under `artifacts/test_runs/UAT/`

Notes
- Keep this fast and offline‑capable; deeper tests live in each repo.

