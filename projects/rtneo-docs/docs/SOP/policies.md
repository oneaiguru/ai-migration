# Engineering Policies (Client Repo)

## Language & Docs
- Client-facing Russian docs updated only at paid milestones.
- Internal docs remain English-only between milestones.

## Data Handling
- Do not commit raw XLSX or sensitive client files.
- Use tiny CSV fixtures under `tests/data/fixtures/`.
- Do not version `deliveries/` or `forecasts/` outputs.

## Secrets & Security
- Store provider tokens locally (e.g., `~/.cdsapirc`, `.env`).
- Never paste secrets into chats or PRs; never commit secrets.

## Determinism & Env
- Set `PYTHONHASHSEED=0`, `TZ=UTC`, `LC_ALL=C.UTF-8`.
- Use Matplotlib Agg backend; set `MPLCONFIGDIR` to a temp dir in CI.

## Output Stability (Golden)
- Baseline scenario must reproduce golden outputs bit-for-bit.
- Golden updates only via a dedicated “golden update” PR with hashes and review.

## Specs & Coverage
- Every behavior has a Spec-ID; spec-sync enforced in CI.
- Coverage: global ≥ 85%; `scripts/ingest_and_forecast.py` ≥ 90%.

## Branch Protection
- All changes via PR; required checks: tests, spec-sync, docs-check, coverage.

