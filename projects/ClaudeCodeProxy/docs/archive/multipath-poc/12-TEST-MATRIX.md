| Test | Path            | OS    | Steps                             | Expected                    | Result |
| ---- | --------------- | ----- | --------------------------------- | --------------------------- | ------ |
| T1   | Subagent‑only   | macOS | Run subagent on ZAI               | ZAI replies, main stays SUB |        |
| T2   | Session‑level   | macOS | Start haiku session in `work/zai` | Context persists on ZAI     |        |
| T3   | Dual‑CLI broker | macOS | `/run` haiku then sonnet          | Correct lanes, JSON OK      |        |
| T4   | PTY wrapper     | macOS | `/haiku` then `/sonnet`           | Lane flips, UX smooth       |        |
| T5   | HTTP gateway    | macOS | Route by model                    | Both lanes OK (API‑billed)  |        |

> Repeat on Linux/WSL if needed; add long‑run (100 prompts) soak tests.

---