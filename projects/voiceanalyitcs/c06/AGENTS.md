# AGENTS.md (scope: `c06/**`)

## Purpose

Standardize how we organize **JSON-only** artifacts for each call into `in/` and `out/` folders, without touching prompts/transcripts.

## Non-negotiable rules

- **JSONs only:** never move/edit/copy/delete prompt files (`*.md`), transcripts (`*.vtt`), timestamps (`*.toon`), or any non-JSON artifacts.
- **No copy / no delete:** use `mv` only. Never use `cp`, `rm`, or destructive cleanup.
- **Verify by content, not filename:** before moving, **read each JSON** enough to confirm what it is (e.g., `call_id`, `version`, presence of `details`, whether it's a corrections/patch instruction file). Filenames and timestamps can be misleading.
- **Two moves per call (principle):**
  - **One** `mv` operation that places the *input/raw* JSON into `in/`.
  - **One** `mv` operation that places the *output/final* JSON(s) into `out/`.
  - If there are multiple output JSON files, move them together in that single `mv ... out/` operation.
- **Never overwrite:** if a destination filename already exists, stop and ask the user what to do (rename with a suffix, or move to a different call folder).

## Final corrected JSON creation (editing phase)

When producing a corrected/final JSON (e.g., `call_<ID>_corrected.json`), do **not** "hand-build" a file from scratch.

- **Start by duplicating** the uncorrected input JSON to the corrected output path, then apply edits programmatically (preferred: `jq`), so the output is deterministic and minimizes manual mistakes.
- **Keep originals intact:** never overwrite the input (`in/`) or the corrections/validation instruction JSONs (`out/*validation*.json`, `out/*corrections*.json`).
- **Counts must be recomputed from `details`:** after edits, recompute header totals, `by_category`, `script_score`, and (if applicable) `script_grade` from the updated `details`.

## Folder layout (per call id)

Use this structure under Downloads:

- `/Users/m/Downloads/<CALL_ID>/in/`  -> raw/uncorrected JSON input(s)
- `/Users/m/Downloads/<CALL_ID>/out/` -> corrected/final JSON output(s)

## Naming conventions (recommended)

- Input: `call_<CALL_ID>_uncorrected.json` (or `call_<CALL_ID>_raw.json`)
- Output: `call_<CALL_ID>_corrected.json` (or `call_<CALL_ID>_final.json`)
- If multiple outputs: add a suffix, e.g. `call_<CALL_ID>_corrected_signals.json`, `call_<CALL_ID>_corrected_evaluation.json`.

## Procedure (do this every time)

1. Ensure folders exist: `<CALL_ID>/in` and `<CALL_ID>/out`.
2. Read/inspect the JSONs to classify them (raw vs corrected vs corrections instructions). Do **not** trust mtimes: an `out` file can be older than an `in` file.
2. **Input move (single operation):** `mv <raw_json_path> /Users/m/Downloads/<CALL_ID>/in/<normalized_name>.json`
3. **Output move (single operation):** `mv <one_or_more_output_json_paths> /Users/m/Downloads/<CALL_ID>/out/`
4. Verify by listing `in/` and `out/` (read-only check).
