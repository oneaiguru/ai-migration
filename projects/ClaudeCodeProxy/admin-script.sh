#!/bin/bash
# Claude Code Proxy - Admin Management Script

# Load configuration
CONFIG_FILE="$HOME/.claude_proxy_config"
if [ -f "$CONFIG_FILE" ]; then
  source "$CONFIG_FILE"
else
  echo "Error: Configuration file not found. Please run the setup script first."
  exit 1
fi

if [ -z "$CLAUDE_CODE_PROXY_URL" ] || [ -z "$CLAUDE_CODE_AUTH_TOKEN" ]; then
  echo "Error: Proxy URL or auth token not found in configuration."
  exit 1
fi

PROXY_URL="$CLAUDE_CODE_PROXY_URL"
AUTH_TOKEN="$CLAUDE_CODE_AUTH_TOKEN"

# Functions
show_help() {
  echo "Claude Code Proxy - Admin Management"
  echo ""
  echo "Usage: $0 [command] [options]"
  echo ""
  echo "Commands:"
  echo "  list                          List all users"
  echo "  add <username> [api_key]      Add a new user"
  echo "  update <username> [api_key]   Update user's API key"
  echo "  delete <username>             Delete a user"
  echo "  usage [username]              Get usage statistics"
  echo "  help                          Show this help message"
  echo ""
  exit 0
}

list_users() {
  echo "Fetching users..."
  RESPONSE=$(curl -s -X GET "$PROXY_URL/admin/users" \
    -H "x-auth-token: $AUTH_TOKEN")
  
  ERROR=$(echo $RESPONSE | grep -o '"error":"[^"]*"' || echo "")
  
  if [ -n "$ERROR" ]; then
    ERROR_MSG=$(echo $ERROR | cut -d'"' -f4)
    echo "Error: $ERROR_MSG"
    exit 1
  fi
  
  echo "Users:"
  echo "$RESPONSE" | jq '.'
}

add_user() {
  if [ -z "$1" ]; then
    echo "Error: Username is required"
    exit 1
  fi
  
  USERNAME="$1"
  API_KEY="${2:-}"
  
  echo "Creating user $USERNAME..."
  RESPONSE=$(curl -s -X POST "$PROXY_URL/admin/users" \
    -H "x-auth-token: $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$USERNAME\", \"anthropicApiKey\": \"$API_KEY\"}")
  
  ERROR=$(echo $RESPONSE | grep -o '"error":"[^"]*"' || echo "")
  
  if [ -n "$ERROR" ]; then
    ERROR_MSG=$(echo $ERROR | cut -d'"' -f4)
    echo "Error: $ERROR_MSG"
    exit 1
  fi
  
  TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  
  echo "✅ User created successfully"
  echo "Username: $USERNAME"
  echo "Token: $TOKEN"
  echo ""
  echo "Share this token with the user for authentication."
}

update_user() {
  if [ -z "$1" ]; then
    echo "Error: Username is required"
    exit 1
  fi
  
  USERNAME="$1"
  API_KEY="${2:-}"
  
  if [ -z "$API_KEY" ]; then
    read -p "Enter new API key for user $USERNAME (leave empty to only reset token): " API_KEY
  fi
  
  RESET_TOKEN="true"
  
  echo "Updating user $USERNAME..."
  RESPONSE=$(curl -s -X PUT "$PROXY_URL/admin/users/$USERNAME" \
    -H "x-auth-token: $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"anthropicApiKey\": \"$API_KEY\", \"resetToken\": $RESET_TOKEN}")
  
  ERROR=$(echo $RESPONSE | grep -o '"error":"[^"]*"' || echo "")
  
  if [ -n "$ERROR" ]; then
    ERROR_MSG=$(echo $ERROR | cut -d'"' -f4)
    echo "Error: $ERROR_MSG"
    exit 1
  fi
  
  TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || echo "")
  
  echo "✅ User updated successfully"
  if [ -n "$TOKEN" ]; then
    echo "New token: $TOKEN"
    echo ""
    echo "Share this token with the user for authentication."
  fi
}

delete_user() {
  if [ -z "$1" ]; then
    echo "Error: Username is required"
    exit 1
  fi
  
  USERNAME="$1"
  
  read -p "Are you sure you want to delete user $USERNAME? (y/n): " CONFIRM
  if [ "$CONFIRM" != "y" ]; then
    echo "Operation cancelled"
    exit 0
  fi
  
  echo "Deleting user $USERNAME..."
  RESPONSE=$(curl -s -X DELETE "$PROXY_URL/admin/users/$USERNAME" \
    -H "x-auth-token: $AUTH_TOKEN")
  
  ERROR=$(echo $RESPONSE | grep -o '"error":"[^"]*"' || echo "")
  
  if [ -n "$ERROR" ]; then
    ERROR_MSG=$(echo $ERROR | cut -d'"' -f4)
    echo "Error: $ERROR_MSG"
    exit 1
  fi
  
  echo "✅ User deleted successfully"
}

get_usage() {
  USERNAME="${1:-}"
  QUERY=""
  
  if [ -n "$USERNAME" ]; then
    QUERY="?username=$USERNAME"
  fi
  
  echo "Fetching usage statistics..."
  RESPONSE=$(curl -s -X GET "$PROXY_URL/admin/usage$QUERY" \
    -H "x-auth-token: $AUTH_TOKEN")
  
  ERROR=$(echo $RESPONSE | grep -o '"error":"[^"]*"' || echo "")
  
  if [ -n "$ERROR" ]; then
    ERROR_MSG=$(echo $ERROR | cut -d'"' -f4)
    echo "Error: $ERROR_MSG"
    exit 1
  fi
  
  echo "Usage Statistics:"
  echo "$RESPONSE" | jq '.'
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
  update)
    update_user "$@"
    ;;
  delete)
    delete_user "$@"
    ;;
  usage)
    get_usage "$@"
    ;;
  help|*)
    show_help
    ;;
esac