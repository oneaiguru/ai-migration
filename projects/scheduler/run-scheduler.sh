#!/bin/bash
# Run the scheduler with the correct Python path

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Running scheduler from ${SCRIPT_DIR}..."
cd "$SCRIPT_DIR"
python main_scheduler.py "$@"
