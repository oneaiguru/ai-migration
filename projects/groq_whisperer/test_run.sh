#!/bin/bash

# Test script for Groq Whisperer
echo "Testing Groq Whisperer setup..."
echo "================================"

# Check for GROQ_API_KEY
if [ -z "$GROQ_API_KEY" ]; then
    echo "⚠️  GROQ_API_KEY not found in environment"
    echo "   Please add to ~/.zshrc:"
    echo "   export GROQ_API_KEY='your-key-here'"
    echo ""
else
    echo "✓ GROQ_API_KEY found"
fi

# Check virtual environment
if [ -d ".venv" ]; then
    echo "✓ Virtual environment exists"
else
    echo "✗ Virtual environment not found"
    exit 1
fi

# Activate virtual environment
source .venv/bin/activate

# Check dependencies
echo ""
echo "Checking Python packages:"
python -c "import groq" && echo "✓ groq installed" || echo "✗ groq missing"
python -c "import pyaudio" && echo "✓ pyaudio installed" || echo "✗ pyaudio missing"
python -c "import keyboard" && echo "✓ keyboard installed" || echo "✗ keyboard missing"
python -c "import pyautogui" && echo "✓ pyautogui installed" || echo "✗ pyautogui missing"
python -c "import pyperclip" && echo "✓ pyperclip installed" || echo "✗ pyperclip missing"

echo ""
echo "================================"
echo "To run Groq Whisperer:"
echo "1. First time: export GROQ_API_KEY='your-key-here'"
echo "2. Run: source .venv/bin/activate && python main_improved.py"
echo ""
echo "To install as background service:"
echo "launchctl load ~/Library/LaunchAgents/com.mikhail.groqwhisperer.plist"
echo ""
echo "To stop background service:"
echo "launchctl unload ~/Library/LaunchAgents/com.mikhail.groqwhisperer.plist"