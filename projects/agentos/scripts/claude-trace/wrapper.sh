#!/bin/bash
# Claude Trace Fork Wrapper - No auto-opening browsers

# Path to the forked claude-trace
FORK_DIR="$(dirname "$0")"
CLAUDE_TRACE="$FORK_DIR/dist/cli.js"

# Function to update the index
update_index() {
    node "$FORK_DIR/generate-index.js"
    echo "Index updated at: ~/.claude-trace/index.html"
}

# Check for index generation request
if [[ "$1" == "--update-index" ]]; then
    update_index
    exit 0
fi

# Run the forked claude-trace with all arguments
node "$CLAUDE_TRACE" "$@"

# After claude-trace completes, update the index
if [[ $? -eq 0 ]]; then
    update_index
fi