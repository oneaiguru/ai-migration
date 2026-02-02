# Environment Fix TODO

## Current Issues Identified
- `.bash_profile` auto-runs Playwright proxy config (`~/.playwright_proxy_env`) → sets `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY` to `socks5://127.0.0.1:1080` (causes npm/git to fail).
- Duplicate `JAVA_HOME` exports referencing `/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home` (shell prints “is a directory”).
- `npm install` within `employee-management` times out; likely due to proxy or missing clean PATH.

## Action Plan
1. Inspect `~/.playwright_proxy_env`; comment/remove proxy exports when working locally (restore afterwards if needed).
2. Clean `.bash_profile`:
   - Keep single `JAVA_HOME=/opt/homebrew/opt/openjdk@21` line with quotes if necessary.
   - Ensure `PATH` additions don’t repeat.
3. After edits, `source ~/.bash_profile` or open new shell.
4. Re-run tooling checks in project:
   ```bash
   cd ~/git/client/naumen/employee-management
   npm install
   npm run build
   npm run preview
   ```
5. Document results back in `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` (Environment Fix phase).
