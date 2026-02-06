#!/bin/bash

# prepare-task.sh - Script for preparing a task on mobile
#
# Usage: ./prepare-task.sh "Task Title" "task-id"
#
# This script creates a task specification from a template,
# initializes a Git branch for the task, and sets up the
# necessary files for task preparation.

# Check for required arguments
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 \"Task Title\" \"task-id\""
    exit 1
fi

TASK_TITLE="$1"
TASK_ID="$2"
DATE=$(date +"%Y-%m-%d")

# Create task spec directory if it doesn't exist
mkdir -p core/specs/tasks

# Create task specification from template
if [ -f "core/specs/templates/task-template.md" ]; then
    sed -e "s/\[Task Title\]/$TASK_TITLE/g" \
        -e "s/\[TASK-ID\]/$TASK_ID/g" \
        -e "s/\[YYYY-MM-DD\]/$DATE/g" \
        core/specs/templates/task-template.md > core/specs/tasks/$TASK_ID.md
else
    # Create a default task specification if template doesn't exist
    cat > core/specs/tasks/$TASK_ID.md << EOF
# Task Specification: $TASK_TITLE

## Metadata
- **Task ID**: $TASK_ID
- **Created**: $DATE
- **Priority**: Medium
- **Estimated Effort**: Medium
- **Dependencies**: None

## Objective
[Describe the task objective here]

## Requirements

### Functional Requirements
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

### Technical Requirements
1. [Technical requirement 1]
2. [Technical requirement 2]

## Implementation Details

### Files to Create/Modify
- [file/path/1.js] - [purpose]
- [file/path/2.js] - [purpose]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Notes
[Any additional notes or context that might be helpful]

## AI Agent Level
[Specify which AI level should handle this task, e.g., L4 for implementation]
EOF
fi

echo "Created task specification: core/specs/tasks/$TASK_ID.md"

# Create task branch if it doesn't exist
CURRENT_BRANCH=$(git branch --show-current)
if git show-ref --verify --quiet refs/heads/task/$TASK_ID; then
    echo "Branch task/$TASK_ID already exists"
    if [ "$CURRENT_BRANCH" != "task/$TASK_ID" ]; then
        read -p "Switch to branch task/$TASK_ID? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git checkout task/$TASK_ID
        fi
    fi
else
    echo "Creating branch task/$TASK_ID"
    git checkout -b task/$TASK_ID
fi

# Create task directory in .claude
mkdir -p core/.claude/tasks

# Create task context file
cat > core/.claude/tasks/$TASK_ID.md << EOF
# Task: $TASK_TITLE
ID: $TASK_ID
Created: $DATE

## Requirements
[See core/specs/tasks/$TASK_ID.md for detailed requirements]

## Context
- Refer to core/ai-docs/architecture/README.md for system architecture
- Refer to core/ai-docs/patterns/error-handling.md for error handling patterns

## Notes
[Add any additional notes here]
EOF

echo "Created task context: core/.claude/tasks/$TASK_ID.md"

# Edit the files with the default editor if EDITOR is set
if [ ! -z "$EDITOR" ]; then
    $EDITOR core/specs/tasks/$TASK_ID.md
    $EDITOR core/.claude/tasks/$TASK_ID.md
else
    echo "To edit the task files, use your text editor:"
    echo "  - Edit core/specs/tasks/$TASK_ID.md to complete the task specification"
    echo "  - Edit core/.claude/tasks/$TASK_ID.md to add additional context"
fi

# Provide next steps
echo
echo "Next Steps:"
echo "1. Edit the task specification: core/specs/tasks/$TASK_ID.md"
echo "2. Add any additional context in: core/.claude/tasks/$TASK_ID.md"
echo "3. Commit and push your changes:"
echo "   git add core/specs/tasks/$TASK_ID.md core/.claude/tasks/$TASK_ID.md"
echo "   git commit -m \"Prepare task $TASK_ID: $TASK_TITLE\""
echo "   git push origin task/$TASK_ID"
echo
echo "Task preparation complete!"
