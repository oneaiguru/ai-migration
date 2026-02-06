# R3 Calibration Sampler

Covers the quota calibration loop (warn_pct_auto, confidence, gap fields).

## Unit checks
- `go test ./services/go-anth-shim/cmd/ccp -run DecisionInfoReflectsCalibration`
- `go test ./services/go-anth-shim/cmd/ccp -run CalibrationSamplerUpdatesConfidence`

## Expected assertions
- `decisionInfo` surfaces `warn_pct_auto`, `warn_pct_confidence`, and gap statistics from calibration state.
- `runCalibrationTick` raises `warn_pct_confidence` when sufficient samples exist.
- `noteQuota429` increments `gap_samples`; reflected in `/v1/usage`.

## Manual spot check
```
source scripts/env/dev.sh
CCP_REROUTE_MODE=hybrid ./services/go-anth-shim/bin/ccp serve --port 8082 &
curl -s :8082/v1/dev/sim-usage -H 'content-type: application/json' \
  -d '{"model":"claude-haiku-4.5","in":120,"out":80,"repeat":4}'
curl -s :8082/v1/usage | jq '.models["claude-haiku-4.5"] | {warn_pct_auto,warn_pct_confidence,gap_seconds_p50,gap_samples}'
```
