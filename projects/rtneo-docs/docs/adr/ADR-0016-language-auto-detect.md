# ADR-0016 — Language Auto-Detect Default

**Status:** Proposed (2025-11-12)  
**Owners:** Codex (BE), Claude (Demo)  
**References:** Demo script (0:00–1:00 “language: auto”) & DR ASR-first guidance.

## Context
- The portal currently assumes RU inputs. Clients handle multilingual calls (RU/EN/KZ); forcing manual language selection is error-prone.

## Decision
- Default `language=auto` for both UI and API uploads.
- Persist detected language in the job record; expose it in TXT/VTT metadata and Excel exports.
- Allow overrides per request for cases where detection fails, but keep auto as the primary UX.

## Consequences
- Demo matches real-world usage (upload once, let system decide).
- Preps the dataset for future analytics (language-specific models, routing).
