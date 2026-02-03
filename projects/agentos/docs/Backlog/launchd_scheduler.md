# Launchd Scheduler (status/ccusage)

## 🎯 Why Now
Remove Keyboard Maestro dependency; schedule status + ccusage captures natively.

## 🔗 Contracts
- Depends: codex_status.sh, ccusage CLI
- Emits: logs under data/automation/

## 🧭 Diagram (ASCII)

[launchd] -> (timer) -> codex_status.sh -> logs
[launchd] -> (timer) -> ccusage-codex --json -> fixtures

## ✅ Acceptance
- Sample plist loads/unloads; dry-run logs produced.
- Scheduler is opt-in: docs explain how to disable or avoid running on non-mac environments.

## ⏱ Token Budget
~10K

## 🛠 Steps
1) example.plist files + docs
2) Wrapper to install/uninstall
