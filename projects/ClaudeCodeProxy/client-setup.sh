#!/bin/bash
# Client setup script for Claude Code Proxy

# Configuration (provide via env or args)
SERVER_URL="${SERVER_URL:-${1:-}}"
ADMIN_TOKEN="${ADMIN_TOKEN:-${2:-}}"
CONFIG_FILE="$HOME/.claude_proxy_config"

if [ -z "$SERVER_URL" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo "Usage: SERVER_URL=https://proxy.example.com ADMIN_TOKEN=<your_token> $0"
  echo "Both SERVER_URL and ADMIN_TOKEN are required."
  exit 1
fi

# Create configuration file
cat > "$CONFIG_FILE" << CONF
# Claude Code Proxy Configuration
export CLAUDE_CODE_PROXY_URL="$SERVER_URL"
export CLAUDE_CODE_AUTH_TOKEN="$ADMIN_TOKEN"

# Anthropic API endpoints
export ANTHROPIC_API_BASE="$SERVER_URL/api/anthropic"
export STATSIG_API_BASE="$SERVER_URL/api/statsig"
export SENTRY_API_BASE="$SERVER_URL/api/sentry"
CONF

chmod 600 "$CONFIG_FILE"

# Check if the configuration is already in the shell profile
if ! grep -q "source $CONFIG_FILE" "$HOME/.bashrc" 2>/dev/null; then
  echo "" >> "$HOME/.bashrc"
  echo "# Claude Code Proxy configuration" >> "$HOME/.bashrc"
  echo "[ -f $CONFIG_FILE ] && source $CONFIG_FILE" >> "$HOME/.bashrc"
  echo "Added source command to $HOME/.bashrc"
fi

if [ -f "$HOME/.zshrc" ]; then
  if ! grep -q "source $CONFIG_FILE" "$HOME/.zshrc" 2>/dev/null; then
    echo "" >> "$HOME/.zshrc"
    echo "# Claude Code Proxy configuration" >> "$HOME/.zshrc"
    echo "[ -f $CONFIG_FILE ] && source $CONFIG_FILE" >> "$HOME/.zshrc"
    echo "Added source command to $HOME/.zshrc"
  fi
fi

# Source the configuration
source "$CONFIG_FILE"

# Install admin script locally from this repo copy
cp "$(dirname "$0")/admin.sh" "$HOME/admin-claude.sh"
chmod +x "$HOME/admin-claude.sh"

echo ""
echo "Setup complete!"
echo "To use Claude Code with the proxy, either start a new terminal or run:"
echo "  source $CONFIG_FILE"
echo ""
echo "You can use the admin script with:"
echo "  $HOME/admin-claude.sh help"
