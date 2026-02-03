# Complete Workflow Example

This guide walks through a typical TaskFlow.ai workflow from creating a task template to reviewing the results. Use this example to verify your setup and practice the core steps.

## 1. Create a Task Template

1. Copy the example template:
   ```bash
   cp core/specs/templates/task-template.example.md core/specs/templates/my-task-template.md
   ```
2. Edit `my-task-template.md` with your desired defaults (priority, effort, etc.).

## 2. Prepare a Task on Mobile

1. From a mobile environment or the offline form, run:
   ```bash
   ./tools/prepare-task.sh "Add search API" search-api
   ```
2. Fill in the generated files under `core/specs/tasks/` and `.claude/tasks/`.
3. Commit and push the preparation:
   ```bash
   git add core/specs/tasks/search-api.md core/.claude/tasks/search-api.md
   git commit -m "[PENDING-L4] prepare search-api"
   git push
   ```

## 3. Sync to Desktop

On your desktop, pull the latest changes:
```bash
git pull
```
This brings the prepared task and branch history to your desktop environment.

## 4. Execute the Task with Claude Code

Run the execution script to generate context and prompts:
```bash
./tools/execute-task.sh search-api
```
Open `core/.claude/current/prompt.md` in your Claude Code environment and follow the instructions. Save the implementation output to `outputs/search-api/implementation.md`.

## 5. Review Results

Review the AI-generated code and apply the changes to the repository. Use the Results Viewer to inspect output files:
```bash
./tools/run.sh webui
```
Open [http://localhost:8000](http://localhost:8000) in your browser to see the results.

## 6. Commit and Push

After applying the implementation, commit your work:
```bash
git add <changed files>
git commit -m "[AI-L4] implement search-api"
git push
```
Open a pull request for review once tests pass.
