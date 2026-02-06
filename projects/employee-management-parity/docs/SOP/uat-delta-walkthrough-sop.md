# SOP – Delta-Focused UAT Walkthrough

Purpose
- Guide UAT agents to verify only what changed between builds, avoiding full explorations.

When To Use
- After a new deployment where specific behavior changes landed (e.g., Day/Period regrouping, overlays, KPIs).

Inputs
- Build URL (Vercel) and prior URL for reference.
- Per‑demo mapping doc (Pass/Fail table) to update.
- Change summary (from PR/commit or executor notes).

Outputs
- Short delta walkthrough in the demo repo’s doc.
- Updated mapping (Pass/Fail), minimal screenshots (3–5), and a one‑liner in `SESSION_HANDOFF.md`.

Steps
1) Changes Since Build
- List the changed areas (features, controls) in one line each.

2) Click Path (UI labels)
- Provide exact button/tab/checkbox labels and their header location to reach the changed areas.

3) Checks (Behavior Only)
- For each changed area, specify 1–3 expected behaviors and a precise “Pass/Fail + note” slot.

4) Evidence
- Minimal screenshots (3–5) named with a short alias and linked in the mapping doc.
- Confirm no console errors.

5) Update Docs
- Mapping doc: update Pass/Fail lines and paste the new URL at the top.
- Handoff: add a single bullet with the new URL and outcomes.

Paste‑Ready Template (drop into demo repo doc)
```
Delta UAT – Build <vercelId>
URL: https://<demo>-<vercelId>.vercel.app
Previous: https://<demo>-<prevId>.vercel.app (optional)

Changes Since Build
- [Area 1] – [1‑line change]
- [Area 2] – [1‑line change]

Click Path
- Header → ["Прогноз + план" | "Отклонения" | "Уровень сервиса (SL)"]
- Time grouping → ["День" | "Период"]
- Overlays → ["Σ" | "123"]

Checks (Behavior Only)
1) [Area]
- Expected: [behavior]
- Result: [Pass/Fail] – [note]

2) [Area]
- Expected: [behavior]
- Result: [Pass/Fail] – [note]

Evidence
- Screenshot: [alias].png – [what it shows]
- Console: [none | first error stack]

Docs Updated
- Mapping: docs/CH5_chart_mapping.md (top URL + Pass/Fail)
- Handoff (if applicable): employee‑management‑parity/docs/SESSION_HANDOFF.md (1 line)
```

Storage & Naming
- Screenshots: use short aliases and register in the demo’s doc (or `docs/SCREENSHOT_INDEX.md` here, if shared).
- Keep raw AI‑UAT notes under `docs/Archive/ai-uat/` and link them when relevant.

