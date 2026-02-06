# Claude Code Agent Farm - AI Assistant Memory

## Quick Start
- **Purpose**: Orchestrate multiple Claude Code agents working in parallel to improve codebases through automated bug fixing or systematic best practices implementation
- **Language**: Python 3.13+
- **Entry Point**: `claude_code_agent_farm.py` (main orchestrator)
- **Author**: Jeffrey Emanuel (jeffrey.emanuel@gmail.com)

## Project Overview

Claude Code Agent Farm is a Python-based orchestration framework that runs multiple Claude Code (`cc`) AI agents in parallel to systematically improve codebases. It uses tmux for session management and provides sophisticated monitoring and recovery capabilities. Supports 34 technology stacks with 3 distinct workflow types.

## Architecture Overview
- **Main Components**:
  - `claude_code_agent_farm.py:1-100` - Core orchestrator with tmux management and agent monitoring
  - `view_agents.sh:1-286` - Optional tmux session viewer utility  
  - `setup.sh:1-500` - Automated installation and dependency setup
  - `pyproject.toml:1-169` - Python project configuration with dependencies

## Important Files
| File | Lines | Purpose |
|------|-------|---------|
| `claude_code_agent_farm.py` | 3500+ | Main orchestrator, agent management, monitoring dashboard |
| `view_agents.sh` | 286 | Tmux viewer utility for monitoring agents |
| `setup.sh` | 500+ | Automated setup script with prerequisite installation |
| `pyproject.toml` | 169 | Python project config, dependencies, tool settings |
| `configs/` | 37 files | Configuration files for 34 tech stacks |
| `prompts/` | 37 files | Specialized prompt templates for all workflows |
| `best_practices_guides/` | 35 files | Comprehensive guides for systematic improvements |
| `tool_setup_scripts/` | 24 scripts | Modular development environment setup |

## Dependencies & Integrations
- **Core Dependencies**: `typer>=0.15.0`, `rich>=13.7.0` 
- **External Requirements**: tmux, git, Claude Code (`claude` command), Python 3.13+, uv
- **Special Alias Required**: `alias cc="ENABLE_BACKGROUND_TASKS=1 claude --dangerously-skip-permissions"`
- **Technology Stacks**: 34 supported (Next.js, Python, Rust, Go, Java, Angular, Flutter, C++, etc.)
- **Development Tools**: Integrates with type-checkers, linters, and testing tools for each stack

## Development Patterns
- **Two-Script Architecture**: Python orchestrator (brain) + Shell viewer (window)
- **Parallel Processing**: Run 20+ agents simultaneously (max 50 configurable)
- **Safety Systems**: Settings backup/restore, file locking, atomic operations
- **Context Management**: One-key reset broadcast (Ctrl+R), context warnings in tmux titles
- **Auto-Recovery**: Automatic agent restart with adaptive idle timeout and exponential backoff
- **Progress Tracking**: Git commits with diff summaries, HTML run reports
- **Monitor Dashboard**: Real-time status display in tmux controller window

## Configuration
- **Config Files**: 37 JSON configurations for different tech stacks and workflows
- **Variable Substitution**: `{chunk_size}` and other dynamic replacements in prompts  
- **Environment Variables**: None required (uses config files and CLI args)
- **Key Settings**:
  - `agents`: Number of parallel agents (default: 20, max: 50)
  - `chunk_size`: Lines per iteration (auto-adjusted: 20-75 based on stack)
  - `auto_restart`: Enable automatic agent restart on errors/idle
  - `context_threshold`: Restart when context ≤ N% (default: 20%)
  - `stagger`: Delay between agent launches (default: 10s, adaptive)
  - `session`: tmux session name (default: "claude_agents")

## Development Commands

## Key Commands
```bash
# Installation
git clone https://github.com/Dicklesworthstone/claude_code_agent_farm.git
cd claude_code_agent_farm
chmod +x setup.sh
./setup.sh

# Required alias setup (done automatically by setup)
alias cc="ENABLE_BACKGROUND_TASKS=1 claude --dangerously-skip-permissions"

# Basic usage - Next.js project
claude-code-agent-farm --path /path/to/project --config configs/nextjs_config.json

# Python project with auto-restart
claude-code-agent-farm \
  --path /python/project \
  --config configs/python_config.json \
  --agents 15 \
  --auto-restart

# Best practices implementation
claude-code-agent-farm \
  --path /nextjs/project \
  --config configs/nextjs_best_practices_config.json \
  --agents 10

# Quick test run
claude-code-agent-farm --path /project -n 5 --skip-regenerate --skip-commit

# Headless operation (CI/CD)
claude-code-agent-farm \
  --path /project \
  --config configs/ci-config.json \
  --no-monitor \
  --auto-restart

# Pre-flight verification
claude-code-agent-farm doctor --path /path/to/project

# Shell completion
claude-code-agent-farm install-completion

# Cooperating agents mode (advanced)
claude-code-agent-farm \
  --path /project \
  --prompt-file prompts/cooperating_agents_improvement_prompt_for_python_fastapi_postgres.txt \
  --agents 20 \
  --auto-restart
```

### Development Setup

```bash
# Initial setup (creates venv, installs dependencies)
./setup.sh

# Install in development mode
pip install -e .

# Run linting
ruff check .
ruff format .

# Run type checking
mypy claude_code_agent_farm.py

# Run tests (when available)
pytest
```

### Viewing Active Agents

```bash
# Grid view - see all agents
./view_agents.sh grid

# Focus mode - cycle through agents
./view_agents.sh focus

# Split view - monitor + agents
./view_agents.sh split
```

## Architecture

### Two-Script Design

1. **Python Orchestrator** (`claude_code_agent_farm.py`):
   - Creates tmux sessions with multiple panes
   - Launches and monitors Claude Code agents
   - Handles auto-restart, error recovery, and progress tracking
   - Provides rich terminal UI with real-time statistics

2. **Shell Viewer** (`view_agents.sh`):
   - Optional convenience wrapper for tmux viewing commands

### Key Components

- **AgentMonitor Class**: Tracks agent health, context usage, idle detection, and error counts
- **Lock-based Coordination**: Prevents conflicts between parallel agents
- **Settings Management**: Backs up and restores Claude settings for safety
- **Signal Handlers**: Graceful shutdown with double Ctrl+C force kill option

### Configuration System

- **Config Files** (`configs/`): 37 JSON configurations for different tech stacks
- **Prompt Templates** (`prompts/`): Corresponding prompts for each workflow
- **Best Practices Guides** (`best_practices_guides/`): Detailed guides for each technology
- **Setup Scripts** (`tool_setup_scripts/`): Environment setup for each stack

### Monitoring Features

- Real-time dashboard showing agent status, context usage, and activity
- Automatic restart when context drops below threshold (default: 20%)
- Idle detection with adaptive timeout based on work patterns
- Error counting with automatic agent disabling after repeated failures

## Key Files and Directories

- `claude_code_agent_farm.py` - Main orchestrator application
- `configs/` - Technology-specific configuration files
- `prompts/` - Workflow prompt templates
- `best_practices_guides/` - Comprehensive best practices documentation
- `tool_setup_scripts/` - Development environment setup scripts
- `pyproject.toml` - Python project configuration and dependencies
- `setup.sh` - Initial project setup script
- `view_agents.sh` - Agent viewing utility

## Important Notes

- Requires Python 3.13+ and tmux
- Uses `uv` package manager for dependency management
- Supports 34 technology stacks with 3 workflow types
- Can run up to 50 agents in parallel
- Automatically handles git operations unless `--skip-commit` is used
- Creates `.agent_problems` file to track work items across agents