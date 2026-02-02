# Environment Fix TODO

## Current Issues Identified
- `.bash_profile` auto-runs Playwright proxy config (`~/.playwright_proxy_env`) → sets `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY` to `socks5://127.0.0.1:1080` (causes npm/git to fail).
- Duplicate `JAVA_HOME` exports referencing `/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home` (shell prints “is a directory”).
- `npm install` within `employee-management` times out; likely due to proxy or missing clean PATH.
- Node 20.x required by `package.json`; confirm via `node --version` after sourcing the profile.

## Action Plan
1. Inspect `~/.playwright_proxy_env`; comment/remove proxy exports when working locally (restore afterwards if needed).
2. Clean `.bash_profile`:
   - Keep single `JAVA_HOME=/opt/homebrew/opt/openjdk@21` line with quotes if necessary.
   - Ensure `PATH` additions don’t repeat.
3. After edits, `source ~/.bash_profile` or open new shell.
4. Re-run tooling checks in the parity repo:
   ```bash
   cd ~/git/client/employee-management-parity
   npm install
   npm run build
   npm run test -- --reporter=list --project=chromium --workers=1
   # Run preview only if explicitly requested:
   # npm run preview -- --host 127.0.0.1 --port 4174
   ```
5. Document results back in `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` (Environment Fix phase).

## Execution Log (2025-10-06)
- Updated `~/.bash_profile` to drop the faulty command substitution, keep a single
  `export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"`, and guard
  the Playwright proxy sourcing with `PLAYWRIGHT_PROXY_ENABLE`.
- Confirmed `~/.playwright_proxy_env` remains for future runs; proxies now disabled by default.
- Cleared any lingering proxy environment variables and re-sourced the profile.
- `npm install` — success (222 packages added, 0 vulnerabilities).
- `npm run build` — success (Vite output under `dist/`).
- `npm run preview -- --host 127.0.0.1 --port 4173` — local server started; terminated by `timeout` after
  printing the URL (expected 124 exit).
- Future runs should target `~/git/client/employee-management-parity` (Node 20.x); follow the command block above and only start preview on request.
