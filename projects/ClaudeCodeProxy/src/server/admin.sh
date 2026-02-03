#!/bin/bash
# Claude Code Proxy - Admin Script

# Load configuration
CONFIG_FILE="$HOME/.claude_proxy_config"
if [ -f "$CONFIG_FILE" ]; then
  # shellcheck disable=SC1090
  source "$CONFIG_FILE"
fi

if [ -z "$CLAUDE_CODE_PROXY_URL" ] || [ -z "$CLAUDE_CODE_AUTH_TOKEN" ]; then
  echo "Set CLAUDE_CODE_PROXY_URL and CLAUDE_CODE_AUTH_TOKEN in $CONFIG_FILE or env before running." >&2
  exit 1
fi

# Functions
show_help() {
  echo "Claude Code Proxy - Admin Management"
  echo ""
  echo "Usage: $0 [command] [options]"
  echo ""
  echo "Commands:"
  echo "  list                          List all users"
  echo "  add <username> [api_key]      Add a new user"
  echo "  help                          Show this help message"
  echo ""
  exit 0
}

list_users() {
  echo "Fetching users..."
  curl -s -X GET "$CLAUDE_CODE_PROXY_URL/admin/users" \
    -H "x-auth-token: $CLAUDE_CODE_AUTH_TOKEN"
}

add_user() {
  if [ -z "$1" ]; then
    echo "Error: Username is required"
    exit 1
  fi
  
  USERNAME="$1"
  API_KEY="${2:-}"
  
  echo "Creating user $USERNAME..."
  curl -s -X POST "$CLAUDE_CODE_PROXY_URL/admin/users" \
    -H "x-auth-token: $CLAUDE_CODE_AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$USERNAME\", \"anthropicApiKey\": \"$API_KEY\"}"
}

# Process commands
COMMAND="${1:-help}"
shift || true

case "$COMMAND" in
  list)
    list_users
    ;;
  add)
    add_user "$@"
    ;;
  help|*)
    show_help
    ;;
esac
