# Logging Retention Controls

The Go shim honours the following environment variables at startup:

| Variable | Default | Description |
|----------|---------|-------------|
| `CCP_LOGS_DIR` | `./logs` | Root directory for usage/anomaly logs, partials, and the policy cache. |
| `CCP_LOG_MAX_BYTES` | `5_242_880` (5 MB) | Rotate `usage.jsonl`/`anomalies.jsonl` when a file exceeds this size. |
| `CCP_LOG_MAX_AGE` | `24h` | Rotate when file age exceeds this duration (accepts seconds or suffixed values like `12h`, `3d`). |
| `CCP_LOG_MAX_FILES` | `5` | Maximum number of rotated files to keep (`usage.jsonl.1`, `usage.jsonl.2`, …). |

Set these values in your profile (`ccc-on` writes them automatically). Example:

```bash
export CCP_LOGS_DIR="$HOME/.cache/ccp/logs/prod"
export CCP_LOG_MAX_BYTES=$((20 * 1024 * 1024))
export CCP_LOG_MAX_FILES=10
```

Rotate manually with `make logs-rotate` or rely on automatic rotation when the configured thresholds are exceeded. The helper honours both `MAX_LOG_BYTES` and `CCP_LOG_MAX_AGE`, skipping rotation when neither trigger is met.

### Partial-output retention

When a streaming response ends abruptly, the shim writes the captured chunks to `logs/partials/<rid>.partial`. Inspect or prune them with:

```bash
./bin/cc partials        # list files
./bin/cc partials clean  # remove all partial dumps
```

## Results directory pruning

The `results/` tree can grow quickly after long sessions. Use the helper to keep only the newest metrics (defaults shown):

```bash
# keep the ten newest METRICS*.json files
make prune-results

# alternate pattern / dry run
bash scripts/prune-results.sh --pattern 'METRICS_go_*.json' --keep 5 --dry-run
```

Override the directory or retention via env vars:

```bash
export CCP_RESULTS_DIR=$HOME/.cache/ccp/results
export RESULTS_MAX_FILES=8
make prune-results
```
