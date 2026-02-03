# Claude Code Integration Guide

This document summarizes how to install, configure, and use Anthropic's Claude Code within TaskFlow.

## System Requirements
- macOS 10.15+, Ubuntu 20.04+/Debian 10+, or Windows via WSL
- Node.js 18+ and git 2.23+
- Optional tools: GitHub/GitLab CLI for PRs, ripgrep for search
- 4GB of RAM and an internet connection

## Installation and Authentication
1. Install Node.js 18+.
2. Run `npm install -g @anthropic-ai/claude-code` *(do not use sudo)*.
3. Navigate to your project directory and start the CLI with `claude`.
4. Authenticate using the Anthropic Console, the Claude App Max plan, or an enterprise platform such as AWS Bedrock or Vertex AI.

## Project Initialization
1. Start Claude Code with `claude`.
2. Run a simple command like `summarize this project`.
3. Generate a `CLAUDE.md` guide by running `/init`.
4. Commit the generated file to version control.

## CLI Usage
- **Interactive mode**: `claude`
- **One-shot mode**: `claude -p "query"`
- Input can be piped via `cat file | claude -p "query"`.
- Resume or continue previous sessions with `--resume` or `--continue`.
- Useful flags include `--output-format` (text, json, stream-json), `--verbose`, `--max-turns`, and `--permission-prompt-tool`.

### Slash Commands
`/bug`, `/clear`, `/config`, `/init`, `/review`, `/status`, `/vim`, and more.
Use `#` at the start of a line to quickly store a memory snippet.

### Terminal Tips
- Use `\` + Enter or Option+Enter for line breaks.
- Vim mode is available via `/vim`.

## Settings and Permissions
- Configuration lives in `~/.claude/settings.json` or `.claude/settings.json` within a project.
- Global settings can be changed with `claude config set -g <key> <value>`.
- Permission rules allow or deny tool usage, e.g. `Bash(npm test:*)`.
- Environment variables such as `CLAUDE_CODE_ENABLE_TELEMETRY`, `DISABLE_AUTOUPDATER`, and proxy settings adjust behavior.

## Telemetry (Optional)
Claude Code can export OpenTelemetry metrics by setting variables like `OTEL_METRICS_EXPORTER` and `OTEL_EXPORTER_OTLP_ENDPOINT`. Metrics include session counts, commits, pull requests, and token usage.

Refer to the official Claude Code documentation for full details.
