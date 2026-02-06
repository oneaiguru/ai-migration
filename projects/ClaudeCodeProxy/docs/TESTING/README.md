This directory tracks **golden fixtures** and **contains‑based** checks for endpoints:

* `/metrics` — text exposition; use **contains** checks to avoid brittle whitespace diffs.
* `/readyz` — JSON shape & semantics.
* `/v1/usage` — percent flags and window metadata (from QUOTAS).
* `logs/usage.jsonl` — sample lines matching `docs/METRICS-SCHEMA.md`.

Run locally:

* `./scripts/dev/check-fixtures.sh` (metrics)
* Curl the others and compare against `testdata/…/expected_*.json`.

---

## Why this set (and how it ties to your tree)

* **Endpoints**: You already expose `/metrics` and `/readyz` and document how to probe them (OPS‑GUIDE §4). The fixtures let us add stable, fast tests without real API calls.
* **Usage/Quotas**: The shapes line up with the R2 QUOTAS doc and your new `quotas_test.go` loaders/warn‑block logic (we only assert *intentional* fields).
* **License harness**: Complements existing licensing docs + testdata in the repo (ADRs, API, trial JSON+SIG), but keeps secrets out of VCS.

---

## How the next agent should wire these into CI

1. Add `go test ./services/go-anth-shim/...` to pick up the new `*_test.go` files.
2. Include `./scripts/dev/check-fixtures.sh` in a lightweight job that starts the shim and scrapes `/metrics`.
3. For license smoke, run `./docs/LICENSING/harness/smoke.sh` (no network; uses placeholder pack).
4. Record outputs under `results/` as usual and append steps to `docs/SESSION_HANDOFF.md`.

---

### Anything else likely needed for R3

* **providers.yaml test fixtures** (when you re‑enable catalog): drop `configs/providers.example.yaml` variants that cover “missing key env”, “alt baseURL”, and “disabled lane”, so routing tests can be table‑driven. Your tree already contains an example to build from.
* **policy/packs sanity**: add a `docs/LICENSING/policy/README.md` that points to your existing policy‑pack docs; if you later toggle routing via signed policy, we can reuse the same harness pattern.

If you want, I can also produce a **tiny `providers.yaml` matrix** and a **ready‑made `metrics_test.go` variant** that asserts fallback lines when a mocked 429 is injected—just say “add the 429 matrix” and I’ll append those files.