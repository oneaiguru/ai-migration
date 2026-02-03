#!/bin/bash
# Claude Code Proxy - Enhanced Admin Management Script

set -euo pipefail

CONFIG_FILE="${CONFIG_FILE:-$HOME/.claude_proxy_config}"

if [ -f "$CONFIG_FILE" ]; then
  # shellcheck disable=SC1090
  source "$CONFIG_FILE"
fi

if [ -z "${CLAUDE_CODE_PROXY_URL:-}" ] || [ -z "${CLAUDE_CODE_AUTH_TOKEN:-}" ]; then
  echo "Error: set CLAUDE_CODE_PROXY_URL and CLAUDE_CODE_AUTH_TOKEN in $CONFIG_FILE or env." >&2
  exit 1
fi

PROXY_URL="$CLAUDE_CODE_PROXY_URL"
AUTH_TOKEN="$CLAUDE_CODE_AUTH_TOKEN"

show_help() {
  cat <<EOF
Claude Code Proxy - Admin Management

Usage: $0 [command] [options]

Commands:
  list                          List all users
  add <username> [api_key]      Add a new user (prompts for balance)
  update <username> [api_key]   Update user's API key (optionally reset token)
  delete <username>             Delete a user
  balance <username> <amount>   Add funds to user's balance
  usage [username]              Get usage statistics
  help                          Show this help message
EOF
  exit 0
}

die_on_error() {
  local resp="$1"
  local err
  err=$(echo "$resp" | grep -o '"error":"[^"]*"' || true)
  if [ -n "$err" ]; then
    echo "Error: $(echo "$err" | cut -d'\"' -f4)" >&2
    exit 1
  fi
}

list_users() {
  echo "Fetching users..."
  resp=$(curl -s -X GET "$PROXY_URL/admin/users" -H "x-auth-token: $AUTH_TOKEN")
  die_on_error "$resp"
  echo "$resp" | jq '.'
}

add_user() {
  if [ -z "${1:-}" ]; then
    echo "Error: Username is required" >&2
    exit 1
  fi
  local username="$1"
  local api_key="${2:-}"
  read -p "Initial balance ($50 minimum): " balance
  if ! [[ "$balance" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
    echo "Error: Balance must be a number" >&2
    exit 1
  fi
  if (( $(echo "$balance < 50" | bc -l) )); then
    echo "Error: Minimum initial balance is \$50" >&2
    exit 1
  fi
  echo "Creating user $username with \$${balance} initial balance..."
  resp=$(curl -s -X POST "$PROXY_URL/admin/users" \
    -H "x-auth-token: $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$username\",\"anthropicApiKey\":\"$api_key\",\"initialBalance\":$balance}")
  die_on_error "$resp"
  token=$(echo "$resp" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "✅ User created. Token: $token"
}

update_user() {
  if [ -z "${1:-}" ]; then
    echo "Error: Username is required" >&2
    exit 1
  fi
  local username="$1"
  local api_key="${2:-}"
  if [ -z "$api_key" ]; then
    read -p "Enter new API key for user $username (leave empty to only reset token): " api_key
  fi
  read -p "Reset the user's token? (y/n): " reset
  local reset_token="false"
  [ "$reset" = "y" ] && reset_token="true"
  echo "Updating user $username..."
  data="{\"resetToken\":$reset_token}"
  if [ -n "$api_key" ]; then
    data="{\"anthropicApiKey\":\"$api_key\",\"resetToken\":$reset_token}"
  fi
  resp=$(curl -s -X PUT "$PROXY_URL/admin/users/$username" \
    -H "x-auth-token: $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$data")
  die_on_error "$resp"
  if [ "$reset_token" = "true" ]; then
    token=$(echo "$resp" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "✅ User updated. New token: $token"
  else
    echo "✅ User updated."
  fi
}

delete_user() {
  if [ -z "${1:-}" ]; then
    echo "Error: Username is required" >&2
    exit 1
  fi
  local username="$1"
  echo "Deleting user $username..."
  resp=$(curl -s -X DELETE "$PROXY_URL/admin/users/$username" -H "x-auth-token: $AUTH_TOKEN")
  die_on_error "$resp"
  echo "✅ User deleted."
}

add_balance() {
  if [ -z "${1:-}" ] || [ -z "${2:-}" ]; then
    echo "Error: Username and amount are required" >&2
    exit 1
  fi
  local username="$1"
  local amount="$2"
  echo "Adding \$${amount} to $username..."
  resp=$(curl -s -X POST "$PROXY_URL/admin/balance/$username" \
    -H "x-auth-token: $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"amount\":$amount}")
  die_on_error "$resp"
  echo "✅ Balance updated."
}

usage_report() {
  local username="${1:-}"
  if [ -n "$username" ]; then
    resp=$(curl -s -G "$PROXY_URL/admin/usage" --data-urlencode "username=$username" -H "x-auth-token: $AUTH_TOKEN")
  else
    resp=$(curl -s -G "$PROXY_URL/admin/usage" -H "x-auth-token: $AUTH_TOKEN")
  fi
  die_on_error "$resp"
  echo "$resp" | jq '.'
}

cmd="${1:-help}"
shift || true

case "$cmd" in
  list) list_users "$@" ;;
  add) add_user "$@" ;;
  update) update_user "$@" ;;
  delete) delete_user "$@" ;;
  balance) add_balance "$@" ;;
  usage) usage_report "$@" ;;
  help|*) show_help ;;
esac
