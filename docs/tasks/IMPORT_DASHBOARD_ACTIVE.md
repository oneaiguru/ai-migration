# Import Dashboard — Active Migrations

Legend (targets align with `projects/` per README):
- ✅ Imported & verified (only template/boilerplate differences after `verify_import_files.py`)
- ⚠️ Small deltas or mapping/source issues to resolve
- 🚧 In progress / large gaps (treat as not done yet)
- ⛔ Not imported

Status is maintained by running `python scripts/dev/verify_import_files.py <repo...> --dest-ref <branch>` plus manual classification.

| Status | Repo | Target path (monorepo) | Notes |
| --- | --- | --- | --- |
| ✅ | CodeInterpreterZip2LocalFolder | projects/CodeInterpreterZip2LocalFolder | Extras: AGENTS/.gitignore/sqlite_mcp_server.db |
| ✅ | autotester | projects/autotester | Extras: AGENTS, src/__init__.py, doc shim, tests/compliant |
| ✅ | fastwhisper | projects/fastwhisper | Extras: AGENTS |
| ✅ | groq_whisperer | projects/groq_whisperer | Extras: AGENTS |
| ✅ | genai-coder | projects/genai-coder | Extras: AGENTS |
| ✅ | taskflow | projects/taskflow | Files match |
| ✅ | scheduler | projects/scheduler | Files match (extras ignored) |
| ✅ | MyCodeTree2LLM | projects/MyCodeTree2LLM | Files match (extras ignored) |
| ✅ | salesvocieanalytics | projects/salesvocieanalytics | Imported |
| ✅ | ClaudeCodeProxy | projects/ClaudeCodeProxy | Imported |
| ✅ | agentos | projects/agentos | Imported |
| ✅ | forecastingrepo | projects/forecastingrepo | Imported |
| ✅ | qbsf | projects/qbsf | Imported |
| ✅ | forecast-ui | projects/forecast-ui | Imported |
| ✅ | mytko-forecast-demo | projects/mytko-forecast-demo | Imported |
| ✅ | rtneo-docs | projects/rtneo-docs | Imported |
| ✅ | rtneo-mock | projects/rtneo-mock | Imported |
| ✅ | rtneo-ui-docs | projects/rtneo-ui-docs | Imported |
| ✅ | rtneo-scripts | projects/rtneo-scripts | Imported |
| ✅ | rtneo-reports | projects/rtneo-reports | Imported |
| ✅ | GenAICodeUpdater | projects/GenAICodeUpdater | Imported |
| ✅ | whisper_infinity_bot | projects/whisper_infinity_bot | Imported |
| ⛔ | reference-mcp | projects/reference-mcp | Not imported |
