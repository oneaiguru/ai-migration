#!/bin/bash

echo "Groq Whisperer API Key Setup"
echo "============================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check if API key is already set
if [ ! -z "$GROQ_API_KEY" ]; then
    echo "✓ GROQ_API_KEY is already set in your environment"
    echo ""
    echo "Current key starts with: ${GROQ_API_KEY:0:10}..."
    echo ""
    read -p "Do you want to update it? (y/n): " update_key
    if [ "$update_key" != "y" ]; then
        echo "Keeping existing key."
        exit 0
    fi
fi

echo "Get your API key from: https://console.groq.com/keys"
echo ""
read -p "Enter your GROQ_API_KEY: " api_key

if [ -z "$api_key" ]; then
    echo "Error: No API key provided"
    exit 1
fi

# Check which shell config to update
if [ -f ~/.zshrc ]; then
    SHELL_CONFIG=~/.zshrc
    SHELL_NAME="zsh"
elif [ -f ~/.bash_profile ]; then
    SHELL_CONFIG=~/.bash_profile
    SHELL_NAME="bash"
else
    SHELL_CONFIG=~/.zshrc
    SHELL_NAME="zsh"
fi

# Remove old GROQ_API_KEY if exists (portable BSD/GNU sed)
if sed --version >/dev/null 2>&1; then
  sed -i '/^export GROQ_API_KEY=/d' "$SHELL_CONFIG"
else
  sed -i '' '/^export GROQ_API_KEY=/d' "$SHELL_CONFIG"
fi

# Add new API key
echo "" >> $SHELL_CONFIG
echo "# Groq Whisperer API Key" >> $SHELL_CONFIG
echo "export GROQ_API_KEY='$api_key'" >> $SHELL_CONFIG

echo ""
echo "✓ API key added to $SHELL_CONFIG"
echo ""
echo "To activate now, run:"
echo "  source $SHELL_CONFIG"
echo ""
echo "Then start Groq Whisperer:"
echo "  cd \"$SCRIPT_DIR\""
if [ -d "$SCRIPT_DIR/venv" ]; then
  echo "  source venv/bin/activate"
elif [ -d "$SCRIPT_DIR/.venv" ]; then
  echo "  source .venv/bin/activate"
else
  echo "  python -m venv venv && source venv/bin/activate"
fi
echo "  python main_improved.py"
