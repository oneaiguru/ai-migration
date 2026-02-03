# Task: Clean the Phase 1 spec into a production-grade document

**Goal:** Rewrite the Phase 1 spec/prompt into a clean, production-ready Markdown that is easy to hand to 1010 and to LLM agents. Remove chat/debug tone, keep one truth for examples, and make the JSON contract explicit.

## Inputs to read
- Feedback: `phase1_analysis/review_feedback/prod_grade_feedback.md` (full review text moved from Desktop `cut.tex`)
- Current spec version (v1.3) you’re cleaning up.
- Russian source docs (Phase 1): the three СО_2024 files already in the repo.

## What to produce
- A single Markdown spec with these sections:
  1) Objective & scope (what Phase 1 automates, what it does NOT)
  2) Normative rules (C04, C05, C06, C07, C08/C17 text rules)
  3) Interpretations & assumptions (Echo 4-step, call_type classification, silent search behavior, etc.)
  4) Open questions for 1010 (relevant subset from Вопросы_к_автору)
  5) JSON output schema (explicit contract: required keys, meanings, in/out of scope)
  6) Golden example — Call #02 (only the final corrected JSON and a 2–3 line “why grade=7”)
  7) Versioning/change log (v1.3 summary of changes)
- Keep only the corrected Echo example; remove or append older/incorrect examples to an appendix if needed.

## Key content fixes to carry over
- C04: 3-second rule for standard questions.
- C05: Thanks required after any announced search (even if check-ins every ~40s); remove invented thresholds/“interactive” exceptions.
- C06: Remove invented two-tier behavior; note Phase 1 limits.
- C07: Echo closer to Russian wording; keep 4-step as **our interpretation**, clearly labeled.
- Mark interpretations vs source rules explicitly.
- JSON: formalize the schema; avoid implying we “pass” criteria we don’t fully evaluate.

## Deliverables
- New cleaned spec Markdown (place in `phase1_analysis/` with a clear name, e.g., `PHASE1_SPEC_v1.3_clean.md`).
- If you retain historical examples, move them to an appendix; keep the main body single-truth.

## Validation
- Content aligns with the Russian docs and the feedback notes.
- Only one final golden JSON for call_02; Echo example corrected.
- Schema section is explicit and unambiguous.
