#!/usr/bin/env bash

# run.sh - Unified TaskFlow runner
# Usage: ./tools/run.sh <component> [args]
# Components:
#   bot       - run Telegram bot
#   server    - run FastAPI web server
#   webui     - run results viewer
#   cli       - run task CLI

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$REPO_ROOT"

component="${1:-}"
if [[ -z "$component" ]]; then
    echo "Usage: $0 {bot|server|webui|cli} [args]"
    exit 1
fi
shift || true

PYTHONPATH="$REPO_ROOT:$PYTHONPATH"

case "$component" in
    bot)
        exec python bot/bot.py "$@"
        ;;
    server)
        exec python web_server.py "$@"
        ;;
    webui)
        exec python webui/results_viewer.py "$@"
        ;;
    cli)
        exec python cli/task_cli.py "$@"
        ;;
    *)
        echo "Unknown component: $component"
        echo "Usage: $0 {bot|server|webui|cli} [args]"
        exit 1
        ;;
esac
