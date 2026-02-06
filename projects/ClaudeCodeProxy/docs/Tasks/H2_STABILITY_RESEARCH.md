Title
H2 Stability Research (Canceled for now)

Status
Canceled (tracking hypothesis: /context with long sessions may drive observed 502s; current plan is to use /compact and shorter sessions, then revisit if needed).

If revisited, plan outline
- Short vs long session A/B on H2 (fallback OFF).
- Capture /context rid + partials (CLI trace) for 400+parse errors.
- DB diagnostic: CCP_PERSIST=0 window proving persistence is not in the critical path.
- Acceptance: 10/10 Haiku H2 passes with stable ttft; /context errors understood and documented.
