# Project Index (Phase 1 imports)

Track repos as they are imported into `~/ai/projects/`.

| Repo | Source path | Target path | PR series (example) | Status |
|------|-------------|-------------|---------------------|--------|
| tools/agentos | /Users/m/git/tools/agentos | projects/agentos | import:agentos:01-03 | imported |
| tools/MyCodeTree2LLM | /Users/m/git/tools/MyCodeTree2LLM | projects/MyCodeTree2LLM | import:MyCodeTree2LLM:01-all | imported |
| genAICodeUpdater | /Users/m/git/tools/GenAICodeUpdater | projects/GenAICodeUpdater | import:GenAICodeUpdater:01-all | imported |
| tools/whisper_infinity_bot | /Users/m/git/tools/whisper_infinity_bot | projects/whisper_infinity_bot | import:whisper_infinity_bot:01-all | imported |
| rtneo/forecastingrepo | /Users/m/git/clients/rtneo/forecastingrepo | projects/forecastingrepo | import:forecastingrepo:01-09 | imported |
| rtneo/scripts | /Users/m/git/clients/rtneo/scripts | projects/rtneo-scripts | import:rtneo-scripts:01-data-tools | imported |
| rtneo/reports | /Users/m/git/clients/rtneo/reports/site_backtest_candidate | projects/rtneo-reports | import:rtneo-reports:01-candidates | imported |
| rtneo/docs | /Users/m/git/clients/rtneo/docs (+docs-internal/ai-docs) | projects/rtneo-docs | import:rtneo-docs:01-03 | imported |
| rtneo/mock | /Users/m/git/clients/rtneo/mock | projects/rtneo-mock | import:rtneo-mock:01-all | imported |
| rtneo/ui/docs | /Users/m/git/clients/rtneo/ui/docs | projects/rtneo-ui-docs | import:rtneo-ui-docs:01-all | imported |
| rtneo/ui/forecast-ui | /Users/m/git/clients/rtneo/ui/forecast-ui | projects/forecast-ui | import:forecast-ui:01-04 | imported |
| rtneo/ui/mytko-forecast-demo | /Users/m/git/clients/rtneo/ui/mytko-forecast-demo | projects/mytko-forecast-demo | import:mytko-forecast-demo:01-03 | imported |
| accounting-operations | /Users/m/Documents/accounting/accounting-tools (moved) | projects/accounting-operations | n/a (local move) | added |
| tuings | n/a (native) | projects/tuings | n/a | native |
| tools/ClaudeCodeProxy | /Users/m/git/tools/ClaudeCodeProxy | projects/ClaudeCodeProxy | import:ClaudeCodeProxy:01-all | imported |
| tools/CodeInterpreterZip2LocalFolder | /Users/m/git/tools/CodeInterpreterZip2LocalFolder | projects/CodeInterpreterZip2LocalFolder | import:CodeInterpreterZip2LocalFolder:01-all | imported |
| clients/adesk | /Users/m/git/clients/adesk | projects/adesk | import:adesk:01-all | imported |
| tools/autotester | /Users/m/git/tools/autotester | projects/autotester | import:autotester:01-all | imported |
| tools/fastwhisper | /Users/m/git/tools/fastwhisper | projects/fastwhisper | import:fastwhisper:01-all | imported |
| tools/genai-coder | /Users/m/git/tools/genai-coder | projects/genai-coder | import:genai-coder:01-all | imported |
| tools/groq_whisperer | /Users/m/git/tools/groq_whisperer | projects/groq_whisperer | import:groq_whisperer:01-all | imported |
| clients/qbsf | /Users/m/git/clients/qbsf | projects/qbsf | import:qbsf:01-all | imported |
| clients/salesvocieanalytics | /Users/m/git/clients/salesvocieanalytics | projects/salesvocieanalytics | import:salesvocieanalytics:01-all | imported |
| tools/scheduler | /Users/m/git/tools/scheduler | projects/scheduler | import:scheduler:01-all | imported |
| tools/taskflow | /Users/m/git/tools/taskflow | projects/taskflow | import:taskflow:01-all | imported |
| anglo | n/a (unknown source) | projects/anglo | n/a | present |
| ccg3 | n/a (unknown source) | projects/ccg3 | n/a | present |
| codefixreview | n/a (unknown source) | projects/codefixreview | n/a | present |
| convertpdf | n/a (unknown source) | projects/convertpdf | n/a | present |
| duolingoru | n/a (unknown source) | projects/duolingoru | n/a | present |
| groq_transcript_cleaner | n/a (unknown source) | projects/groq_transcript_cleaner | n/a | present |
| last20reddit | n/a (unknown source) | projects/last20reddit | n/a | present |
| uahis | n/a (unknown source) | projects/uahis | n/a | present |
| voiceanalyitcs | n/a (unknown source) | projects/voiceanalyitcs | n/a | present |
| yclientparser | n/a (unknown source) | projects/yclientparser | n/a | present |
| clients/yclients | /Users/m/git/clients/yclents/yclients-local-fix | projects/yclients | import:yclients:01-all | planned |
| ... | ... | ... | ... | ... |

Rules:
- Phase 1 = import-only. No refactors; add AGENTS.md and ignore junk.
- PRs should stay ≤ ~300 KB and be coherent (one area per PR). If a repo cannot be split cleanly, import in one PR.
- Naming: `import:<repo>:NN-<scope>` (e.g., `import:forecastingrepo:01-scaffold`).
- Update this table as PRs open/merge.
