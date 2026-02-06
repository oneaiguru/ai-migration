Title
CLI Startup, Autostart, and Daily Aliases

Purpose
Make starting and using the local proxy (CCP) trivial across reboots and terminals, with one-liner aliases. Only log proof counts.

Prerequisites
- Claude CLI installed and logged in
- Repo cloned at ~/git/tools/ClaudeCodeProxy (adjust if different)

One Clear Command (fresh or after reboot)

bash /Users/m/git/tools/ClaudeCodeProxy/scripts/quick/bootstrap.sh 8082

Install Aliases (first time only)

./scripts/install-shell-aliases.sh

source ~/.zshrc

Tail Logs

ccc-logs

ccc-out-logs

Interactive “Here” Sessions

cz

cz haiku

cz sonnet

Note: you can always switch models interactively with `/model`.

Quick Switch (resume on stock Anthropic)

cz-off

This unsets proxy envs and runs `claude -c` in the current directory, resuming your last conversation without the shim.

One-Liner Startup (check, start, env, then here)

cz-up

Use `cz-up 8182` to use the alternate port if 8082 is busy.

- Behavior: `cz-up` will start the shim if needed, wait up to 5s for `/healthz` to return ok, set the environment for this shell, and then launch Claude in the current directory. If health fails, it exits non‑zero with a hint to try `ccc-restart`.

Autostart on Login (optional)
Use the provided LaunchAgent installer; it gates on health and logs failures.

ccc-startup-enable 8082

- Installs `~/Library/LaunchAgents/com.ccp.shim.plist` that runs `scripts/launch/start-on-login.sh 8082` on login.
- The launcher waits up to 10s for `/healthz`; on failure, it exits non‑zero and writes the last 80 lines of `logs/prod/ccp.out` to `logs/prod/launchctl.err`.
- Disable with `ccc-startup-disable`.

License Activation (if not already activated)

cd /Users/m/git/tools/ClaudeCodeProxy

scripts/dev/dev-license-activate.sh

source logs/dev-license/exports.sh

Restart the proxy after exporting the license.

Verification (“say ok”) — Logs are the proof
From any terminal after startup and license export:

source /Users/m/git/tools/ClaudeCodeProxy/scripts/go-env.sh 8082

timeout 30 env ANTHROPIC_BASE_URL=http://127.0.0.1:8082 claude -p --model claude-haiku-4-5-20251001 "ok" --output-format json

timeout 30 env ANTHROPIC_BASE_URL=http://127.0.0.1:8082 claude -p --model claude-sonnet-4-5-20250929 "ok" --output-format json

Open logs/prod/usage.jsonl and confirm:
- A Z.ai entry (lane:"zai") 200 for Haiku
- An Anth entry (lane:"anthropic") 200 for Sonnet

Also confirm in logs/prod/ccp.out that the license is loaded:
- A line like: `[license] plan=trial features=[zai_offload]`

Troubleshooting
- 502 on Haiku: likely Z.ai HTTP/2 header stall. Keep MITM_FORCE_H1=1 and restart with ccc-restart 8082.
- 404 with model:"haiku": use full model id: claude-haiku-4-5-20251001
- Connection error after reboot: start proxy again with ccc-restart 8082 or enable autostart.
- `ccc-restart` is health‑gated: it fails fast on build/start/health errors and prints the last 80 lines of `logs/prod/ccp.out` for diagnosis.

Wiki Dotfiles Snippet (paste into ~/wiki/dotfiles)

source /Users/m/git/tools/ClaudeCodeProxy/scripts/shell/ccc-aliases.sh

ccc-bootstrap

ccc-haiku-i

ccc-sonnet-i

ccc-ok

ccc-startup-enable 8082
