# Excel Report Specification (ASR Demo)

Matches demo segment 5:00–7:00.

## Generation
- Trigger: nightly cron (UTC 21:00) or manual button in UI.
- Source tables: `jobs`, `transcripts`, `issues` (keywords), `teams`, `agents`.
- Output path: `s3://asr/{client_id}/{yyyy-mm}/reports/asr_summary.xlsx`.

## Sheet Layouts

### Sheet 1 — Call Details
| Column | Description |
|--------|-------------|
| Call ID | `job_id` |
| Client | Customer name / line of business |
| Team / Agent | Derived from metadata |
| Duration (mm:ss) | Audio length |
| Language (detected) | From ADR-0016 |
| Channel mode | Stereo / Mono |
| Flags | e.g., “contains cancel”, “contains complaint” (rule-based) |
| Transcript Link | Signed URL to TXT |

### Sheet 2 — Issues & Objections (Pilot)
| Column | Description |
|--------|-------------|
| Timestamp | Segment start |
| Agent/Client | Channel tag |
| Snippet | Text around keyword match |
| Keyword / Rule | Which rule fired (cancel, refund, escalation) |
| Confidence | Placeholder (rule = 1.0, ML later) |

### Sheet 3 — Team Summary
| Column | Description |
|--------|-------------|
| Team | Ops team name |
| Agent Count | Distinct agents processed |
| Calls / Minutes | Totals |
| Issues Found | Count from Sheet 2 |
| Avg Duration | Mean call length |

## Acceptance Criteria
- Workbook opens in Excel/LibreOffice without warnings.
- Links to transcripts/audio resolve (signed URLs).
- Sheet 2 can be populated via simple keyword rules now; same schema will host ML results later.
