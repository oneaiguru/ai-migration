# Tooling References for Usage Tracking

This note consolidates definitive sources for the `ccusage` and `claude-monitor` utilities so every agent uses the same guidance.

## ccusage (Claude/Codex Usage Analyzer)
- **Wiki entry:** `~/wiki/dotfiles/tools/ccusage.md`
  - Installation & aliases (`ccusage-codex` → `bunx @ccusage/codex@latest`)
  - Example commands: `daily`, `monthly --json`, `sessions`
- **Shell config:** `~/wiki/dotfiles/ShellConfig.md` lines 148–183 (alias definitions and usage examples)
- **Alias overview:** `~/wiki/dotfiles/AliasSystem.md` lines 50–69 (context in alias catalog)

## claude-monitor (Claude Code Usage Monitor)
- **Wiki entry:** `~/wiki/dotfiles/tools/claude-monitor.md`
  - Install via `uv tool install claude-monitor`
  - Commands: `--view realtime`, `--view daily`, `--view sessions --format json`
- **Tools index:** `~/wiki/dotfiles/tools/Home.md` lists `claude-monitor` as standard utility

## claude-trace Wrapper
- **Wiki entry:** `~/wiki/dotfiles/ClaudeIntegration.md` (primary reference)
  - Aliases (`c`, `o`, `so`, `h`) wrapping `claude-trace claude [--model ...]`
  - Output stored under `.claude-trace/` per project; HTML/JSONL logs
- **Shell config:** `~/wiki/dotfiles/ShellConfig.md` (alias definitions) and `~/wiki/dotfiles/2025-10-16-npm-workspaces-fix.md` (installation notes)
- **Usage tip:** `claude-trace` must wrap all Claude CLI sessions so traces exist for usage analysis and fallback parsing.

Refer to these files for authoritative instructions; they are the single source of truth for using these tools in the tracker workflow.
