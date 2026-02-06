| ID | Scenario                 | Steps                | Expectation               | Pass/Fail |
| -- | ------------------------ | -------------------- | ------------------------- | --------- |
| T1 | Subagent → Z.AI          | Spawn haiku subagent | All calls to Z.AI         |           |
| T2 | Main session → Anthropic | Normal prompts       | All calls to Anthropic    |           |
| T3 | SSE integrity            | Long streaming run   | Smooth stream, no stalls  |           |
| T4 | Usage logging            | 10 mixed calls       | JSONL entries for each    |           |
| T5 | Host retargeting         | Alternate subagents  | New upstream per retarget |           |
| T6 | Crash safety             | Kill MITM; restart   | CLI recovers gracefully   |           |

---