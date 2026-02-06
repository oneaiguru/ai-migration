#!/bin/bash
# Claude Code Proxy - Enhanced Admin Management Script

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
  echo "  balance <username> <amount>   Add funds to user's balance"
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
  
  read -p "Initial balance ($50 minimum): " BALANCE
  
  # Validate balance is a number and at least $50
  if ! [[ "$BALANCE" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
    echo "Error: Balance must be a number"
    exit 1
  fi
  
  if (( $(echo "$BALANCE < 50" | bc -l) )); then
    echo "Error: Minimum initial balance is $50"
    exit 1
  fi
  
  echo "Creating user $USERNAME with $BALANCE initial balance..."
  RESPONSE=$(curl -s -X POST "$PROXY_URL/admin/users" \
    -H "x-auth-token: $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$USERNAME\", \"anthropicApiKey\": \"$API_KEY\", \"initialBalance\": $BALANCE}")
  
  ERROR=$(echo $RESPONSE | grep -o '"error":"[^"]*"' || echo "")
  
  if [ -n "$ERROR" ]; then
    ERROR_MSG=$(echo $ERROR | cut -d'"' -f4)
    echo "Error: $ERROR_MSG"
    exit 1
  fi
  
  TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  
  echo "✅ User created successfully"
  echo "Username: $USERNAME"
  echo "Initial Balance: $BALANCE"
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
  
  read -p "Do you want to reset the user's token? (y/n): " RESET_TOKEN_INPUT
  RESET_TOKEN="false"
  if [ "$RESET_TOKEN_INPUT" = "y" ]; then
    RESET_TOKEN="true"
  fi
  
  echo "Updating user $USERNAME..."
  RESPONSE=$(curl -s -X PUT "$PROXY_URL/admin/users/$USERNAME" \
    -H "x-auth-token: $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"anthropicApiKey\": \"$API_KEY\", \"resetToken\": $RESET_TOKEN}")
  
  ERROR=$(echo $RESPONSE | grep -o '"error":"[^"]*"' || echo "")
  
  if [ -n "$ERROR" ]; then
    ERROR_MSG=$(echo $ERROR | cut -d'"' -f4)
    echo "Error: $ERROR