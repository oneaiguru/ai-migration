#!/bin/bash
# Claude Code Proxy - Admin Script

# Load configuration
CONFIG_FILE="$HOME/.claude_proxy_config"
if [ -f "$CONFIG_FILE" ]; then
  source "$CONFIG_FILE"
else
  # Default values if config file doesn't exist
  CLAUDE_CODE_PROXY_URL="http://176.223.142.11:3000"
  CLAUDE_CODE_AUTH_TOKEN="4ff854ea-c0c5-44fc-a8da-42fd0aed8146"
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
