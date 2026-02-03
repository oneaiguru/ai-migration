# PR-22 — MyTKO Demo Site Selector

## Goal
Make the MyTKO UI (port 5174) demo-friendly by providing a curated dropdown of sites + date ranges that showcase non‑trivial fill levels and realistic WAPE, while still allowing custom site IDs.

## Current State
- `ui/mytko-forecast-demo/src/pages/ForecastPage.tsx:160-212` renders a free-text `<Input>` for `site_id`.
- `forecastStore` only tracks `siteId`, `startDate`, `endDate` with no preset awareness.
- Known demo data lives under `ui/mytko-forecast-demo/public/demo_data/containers_summary.csv` (see `docs/System/Demo_Data.md:1-40`).

## Requirements
1. Replace the free-text `site_id` field with an Ant Design `<Select>` listing the curated demo sites below (format: `38117820 · пос. Новый`). Provide a “Custom site…” option that reveals the existing `<Input>` so testers can still type arbitrary IDs.
2. Selecting a preset must:
   - Set `store.siteId` to the preset ID.
   - Update `store.setDateRange(start, end)` to the recommended window in the table.
   - Update `dialogRange` so `ContainerHistoryDialog` opens on that window immediately.
3. Keep manual entry fully functional (Custom option toggles input + uses whatever dates the user set).
4. Document the curated list in both code (exported constant) and `docs/System/Demo_Data.md`.
5. Pass lint/build/tests; no regressions to existing behavior.

### Curated sites + default windows
| Site ID | Label | Default range |
|---------|-------|---------------|
| 38105070 | Лермонтова 297в | 2024-08-01 → 2024-08-07 |
| 38100003 | Академсад | 2024-07-05 → 2024-07-15 |
| 38104949 | Лермонтова 297в · Площадка 2 | 2024-07-10 → 2024-07-20 |
| 38117820 | пос. Новый | 2024-07-01 → 2024-07-07 |
| 38120158 | ул. Б. Хмельницкого | 2024-07-01 → 2024-07-10 |
| 38117630 | Шелеховский район | 2024-07-05 → 2024-07-12 |
| 38104803 | ул. Байкальская | 2024-07-08 → 2024-07-15 |
| 38121360 | Ангарский проспект | 2024-07-12 → 2024-07-19 |

## Implementation Plan
1. **Helper constant** (`ui/mytko-forecast-demo/src/constants/demoSites.ts`):
   ```ts
   export const DEMO_SITES = [
     { id: '38117820', label: '38117820 · пос. Новый', start: '2024-07-01', end: '2024-07-07' },
     ...
   ];
   ```
2. **Store helpers** (`src/stores/forecastStore.ts`):
   - Add methods `selectPreset(siteId: string)` and `setRange(start: string, end: string)` so components don’t manipulate dates manually.
3. **ForecastPage.tsx**:
   - Swap the `<Input>` for `<Select>` using `DEMO_SITES`.
   - Include an `Option value="custom"` that toggles the text field.
   - When preset changes, call `store.selectPreset(siteId)` and `setDialogRange([dayjs(start), dayjs(end)])`.
4. **Dialog**: ensure `dialogRange` state is updated whenever presets change so clicking the site ID opens the right window.
5. **Docs**: append the table to `docs/System/Demo_Data.md`.

## Validation
- `cd ui/mytko-forecast-demo && npm run build`
- `bash scripts/dev/start_stack.sh`
  - `curl -fsS http://127.0.0.1:8000/api/metrics | jq .`
  - `curl -I http://127.0.0.1:5174`
  - Exercise every preset + the Custom path in the browser; confirm WAPE/Fill update accordingly.
- `bash scripts/dev/stop_stack.sh`

## Handoff
- Update `docs/SESSION_HANDOFF.md` with summary, commands, and note that presets now exist.
- Mention the curated list in `docs/System/Demo_Data.md` so future agents know which windows are safe.
