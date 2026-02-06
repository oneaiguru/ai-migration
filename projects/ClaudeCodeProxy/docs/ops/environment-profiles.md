# Environment Profiles (prod vs dev)

To avoid colliding with production usage while developing locally, we now support two profiles:

| Profile | Wrapper | Env script | Default port | Logs | License dir |
|---------|---------|------------|--------------|------|-------------|
| `prod`  | `bin/ccp` | `source scripts/env/prod.sh` | 8082 | `logs/prod` | `~/.config/ccp` |
| `dev`   | `bin/ccc` | `source scripts/env/dev.sh`  | 8182 | `logs/dev`  | `~/.config/ccc` |

## Quick usage

```bash
# Production shell
source scripts/env/prod.sh
bin/cc license status

# Development shell (uses mock issuer, alternate ports, isolated logs)
source scripts/env/dev.sh
bin/ccc license login --issuer http://127.0.0.1:8787 --no-browser
```
Tip: run `./scripts/install-shell-aliases.sh` once to install the aliases. After that, `ccc-on` writes `~/.config/ccc/env`, which your shell auto-sources on every launch (no per-tab setup needed).

Each script exports:
- `CCP_PROFILE` – active profile name (`prod` or `dev`).
- `CCP_LOGS_DIR`, `CCP_RESULTS_DIR`, `CCP_LICENSE_DIR` – per-profile paths.
- `CCP_PORT_DEFAULT` – default port used by `scripts/go-env.sh` and other helpers.

All logs (`usage.jsonl`, `mitm.pid`, etc.) and results now live under the profile-specific directories. The CLI (`bin/cc`) detects the profile automatically from these environment variables.

> Tip: add the wrappers to your `$PATH` so you can invoke `ccp` and `ccc` directly.

## Mixing and matching

- Wrappers set sensible defaults. If you need custom paths, export `CCP_LOGS_DIR` (and friends) before calling `bin/cc`/`ccc`.
- Scripts such as `make smoke-license` honour the same environment variables, so you can run the smoke tests against dev or prod simply by switching profiles.
- `scripts/go-env.sh` now respects `CCP_PORT_DEFAULT`; profile scripts set this to 8082 (prod) or 8182 (dev).

Remember to keep one profile per terminal to avoid cross-contamination.
