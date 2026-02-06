# TaskFlow.ai - End-to-End Workflow Guide

This guide provides a comprehensive walkthrough for using TaskFlow.ai to manage AI-assisted development. It covers setup, mobile and desktop workflows, template management, synchronization, the dashboard and more.

## Table of Contents
1. [Overview](#overview)
2. [Initial Setup](#initial-setup)
3. [Mobile Workflow (Codex/L5)](#mobile-workflow-codexl5)
4. [Desktop Workflow (Claude Code/L4)](#desktop-workflow-claude-codel4)
5. [Template Management](#template-management)
6. [Task Synchronization](#task-synchronization)
7. [Dashboard and Metrics](#dashboard-and-metrics)
8. [Common Issues and Solutions](#common-issues-and-solutions)
9. [Advanced Usage](#advanced-usage)

## Overview
TaskFlow.ai orchestrates tasks between mobile and desktop environments. Key features include:
- **Mobile-to-Desktop Bridge** for preparing tasks on mobile and executing them on desktop.
- **Template System** with pre‑optimized prompts.
- **Context Management** so knowledge persists between sessions.
- **Synchronization** powered by Git.
- **Metrics Dashboard** to track productivity.

The repository uses a three‑folder structure:
- `ai-docs/` – persistent knowledge repository.
- `specs/` – task specifications and requirements.
- `.claude/` – reusable prompts and commands.

## Initial Setup
### Prerequisites
- Git for synchronization
- Python 3.8+
- Access to Codex (L5)
- Access to Claude Code (L4)

### Installation
```bash
git pull
git clone https://github.com/yourusername/taskflow-ai.git
cd taskflow-ai
python scripts/setup.py
```
Create a `.env` file based on the example and fill in the required values, then initialize the folder structure:
```bash
cp .env.example .env
./init.sh
```

## Mobile Workflow (Codex/L5)
1. Open `mobile-form/index.html` on your device.
2. Select a template, fill in parameters and click **Create Task**.
3. Copy the generated prompt to Codex and implement the task.
4. Commit your changes on mobile:
```bash
./tools/execute-task.sh my-feature
git add .
git commit -m "[PENDING-L4] <description>"
```
Follow the prompt instructions and save the generated code to the `outputs/` directory.

Alternatively use the Telegram bot:
1. Send `/templates` to list templates.
2. Send `/create_task <template>` and follow the prompts.
3. Commit with `[PENDING-L4]` when finished.

## Desktop Workflow (Claude Code/L4)
1. Pull the latest changes:
```bash
./tools/run.sh webui
git pull
```
2. List pending tasks:
```bash
./tools/run.sh cli list
```
3. Execute a task:
```bash
./tools/run.sh cli execute <task-id>
```
4. Use Claude Code to implement the task and commit your work:
```bash
git add .
git commit -m "[AI-L4] [TASK-<id>] implement feature"
```
Apply the relevant changes to the repository and ensure everything works as expected.

## Template Management
Use the web interface by running:
```bash
./tools/run.sh server
```
Browse templates at `http://localhost:8000/templates` or manage them via the CLI:
```bash
./tools/run.sh cli templates list
./tools/run.sh cli templates create
```

## Task Synchronization
TaskFlow.ai relies on Git. Always pull before starting work and push frequently:
```bash
flake8 bot/
bash -n tools/*.sh
pytest
git pull
git push
```
Use commit tags:
- `[PENDING-L4]` – waiting for desktop execution
- `[AI-L4]` – completed by Claude Code
- `[AI-L5]` – completed by Codex

## Dashboard and Metrics
Run the results viewer to inspect outputs and metrics:
```bash
./tools/run.sh webui
```
Open `http://localhost:8000` to view completion rates, AI level distribution and template effectiveness.

## Common Issues and Solutions
- **Merge conflicts** – use `git pull --rebase` and resolve conflicts manually.
- **Task execution failures** – inspect `outputs/<task-id>/implementation.md` and retry with simplified prompts.
- **Missing templates** – verify the template path or create a new one with the CLI.

## Advanced Usage
- Create custom template categories for specialized tasks.
- Version templates using `./tools/run.sh cli templates version <name>`.
- Add project‑specific docs under `core/ai-docs/` and reference them in tasks.
- Configure automated testing workflows with `.claude/workflows/`.

Once tests pass, open a pull request against the `main` branch. A maintainer will review your changes before merge.
