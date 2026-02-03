#!/bin/bash

# execute-task.sh - Script for executing a task on desktop
#
# Usage: ./execute-task.sh "task-id"
#
# This script checks out the task branch, loads task context,
# and prepares the environment for task execution using Claude Code.

# Check for required arguments
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 \"task-id\""
    exit 1
fi

TASK_ID="$1"

# Check if task branch exists
if ! git show-ref --verify --quiet refs/heads/task/$TASK_ID; then
    echo "Error: Branch task/$TASK_ID does not exist."
    echo "Pull latest changes or create the task first."
    exit 1
fi

# Check if task files exist
if [ ! -f "core/specs/tasks/$TASK_ID.md" ]; then
    echo "Error: Task specification not found: core/specs/tasks/$TASK_ID.md"
    exit 1
fi

# Check out task branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "task/$TASK_ID" ]; then
    echo "Checking out branch task/$TASK_ID"
    git checkout task/$TASK_ID
fi

# Create output directory
mkdir -p outputs/$TASK_ID

# Extract task title
TASK_TITLE=$(grep -m 1 "# Task Specification:" core/specs/tasks/$TASK_ID.md | sed 's/# Task Specification: \(.*\)/\1/')

# Create expanded context file
mkdir -p core/.claude/current
cat > core/.claude/current/context.md << EOF
# Task Context: $TASK_TITLE

## Task Specification
$(cat core/specs/tasks/$TASK_ID.md)

## Additional Context
$([ -f "core/.claude/tasks/$TASK_ID.md" ] && cat core/.claude/tasks/$TASK_ID.md || echo "No additional context provided.")
EOF

# Add architecture documentation if available
if [ -f "core/ai-docs/architecture/README.md" ]; then
    echo -e "\n## Architecture Overview\n$(cat core/ai-docs/architecture/README.md)" >> core/.claude/current/context.md
fi

# Add error handling pattern if available
if [ -f "core/ai-docs/patterns/error-handling.md" ]; then
    echo -e "\n## Error Handling Pattern\n$(cat core/ai-docs/patterns/error-handling.md)" >> core/.claude/current/context.md
fi

echo "Prepared task context in core/.claude/current/context.md"

# Create a Claude prompt file
cat > core/.claude/current/prompt.md << EOF
# Task Implementation Request

Please help implement the task described below, based on the provided context and specifications.

## Task Information
- **Task ID**: $TASK_ID
- **Task Title**: $TASK_TITLE

## Instructions
1. Review the task specification and context carefully
2. Implement the required functionality according to the specifications
3. Follow any error handling patterns and architectural guidelines
4. Provide clear documentation for your implementation
5. Include any necessary tests

## Context
$(cat core/.claude/current/context.md)

Please provide a comprehensive implementation that meets all requirements and acceptance criteria.
EOF

echo "Prepared Claude prompt in core/.claude/current/prompt.md"

# Provide guidance on next steps
echo
echo "Task execution prepared! You now have two options:"
echo
echo "Option 1: Use Claude Code CLI (if installed):"
echo "  claude -p core/.claude/current/prompt.md > outputs/$TASK_ID/implementation.md"
echo
echo "Option 2: Copy the prompt to the Claude Web UI:"
echo "  1. Open core/.claude/current/prompt.md"
echo "  2. Copy the contents to Claude"
echo "  3. Save the response to outputs/$TASK_ID/implementation.md"
echo
echo "After implementation:"
echo "  1. Review the implementation in outputs/$TASK_ID/implementation.md"
echo "  2. Apply the changes to the appropriate files"
echo "  3. Commit and push your changes:"
echo "     git add [changed files]"
echo "     git commit -m \"[AI-L4] [TASK-$TASK_ID] Implement $TASK_TITLE\""
echo "     git push origin task/$TASK_ID"
echo
echo "Task execution preparation complete!"
