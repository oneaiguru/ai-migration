#!/bin/bash

set -euo pipefail

trap 'echo "Error on line $LINENO"; exit 1' ERR

# Determine repository root (directory of this script)
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Directories to create
DIRECTORIES=(
    "core/ai-docs"
    "core/specs/templates"
    "core/.claude"
    "tools"
    ".github/workflows"
)

echo "Creating folder structure..."
for dir in "${DIRECTORIES[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "  Created $dir"
    else
        echo "  Exists $dir"
    fi
done

copy_file() {
    src="$1"
    dest="$2"
    if [ -f "$src" ]; then
        if [ ! -f "$dest" ]; then
            cp "$src" "$dest"
            echo "  Copied $(basename "$src") -> $dest"
        else
            echo "  Skipped existing $dest"
        fi
    else
        echo "  Template missing: $src"
    fi
}

echo "Copying template files..."
copy_file "core/specs/templates/task-template.example.md" "core/specs/templates/task-template.md"

if [ -d "tools" ]; then
    chmod +x tools/*.sh 2>/dev/null || true
    echo "Made task scripts executable"
fi

if [ ! -d ".git" ]; then
    git init
    echo "Initialized new git repository"
else
    echo "Git repository already exists"
fi

echo "Initialization complete."
