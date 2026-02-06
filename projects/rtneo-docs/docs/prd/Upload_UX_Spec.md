# Upload UX Specification (ASR Demo Portal)

**Goal:** Match the 0:00–1:00 portion of the demo script; give engineers concrete UI/UX requirements.

## Components

1. **File selector**
   - Accept `.wav`, `.mp3`, `.ogg`. Max size default 200 MB.
   - Show friendly validation errors (unsupported type, exceeds limit, missing filename).

2. **Language selector**
   - Dropdown with `auto` (default), `ru`, `en`, `kz`.
   - Tooltip explains that auto-detect is recommended (ties to ADR-0016).

3. **Upload button + progress**
   - Disabled until a file is selected.
   - On submit: show toast “Queued job <id>” and add entry to job list.
   - Progress states: Pending → Processing → Done / Failed (poll `/v1/jobs` every 5s).

4. **Job list**
   - Columns: Job ID (clickable), Filename, Language (requested/detected), Status pill, Submit Time, Duration.
   - Filters: `All / Mine / Completed / Failed`.

5. **Bulk note**
   - Text block: “For bulk ingestion use SFTP drop or watcher script. See docs/prd/Processing_Pipeline_Spec.md”.

## Acceptance Criteria
- Uploading a valid MP3/WAV enqueues the job and shows state transitions without page refresh.
- Invalid files display inline errors and no job is created.
- Selecting a job opens the transcript detail page defined in `docs/prd/Transcript_Detail_Spec.md`.
