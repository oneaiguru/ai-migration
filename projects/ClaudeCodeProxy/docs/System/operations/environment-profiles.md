# Environment Profiles (System Reference)

This document captures the canonical layout for running the project in isolated production (`prod`) and development (`dev`) environments.

## Summary
- **Profiles**: `prod` (live usage), `dev` (local experimentation/mocks).
- **Wrappers**: `bin/ccp` (prod) and `bin/ccc` (dev) set `CCP_PROFILE` and paths.
- **Env scripts**: `scripts/env/prod.sh`, `scripts/env/dev.sh` export log/result/license roots and default ports.
- **Ports**: prod defaults to `8082`, dev defaults to `8182` (override via `CCP_PORT_DEFAULT`).

## Directory Layout
| Profile | Logs | Results | License Dir |
|---------|------|---------|-------------|
| prod    | `logs/prod/` | `results/prod/` | `~/.config/ccp/` |
| dev     | `logs/dev/`  | `results/dev/`  | `~/.config/ccc/` |

Scripts and CLI commands read these via environment variables. Custom paths can be supplied by setting `CCP_LOGS_DIR`, `CCP_RESULTS_DIR`, or `CCP_LICENSE_DIR` before invoking the wrappers.

## Usage Patterns
```bash
# Production shell
source scripts/env/prod.sh
bin/ccp license status

# Development shell
source scripts/env/dev.sh
bin/ccc license login --issuer http://127.0.0.1:8787 --no-browser
```

Always dedicate one terminal per profile to avoid mixing log directories or credentials.

## Related SOP
See `docs/SOP/README.md` → *Proxy alias playbook* and *Environment profile setup* for step-by-step guidance.
