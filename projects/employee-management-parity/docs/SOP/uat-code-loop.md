## UAT ↔ Code Loop (Outcome‑Based)

Purpose
- Keep execution simple and repeatable: run UAT against the live build, fix behaviour gaps, redeploy, and repeat until parity. No timeboxes; only outcomes.

Loop
1) UAT
- Target the live URL.
- Use the correct pack(s): `docs/Tasks/uat-packs/{parity_static.md, trimmed_smoke.md, chart_visual_spec.md}` (plus `naumen-real-walkthrough.md` when comparing to the real UI).
- Deliver: Pass/Fail table + notes + screenshot aliases in the demo repo mapping or curated UAT file.

2) Code
- Fix only behaviour gaps from UAT.
- Validate locally: tests + `npm run build`.
- Deploy and post URL.

3) Update Docs
- System reports + canonical checklist
- CodeMap (file:line evidence)
- `docs/SESSION_HANDOFF.md` (deploy URL + summary) and `PROGRESS.md`

4) Repeat
- Stop when all in‑scope UAT checks = Pass (behaviour parity).
- Then trim (if applicable) and finalize docs.

Acceptance (per loop)
- New deploy URL
- UAT pack runs recorded (tables + aliases)
- Reports/Checklist/CodeMap updated
- No console errors on target screens

Notes
- Visuals remain frozen; behaviour‑only fixes.
- Keep the library/docs repo code‑free; only update documentation here.
