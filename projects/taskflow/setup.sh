#!/usr/bin/env bash

# Non-interactive setup script for TaskFlow.ai
# This script automatically installs dependencies without user prompts

set -e

# Colors for output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m"

echo "TaskFlow.ai automatic setup"

# Check dependencies
echo "Checking dependencies..."
missing=0
for dep in git python3; do
    if ! command -v "$dep" >/dev/null 2>&1; then
        echo -e "${YELLOW}Missing dependency: $dep${NC}"
        missing=1
    else
        echo -e "${GREEN}$dep found${NC}"
    fi
done

if ! command -v pip3 >/dev/null 2>&1 && ! command -v pip >/dev/null 2>&1; then
    echo -e "${YELLOW}Missing dependency: pip${NC}"
    missing=1
fi

if [[ $missing -eq 1 ]]; then
    echo -e "${YELLOW}Some dependencies are missing. Installation may fail.${NC}"
else
    echo -e "${GREEN}All dependencies satisfied.${NC}"
fi

# Create virtual environment
venv_dir="venv"
if [[ ! -d "$venv_dir" ]]; then
    echo "Creating virtual environment..."
    python3 -m venv "$venv_dir"
    echo -e "${GREEN}Virtual environment created at $venv_dir${NC}"
    echo "To activate: source $venv_dir/bin/activate"
else
    echo "Virtual environment '$venv_dir' already exists"
fi

# Install packages
if [[ -f "requirements.txt" ]]; then
    echo "Installing Python packages..."
    if command -v pip3 >/dev/null 2>&1; then
        pip3 install -r "requirements.txt"
    else
        pip install -r "requirements.txt"
    fi
    echo -e "${GREEN}Packages installed successfully${NC}"
    if [[ -f "requirements-dev.txt" ]]; then
        echo "Installing development packages..."
        if command -v pip3 >/dev/null 2>&1; then
            pip3 install -r "requirements-dev.txt"
        else
            pip install -r "requirements-dev.txt"
        fi
        echo -e "${GREEN}Development packages installed successfully${NC}"
    fi
else
    echo -e "${YELLOW}No requirements.txt file found${NC}"
fi

# Create initial directories
echo "Setting up directories..."
mkdir -p core/ai-docs/architecture core/ai-docs/patterns core/specs/templates
if [[ -f core/specs/templates/task-template.example.md ]] && [[ ! -f core/specs/templates/task-template.md ]]; then
    cp core/specs/templates/task-template.example.md core/specs/templates/task-template.md
fi
echo -e "${GREEN}Initial directories verified${NC}"

echo -e "${GREEN}Setup complete!${NC}"
echo "Note: Telegram bot and Git hooks were not configured as they require user input."
echo "You can configure them manually if needed."
